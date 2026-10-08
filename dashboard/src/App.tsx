import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import type { Candidate, TelemetryEvent, ConnectionStatus } from './types';
import { telemetrySocket } from './services/websocket';
import { Sidebar } from './components/Sidebar';
import { LiveVideoFeed } from './components/LiveVideoFeed';
import { AnomalyFeed } from './components/AnomalyFeed';
import { EvidenceModal } from './components/EvidenceModal';

const INITIAL_CANDIDATES: Candidate[] = [
  {
    student_id: '46',
    name: 'Taher Sanawadwala',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    trust_score: 98.4,
    status: 'ACTIVE',
    hasDot: false,
  },
  {
    student_id: '50',
    name: 'Anushka Patel',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    trust_score: 86.1,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '47',
    name: 'Taher Sanawadwala',
    roll_id: 'R...',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    trust_score: 98.4,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '51',
    name: 'Anushka Patel',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    trust_score: 77.3,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '48',
    name: 'Anushkan Fiavn',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    trust_score: 87.1,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '52',
    name: 'Anushka Pateri',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    trust_score: 87.3,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '38',
    name: 'Taher Sanawadwala',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    trust_score: 92.4,
    status: 'ACTIVE',
    hasDot: true,
  },
  {
    student_id: '12',
    name: 'Anushka Patel',
    roll_id: 'Rollins...',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    trust_score: 89.0,
    status: 'ACTIVE',
    hasDot: true,
  },
];

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(INITIAL_CANDIDATES[0]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [activeAuditModal, setActiveAuditModal] = useState<{ event: TelemetryEvent; candidate: Candidate } | null>(null);

  // Incoming WebSocket Event Handler
  const handleIncomingEvent = useCallback((newEvent: TelemetryEvent) => {
    setEvents((prev) => [newEvent, ...prev.slice(0, 39)]);

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.student_id === newEvent.student_id) {
          const penalty = newEvent.penalty || (newEvent.severity === 'CRITICAL' ? 15 : 10);
          const nextScore = Math.max(0, Number((c.trust_score - penalty).toFixed(1)));
          const updated: Candidate = {
            ...c,
            trust_score: nextScore,
            status: nextScore < 60 ? 'FLAGGED' : c.status,
            last_violation: newEvent.subtype,
          };
          setSelectedCandidate((curr) => (curr?.student_id === c.student_id ? updated : curr));
          return updated;
        }
        return c;
      })
    );
  }, []);

  // Connect to Go Edge Server via WebSocket
  useEffect(() => {
    telemetrySocket.connect();

    const unsubStatus = telemetrySocket.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubEvents = telemetrySocket.subscribe(handleIncomingEvent);

    return () => {
      unsubStatus();
      unsubEvents();
      telemetrySocket.disconnect();
    };
  }, [handleIncomingEvent]);

  // Simulate Anomaly Button click handler
  const handleSimulateAnomaly = () => {
    const samples: Array<Partial<TelemetryEvent>> = [
      {
        student_id: '50',
        student_name: 'Anushka Patel',
        category: 'VISION',
        subtype: 'MULTIPLE_FACES_DETECTED',
        severity: 'CRITICAL',
        confidence: 0.99,
        message: 'Secondary face detected in camera viewport at (x: 0.72, y: 0.45).',
        penalty: 14.5,
      },
      {
        student_id: '12',
        student_name: 'Priya Singh',
        category: 'ENVIRONMENT',
        subtype: 'TAB_SWITCH_BLUR',
        severity: 'HIGH',
        confidence: 1.0,
        message: 'Persistent Screen Blur: Candidate switched browser tab.',
        penalty: 12.0,
      },
      {
        student_id: '46',
        student_name: 'Taher Sanawadwala',
        category: 'VISION',
        subtype: 'GAZE_DEVIATION',
        severity: 'MEDIUM',
        confidence: 0.95,
        message: 'Gaze deviation outside frame detected for 3.8s.',
        penalty: 7.5,
      },
      {
        student_id: '51',
        student_name: 'Anushka Patel',
        category: 'AUDIO',
        subtype: 'AUDIO_WHISPER',
        severity: 'LOW',
        confidence: 0.89,
        message: 'Consistent whisper detected exceeding nominal audio threshold.',
        penalty: 5.0,
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    telemetrySocket.simulateAnomaly(pick);
  };

  const handleProctorAction = (actionType: 'WARN' | 'LOCK' | 'TERMINATE', studentId: string) => {
    telemetrySocket.sendAction(actionType, studentId);
  };

  const flaggedCount = candidates.filter((c) => c.status === 'FLAGGED' || c.trust_score < 60).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      {/* 1. Left Sidebar Component */}
      <Sidebar
        connectionStatus={connectionStatus}
        onlineCount={28}
        flaggedCount={flaggedCount}
        onAuditClick={() => {
          const flaggedCandidate = candidates.find((c) => c.status === 'FLAGGED') || candidates[0];
          setActiveAuditModal({
            event: events[0] || {
              event_id: 'evt_audit_latest',
              student_id: flaggedCandidate.student_id,
              timestamp: '15:04:05',
              subtype: flaggedCandidate.last_violation || 'MULTIPLE_FACES_DETECTED',
              severity: 'CRITICAL',
              confidence: 0.99,
              message: 'Infraction audit snapshot captured by proctoring engine.',
            },
            candidate: flaggedCandidate,
          });
        }}
      />

      {/* 2. Main Workstation Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top White Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end gap-4 shrink-0 shadow-xs">
          {/* Proctor Profile Photo Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-xs cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Proctor Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Simulate Anomaly Blue Button */}
          <button
            onClick={handleSimulateAnomaly}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Simulate Anomaly</span>
          </button>
        </header>

        {/* Workspace Body: 2 Columns (Fleet Grid on Left, Video + Anomaly Feed on Right) */}
        <main className="flex-1 p-5 overflow-y-auto grid grid-cols-12 gap-5 min-h-0">
          {/* Center Column: Fleet Grid */}
          <section className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Fleet Grid
            </h2>

            {/* 2x4 Candidate Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {candidates.map((c) => {
                const isDanger = c.status === 'FLAGGED' || c.trust_score < 60;
                const isSelected = selectedCandidate?.student_id === c.student_id;

                const progressBarColor = isDanger
                  ? 'bg-rose-500'
                  : 'bg-[#EAB308]';

                return (
                  <div
                    key={c.student_id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all duration-150 cursor-pointer hover:shadow-sm space-y-2.5 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/10'
                        : isDanger
                        ? 'border-rose-300/80 bg-rose-50/20'
                        : 'border-slate-200/90'
                    }`}
                  >
                    {/* Top Row: Name | Roll ID & Red Recording Dot */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-slate-800 truncate">
                        {c.name} <span className="font-normal text-slate-500">| {c.roll_id || 'Rollins...'}</span>
                      </p>

                      {/* Small Red/Rose Dot Indicator */}
                      {c.hasDot && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#FECDD3] flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
                        </span>
                      )}
                    </div>

                    {/* Centered Student Photo */}
                    <div className="flex justify-center py-0.5">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Trust Score & Progress Bar */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">
                        Trust: <span className={isDanger ? 'text-rose-600 font-extrabold' : 'font-extrabold'}>{c.trust_score}%</span>
                      </p>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressBarColor} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(0, c.trust_score))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Mock Video Feed & Live AI Diagnostics Feed */}
          <aside className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
            {/* 1. Mock Video Feed Component */}
            <LiveVideoFeed
              candidate={selectedCandidate}
              onWarn={(studentId) => handleProctorAction('WARN', studentId)}
              onLock={(studentId) => handleProctorAction('LOCK', studentId)}
            />

            {/* 2. Live AI Diagnostics Feed Component */}
            <AnomalyFeed
              events={events}
              candidates={candidates}
              onSelectEvent={(event, candidate) => {
                setSelectedCandidate(candidate);
                setActiveAuditModal({ event, candidate });
              }}
            />
          </aside>
        </main>
      </div>

      {/* Evidentiary Capture & Audit Modal */}
      <EvidenceModal
        event={activeAuditModal?.event ?? null}
        candidate={activeAuditModal?.candidate ?? null}
        onClose={() => setActiveAuditModal(null)}
        onAction={(action) => {
          if (activeAuditModal?.candidate) {
            handleProctorAction(action, activeAuditModal.candidate.student_id);
          }
          setActiveAuditModal(null);
        }}
      />
    </div>
  );
}