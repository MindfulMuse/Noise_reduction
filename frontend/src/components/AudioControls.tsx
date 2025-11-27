type Props = {
  isStreaming: boolean;
  level: number;
  isConnected?: boolean;
  role?: 'sender' | 'receiver';
  onStart: () => void;
  onStop: () => void;
};

const AudioControls = ({ isStreaming, level, onStart, onStop, isConnected = true,
  role = 'sender' }: Props) => {
  return (

    
    <div className="card grid" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        
      {/* Small connection indicator (non-intrusive) */}
      {!isConnected && (
        <p style={{ 
          color: '#ff6b6b', 
          fontSize: '0.8rem', 
          margin: '0',
          opacity: 0.8
        }}>
          ⚠️ Not connected to server
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className="btn-primary" 
          onClick={onStart} 
          disabled={isStreaming || !isConnected}
        >
          {role === 'sender' ? 'Start Sending' : 'Start Receiving'}
        </button>

        <button 
          className="btn-danger" 
          onClick={onStop} 
          disabled={!isStreaming}
        >
          {role === 'sender' ? 'Stop Sending' : 'Stop Receiving'}
        </button>
      </div>

      {/* Level Meter */}
      {role === 'sender' && (
        <div>
          <p style={{ marginBottom: '0.35rem', color: '#9da6ff', fontSize: '0.85rem' }}>
            Input Level
          </p>

          <div
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min(level * 100, 100)}%`,
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg,#55f7c8,#33a3ff)',
                transition: 'width 120ms ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Receiver text */}
      {role === 'receiver' && (
        <p style={{ 
          marginTop: '0.35rem', 
          color: '#9da6ff', 
          fontSize: '0.85rem' 
        }}>
          {isStreaming 
            ? 'Receiving cleaned audio...' 
            : 'Idle - Click start'}
        </p>
      )}
        <button className="btn-primary" onClick={onStart} disabled={isStreaming}>
          Start Stream
        </button>
        <button className="btn-danger" onClick={onStop} disabled={!isStreaming}>
          Stop Stream
        </button>
      </div>

      <div>
        <p style={{ marginBottom: '0.35rem', color: '#9da6ff', fontSize: '0.85rem' }}>
          Input Level
        </p>
        <div
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${Math.min(level * 100, 100)}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg,#55f7c8,#33a3ff)',
              transition: 'width 120ms ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;

