import { useState, useEffect } from 'react';
import { ShieldAlert, Users, AlertTriangle, Eye, Video, Mic, Bell, RefreshCw } from 'lucide-react';
import type { Candidate, TelemetryEvent } from './types';
import { EvidenceModal } from './components/EvidenceModal';

const INITIAL_CANDIDATES: Candidate[] = [
  { student_id: '49', name: 'Atharva Mandle', trust_score: 98, status: 'ACTIVE' },
  { student_id: '46', name: 'Taher Sanawadwala', trust_score: 82, status: 'ACTIVE', last_violation: 'GAZE_DEVIATION' },
  { student_id: '50', name: 'Anushka Patel', trust_score: 54, status: 'FLAGGED', last_violation: 'MULTIPLE_FACES_DETECTED' },
  { student_id: '52', name: 'Dimpal Sharma', trust_score: 92, status: 'ACTIVE' },
  { student_id: '38', name: 'Aryan Karande', trust_score: 100, status: 'ACTIVE' },
  { student_id: '12', name: 'Rohan Sharma', trust_score: 42, status: 'FLAGGED', last_violation: 'TAB_SWITCH_BLUR' },
];

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [activeAuditModal, setActiveAuditModal] = useState<{
    event: TelemetryEvent;
    candidate: Candidate;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      const sampleAlerts = [
        { subtype: 'MULTIPLE_FACES_DETECTED', severity: 'CRITICAL' as const, penalty: 15, msg: 'Additional face observed in frame' },
        { subtype: 'TAB_SWITCH_BLUR', severity: 'HIGH' as const, penalty: 12, msg: 'Exam window lost focus' },
        { subtype: 'GAZE_DEVIATION', severity: 'MEDIUM' as const, penalty: 5, msg: 'Off-screen gaze sustained > 3.5s' },
        { subtype: 'AUDIO_WHISPER', severity: 'LOW' as const, penalty: 3, msg: 'Whispering frequencies registered' },
      ];
      const alert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];

      const newEvent: TelemetryEvent = {
        event_id: `evt_${Math.random().toString(36).substring(2, 9)}`,
        student_id: randomCandidate.student_id,
        timestamp: new Date().toLocaleTimeString(),
        subtype: alert.subtype,
        severity: alert.severity,
        confidence: Number((0.85 + Math.random() * 0.14).toFixed(2)),
        message: alert.msg,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);

      setCandidates((prev) =>
        prev.map((c) => {
          if (c.student_id === randomCandidate.student_id) {
            const nextScore = Math.max(0, c.trust_score - alert.penalty);
            const updated: Candidate = {
              ...c,
              trust_score: nextScore,
              status: nextScore < 60 ? ('FLAGGED' as const) : c.status,
              last_violation: alert.subtype,
            };
            setSelectedCandidate((curr: Candidate | null) => (curr?.student_id === c.student_id ? updated : curr));
            return updated;
          }
          return c;
        })
      );
    }, 4500);

    return () => clearInterval(timer);
  }, [candidates]);

  const activeCount = candidates.filter((c) => c.status === 'ACTIVE').length;
  const flaggedCount = candidates.filter((c) => c.status === 'FLAGGED').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-[#111827] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-blue-500" />
          <h1 className="font-bold text-lg tracking-wide">
            ExamGuard <span className="text-xs font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">INVIGILATOR CONSOLE</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Active: <strong>{activeCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Flagged: <strong>{flaggedCount}</strong></span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        <div className="col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Live Session Candidates</h2>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" /> Synced via Go Engine
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {candidates.map((c) => {
              const isDanger = c.trust_score < 60;
              const isWarning = c.trust_score >= 60 && c.trust_score < 85;
              const ringColor = isDanger ? 'border-rose-500' : isWarning ? 'border-amber-500' : 'border-emerald-500';
              const badgeColor = isDanger ? 'bg-rose-500/20 text-rose-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400';

              return (
                <div
                  key={c.student_id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`cursor-pointer rounded-xl bg-[#111827] border p-4 transition-all hover:border-slate-500 ${
                    selectedCandidate?.student_id === c.student_id ? 'ring-2 ring-blue-500' : 'border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-200">Roll #{c.student_id}</h3>
                      <p className="text-xs text-slate-400">{c.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${badgeColor}`}>
                      {c.trust_score}%
                    </span>
                  </div>

                  <div className={`mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border ${ringColor}`}>
                    <div
                      className={`h-full transition-all duration-500 ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${c.trust_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                    <span className="truncate max-w-[120px]">{c.last_violation ?? 'Nominal'}</span>
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col h-72">
            <div className="flex items-center gap-2 mb-3 text-slate-300">
              <Bell className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold tracking-wide">Live Incident Feed</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {events.length === 0 ? (
                <p className="text-slate-500">Listening for telemetry anomalies...</p>
              ) : (
                events.map((e) => (
                  <div
                    key={e.event_id}
                    onClick={() => {
                      const candidate = candidates.find((c) => c.student_id === e.student_id);
                      if (candidate) {
                        setActiveAuditModal({ event: e, candidate });
                      }
                    }}
                    className="p-2.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex justify-between items-start cursor-pointer transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">#{e.student_id}</span>
                        <span className="font-mono text-[10px] text-slate-400">{e.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{e.message}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${e.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {e.subtype}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex-1">
            <h2 className="text-sm font-semibold tracking-wide text-slate-300 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" /> Selected Candidate Inspector
            </h2>
            {selectedCandidate ? (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-400">Candidate Name</p>
                  <p className="text-sm font-bold text-slate-200">{selectedCandidate.name} (Roll #{selectedCandidate.student_id})</p>
                </div>
                <div>
                  <p className="text-slate-400">Trust Index</p>
                  <p className="text-xl font-bold text-blue-400 font-mono">{selectedCandidate.trust_score} / 100</p>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800">
                  <p className="text-slate-400">Last Anomaly Flag</p>
                  <p className="font-mono text-rose-400 mt-1">{selectedCandidate.last_violation ?? 'None recorded'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => alert(`Warning dispatched to Roll #${selectedCandidate.student_id}`)}
                    className="flex-1 py-1.5 px-3 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded transition"
                  >
                    Warn Student
                  </button>
                  <button
                    onClick={() => alert(`Session locked for Roll #${selectedCandidate.student_id}`)}
                    className="flex-1 py-1.5 px-3 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded transition"
                  >
                    Lock Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 pb-8">
                Click any candidate card to view telemetry metrics
              </div>
            )}
          </div>
        </div>
      </div>

      <EvidenceModal
        event={activeAuditModal?.event ?? null}
        candidate={activeAuditModal?.candidate ?? null}
        onClose={() => setActiveAuditModal(null)}
        onAction={(action) => {
          alert(`Invigilator action [${action}] sent to Roll #${activeAuditModal?.candidate.student_id}`);
          setActiveAuditModal(null);
        }}
      />
    </div>
  );
}