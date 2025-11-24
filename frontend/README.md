# Real-time Noise Reduction Frontend

This Vite + React app captures audio from any connected device, applies low-latency DSP inside the browser (AudioContext + AudioWorklet/RNNoise), and plays the cleaned stream back through the user's speakers. It also exposes hooks for consuming a WebRTC stream coming from another device (phone → laptop).

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome/Edge. Grant microphone permissions when asked.

## Testing with a phone source

1. Make sure your laptop and phone share the same Wi-Fi network.
2. Start a WebRTC session from the phone (the phone can publish via a minimal page that captures its mic and sends it across). You can repurpose `server.py` or any lightweight signaling channel (WebSocket, Firebase, etc.).
3. On the laptop/browser, use the helper in `src/utils/webrtc.ts` to create a peer connection, accept the phone's SDP answer, and obtain the remote `MediaStream`. Pass that stream to `startStream({ stream })` from `useAudioNoiseReducer`.
4. The hook reuses the same downstream DSP graph (noise worklet + analyser + speakers), so the remote audio is filtered exactly like the local mic.

## Architecture overview

- `src/hooks/useAudioNoiseReducer.ts`: Orchestrates the AudioContext graph, toggles ScriptProcessor vs AudioWorklet, and streams the cleaned audio to `audioContext.destination`.
- `public/noise-worklet.js`: Runs in the audio render thread. It can act as a simple noise gate or load an RNNoise WebAssembly module for full suppression.
- `src/utils/audioGraph.ts`: Factory utilities for common nodes (context, gate, analyser) plus capture constraints tuned for low latency.
- `src/utils/webrtc.ts`: Minimal helpers for attaching remote tracks from an external device via WebRTC.
- `src/components/*`: View layer — buttons, visualizer, and state readouts.

## RNNoise / WASM

Drop a compiled `rnnoise.wasm` file into `public/wasm/rnnoise.wasm`, then pass its URL to `useAudioNoiseReducer({ rnnoiseWasmUrl: '/wasm/rnnoise.wasm' })`. The worklet will fetch and instantiate the model and automatically route frames through RNNoise instead of the built-in gate.

## Key Commands

- `npm run dev` – start the hot-reload dev server
- `npm run build` – type-check + production bundle
- `npm run preview` – inspect the production build locally

