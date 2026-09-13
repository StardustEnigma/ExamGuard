import React from 'react';
import { X, AlertOctagon, ShieldAlert, UserX } from 'lucide-react';
import type { TelemetryEvent, Candidate } from '../types';

interface EvidenceModalProps {
  event: TelemetryEvent | null;
  candidate: Candidate | null;
  onClose: () => void;
  onAction: (actionType: 'WARN' | 'TERMINATE') => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  event,
  candidate,
  onClose,
  onAction,
}) => {
  if (!event || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-100">Telemetry Infraction Audit</h3>
              <p className="text-xs font-mono text-slate-400">Event ID: {event.event_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Left: Snapshot Frame */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Evidentiary Capture (MinIO / S3)
            </label>
            <div className="relative aspect-video rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center group">
              {/* Simulated camera capture graphic */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
              <div className="text-center p-4 z-20">
                <div className="inline-block p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-2">
                  <UserX className="w-8 h-8 text-rose-400/80" />
                </div>
                <p className="text-xs font-mono text-slate-400">Flagged Frame Captured</p>
                <span className="text-[10px] text-slate-500 font-mono">Timestamp: {event.timestamp}</span>
              </div>
              <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-rose-500/80 text-white text-[10px] font-bold tracking-wider">
                {event.severity}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Encrypted on-device snapshot transmitted over secure WebSocket.
            </p>
          </div>

          {/* Right: AI Telemetry Breakdown */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Candidate & Edge-AI Analytics
              </label>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-semibold text-slate-200">{candidate.name} (Roll #{candidate.student_id})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Infraction Type:</span>
                  <span className="font-mono text-amber-400">{event.subtype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-emerald-400">{(event.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trust Score After Hit:</span>
                  <span className={`font-mono font-bold ${candidate.trust_score < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {candidate.trust_score} / 100
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-2.5 text-xs text-slate-300">
                <span className="text-slate-400 block text-[11px] mb-1">Diagnostic Detail:</span>
                {event.message}
              </div>
            </div>

            {/* Direct Invigilator Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onAction('WARN')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium text-xs transition"
              >
                <ShieldAlert className="w-4 h-4" /> Issue Direct Proctor Warning
              </button>
              <button
                onClick={() => onAction('TERMINATE')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium text-xs transition"
              >
                <UserX className="w-4 h-4" /> Force Lock & Terminate Exam
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-[#0e1422] px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>ProctorSentinel Audit Engine v1.0</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};