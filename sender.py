
# # sender.py
# import streamlit as st
# import torch
# import numpy as np
# import pyaudio
# import socket
# import threading
# import struct
# from df.enhance import enhance, init_df

# st.set_page_config(page_title="Audio Sender", page_icon="🎤")

# # Initialize model
# @st.cache_resource
# def load_model():
#     model, df_state, _ = init_df()
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     model = model.to(device)
#     return model, df_state, device

# st.title("🎤 Audio Sender (Microphone)")
# st.write("This device captures and sends enhanced audio")

# # Connection settings
# st.sidebar.header("🔗 Connection Settings")
# server_ip = st.sidebar.text_input("Server IP Address", "127.0.0.1")
# server_port = st.sidebar.number_input("Server Port", value=5555, min_value=1024, max_value=65535)

# # Audio settings
# CHUNK = 1024
# FORMAT = pyaudio.paInt16
# CHANNELS = 1
# RATE = 16000

# # Session state
# if 'streaming' not in st.session_state:
#     st.session_state.streaming = False
# if 'socket' not in st.session_state:
#     st.session_state.socket = None

# # Load model
# with st.spinner("Loading AI model..."):
#     model, df_state, device = load_model()
# st.success(f"✅ Model loaded on {device.upper()}")

# def send_audio():
#     """Capture, enhance, and send audio"""
#     try:
#         # Connect to server
#         sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#         sock.connect((server_ip, server_port))
#         sock.send(b'sender')
#         st.session_state.socket = sock
        
#         # Initialize PyAudio
#         audio = pyaudio.PyAudio()
#         stream = audio.open(
#             format=FORMAT,
#             channels=CHANNELS,
#             rate=RATE,
#             input=True,
#             frames_per_buffer=CHUNK
#         )
        
#         st.info("🔴 STREAMING - Speaking into microphone...")
        
#         buffer = []
#         buffer_size = RATE  # 1 second buffer
        
#         while st.session_state.streaming:
#             # Read audio
#             data = stream.read(CHUNK, exception_on_overflow=False)
#             audio_data = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
            
#             buffer.extend(audio_data)
            
#             # Process when buffer is full
#             if len(buffer) >= buffer_size:
#                 chunk = np.array(buffer[:buffer_size])
#                 buffer = buffer[buffer_size:]
                
#                 # Enhance with DeepFilterNet2
#                 audio_tensor = torch.from_numpy(chunk).float().unsqueeze(0).to(device)
#                 with torch.no_grad():
#                     enhanced = enhance(model, df_state, audio_tensor)
                
#                 # Convert back to int16
#                 enhanced_audio = enhanced.cpu().numpy().squeeze()
#                 enhanced_audio = (enhanced_audio * 32768.0).astype(np.int16)
                
#                 # Send over socket
#                 sock.sendall(enhanced_audio.tobytes())
        
#         # Cleanup
#         stream.stop_stream()
#         stream.close()
#         audio.terminate()
#         sock.close()
        
#     except Exception as e:
#         st.error(f"❌ Error: {e}")
#         st.session_state.streaming = False

# # Controls
# col1, col2 = st.columns(2)

# with col1:
#     if st.button("▶️ START STREAMING", disabled=st.session_state.streaming):
#         st.session_state.streaming = True
#         threading.Thread(target=send_audio, daemon=True).start()
#         st.rerun()

# with col2:
#     if st.button("⏹️ STOP STREAMING", disabled=not st.session_state.streaming):
#         st.session_state.streaming = False
#         if st.session_state.socket:
#             st.session_state.socket.close()
#         st.rerun()

# if st.session_state.streaming:
#     st.success("🟢 LIVE - Audio is being enhanced and transmitted")
# else:
#     st.info("⏸️ Click START STREAMING to begin")

# st.markdown("---")
# st.markdown("""
# **Instructions:**
# 1. Make sure the server is running first
# 2. Enter the server IP address (use your computer's local IP)
# 3. Click START STREAMING
# 4. Speak into your microphone - audio will be enhanced and sent to the receiver
# """)

#2


# # ============= SENDER.PY (Run this on device with microphone) =============
# """
# This is the SENDER that:
# 1. Captures audio from microphone (with background noise)
# 2. Sends it directly to receiver's IP
# 3. Receiver will enhance and play it

# Run with: streamlit run sender.py
# """

# # sender.py
# import streamlit as st
# import numpy as np
# import pyaudio
# import socket
# import threading
# import time

# st.set_page_config(page_title="Audio Sender", page_icon="🎤")

# st.title("🎤 Audio Sender (Microphone)")
# st.write("**Captures and sends noisy audio to receiver**")

# # Audio settings
# CHUNK = 1024
# FORMAT = pyaudio.paInt16
# CHANNELS = 1
# RATE = 16000

# # Session state
# if 'streaming' not in st.session_state:
#     st.session_state.streaming = False
# if 'socket' not in st.session_state:
#     st.session_state.socket = None

# # Connection settings
# st.sidebar.header("🔗 Connection Settings")
# receiver_ip = st.sidebar.text_input("Receiver IP Address", "192.168.1.100")
# receiver_port = st.sidebar.number_input("Receiver Port", value=5555, min_value=1024, max_value=65535)

# st.sidebar.markdown("---")
# st.sidebar.info("💡 **Get these from the Receiver device**")

# def send_audio():
#     """Capture audio from microphone and send to receiver"""
#     try:
#         # Connect to receiver
#         sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#         sock.connect((receiver_ip, receiver_port))
#         st.session_state.socket = sock
        
#         st.success(f"✅ Connected to receiver at {receiver_ip}:{receiver_port}")
        
#         # Initialize PyAudio
#         audio = pyaudio.PyAudio()
#         stream = audio.open(
#             format=FORMAT,
#             channels=CHANNELS,
#             rate=RATE,
#             input=True,
#             frames_per_buffer=CHUNK
#         )
        
#         st.info("🔴 STREAMING - Speak into your microphone...")
        
#         while st.session_state.streaming:
#             # Read audio from microphone
#             data = stream.read(CHUNK, exception_on_overflow=False)
            
#             # Send raw audio data to receiver
#             sock.sendall(data)
        
#         # Cleanup
#         stream.stop_stream()
#         stream.close()
#         audio.terminate()
#         sock.close()
        
#     except ConnectionRefusedError:
#         st.error(f"❌ Cannot connect to {receiver_ip}:{receiver_port}")
#         st.error("Make sure the receiver is running and listening!")
#         st.session_state.streaming = False
#     except Exception as e:
#         st.error(f"❌ Error: {e}")
#         st.session_state.streaming = False

# # Status
# status_placeholder = st.empty()

# if st.session_state.streaming:
#     status_placeholder.success("🟢 STREAMING - Your audio is being sent")
# else:
#     status_placeholder.info("⚪ READY - Click START to begin streaming")

# # Controls
# col1, col2 = st.columns(2)

# with col1:
#     if st.button("▶️ START STREAMING", disabled=st.session_state.streaming, use_container_width=True):
#         st.session_state.streaming = True
#         threading.Thread(target=send_audio, daemon=True).start()
#         time.sleep(0.5)
#         st.rerun()

# with col2:
#     if st.button("⏹️ STOP", disabled=not st.session_state.streaming, use_container_width=True):
#         st.session_state.streaming = False
#         if st.session_state.socket:
#             try:
#                 st.session_state.socket.close()
#             except:
#                 pass
#         time.sleep(0.5)
#         st.rerun()

# st.markdown("---")
# st.markdown("""
# ### 📖 How to Use:

# 1. **Make sure Receiver is running** and listening first
# 2. **Enter the Receiver's IP address** (get it from receiver's screen)
# 3. **Click "START STREAMING"**
# 4. **Speak into your microphone** 🎤
# 5. The receiver will hear your voice **crystal clear** without background noise!

# ### 🎯 What's happening:
# - Your microphone captures audio (with all background noise)
# - Audio is sent **as-is** to the receiver
# - Receiver enhances it using AI
# - Receiver plays **clean, clear audio** through speakers

# **Note:** Any background noise (traffic, AC, typing) will be removed by the receiver!
# """)


# import streamlit as st
# import asyncio
# import websockets
# import json
# import base64
# import numpy as np
# import sounddevice as sd
# import threading
# import queue

# st.set_page_config(page_title="Noise Reduction Sender/Receiver", layout="wide")

# # -----------------------------
# # Shared queue between threads
# # -----------------------------
# audio_send_queue = queue.Queue()
# audio_play_queue = queue.Queue()

# # -----------------------------
# # Sidebar
# # -----------------------------
# role = st.sidebar.selectbox("Select Role", ["None", "Sender", "Receiver"])
# server_ip = st.sidebar.text_input("Server IP", "localhost")
# server_port = st.sidebar.text_input("Port", "8765")
# server_url = f"ws://{server_ip}:{server_port}"

# st.write(f"Server URL: `{server_url}`")
# st.write(f"Role: `{role}`")

# # -----------------------------
# # WebSocket Background Thread
# # -----------------------------
# def start_async_loop(loop):
#     asyncio.set_event_loop(loop)
#     loop.run_forever()

# ws_loop = asyncio.new_event_loop()
# threading.Thread(target=start_async_loop, args=(ws_loop,), daemon=True).start()

# async def ws_sender():
#     async with websockets.connect(server_url) as ws:
#         await ws.send(json.dumps({"type": "register", "role": "sender"}))

#         while True:
#             audio_bytes = audio_send_queue.get()
#             b64 = base64.b64encode(audio_bytes).decode("utf-8")

#             await ws.send(json.dumps({"type": "audio", "data": b64}))

# async def ws_receiver():
#     async with websockets.connect(server_url) as ws:
#         await ws.send(json.dumps({"type": "register", "role": "receiver"}))

#         async for msg in ws:
#             data = json.loads(msg)
#             if data["type"] == "audio":
#                 raw = base64.b64decode(data["data"])
#                 audio_np = np.frombuffer(raw, dtype=np.int16) / 32768.0
#                 audio_play_queue.put(audio_np)

# # -----------------------------
# # Audio Callbacks (NO ASYNC HERE)
# # -----------------------------
# def mic_callback(indata, frames, time, status):
#     audio16 = (indata[:,0] * 32767).astype(np.int16).tobytes()
#     audio_send_queue.put(audio16)

# def play_callback(outdata, frames, time, status):
#     if not audio_play_queue.empty():
#         data = audio_play_queue.get()
#         if len(data) < frames:
#             data = np.pad(data, (0, frames-len(data)))
#         outdata[:,0] = data[:frames]
#     else:
#         outdata.fill(0)

# # -----------------------------
# # Buttons
# # -----------------------------
# if role != "None":
#     if st.button("▶ START"):
#         if role == "Sender":
#             # start websocket sender
#             asyncio.run_coroutine_threadsafe(ws_sender(), ws_loop)

#             # start microphone capture
#             sd.InputStream(
#                 channels=1, samplerate=16000, callback=mic_callback
#             ).start()

#             st.success("🎤 Sender started (mic recording & websocket running)")

#         elif role == "Receiver":
#             # start websocket receiver
#             asyncio.run_coroutine_threadsafe(ws_receiver(), ws_loop)

#             # start speaker output
#             sd.OutputStream(
#                 channels=1, samplerate=16000, callback=play_callback
#             ).start()

#             st.success("🔊 Receiver started (playing cleaned audio)")


# # streamlit_app.py
# working design 


# import streamlit as st
# import asyncio
# import websockets
# import json
# import sounddevice as sd
# import threading
# import queue
# import numpy as np
# import struct
# import time

# st.set_page_config(page_title="Noise Reduction Sender/Receiver", layout="wide")

# # --------------------------
# # Config (match server)
# # --------------------------
# SAMPLE_RATE = 16000
# CHUNK_SIZE = 2048  # must match or be a divisor of server PROCESS_BUFFER
# HDR_STRUCT = struct.Struct("<II")

# # --------------------------
# # UI
# # --------------------------
# role = st.sidebar.selectbox("Select Role", ["None", "Sender", "Receiver"])
# server_ip = st.sidebar.text_input("Server IP", "localhost")
# server_port = st.sidebar.text_input("Port", "8765")
# server_url = f"ws://{server_ip}:{server_port}"
# st.write(f"Server URL: `{server_url}`")
# st.write(f"Role: `{role}`")

# # --------------------------
# # Queues and state
# # --------------------------
# audio_send_q = queue.Queue()   # int16 bytes
# audio_play_q = queue.Queue()   # numpy float32 chunks
# ws_loop = asyncio.new_event_loop()
# threading.Thread(target=lambda: (asyncio.set_event_loop(ws_loop), ws_loop.run_forever()), daemon=True).start()

# # keep stream references alive in session_state so they don't get GC'd
# if "input_stream" not in st.session_state:
#     st.session_state["input_stream"] = None
# if "output_stream" not in st.session_state:
#     st.session_state["output_stream"] = None

# # --------------------------
# # WS coroutines
# # --------------------------
# async def ws_sender_coroutine(url):
#     seq = 0
#     async with websockets.connect(url, max_size=None) as ws:
#         await ws.send(json.dumps({"type": "register", "role": "sender"}))
#         # send loop: blocking on queue get via run_in_executor
#         loop = asyncio.get_event_loop()
#         while True:
#             # use run_in_executor for blocking queue
#             audio_bytes = await loop.run_in_executor(None, audio_send_q.get)
#             # assemble header + bytes
#             sample_count = len(audio_bytes) // 2  # int16 -> 2 bytes
#             header = HDR_STRUCT.pack(seq, sample_count)
#             await ws.send(header + audio_bytes)
#             seq = (seq + 1) & 0xFFFFFFFF

# async def ws_receiver_coroutine(url):
#     async with websockets.connect(url, max_size=None) as ws:
#         await ws.send(json.dumps({"type": "register", "role": "receiver"}))
#         async for msg in ws:
#             # binary message expected
#             if isinstance(msg, bytes):
#                 if len(msg) < HDR_STRUCT.size:
#                     continue
#                 header = msg[:HDR_STRUCT.size]
#                 seq, sample_count = HDR_STRUCT.unpack(header)
#                 pcm = msg[HDR_STRUCT.size:]
#                 samples = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
#                 audio_play_q.put(samples)
#             else:
#                 # text message
#                 data = json.loads(msg)
#                 # handle control if needed
#                 # st.write(data)
#                 pass

# # --------------------------
# # sounddevice callbacks
# # --------------------------
# def mic_callback(indata, frames, timeinfo, status):
#     # indata is float32 in [-1,1], mono channel
#     int16_bytes = (indata[:, 0] * 32767.0).astype(np.int16).tobytes()
#     audio_send_q.put(int16_bytes)

# def play_callback(outdata, frames, timeinfo, status):
#     if not audio_play_q.empty():
#         data = audio_play_q.get()
#         # if too short, pad
#         if len(data) < frames:
#             data = np.pad(data, (0, frames - len(data)))
#         outdata[:, 0] = data[:frames]
#     else:
#         outdata.fill(0)

# # --------------------------
# # Start/Stop buttons
# # --------------------------
# if role != "None":
#     if st.button("▶ START"):
#         if role == "Sender":
#             # start websocket sender coroutine on ws_loop
#             asyncio.run_coroutine_threadsafe(ws_sender_coroutine(server_url), ws_loop)

#             # start input stream and keep reference
#             stream = sd.InputStream(channels=1, samplerate=SAMPLE_RATE, blocksize=CHUNK_SIZE, callback=mic_callback)
#             stream.start()
#             st.session_state["input_stream"] = stream
#             st.success("🎤 Sender started (mic recording & websocket running)")

#         elif role == "Receiver":
#             asyncio.run_coroutine_threadsafe(ws_receiver_coroutine(server_url), ws_loop)

#             stream = sd.OutputStream(channels=1, samplerate=SAMPLE_RATE, blocksize=CHUNK_SIZE, callback=play_callback)
#             stream.start()
#             st.session_state["output_stream"] = stream
#             st.success("🔊 Receiver started (playing cleaned audio)")

#     if st.button("⏹ STOP"):
#         # attempt to stop streams
#         if st.session_state.get("input_stream") is not None:
#             try:
#                 st.session_state["input_stream"].stop()
#                 st.session_state["input_stream"].close()
#             except:
#                 pass
#             st.session_state["input_stream"] = None
#         if st.session_state.get("output_stream") is not None:
#             try:
#                 st.session_state["output_stream"].stop()
#                 st.session_state["output_stream"].close()
#             except:
#                 pass
#             st.session_state["output_stream"] = None
#         st.success("Stopped")

# st.markdown("""
# **Notes**
# - This client sends raw 16-bit PCM in binary frames (no base64) for minimal latency.
# - If you run both Sender & Receiver on the same machine, use `localhost`. For remote devices use the server's reachable IP.
# """)



"""
DeepFilterNet WebSocket Server for React App
============================================
Receives noisy audio from senders, processes with DeepFilterNet,
and forwards cleaned audio to receivers.

Requirements:
    pip install aiohttp numpy deepfilternet

Usage:
    python server.py
"""

import asyncio
import numpy as np
import json
from aiohttp import web
import aiohttp
import socket

# DeepFilterNet
try:
    from df.enhance import enhance, init_df
    DEEPFILTER_AVAILABLE = True
except ImportError:
    print("⚠️  DeepFilterNet not found - running in passthrough mode")
    print("   Install: pip install deepfilternet")
    DEEPFILTER_AVAILABLE = False

# ============== CONFIG ==============
PORT = 8080

# State
df_model = None
df_state = None
senders = set()
receivers = set()

def init_deepfilter():
    """Initialize DeepFilterNet model"""
    global df_model, df_state
    if DEEPFILTER_AVAILABLE:
        print("🔄 Loading DeepFilterNet...")
        df_model, df_state, _ = init_df()
        print("✅ DeepFilterNet ready!")
    else:
        print("⚠️  Running in passthrough mode (no noise reduction)")

def process_audio(audio_bytes):
    """Process audio through DeepFilterNet"""
    global df_model, df_state
    
    # Convert bytes to numpy array
    audio = np.frombuffer(audio_bytes, dtype=np.int16)
    
    # If no model, pass through unchanged
    if df_model is None:
        return audio_bytes
    
    try:
        # Convert to float32 for processing
        audio_float = audio.astype(np.float32) / 32768.0
        
        # Process with DeepFilterNet
        enhanced = enhance(df_model, df_state, audio_float)
        
        # Convert back to int16
        return (enhanced * 32768).astype(np.int16).tobytes()
    except Exception as e:
        print(f"⚠️ Processing error: {e}")
        return audio_bytes

async def websocket_handler(request):
    """Handle WebSocket connections from React app"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    role = None
    client_ip = request.remote
    print(f"🔌 New connection from {client_ip}")
    
    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                # Handle JSON messages (registration, etc.)
                try:
                    data = json.loads(msg.data)
                    if data.get('type') == 'register':
                        role = data.get('role')
                        if role == 'sender':
                            senders.add(ws)
                            print(f"📤 Sender registered ({len(senders)} senders, {len(receivers)} receivers)")
                        elif role == 'receiver':
                            receivers.add(ws)
                            print(f"📥 Receiver registered ({len(senders)} senders, {len(receivers)} receivers)")
                        
                        # Confirm registration
                        await ws.send_json({"type": "registered", "role": role})
                except json.JSONDecodeError:
                    print(f"⚠️ Invalid JSON from {client_ip}")
                    
            elif msg.type == aiohttp.WSMsgType.BINARY and role == 'sender':
                # Process audio from sender and forward to all receivers
                clean_audio = process_audio(msg.data)
                
                # Send to all active receivers
                dead_receivers = set()
                for receiver in receivers:
                    try:
                        await receiver.send_bytes(clean_audio)
                    except Exception as e:
                        print(f"⚠️ Failed to send to receiver: {e}")
                        dead_receivers.add(receiver)
                
                # Remove dead connections
                for dead in dead_receivers:
                    receivers.discard(dead)
                    print(f"🗑️ Removed dead receiver")
                    
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print(f'❌ WebSocket error: {ws.exception()}')
                
    except Exception as e:
        print(f"❌ Connection error: {e}")
    finally:
        # Cleanup on disconnect
        senders.discard(ws)
        receivers.discard(ws)
        print(f"👋 {role or 'Unknown'} disconnected ({len(senders)} senders, {len(receivers)} receivers)")
    
    return ws

async def health_handler(request):
    """Health check endpoint"""
    return web.json_response({
        "status": "ok",
        "deepfilter": DEEPFILTER_AVAILABLE,
        "senders": len(senders),
        "receivers": len(receivers)
    })

def get_local_ip():
    """Get local network IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

async def main():
    print("=" * 60)
    print("   DeepFilterNet WebSocket Server for React")
    print("=" * 60)
    
    # Initialize DeepFilterNet
    init_deepfilter()
    
    # Create aiohttp app
    app = web.Application()
    app.router.add_get('/ws', websocket_handler)
    app.router.add_get('/health', health_handler)
    
    # Enable CORS for development
    @web.middleware
    async def cors_middleware(request, handler):
        if request.method == "OPTIONS":
            response = web.Response()
        else:
            response = await handler(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = '*'
        return response
    
    app.middlewares.append(cors_middleware)
    
    # Start server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', PORT)
    await site.start()
    
    local_ip = get_local_ip()
    
    print(f"\n✅ Server running on port {PORT}")
    print(f"\n🌐 WebSocket URLs:")
    print(f"   Local:   ws://localhost:{PORT}/ws")
    print(f"   Network: ws://{local_ip}:{PORT}/ws")
    print(f"\n📊 Health check:")
    print(f"   http://localhost:{PORT}/health")
    print(f"\n🚀 For remote access (different networks):")
    print(f"   1. Run: ngrok http {PORT}")
    print(f"   2. Use: wss://YOUR-NGROK-URL/ws (note wss:// not ws://)")
    print(f"\n📱 For same WiFi:")
    print(f"   Use: ws://{local_ip}:{PORT}/ws on all devices")
    print("\n⏳ Waiting for connections...\n")
    
    # Keep running
    await asyncio.Event().wait()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")