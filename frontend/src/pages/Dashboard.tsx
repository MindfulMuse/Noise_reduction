// import AudioControls from '../components/AudioControls';
// import NoiseToggle from '../components/NoiseToggle';
// import StreamStatus from '../components/StreamStatus';
// import VisualizerCanvas from '../components/VisualizerCanvas';
// import { useAudioNoiseReducer } from '../hooks/useAudioNoiseReducer';

// const Dashboard = () => {
//   const {
//     startStream,
//     stopStream,
//     toggleNoiseSuppression,
//     analyserNode,
//     isStreaming,
//     isNoiseSuppressionOn,
//     level,
//     error
//   } = useAudioNoiseReducer({
//     thresholdDb: -50,
//     useWorklet: true
//   });

//   return (
//     <main className="grid" style={{ gap: '1.5rem' }}>
//       <header>
//         <p className="pill">Real-time Noise Reduction</p>
//         <h1 style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>Noise Cleaner</h1>
//         <p style={{ color: '#9da6ff', maxWidth: '620px' }}>
//           Capture audio from any external device, apply client-side DSP (noise gating, RNNoise, or
//           custom WebAssembly models), and monitor the cleaned output with sub-30ms latency.
//         </p>
//       </header>

//       <StreamStatus isStreaming={isStreaming} error={error} />

//       <div className="grid grid-2">
//         <AudioControls
//           isStreaming={isStreaming}
//           level={level}
//           onStart={() => startStream()}
//           onStop={stopStream}
//         />
//         <NoiseToggle isOn={isNoiseSuppressionOn} onToggle={() => toggleNoiseSuppression()} />
//       </div>

//       <VisualizerCanvas analyser={analyserNode} isActive={isStreaming} />
//     </main>
//   );
// };

// export default Dashboard;


// Dashboard.tsx
import { useState } from 'react';
import AudioControls from '../components/AudioControls';
import NoiseToggle from '../components/NoiseToggle';
import StreamStatus from '../components/StreamStatus';
import VisualizerCanvas from '../components/VisualizerCanvas';
import { useAudioNoiseReducer } from '../hooks/useAudioNoiseReducer';

const Dashboard = () => {
  // WebSocket configuration
  const [serverUrl, setServerUrl] = useState('ws://localhost:8080/ws');
  const [role, setRole] = useState<'sender' | 'receiver' | null>(null);
  const [showConfig, setShowConfig] = useState(true);

  const {
    startStream,
    stopStream,
    toggleNoiseSuppression,
    analyserNode,
    isStreaming,
    isNoiseSuppressionOn,
    isConnected,
    level,
    error,
    stats
  } = useAudioNoiseReducer({
    serverUrl,
    role: role || 'sender',
    sampleRate: 48000
  });

  return (
    <main className="grid" style={{ gap: '1.5rem' }}>
      <header>
        <p className="pill">Real-time Noise Reduction</p>
        <h1 style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>Noise Cleaner</h1>
        <p style={{ color: '#9da6ff', maxWidth: '620px' }}>
          Capture audio from any external device, stream it to DeepFilterNet server via WebSocket,
          and monitor the cleaned output with low latency.
        </p>
      </header>

      {/* Server Configuration Card */}
      {showConfig && (
        <div className="card" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>🔧 Server Configuration</h3>
            <button
              onClick={() => setShowConfig(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9da6ff',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
          </div>
          
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c7c9e6' }}>
            <strong>DeepFilterNet Server URL:</strong>
          </label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            disabled={isStreaming}
            placeholder="ws://localhost:8080/ws"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              fontSize: '0.95rem'
            }}
          />
          <small style={{ display: 'block', marginTop: '0.5rem', color: '#9da6ff' }}>
            💡 Local: <code>ws://localhost:8080/ws</code> | Remote (ngrok): <code>wss://your-url.ngrok.io/ws</code>
          </small>
        </div>
      )}

      {/* Connection Status */}
      <div className="card" style={{
        background: isConnected 
          ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.15), rgba(40, 167, 69, 0.05))' 
          : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.05))',
        borderLeft: `4px solid ${isConnected ? '#28a745' : '#dc3545'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>
              {isConnected ? '✅ Connected to Server' : '❌ Disconnected'}
            </strong>
            {role && (
              <div style={{ marginTop: '0.25rem', color: '#9da6ff' }}>
                Mode: <strong>{role === 'sender' ? '📤 Sender' : '📥 Receiver'}</strong>
              </div>
            )}
            {isConnected && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#b6b9d6' }}>
                {role === 'sender' && `Chunks sent: ${stats.chunksSent}`}
                {role === 'receiver' && `Chunks received: ${stats.chunksReceived}`}
              </div>
            )}
          </div>
          {!showConfig && (
            <button
              onClick={() => setShowConfig(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ⚙️ Settings
            </button>
          )}
        </div>
      </div>

      {/* Role Selection (only show if no role selected) */}
      {!role && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Select Device Mode:</h3>
          <div className="grid grid-2">
            <button
              onClick={() => setRole('sender')}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #007bff, #0056b3)',
                border: '2px solid transparent',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📤</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Sender</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e0e0e0' }}>
                Capture microphone audio and send to server for noise reduction
              </p>
            </button>

            <button
              onClick={() => setRole('receiver')}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #6f42c1, #4a2c7f)',
                border: '2px solid transparent',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📥</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Receiver</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e0e0e0' }}>
                Receive and play cleaned audio from the sender device
              </p>
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#9da6ff', textAlign: 'center' }}>
            💡 One device sends noisy audio, another receives clean audio
          </p>
        </div>
      )}

      {/* Stream Status (only show if role selected) */}
      {role && <StreamStatus isStreaming={isStreaming} error={error} />}

      {/* Controls (only show if role selected) */}
      {role && (
        <div className="grid grid-2">
          <AudioControls
            isStreaming={isStreaming}
            level={level}
            onStart={() => startStream()}
            onStop={stopStream}
            isConnected={isConnected}
            role={role}
          />
          {role === 'sender' && (
            <NoiseToggle 
              isOn={isNoiseSuppressionOn} 
              onToggle={() => toggleNoiseSuppression()} 
            />
          )}
        </div>
      )}

      {/* Visualizer (only show if streaming) */}
      {role && <VisualizerCanvas analyser={analyserNode} isActive={isStreaming} />}

      {/* Reset Button */}
      {role && (
        <button
          onClick={() => {
            stopStream();
            setRole(null);
          }}
          style={{
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          ← Back to Mode Selection
        </button>
      )}
    </main>
  );
};

export default Dashboard;