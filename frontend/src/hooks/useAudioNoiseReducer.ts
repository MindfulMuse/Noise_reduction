// previous code 
// import { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   DEFAULT_CONSTRAINTS,
//   createAnalyser,
//   createAudioContext,
//   createScriptNoiseProcessor,
//   initNoiseWorklet
// } from '../utils/audioGraph';
// import type { NoiseReducerOptions, StartStreamParams } from '../types/audio';

// type UseAudioNoiseReducerResult = {
//   startStream: (params?: StartStreamParams) => Promise<void>;
//   stopStream: () => void;
//   toggleNoiseSuppression: (force?: boolean) => void;
//   isStreaming: boolean;
//   isNoiseSuppressionOn: boolean;
//   analyserNode: AnalyserNode | null;
//   level: number;
//   error: string | null;
// };

// export const useAudioNoiseReducer = (
//   options?: NoiseReducerOptions
// ): UseAudioNoiseReducerResult => {
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [isNoiseSuppressionOn, setNoiseSuppressionOn] = useState(true);
//   const [level, setLevel] = useState(0);
//   const [error, setError] = useState<string | null>(null);

//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
//   const processorRef = useRef<AudioNode | null>(null);
//   const scriptControllerRef = useRef<{ setEnabled: (value: boolean) => void } | null>(null);
//   const rafRef = useRef<number>();
//   const streamRef = useRef<MediaStream | null>(null);

//   const monitorLevel = useCallback(() => {
//     if (!analyserRef.current) {
//       return;
//     }
//     const analyser = analyserRef.current;
//     const dataArray = new Uint8Array(analyser.fftSize);

//     const tick = () => {
//       analyser.getByteTimeDomainData(dataArray);
//       let peak = 0;
//       for (let i = 0; i < dataArray.length; i++) {
//         const deviation = Math.abs(dataArray[i] - 128) / 128;
//         if (deviation > peak) peak = deviation;
//       }
//       setLevel(peak);
//       rafRef.current = requestAnimationFrame(tick);
//     };

//     tick();
//   }, []);

//   const cleanupLevelMonitor = useCallback(() => {
//     if (rafRef.current) {
//       cancelAnimationFrame(rafRef.current);
//       rafRef.current = undefined;
//     }
//     setLevel(0);
//   }, []);

//   const stopNodes = useCallback(() => {
//     sourceRef.current?.disconnect();
//     sourceRef.current = null;
//     if (processorRef.current) {
//       processorRef.current.disconnect();
//       processorRef.current = null;
//     }
//     analyserRef.current?.disconnect();
//     analyserRef.current = null;
//   }, []);

//   const stopStream = useCallback(() => {
//     cleanupLevelMonitor();
//     stopNodes();

//     streamRef.current?.getTracks().forEach((track) => track.stop());
//     streamRef.current = null;

//     audioContextRef.current?.close();
//     audioContextRef.current = null;

//     setIsStreaming(false);
//   }, [cleanupLevelMonitor, stopNodes]);

//   const prepareProcessor = useCallback(
//     async (context: AudioContext) => {
//       if (options?.useWorklet !== false) {
//         try {
//           const worklet = await initNoiseWorklet(context, options?.workletUrl);
//           if (options?.rnnoiseWasmUrl) {
//             worklet.port.postMessage({
//               type: 'configureRnnoise',
//               payload: { url: options.rnnoiseWasmUrl }
//             });
//           }
//           return worklet;
//         } catch (workletError) {
//           console.warn('Falling back to ScriptProcessorNode', workletError);
//         }
//       }

//       const script = createScriptNoiseProcessor(context, {
//         thresholdDb: options?.thresholdDb
//       });
//       scriptControllerRef.current = script;
//       return script.node;
//     },
//     [options]
//   );

//   const startStream = useCallback(
//     async (params?: StartStreamParams) => {
//       if (isStreaming) {
//         return;
//       }

//       try {
//         const stream =
//           params?.stream ??
//           (await navigator.mediaDevices.getUserMedia(
//             params?.constraints ?? DEFAULT_CONSTRAINTS
//           ));

//         const audioContext = createAudioContext(options?.sampleRate);
//         audioContextRef.current = audioContext;

//         const sourceNode = audioContext.createMediaStreamSource(stream);
//         const analyser = createAnalyser(audioContext);
//         const processor = await prepareProcessor(audioContext);

//         if (!processor) {
//           throw new Error('Unable to initialise noise processor');
//         }

//         sourceRef.current = sourceNode;
//         analyserRef.current = analyser;
//         processorRef.current = processor;
//         streamRef.current = stream;

//         sourceNode.connect(processor as AudioNode);
//         (processor as AudioNode).connect(analyser);
//         analyser.connect(audioContext.destination);

//         if (processor instanceof AudioWorkletNode) {
//           processor.port.postMessage({ type: 'toggle', payload: isNoiseSuppressionOn });
//         } else if (scriptControllerRef.current) {
//           scriptControllerRef.current.setEnabled(isNoiseSuppressionOn);
//         }

//         setIsStreaming(true);
//         setError(null);
//         monitorLevel();
//       } catch (err) {
//         setError(err instanceof Error ? err.message : String(err));
//         stopStream();
//       }
//     },
//     [
//       isStreaming,
//       isNoiseSuppressionOn,
//       monitorLevel,
//       options?.sampleRate,
//       prepareProcessor,
//       stopStream
//     ]
//   );

//   const toggleNoiseSuppression = useCallback(
//     (force?: boolean) => {
//       const nextState = force ?? !isNoiseSuppressionOn;
//       setNoiseSuppressionOn(nextState);

//       if (processorRef.current instanceof AudioWorkletNode) {
//         processorRef.current.port.postMessage({ type: 'toggle', payload: nextState });
//       } else if (scriptControllerRef.current) {
//         scriptControllerRef.current.setEnabled(nextState);
//       }
//     },
//     [isNoiseSuppressionOn]
//   );

//   useEffect(
//     () => () => {
//       stopStream();
//     },
//     [stopStream]
//   );

//   return {
//     startStream,
//     stopStream,
//     toggleNoiseSuppression,
//     isStreaming,
//     isNoiseSuppressionOn,
//     analyserNode: analyserRef.current,
//     level,
//     error
//   };
// };

// export default useAudioNoiseReducer;


// src/hooks/useAudioNoiseReducer.ts
// Updated to use WebSocket connection to Python DeepFilterNet server

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CONSTRAINTS, createAnalyser, createAudioContext } from '../utils/audioGraph';
import { DeepFilterWebSocket, float32ToInt16, int16ToFloat32 } from '../utils/websocket';
import type { NoiseReducerOptions, StartStreamParams } from '../types/audio';

const BUFFER_SIZE = 4096;

type UseAudioNoiseReducerResult = {
  startStream: (params?: StartStreamParams) => Promise<void>;
  stopStream: () => void;
  toggleNoiseSuppression: (force?: boolean) => void;
  isStreaming: boolean;
  isNoiseSuppressionOn: boolean;
  isConnected: boolean;
  analyserNode: AnalyserNode | null;
  level: number;
  error: string | null;
  stats: {
    chunksSent: number;
    chunksReceived: number;
  };
};

export const useAudioNoiseReducer = (
  options?: NoiseReducerOptions
): UseAudioNoiseReducerResult => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isNoiseSuppressionOn, setNoiseSuppressionOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ chunksSent: 0, chunksReceived: 0 });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<DeepFilterWebSocket | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const role = options?.role || 'sender';
  const serverUrl = options?.serverUrl || 'ws://localhost:8080/ws';

  // Initialize WebSocket connection
  useEffect(() => {
    console.log(`[Hook] Initializing WebSocket as ${role}...`);
    
    const ws = new DeepFilterWebSocket({
      url: serverUrl,
      role,
      onOpen: () => {
        console.log('[Hook] WebSocket connected');
        setIsConnected(true);
        setError(null);
      },
      onClose: () => {
        console.log('[Hook] WebSocket disconnected');
        setIsConnected(false);
      },
      onError: (err) => {
        console.error('[Hook] WebSocket error:', err);
        setError('WebSocket connection failed');
        setIsConnected(false);
      },
      onAudioData: async (data) => {
        // Receiver: play cleaned audio
        if (role === 'receiver' && audioContextRef.current) {
          await playCleanAudio(data);
          setStats(prev => ({ ...prev, chunksReceived: prev.chunksReceived + 1 }));
        }
      }
    });

    wsRef.current = ws;
    ws.connect();

    return () => {
      console.log('[Hook] Cleaning up WebSocket');
      ws.disconnect();
    };
  }, [serverUrl, role]);

  // Play received clean audio (for receivers)
  const playCleanAudio = async (arrayBuffer: ArrayBuffer) => {
  const context = audioContextRef.current;
  const analyser = analyserRef.current;
  if (!context || !analyser) return;

    if (!context) return;

    try {
      const float32 = int16ToFloat32(arrayBuffer);
      const buffer = context.createBuffer(1, float32.length, context.sampleRate);
      buffer.getChannelData(0).set(float32);

      // const source = context.createBufferSource();
      // source.buffer = buffer;
      // source.connect(context.destination);

         const source = context.createBufferSource();
source.buffer = buffer;

// Connect through analyser for visualization!
source.connect(analyser);
analyser.connect(context.destination);


      // Schedule playback to avoid gaps
      const currentTime = context.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;

    } catch (err) {
      console.error('[Hook] Playback error:', err);
    }
  };

  // Monitor audio level
  const monitorLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const deviation = Math.abs(dataArray[i] - 128) / 128;
        if (deviation > peak) peak = deviation;
      }
      setLevel(peak);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const cleanupLevelMonitor = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    setLevel(0);
  }, []);

  const stopNodes = useCallback(() => {
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    analyserRef.current?.disconnect();
    analyserRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    console.log('[Hook] Stopping stream...');
    cleanupLevelMonitor();
    stopNodes();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setIsStreaming(false);
    nextPlayTimeRef.current = 0;
  }, [cleanupLevelMonitor, stopNodes]);

  const startStream = useCallback(
    async (params?: StartStreamParams) => {
      if (isStreaming) {
        console.log('[Hook] Already streaming');
        return;
      }

      if (!wsRef.current?.isConnected()) {
        setError('Not connected to server. Please wait...');
        return;
      }

      try {
        console.log(`[Hook] Starting stream as ${role}...`);
        
        const audioContext = createAudioContext(options?.sampleRate);
        audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Create analyser for BOTH sender and receiver
        const analyser = createAnalyser(audioContext);
        analyserRef.current = analyser;
        console.log('[Hook] Analyser created:', {
       fftSize: analyser.fftSize,
       frequencyBinCount: analyser.frequencyBinCount
      });

        if (role === 'sender') {
          // SENDER MODE: Capture mic and send to server
          const stream = params?.stream ?? 
            await navigator.mediaDevices.getUserMedia(
              params?.constraints ?? DEFAULT_CONSTRAINTS
            );

          streamRef.current = stream;
          const sourceNode = audioContext.createMediaStreamSource(stream);
          // const analyser = createAnalyser(audioContext);

          // Create script processor to capture and send audio
          const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

          processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);

            // Send to Python server if noise suppression is ON
            if (isNoiseSuppressionOn && wsRef.current?.isConnected()) {
              const int16Buffer = float32ToInt16(inputData);
              wsRef.current.send(int16Buffer);
              setStats(prev => ({ ...prev, chunksSent: prev.chunksSent + 1 }));
            }

            // Pass through for local monitoring
            const outputData = event.outputBuffer.getChannelData(0);
            outputData.set(inputData);
          };

          sourceRef.current = sourceNode;
          // analyserRef.current = analyser;
          processorRef.current = processor;

          sourceNode.connect(analyser);
          analyser.connect(processor);
          processor.connect(audioContext.destination);

          monitorLevel();

        } else {
          // RECEIVER MODE: Just wait for incoming audio
          console.log('[Hook] Receiver ready - waiting for audio...');
        }

        monitorLevel();

        setIsStreaming(true);
        setError(null);

      } catch (err) {
        console.error('[Hook] Stream start error:', err);
        setError(err instanceof Error ? err.message : String(err));
        stopStream();
      }
    },
    [isStreaming, isNoiseSuppressionOn, role, options?.sampleRate, monitorLevel, stopStream]
  );

  const toggleNoiseSuppression = useCallback(
    (force?: boolean) => {
      const nextState = force ?? !isNoiseSuppressionOn;
      console.log(`[Hook] Noise suppression: ${nextState ? 'ON' : 'OFF'}`);
      setNoiseSuppressionOn(nextState);
    },
    [isNoiseSuppressionOn]
  );

  useEffect(
    () => () => {
      stopStream();
    },
    [stopStream]
  );

  return {
    startStream,
    stopStream,
    toggleNoiseSuppression,
    isStreaming,
    isNoiseSuppressionOn,
    isConnected,
    analyserNode: analyserRef.current,
    level,
    error,
    stats
  };
};

export default useAudioNoiseReducer;