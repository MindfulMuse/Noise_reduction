import { useRef } from 'react';
import { useVisualizer } from '../hooks/useVisualizer';

type Props = {
  analyser: AnalyserNode | null;
  isActive: boolean;
};

const VisualizerCanvas = ({ analyser, isActive }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useVisualizer({ analyser, canvasRef, isActive });

  return (
    <div className="card" style={{ minHeight: '260px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: '#9da6ff', fontSize: '0.85rem' }}>Waveform Monitor</p>
          <h3 style={{ margin: 0 }}>Time-domain View</h3>
        </div>
        <span className={`pill ${isActive ? 'success' : ''}`}>{isActive ? 'Live' : 'Paused'}</span>
      </div>
      <canvas ref={canvasRef} width={960} height={200} style={{ width: '100%', height: '200px' }} />
    </div>
  );
};

export default VisualizerCanvas;

