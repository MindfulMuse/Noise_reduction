type Props = {
  isStreaming: boolean;
  error: string | null;
};

const StreamStatus = ({ isStreaming, error }: Props) => (
  <div className="card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '0.85rem', color: '#9da6ff' }}>Stream Status</p>
        <h2 style={{ fontSize: '1.4rem' }}>{isStreaming ? 'Streaming live' : 'Idle'}</h2>
      </div>
      <span className={`pill ${isStreaming ? 'success' : ''}`}>
        {isStreaming ? 'Real-time' : 'Stopped'}
      </span>
    </div>
    {error ? (
      <p style={{ marginTop: '0.75rem' }} className="pill error">
        {error}
      </p>
    ) : null}
  </div>
);

export default StreamStatus;

