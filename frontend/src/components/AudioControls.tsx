type Props = {
  isStreaming: boolean;
  level: number;
  onStart: () => void;
  onStop: () => void;
};

const AudioControls = ({ isStreaming, level, onStart, onStop }: Props) => {
  return (
    <div className="card grid" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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

