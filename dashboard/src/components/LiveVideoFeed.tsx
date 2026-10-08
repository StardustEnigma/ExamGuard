import React, { useState, useEffect } from 'react';
import type { Candidate } from '../types';

interface LiveVideoFeedProps {
  candidate: Candidate | null;
  onWarn?: (studentId: string) => void;
  onLock?: (studentId: string) => void;
}

export const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({
  candidate,
  onWarn,
  onLock,
}) => {
  // Waveform bars animation
  const [waveHeights, setWaveHeights] = useState<number[]>([
    20, 35, 60, 45, 80, 55, 30, 70, 90, 65, 40, 85, 50, 30, 20, 45, 75, 60, 35, 20
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => 15 + Math.floor(Math.random() * 75))
      );
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const videoImage = candidate?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
        Mock Video Feed
      </h3>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        {/* Video Frame */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 group select-none">
          {/* Feed Photo */}
          <img
            src={videoImage}
            alt="Candidate Live Feed"
            className="w-full h-full object-cover brightness-95 contrast-105"
          />

          {/* AI Face Detection Bounding Box */}
          <div className="absolute top-[22%] left-[34%] w-[32%] h-[52%] border-2 border-[#38BDF8] rounded-xs shadow-[0_0_12px_rgba(56,189,248,0.5)] pointer-events-none">
            {/* Outer Box Accent */}
            <div className="absolute -inset-1.5 border border-[#38BDF8]/40 rounded-xs pointer-events-none" />
          </div>

          {/* Top Left HUD */}
          <div className="absolute top-2.5 left-3 text-[10px] font-mono text-white/80 tracking-wider pointer-events-none">
            [· HUD ·]
          </div>

          {/* Top Right Battery HUD */}
          <div className="absolute top-2.5 right-3 text-[10px] font-mono text-white/80 tracking-wider flex items-center gap-1 pointer-events-none">
            <span>HUB</span>
            <span className="inline-block w-4 h-2 border border-white/80 rounded-xs relative">
              <span className="absolute inset-0.5 bg-white/80 rounded-xs" />
            </span>
          </div>

          {/* Bottom Left Gaze Status HUD */}
          <div className="absolute bottom-2.5 left-3 text-[11px] font-mono text-white/90 leading-tight pointer-events-none drop-shadow-md">
            <p>Gaze Status: Normal</p>
            <p className="text-white/70">Gaze Status: Normal</p>
          </div>
        </div>

        {/* Audio Waveform Visualizer */}
        <div className="relative py-1.5 flex items-center justify-center gap-1 h-8 px-2 overflow-hidden">
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-b border-dotted border-slate-300 pointer-events-none" />
          {waveHeights.map((h, i) => (
            <span
              key={i}
              className="relative z-10 w-1 bg-[#14B8A6] rounded-full transition-all duration-200"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => candidate && onWarn?.(candidate.student_id)}
            className="flex-1 py-2 px-3 rounded-xl border border-[#3B82F6] text-[#2563EB] bg-white hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Warn Student
          </button>

          <button
            onClick={() => candidate && onLock?.(candidate.student_id)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Lock Screen
          </button>
        </div>
      </div>
    </div>
  );
};
