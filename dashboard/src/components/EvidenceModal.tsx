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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-rose-100 text-rose-600 border border-rose-200">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900">Telemetry Infraction Audit</h3>
              <p className="text-xs font-semibold text-slate-500">Event ID: {event.event_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Left: Snapshot Frame */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evidentiary Capture
            </label>
            <div className="relative aspect-video rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center group shadow-inner">
              <div className="text-center p-4 z-20">
                <div className="inline-block p-3 rounded-full bg-white border border-slate-200 text-slate-400 mb-2 shadow-sm">
                  <UserX className="w-8 h-8 text-rose-500" />
                </div>
                <p className="text-xs font-bold text-slate-500">Flagged Frame Captured</p>
                <span className="text-[10px] text-slate-400 font-semibold">Timestamp: {event.timestamp}</span>
              </div>
              <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold tracking-wider shadow-sm">
                {event.severity}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">
              Encrypted on-device snapshot transmitted over secure WebSocket.
            </p>
          </div>

          {/* Right: AI Telemetry Breakdown */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Candidate & AI Analytics
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Student:</span>
                  <span className="font-bold text-slate-900">{candidate.name} <span className="text-slate-400">(#{candidate.student_id})</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Infraction Type:</span>
                  <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{event.subtype}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Model Confidence:</span>
                  <span className="font-bold text-emerald-600">{(event.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Trust Score After Hit:</span>
                  <span className={`font-black text-sm ${candidate.trust_score < 60 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {candidate.trust_score} / 100
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 font-medium">
                <span className="text-blue-500 block text-[10px] font-bold uppercase tracking-wider mb-1">Diagnostic Detail:</span>
                {event.message}
              </div>
            </div>

            {/* Direct Invigilator Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => onAction('WARN')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition-colors"
              >
                <ShieldAlert className="w-4 h-4" /> Issue Direct Proctor Warning
              </button>
              <button
                onClick={() => onAction('TERMINATE')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
              >
                <UserX className="w-4 h-4" /> Force Lock & Terminate Exam
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold">ProctorSentinel Audit Engine v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-colors shadow-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};