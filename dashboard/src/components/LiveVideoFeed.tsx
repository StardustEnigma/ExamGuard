import React, { useState, useEffect } from 'react';
import type { Candidate } from '../types';

interface LiveVideoFeedProps {
  candidate: Candidate | null;
  onWarn?: (studentId: string) => void;
  onLock?: (studentId: string) => void;
  onTerminate?: (studentId: string) => void;
}

export const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({
  candidate,
  onWarn,
  onLock,
  onTerminate,
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
  const isGazeDeviated = candidate?.last_violation === 'GAZE_DEVIATION';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Mock Video Feed
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          {candidate ? `${candidate.name} • 1080p` : 'Stream: Inactive'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        {/* Video Viewport with Corner HUD Brackets & Bounding Box */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 group select-none">
          {/* Feed Photo */}
          <img
            src={videoImage}
            alt="Candidate Live Feed"
            className="w-full h-full object-cover brightness-95 contrast-105"
          />

          {/* Viewport Corner HUD Brackets */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* AI Face Detection Bounding Box */}
          <div className="absolute top-[20%] left-[34%] w-[32%] h-[54%] border-2 border-cyan-400 rounded-xs shadow-[0_0_12px_rgba(34,211,238,0.4)] pointer-events-none">
            <div className="absolute -inset-1 border border-cyan-400/30 rounded-xs pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-cyan-300 pointer-events-none" />
          </div>

          {/* Top-Right HUD Tag */}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-slate-900/70 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
              HUD ACTIVE
            </span>
          </div>

          {/* Bottom-Left Live Indicator Pill */}
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-white/20 text-white text-[11px] font-medium shadow-md">
              <span className={`w-2 h-2 rounded-full ${isGazeDeviated ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span>
                Gaze:{' '}
                <strong className={isGazeDeviated ? 'text-rose-300 font-bold' : 'text-emerald-300 font-semibold'}>
                  {isGazeDeviated ? 'Deviated' : 'Normal'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Audio Waveform Visualizer */}
        <div className="relative py-1.5 flex items-center justify-center gap-1 h-8 px-2 overflow-hidden bg-slate-50/60 rounded-lg border border-slate-100">
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-b border-dotted border-slate-300 pointer-events-none" />
          {waveHeights.map((h, i) => (
            <span
              key={i}
              className="relative z-10 w-1 bg-teal-500 rounded-full transition-all duration-200"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* 3 Equal Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <button
            onClick={() => candidate && onWarn?.(candidate.student_id)}
            className="py-2 px-2 rounded-xl border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-xs font-bold transition-colors shadow-xs text-center cursor-pointer active:scale-98"
          >
            Warn
          </button>

          <button
            onClick={() => candidate && onLock?.(candidate.student_id)}
            className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs text-center cursor-pointer active:scale-98"
          >
            Lock Screen
          </button>

          <button
            onClick={() => candidate && onTerminate?.(candidate.student_id)}
            className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs text-center cursor-pointer active:scale-98"
          >
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
};
