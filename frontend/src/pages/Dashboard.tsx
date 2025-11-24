import AudioControls from '../components/AudioControls';
import NoiseToggle from '../components/NoiseToggle';
import StreamStatus from '../components/StreamStatus';
import VisualizerCanvas from '../components/VisualizerCanvas';
import { useAudioNoiseReducer } from '../hooks/useAudioNoiseReducer';

const Dashboard = () => {
  const {
    startStream,
    stopStream,
    toggleNoiseSuppression,
    analyserNode,
    isStreaming,
    isNoiseSuppressionOn,
    level,
    error
  } = useAudioNoiseReducer({
    thresholdDb: -50,
    useWorklet: true
  });

  return (
    <main className="grid" style={{ gap: '1.5rem' }}>
      <header>
        <p className="pill">Real-time Noise Reduction</p>
        <h1 style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>Noise Cleaner</h1>
        <p style={{ color: '#9da6ff', maxWidth: '620px' }}>
          Capture audio from any external device, apply client-side DSP (noise gating, RNNoise, or
          custom WebAssembly models), and monitor the cleaned output with sub-30ms latency.
        </p>
      </header>

      <StreamStatus isStreaming={isStreaming} error={error} />

      <div className="grid grid-2">
        <AudioControls
          isStreaming={isStreaming}
          level={level}
          onStart={() => startStream()}
          onStop={stopStream}
        />
        <NoiseToggle isOn={isNoiseSuppressionOn} onToggle={() => toggleNoiseSuppression()} />
      </div>

      <VisualizerCanvas analyser={analyserNode} isActive={isStreaming} />
    </main>
  );
};

export default Dashboard;

