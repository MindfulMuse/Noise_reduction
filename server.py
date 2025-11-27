

"""
DeepFilterNet Single-Port Server (Works with ngrok free tier!)
==============================================================
Both HTTP and WebSocket on ONE port using aiohttp.

Usage:
    pip install aiohttp numpy deepfilternet
    python server.py
    
    Then: ngrok http 8080
"""

import asyncio
import numpy as np
import json
from collections import deque
from aiohttp import web
import aiohttp
import socket
import io
import soundfile as sf
import torch
from scipy import signal

# DeepFilterNet
try:
    from df.enhance import enhance, init_df
    print("🔄 Loading DeepFilterNet...")
    df_model, df_state, _ = init_df()
    df_model = df_model.to("cuda" if torch.cuda.is_available() else "cpu")
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    DEEPFILTER_AVAILABLE = True
    print(f"✅ DeepFilterNet ready on: {DEVICE}")
except Exception as e:
    print("❌ DeepFilterNet not available:", e)
    df_model = None
    df_state = None
    DEVICE = "cpu"
    DEEPFILTER_AVAILABLE = False


# ============== CONFIG ==============
PORT = 8080

# State
df_model = None
df_state = None
senders = set()
receivers = set()

# HTML Interface
HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>DeepFilterNet Streaming</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh; color: #fff; padding: 20px;
        }
        .container { max-width: 500px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 30px; font-size: 24px; }
        .status { 
            background: rgba(255,255,255,0.1); padding: 15px; 
            border-radius: 10px; margin-bottom: 20px; text-align: center;
        }
        .status.connected { border-left: 4px solid #4ade80; }
        .status.disconnected { border-left: 4px solid #f87171; }
        .status.connecting { border-left: 4px solid #facc15; }
        .mode-select { display: flex; gap: 10px; margin-bottom: 20px; }
        .mode-btn {
            flex: 1; padding: 20px; border: none; border-radius: 10px;
            font-size: 18px; cursor: pointer; transition: all 0.3s;
        }
        .mode-btn.sender { background: #3b82f6; color: white; }
        .mode-btn.receiver { background: #8b5cf6; color: white; }
        .mode-btn:hover { transform: scale(1.02); }
        .mode-btn.active { box-shadow: 0 0 0 3px #fff; }
        .controls { 
            background: rgba(255,255,255,0.1); padding: 20px; 
            border-radius: 10px; display: none;
        }
        .controls.active { display: block; }
        button.action {
            width: 100%; padding: 15px; border: none; border-radius: 8px;
            font-size: 16px; cursor: pointer; margin-top: 10px;
            background: #22c55e; color: white;
        }
        button.action.stop { background: #ef4444; }
        button.action:disabled { background: #666; cursor: not-allowed; }
        .stats { 
            font-size: 14px; margin-top: 15px; padding: 10px;
            background: rgba(0,0,0,0.2); border-radius: 8px;
        }
        .info { font-size: 12px; opacity: 0.7; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎙️ DeepFilterNet Stream</h1>
        
        <div id="status" class="status disconnected">
            <span id="statusText">Select a mode to connect</span>
        </div>
        
        <div class="mode-select">
            <button class="mode-btn sender" onclick="selectMode('sender')">
                📤 Sender<br><small>Send noisy audio</small>
            </button>
            <button class="mode-btn receiver" onclick="selectMode('receiver')">
                📥 Receiver<br><small>Get clean audio</small>
            </button>
        </div>
        
        <div id="senderControls" class="controls">
            <p>Capture audio from your microphone and send it for noise reduction.</p>
            <button id="startSend" class="action" onclick="toggleSending()" disabled>
                🎤 Start Sending
            </button>
            <div class="stats" id="sendStats">Waiting for connection...</div>
            <div class="info">💡 Tip: Speak into your mic - the receiver will hear clean audio!</div>
        </div>
        
        <div id="receiverControls" class="controls">
            <p>Receive and play cleaned audio from the sender device.</p>
            <button id="startReceive" class="action" onclick="toggleReceiving()" disabled>
                🔊 Start Receiving
            </button>
            <div class="stats" id="recvStats">Waiting for connection...</div>
            <div class="info">💡 Make sure sender is connected and streaming!</div>
        </div>
    </div>

    <script>
        let ws = null;
        let audioContext = null;
        let mediaStream = null;
        let processor = null;
        let mode = null;
        let isSending = false;
        let isReceiving = false;
        let chunksSent = 0;
        let chunksReceived = 0;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        // Auto-detect WebSocket URL (works with ngrok!)
        function getWsUrl() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${protocol}//${window.location.host}/ws`;
        }

        function selectMode(m) {
            mode = m;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.mode-btn.${m}`).classList.add('active');
            document.getElementById('senderControls').classList.toggle('active', m === 'sender');
            document.getElementById('receiverControls').classList.toggle('active', m === 'receiver');
            connectWS();
        }

        function connectWS() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            
            updateStatus('connecting', 'Connecting...');
            const wsUrl = getWsUrl();
            console.log('Connecting to:', wsUrl);
            
            try {
                ws = new WebSocket(wsUrl);
                ws.binaryType = 'arraybuffer';
            } catch (e) {
                updateStatus(false, 'Failed to create WebSocket: ' + e.message);
                return;
            }
            
            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                updateStatus(true, 'Connected as ' + mode);
                ws.send(JSON.stringify({type: 'register', role: mode}));
                
                // Enable buttons
                if (mode === 'sender') {
                    document.getElementById('startSend').disabled = false;
                    document.getElementById('sendStats').textContent = 'Ready to send audio';
                } else {
                    document.getElementById('startReceive').disabled = false;
                    document.getElementById('recvStats').textContent = 'Ready to receive audio';
                }
            };
            
            ws.onclose = (e) => {
                console.log('WebSocket closed:', e.code, e.reason);
                updateStatus(false, 'Disconnected');
                disableButtons();
                
                // Auto-reconnect
                if (reconnectAttempts < maxReconnectAttempts && mode) {
                    reconnectAttempts++;
                    updateStatus('connecting', `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`);
                    setTimeout(connectWS, 2000);
                }
            };
            
            ws.onerror = (e) => {
                console.error('WebSocket error:', e);
                updateStatus(false, 'Connection error');
            };
            
            ws.onmessage = async (event) => {
                if (mode === 'receiver' && event.data instanceof ArrayBuffer) {
                    chunksReceived++;
                    document.getElementById('recvStats').textContent = 
                        `Chunks received: ${chunksReceived} | ` +
                        `Audio: ${(chunksReceived * 4096 / 48000).toFixed(1)}s`;
                    if (isReceiving && audioContext) {
                        await playAudio(event.data);
                    }
                } else if (typeof event.data === 'string') {
                    const data = JSON.parse(event.data);
                    console.log('Server message:', data);
                }
            };
        }

        function disableButtons() {
            document.getElementById('startSend').disabled = true;
            document.getElementById('startReceive').disabled = true;
        }

        function updateStatus(connected, text) {
            const el = document.getElementById('status');
            if (connected === 'connecting') {
                el.className = 'status connecting';
            } else {
                el.className = 'status ' + (connected ? 'connected' : 'disconnected');
            }
            document.getElementById('statusText').textContent = text;
        }

        async function toggleSending() {
            const btn = document.getElementById('startSend');
            
            if (!isSending) {
                try {
                    audioContext = new AudioContext({sampleRate: 48000});
                    
                    // Resume audio context (needed for some browsers)
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }
                    
                    mediaStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false,
                            sampleRate: 48000
                        }
                    });
                    
                    const source = audioContext.createMediaStreamSource(mediaStream);
                    processor = audioContext.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const float32 = e.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(float32.length);
                            for (let i = 0; i < float32.length; i++) {
                                const s = Math.max(-1, Math.min(1, float32[i]));
                                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                            }
                            ws.send(int16.buffer);
                            chunksSent++;
                            document.getElementById('sendStats').textContent = 
                                `Chunks sent: ${chunksSent} | ` +
                                `Audio: ${(chunksSent * 4096 / 48000).toFixed(1)}s`;
                        }
                    };
                    
                    source.connect(processor);
                    processor.connect(audioContext.destination);
                    
                    isSending = true;
                    btn.textContent = '⏹️ Stop Sending';
                    btn.classList.add('stop');
                    
                } catch (err) {
                    console.error('Mic error:', err);
                    alert('Microphone access error: ' + err.message);
                }
            } else {
                stopSending();
                btn.textContent = '🎤 Start Sending';
                btn.classList.remove('stop');
            }
        }

        function stopSending() {
            isSending = false;
            if (mediaStream) {
                mediaStream.getTracks().forEach(t => t.stop());
                mediaStream = null;
            }
            if (processor) {
                processor.disconnect();
                processor = null;
            }
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
        }

        async function toggleReceiving() {
            const btn = document.getElementById('startReceive');
            
            if (!isReceiving) {
                audioContext = new AudioContext({sampleRate: 48000});
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                isReceiving = true;
                btn.textContent = '⏹️ Stop Receiving';
                btn.classList.add('stop');
            } else {
                if (audioContext) {
                    audioContext.close();
                    audioContext = null;
                }
                isReceiving = false;
                btn.textContent = '🔊 Start Receiving';
                btn.classList.remove('stop');
            }
        }

        // Audio playback with buffering
        let nextPlayTime = 0;
        
        async function playAudio(arrayBuffer) {
            try {
                const int16 = new Int16Array(arrayBuffer);
                const float32 = new Float32Array(int16.length);
                
                for (let i = 0; i < int16.length; i++) {
                    float32[i] = int16[i] / 32768;
                }
                
                const buffer = audioContext.createBuffer(1, float32.length, 48000);
                buffer.getChannelData(0).set(float32);
                
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                
                // Schedule playback to avoid gaps
                const currentTime = audioContext.currentTime;
                if (nextPlayTime < currentTime) {
                    nextPlayTime = currentTime;
                }
                source.start(nextPlayTime);
                nextPlayTime += buffer.duration;
                
            } catch (err) {
                console.error('Playback error:', err);
            }
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            stopSending();
            if (ws) ws.close();
        });
    </script>
</body>
</html>
"""

# WebSocket audio buffers
audio_buffers = {}
SAMPLE_RATE = 48000  # DeepFilterNet requires 48kHz
CHUNK_DURATION = 0.1  # Process every 0.5 seconds
CHUNK_SIZE = int(SAMPLE_RATE * CHUNK_DURATION)  # 24,000 samples

# ==========================================
# DEEPFILTER INITIALIZATION
# ==========================================

# def init_deepfilter():
#     global df_model, df_state
#     if DEEPFILTER_AVAILABLE:
#         print("🔄 Loading DeepFilterNet...")
#         df_model, df_state, _ = init_df()
#         print("✅ DeepFilterNet ready!")

# def process_audio(audio_bytes):
#     """Process audio through DeepFilterNet"""
#     global df_model, df_state
    
#     audio = np.frombuffer(audio_bytes, dtype=np.int16)
    
#     if df_model is None:
#         return audio_bytes
    
#     # try:
#     #     audio_float = audio.astype(np.float32) / 32768.0
#     #     enhanced = enhance(df_model, df_state, audio_float)
#     #     return (enhanced * 32768).astype(np.int16).tobytes()
#     # except Exception as e:
#     #     print(f"⚠️ Processing error: {e}")
#     #     return audio_bytes
    
#     #New
#     try:
#         audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0

#         audio_tensor = torch.from_numpy(audio).float().to(DEVICE)
#         if audio_tensor.ndim == 1:
#             audio_tensor = audio_tensor.unsqueeze(0)

#         enhanced = enhance(df_model, df_state, audio_tensor)
#         enhanced_np = enhanced.squeeze().detach().cpu().numpy()

#         out_int16 = (enhanced_np * 32768).astype(np.int16)
#         return out_int16.tobytes()

#     except Exception as e:
#         print("❌ WS audio processing error:", e)
#         return audio_bytes
    
# async def websocket_handler(request):
#     """Handle WebSocket connections via aiohttp"""
#     ws = web.WebSocketResponse()
#     await ws.prepare(request)
    
#     role = None
#     client_ip = request.remote
#     print(f"🔌 New WebSocket connection from {client_ip}")
    
#     try:
#         async for msg in ws:
#             if msg.type == aiohttp.WSMsgType.TEXT:
#                 data = json.loads(msg.data)
#                 if data.get('type') == 'register':
#                     role = data.get('role')
#                     if role == 'sender':
#                         senders.add(ws)
#                         print(f"📤 Sender registered ({len(senders)} senders, {len(receivers)} receivers)")
#                     else:
#                         receivers.add(ws)
#                         print(f"📥 Receiver registered ({len(senders)} senders, {len(receivers)} receivers)")
                    
#                     await ws.send_json({"type": "registered", "role": role})
                    
#             elif msg.type == aiohttp.WSMsgType.BINARY and role == 'sender':
#                 # Process audio and forward to all receivers
#                 clean_audio = process_audio(msg.data)
                
#                 dead_receivers = set()
#                 for receiver in receivers:
#                     try:
#                         await receiver.send_bytes(clean_audio)
#                     except Exception as e:
#                         dead_receivers.add(receiver)
                
#                 # Remove dead connections
#                 for dead in dead_receivers:
#                     receivers.discard(dead)
                    
#             elif msg.type == aiohttp.WSMsgType.ERROR:
#                 print(f'WebSocket error: {ws.exception()}')
                
#     except Exception as e:
#         print(f"WebSocket error: {e}")
#     finally:
#         senders.discard(ws)
#         receivers.discard(ws)
#         print(f"👋 {role or 'Unknown'} disconnected ({len(senders)} senders, {len(receivers)} receivers)")
    
#     return ws

# ==========================================
# DEEPFILTER INITIALIZATION
# ==========================================
def init_deepfilter():
    global df_model, df_state, DEVICE, DEEPFILTER_AVAILABLE
    try:
        from df.enhance import enhance, init_df
        print("🔄 Loading DeepFilterNet...")
        df_model, df_state, _ = init_df()
        DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
        df_model = df_model.to(DEVICE)
        DEEPFILTER_AVAILABLE = True
        print(f"✅ DeepFilterNet ready on: {DEVICE}")
    except Exception as e:
        print(f"❌ DeepFilterNet not available: {e}")
        DEEPFILTER_AVAILABLE = False

# ==========================================
# AUDIO PROCESSING - NO BUFFERING
# ==========================================
def resample_audio(audio, orig_sr, target_sr=48000):
    """Resample audio to target sample rate"""
    if orig_sr == target_sr:
        return audio
    
    num_samples = int(len(audio) * target_sr / orig_sr)
    resampled = signal.resample(audio, num_samples)
    return resampled

def process_audio(audio_bytes, sample_rate=48000):
    """
    Process audio through DeepFilterNet - IMMEDIATE MODE
    
    Args:
        audio_bytes: Raw PCM audio bytes (int16)
        sample_rate: Sample rate of input audio (default 48000)
    
    Returns:
        Processed audio bytes (int16)
    """
    global df_model, df_state, DEVICE
    
    if df_model is None or not DEEPFILTER_AVAILABLE:
        return audio_bytes
    
    try:
        # Convert bytes to numpy array
        audio = np.frombuffer(audio_bytes, dtype=np.int16)
        
        # Skip if too short (less than 10ms)
        if len(audio) < 480:
            return audio_bytes
        
        # Convert to float32 [-1, 1]
        audio_float = audio.astype(np.float32) / 32768.0
        
        # Resample to 48kHz if needed
        if sample_rate != 48000:
            audio_float = resample_audio(audio_float, sample_rate, 48000)
        
        # Convert to tensor and move to device
        audio_tensor = torch.from_numpy(audio_float).float().to(DEVICE)
        
        # Add batch dimension if needed
        if audio_tensor.ndim == 1:
            audio_tensor = audio_tensor.unsqueeze(0)
        
        # Process with DeepFilterNet
        with torch.no_grad():
            enhanced = enhance(df_model, df_state, audio_tensor)
        
        # Convert back to numpy
        enhanced_np = enhanced.squeeze().detach().cpu().numpy()
        
        # Clip to prevent overflow
        enhanced_np = np.clip(enhanced_np, -1.0, 1.0)
        
        # Convert back to int16
        out_int16 = (enhanced_np * 32768).astype(np.int16)
        
        return out_int16.tobytes()
    
    except Exception as e:
        print(f"❌ Audio processing error: {e}")
        import traceback
        traceback.print_exc()
        return audio_bytes

# ==========================================
# WEBSOCKET HANDLER - ZERO LATENCY
# ==========================================
async def websocket_handler(request):
    """Handle WebSocket connections - IMMEDIATE PROCESSING"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    role = None
    client_ip = request.remote
    print(f"🔌 New WebSocket connection from {client_ip}")
    
    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                data = json.loads(msg.data)
                
                if data.get('type') == 'register':
                    role = data.get('role')
                    
                    if role == 'sender':
                        senders.add(ws)
                        print(f"📤 Sender registered ({len(senders)} senders, {len(receivers)} receivers)")
                    else:
                        receivers.add(ws)
                        print(f"📥 Receiver registered ({len(senders)} senders, {len(receivers)} receivers)")
                    
                    await ws.send_json({
                        "type": "registered",
                        "role": role,
                        "deepfilter": DEEPFILTER_AVAILABLE
                    })
            
            elif msg.type == aiohttp.WSMsgType.BINARY and role == 'sender':
                # IMMEDIATE PROCESSING - NO BUFFERING!
                # Process every chunk as it arrives
                clean_audio = process_audio(msg.data, sample_rate=48000)
                
                # Forward to all receivers immediately
                dead_receivers = set()
                for receiver in receivers:
                    try:
                        await receiver.send_bytes(clean_audio)
                    except Exception as e:
                        print(f"⚠️ Error sending to receiver: {e}")
                        dead_receivers.add(receiver)
                
                # Remove dead connections
                for dead in dead_receivers:
                    receivers.discard(dead)
            
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print(f'❌ WebSocket error: {ws.exception()}')
    
    except Exception as e:
        print(f"❌ WebSocket handler error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        senders.discard(ws)
        receivers.discard(ws)
        print(f"👋 {role or 'Unknown'} disconnected ({len(senders)} senders, {len(receivers)} receivers)")
    
    return ws


async def index_handler(request):
    """Serve the main page"""
    return web.Response(text=HTML_PAGE, content_type='text/html')

async def health_handler(request):
    """Health check endpoint"""
    return web.json_response({
        "status": "ok",
        "deepfilter": DEEPFILTER_AVAILABLE,
        "senders": len(senders),
        "receivers": len(receivers)
    })

def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"


# ==============================
#    FILE UPLOAD ENDPOINT
# ==============================
async def process_upload_handler(request):
    reader = await request.multipart()
    field = await reader.next()

    if not field or field.name != "file":
        return web.json_response({"error": "File field required"}, status=400)

    filename = field.filename
    file_bytes = await field.read()

    # Load WAV
    data, sr = sf.read(io.BytesIO(file_bytes))
    if data.ndim > 1:
        data = data[:, 0]

    if not DEEPFILTER_AVAILABLE:
        clean = data
    else:
        audio_tensor = torch.from_numpy(data.astype(np.float32)).to(DEVICE)
        if audio_tensor.ndim == 1:
            audio_tensor = audio_tensor.unsqueeze(0)

        enhanced = enhance(df_model, df_state, audio_tensor)
        clean = enhanced.squeeze().detach().cpu().numpy()

    # Write output WAV
    buf = io.BytesIO()
    sf.write(buf, clean, sr, format="WAV")
    buf.seek(0)

    return web.Response(
        body=buf.read(),
        headers={
            "Content-Type": "audio/wav",
            "Content-Disposition": f"attachment; filename=cleaned_{filename}"
        }
    )



# Add this to server.py before app.router.add_post(...)
from aiohttp_middlewares import cors_middleware

# Or simpler:
from aiohttp import web
from aiohttp.web_middlewares import middleware

@middleware
async def cors_handler(request, handler):
    resp = await handler(request)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

app = web.Application(middlewares=[cors_handler])


async def main():
    print("=" * 50)
    print("   DeepFilterNet Single-Port Server")
    print("   (ngrok compatible!)")
    print("=" * 50)
    
    init_deepfilter()
    
    # Create aiohttp app
    # app = web.Application()
    app = web.Application(middlewares=[cors_handler])

    app.router.add_get('/', index_handler)
    app.router.add_get('/ws', websocket_handler)
    app.router.add_get('/health', health_handler)
    
    # NEW — upload endpoint
    app.router.add_post('/process', process_upload_handler)

    # Start server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', PORT)
    await site.start()
    
    local_ip = get_local_ip()
    
    print(f"\n✅ Server running on port {PORT}")
    print(f"\n🌐 Local access:")
    print(f"   http://localhost:{PORT}")
    print(f"   http://{local_ip}:{PORT}")
    print(f"\n🚀 For remote access, run:")
    print(f"   ngrok http {PORT}")
    print(f"\n   Then use the ngrok URL on both devices!")
    print("\n⏳ Waiting for connections...")
    
    # Keep running
    await asyncio.Event().wait()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Server stopped")