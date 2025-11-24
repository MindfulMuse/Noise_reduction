export type NoiseReducerState = {
  isStreaming: boolean;
  isNoiseSuppressionOn: boolean;
  level: number;
  error: string | null;
};

export type StartStreamParams = {
  stream?: MediaStream;
  constraints?: MediaStreamConstraints;
};

export type NoiseReducerOptions = {
  sampleRate?: number;
  thresholdDb?: number;
  useWorklet?: boolean;
  workletUrl?: string;
  rnnoiseWasmUrl?: string;
};

