//E:\tp\random\frontend\src\hooks\useVisualizer.ts

import { useEffect } from 'react';
import type { RefObject } from 'react';

type Props = {
  analyser: AnalyserNode | null;
  canvasRef: RefObject<HTMLCanvasElement>;
  isActive: boolean;
};

export const useVisualizer = ({ analyser, canvasRef, isActive }: Props) => {
  useEffect(() => {
    if (!analyser || !canvasRef.current || !isActive) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrame: number;

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(5, 6, 10, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#55f7c8';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [analyser, canvasRef, isActive]);
};

