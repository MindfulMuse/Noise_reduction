import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_CONSTRAINTS,
  createAnalyser,
  createAudioContext,
  createScriptNoiseProcessor,
  initNoiseWorklet
} from '../utils/audioGraph';
import type { NoiseReducerOptions, StartStreamParams } from '../types/audio';

type UseAudioNoiseReducerResult = {
  startStream: (params?: StartStreamParams) => Promise<void>;
  stopStream: () => void;
  toggleNoiseSuppression: (force?: boolean) => void;
  isStreaming: boolean;
  isNoiseSuppressionOn: boolean;
  analyserNode: AnalyserNode | null;
  level: number;
  error: string | null;
};

export const useAudioNoiseReducer = (
  options?: NoiseReducerOptions
): UseAudioNoiseReducerResult => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isNoiseSuppressionOn, setNoiseSuppressionOn] = useState(true);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<AudioNode | null>(null);
  const scriptControllerRef = useRef<{ setEnabled: (value: boolean) => void } | null>(null);
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const monitorLevel = useCallback(() => {
    if (!analyserRef.current) {
      return;
    }
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
    cleanupLevelMonitor();
    stopNodes();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setIsStreaming(false);
  }, [cleanupLevelMonitor, stopNodes]);

  const prepareProcessor = useCallback(
    async (context: AudioContext) => {
      if (options?.useWorklet !== false) {
        try {
          const worklet = await initNoiseWorklet(context, options?.workletUrl);
          if (options?.rnnoiseWasmUrl) {
            worklet.port.postMessage({
              type: 'configureRnnoise',
              payload: { url: options.rnnoiseWasmUrl }
            });
          }
          return worklet;
        } catch (workletError) {
          console.warn('Falling back to ScriptProcessorNode', workletError);
        }
      }

      const script = createScriptNoiseProcessor(context, {
        thresholdDb: options?.thresholdDb
      });
      scriptControllerRef.current = script;
      return script.node;
    },
    [options]
  );

  const startStream = useCallback(
    async (params?: StartStreamParams) => {
      if (isStreaming) {
        return;
      }

      try {
        const stream =
          params?.stream ??
          (await navigator.mediaDevices.getUserMedia(
            params?.constraints ?? DEFAULT_CONSTRAINTS
          ));

        const audioContext = createAudioContext(options?.sampleRate);
        audioContextRef.current = audioContext;

        const sourceNode = audioContext.createMediaStreamSource(stream);
        const analyser = createAnalyser(audioContext);
        const processor = await prepareProcessor(audioContext);

        if (!processor) {
          throw new Error('Unable to initialise noise processor');
        }

        sourceRef.current = sourceNode;
        analyserRef.current = analyser;
        processorRef.current = processor;
        streamRef.current = stream;

        sourceNode.connect(processor as AudioNode);
        (processor as AudioNode).connect(analyser);
        analyser.connect(audioContext.destination);

        if (processor instanceof AudioWorkletNode) {
          processor.port.postMessage({ type: 'toggle', payload: isNoiseSuppressionOn });
        } else if (scriptControllerRef.current) {
          scriptControllerRef.current.setEnabled(isNoiseSuppressionOn);
        }

        setIsStreaming(true);
        setError(null);
        monitorLevel();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        stopStream();
      }
    },
    [
      isStreaming,
      isNoiseSuppressionOn,
      monitorLevel,
      options?.sampleRate,
      prepareProcessor,
      stopStream
    ]
  );

  const toggleNoiseSuppression = useCallback(
    (force?: boolean) => {
      const nextState = force ?? !isNoiseSuppressionOn;
      setNoiseSuppressionOn(nextState);

      if (processorRef.current instanceof AudioWorkletNode) {
        processorRef.current.port.postMessage({ type: 'toggle', payload: nextState });
      } else if (scriptControllerRef.current) {
        scriptControllerRef.current.setEnabled(nextState);
      }
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
    analyserNode: analyserRef.current,
    level,
    error
  };
};

export default useAudioNoiseReducer;

