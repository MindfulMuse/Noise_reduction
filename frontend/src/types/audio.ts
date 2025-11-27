// export type NoiseReducerState = {
//   isStreaming: boolean;
//   isNoiseSuppressionOn: boolean;
//   level: number;
//   error: string | null;
// };

// export type StartStreamParams = {
//   stream?: MediaStream;
//   constraints?: MediaStreamConstraints;
// };

// export type NoiseReducerOptions = {
//   sampleRate?: number;
//   thresholdDb?: number;
//   useWorklet?: boolean;
//   workletUrl?: string;
//   rnnoiseWasmUrl?: string;
// };


// src/types/audio.ts

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
  // NEW: WebSocket options
  serverUrl?: string; // DeepFilterNet server URL
  role?: 'sender' | 'receiver'; // Device role
};

// NEW: WebSocket specific types
export type DeepFilterRole = 'sender' | 'receiver';

export type WebSocketState = {
  connected: boolean;
  connecting: boolean;
  error: string | null;
};

export type DeepFilterStats = {
  chunksSent: number;
  chunksReceived: number;
  bytesProcessed: number;
  latency: number;
};