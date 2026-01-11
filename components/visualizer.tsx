
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 160;
    };
    resize();
    window.addEventListener('resize', resize);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 繪製頻譜曲線 (Spectrum Line)
      ctx.beginPath();
      ctx.lineWidth = 4;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#22d3ee'); // cyan
      gradient.addColorStop(0.5, '#a855f7'); // purple
      gradient.addColorStop(1, '#22d3ee'); // cyan
      
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 添加外發光效果
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';

      const sliceWidth = canvas.width / (bufferLength / 2); // 只取一半頻率顯示，視覺效果較好
      let x = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        // 放大波動幅度
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        
        // 將 y 值限制在畫布內並增加平滑度
        const targetY = canvas.height - y - 10;

        if (i === 0) {
          ctx.moveTo(x, targetY);
        } else {
          const xc = x + sliceWidth / 2;
          const yc = targetY; // 簡化處理，實際可用貝塞爾曲線優化
          ctx.lineTo(x, targetY);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // 繪製底部鏡像弱化曲線
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      x = 0;
      for (let i = 0; i < bufferLength / 2; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 4;
        const targetY = (canvas.height / 2) + y;
        if (i === 0) ctx.moveTo(x, targetY);
        else ctx.lineTo(x, targetY);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    };

    if (isPlaying) {
      draw();
    } else {
      // 靜止時畫一條平滑的直線
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyser, isPlaying]);

  return (
    <div className="w-full h-40 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;
