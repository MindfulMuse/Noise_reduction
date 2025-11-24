const DEFAULT_SAMPLE_RATE = 48000;

export const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    channelCount: 1,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: DEFAULT_SAMPLE_RATE
  },
  video: false
};

export type ScriptProcessorConfig = {
  bufferSize?: 2048 | 4096 | 1024 | 512;
  thresholdDb?: number;
  smoothing?: number;
};

type NoiseGateState = {
  enabled: boolean;
  attack: number;
  release: number;
  previousGain: number;
};

const dbToGain = (db: number) => 10 ** (db / 20);

export const createAudioContext = (sampleRate = DEFAULT_SAMPLE_RATE) =>
  new AudioContext({ sampleRate, latencyHint: 'interactive' });

export const initNoiseWorklet = async (
  context: AudioContext,
  workletUrl = '/noise-worklet.js'
) => {
  if (!('audioWorklet' in context)) {
    throw new Error('AudioWorklet is not supported in this browser');
  }

  await context.audioWorklet.addModule(workletUrl);
  return new AudioWorkletNode(context, 'noise-gate-processor', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1]
  });
};

export const createScriptNoiseProcessor = (
  context: AudioContext,
  config: ScriptProcessorConfig = {}
) => {
  const { bufferSize = 2048, thresholdDb = -45, smoothing = 0.15 } = config;
  const node = context.createScriptProcessor(bufferSize, 1, 1);
  const gate: NoiseGateState = {
    enabled: true,
    attack: 0.04,
    release: 0.12,
    previousGain: 1
  };

  const thresholdGain = dbToGain(thresholdDb);

  node.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    if (!gate.enabled) {
      output.set(input);
      return;
    }

    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * input[i];
    }
    const rms = Math.sqrt(sum / input.length);
    const gainTarget = rms < thresholdGain ? 0 : 1;
    const coefficient = gainTarget > gate.previousGain ? gate.attack : gate.release;
    const smoothed = gate.previousGain + coefficient * (gainTarget - gate.previousGain);
    gate.previousGain = smoothed * (1 - smoothing) + gainTarget * smoothing;

    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] * gate.previousGain;
    }
  };

  const setEnabled = (value: boolean) => {
    gate.enabled = value;
    gate.previousGain = value ? gate.previousGain : 1;
  };

  return { node, setEnabled };
};

export const createAnalyser = (context: AudioContext) => {
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  return analyser;
};

