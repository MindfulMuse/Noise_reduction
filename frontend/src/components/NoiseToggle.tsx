type Props = {
  isOn: boolean;
  onToggle: () => void;
};

const NoiseToggle = ({ isOn, onToggle }: Props) => (
  <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Noise Reduction</h3>
      <p style={{ color: '#9da6ff', fontSize: '0.9rem' }}>
        {isOn ? 'Active — noise floor suppressed' : 'Bypassed — raw stream'}
      </p>
    </div>
    <button className="btn-secondary" onClick={onToggle}>
      {isOn ? 'Disable' : 'Enable'}
    </button>
  </div>
);

export default NoiseToggle;

