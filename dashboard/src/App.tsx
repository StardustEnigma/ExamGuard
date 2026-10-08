import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Radio, 
  Camera, 
  Mic, 
  Monitor, 
  CheckCircle2, 
  X, 
  Zap
} from 'lucide-react';
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
    roll_id: '2024-CS-046',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    trust_score: 98.4,
    status: 'ACTIVE',
    biometric_match: 99.4,
    seat_number: 'Hall-4B-S14',
    ip_address: '192.168.1.104',
    device: 'Win11 • Chrome 128',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: false,
  },
  {
    student_id: '50',
    name: 'Anushka Patel',
    roll_id: '2024-CS-050',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    trust_score: 86.1,
    status: 'ACTIVE',
    biometric_match: 98.8,
    seat_number: 'Hall-4B-S15',
    ip_address: '192.168.1.105',
    device: 'macOS Sonoma • Safari',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
  {
    student_id: '49',
    name: 'Atharva Mandle',
    roll_id: '2024-CS-049',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    trust_score: 98.4,
    status: 'ACTIVE',
    biometric_match: 99.1,
    seat_number: 'Hall-4B-S16',
    ip_address: '192.168.1.106',
    device: 'Ubuntu 24 • Chrome',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
  {
    student_id: '52',
    name: 'Dimpal Sharma',
    roll_id: '2024-CS-052',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    trust_score: 77.3,
    status: 'ACTIVE',
    biometric_match: 97.5,
    seat_number: 'Hall-4B-S17',
    ip_address: '192.168.1.107',
    device: 'Win11 • Edge 128',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
  {
    student_id: '38',
    name: 'Aryan Karande',
    roll_id: '2024-CS-038',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    trust_score: 87.1,
    status: 'ACTIVE',
    biometric_match: 98.2,
    seat_number: 'Hall-4B-S18',
    ip_address: '192.168.1.108',
    device: 'macOS Sequoia • Chrome',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
  {
    student_id: '12',
    name: 'Rohan Sharma',
    roll_id: '2024-CS-012',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    trust_score: 42.0,
    status: 'FLAGGED',
    last_violation: 'TAB_SWITCH_BLUR',
    biometric_match: 82.0,
    seat_number: 'Hall-4B-S19',
    ip_address: '192.168.1.109',
    device: 'Win10 • Chrome 128',
    camera_active: true,
    microphone_active: true,
    screen_active: false,
    hasDot: true,
  },
  {
    student_id: '21',
    name: 'Priya Singh',
    roll_id: '2024-CS-021',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    trust_score: 92.4,
    status: 'ACTIVE',
    biometric_match: 99.0,
    seat_number: 'Hall-4B-S20',
    ip_address: '192.168.1.110',
    device: 'macOS Sonoma • Safari',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
  {
    student_id: '33',
    name: 'Farhan Qureshi',
    roll_id: '2024-CS-033',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    trust_score: 89.0,
    status: 'ACTIVE',
    biometric_match: 98.6,
    seat_number: 'Hall-4B-S21',
    ip_address: '192.168.1.111',
    device: 'Ubuntu 24 • Firefox',
    camera_active: true,
    microphone_active: true,
    screen_active: true,
    hasDot: true,
  },
];

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(INITIAL_CANDIDATES[0]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [activeAuditModal, setActiveAuditModal] = useState<{ event: TelemetryEvent; candidate: Candidate } | null>(null);

  // Enterprise UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetFilter, setFleetFilter] = useState<'ALL' | 'FLAGGED' | 'HIGH' | 'WATCH'>('ALL');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastNoticeSent, setBroadcastNoticeSent] = useState<string | null>(null);

  // Live Exam Countdown Timer (01:42:15 Remaining)
  const [secondsRemaining, setSecondsRemaining] = useState(6135); // ~1h 42m 15s
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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

  // Invigilator Action Handler
  const handleProctorAction = (actionType: 'WARN' | 'LOCK' | 'TERMINATE', studentId: string) => {
    telemetrySocket.sendAction(actionType, studentId);
  };

  // Filtered & Searched Candidate List
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.roll_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (fleetFilter === 'FLAGGED') return c.status === 'FLAGGED' || c.trust_score < 60;
      if (fleetFilter === 'HIGH') return c.trust_score >= 90;
      if (fleetFilter === 'WATCH') return c.trust_score < 90 && c.trust_score >= 60;
      return true;
    });
  }, [candidates, searchQuery, fleetFilter]);

  const flaggedCount = candidates.filter((c) => c.status === 'FLAGGED' || c.trust_score < 60).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      {/* 1. Left Sidebar Component (Proctortrack / ExamSoft Style) */}
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
              timestamp: '15:04:12',
              subtype: flaggedCandidate.last_violation || 'MULTIPLE_FACES_DETECTED',
              severity: 'CRITICAL',
              confidence: 0.99,
              message: 'Infraction audit snapshot captured by proctoring engine.',
            },
            candidate: flaggedCandidate,
          });
        }}
        onBroadcastClick={() => setIsBroadcastModalOpen(true)}
      />

      {/* 2. Main Workstation Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Institutional Command Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          {/* Exam Title & Active Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">
                CS501 Distributed Systems End-Semester
              </h1>
            </div>

            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hidden md:inline">
              Hall 4B • Section A
            </span>

            {/* Countdown Timer Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-200/60 text-indigo-900 font-mono text-xs font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatCountdown(secondsRemaining)} REMAINING</span>
            </div>
          </div>

          {/* Right Controls: Simulator Drawer Trigger + Proctor Avatar */}
          <div className="flex items-center gap-3">
            {/* Discreet Edge Telemetry Lab Trigger */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-slate-300"
              title="Open Edge Telemetry Lab to simulate and test real-time violations"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Telemetry Lab</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                SIM
              </span>
            </button>

            {/* Broadcast Notice Button */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-slate-300"
            >
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>

            {/* Proctor Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Prof. Saurabh Tiwari</p>
                <p className="text-[10px] text-slate-500 font-medium">Chief Invigilator</p>
              </div>

              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Proctor Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body: 2 Columns (Fleet Directory on Left, Dual Video & Forensic Feed on Right) */}
        <main className="flex-1 p-5 overflow-y-auto grid grid-cols-12 gap-5 min-h-0">
          {/* Center Column: Fleet Monitoring Grid */}
          <section className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col space-y-3">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              {/* Search Candidate Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate name, roll ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'ALL', label: `All (${candidates.length})` },
                  { id: 'FLAGGED', label: `Flagged (${flaggedCount})` },
                  { id: 'HIGH', label: 'Verified' },
                  { id: 'WATCH', label: 'Watchlist' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFleetFilter(tab.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fleetFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Directory Grid (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredCandidates.map((c) => {
                const isDanger = c.status === 'FLAGGED' || c.trust_score < 60;
                const isSelected = selectedCandidate?.student_id === c.student_id;

                const progressBarColor = isDanger
                  ? 'bg-gradient-to-r from-rose-500 to-red-500'
                  : c.trust_score < 85
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500';

                return (
                  <div
                    key={c.student_id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`bg-white rounded-2xl border p-3.5 shadow-2xs transition-all duration-150 cursor-pointer hover:shadow-sm space-y-2.5 relative ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/15'
                        : isDanger
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Candidate Name, Roll ID, Peripheral Badges */}
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {c.roll_id || 'BTech-CS-046'}
                        </p>
                      </div>

                      {/* Hardware Status Badges */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <span title="Webcam Live"><Camera className="w-3 h-3 text-emerald-500" /></span>
                        <span title="Microphone Active"><Mic className="w-3 h-3 text-emerald-500" /></span>
                        <span title="Screen Shared"><Monitor className="w-3 h-3 text-emerald-500" /></span>
                      </div>
                    </div>

                    {/* Centered Student Photo & Biometric ID Match Tag */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                        {c.hasDot && (
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <span>Seat:</span>
                          <span className="font-bold text-slate-700">{c.seat_number || 'Hall-4B'}</span>
                        </div>

                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>ID: {c.biometric_match || 99.4}% Match</span>
                        </span>

                        <p className="text-[10px] text-slate-400 truncate">
                          {c.device || 'Chrome • Windows'}
                        </p>
                      </div>
                    </div>

                    {/* Trust Score & Progress Bar */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-600">Integrity Trust</span>
                        <span className={`font-extrabold ${isDanger ? 'text-rose-600 font-mono' : 'text-slate-900 font-mono'}`}>
                          {c.trust_score}%
                        </span>
                      </div>

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

          {/* Right Column: Focus Stream Monitor & Live Forensic Feed */}
          <aside className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col space-y-4">
            {/* 1. Live Video Feed HUD Component */}
            <LiveVideoFeed
              candidate={selectedCandidate}
              onWarn={(studentId) => handleProctorAction('WARN', studentId)}
              onLock={(studentId) => handleProctorAction('LOCK', studentId)}
              onTerminate={(studentId) => handleProctorAction('TERMINATE', studentId)}
              onIntercom={(studentId) => {
                alert(`Opening two-way live intercom channel with candidate ${studentId}`);
              }}
            />

            {/* 2. Live Incident Forensic Feed Component */}
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

      {/* 3. Evidentiary Forensic Capture & Audit Modal */}
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

      {/* 4. Slide-Out Edge Telemetry Simulator Drawer (Enterprise Testing Deck) */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Edge Telemetry Simulator</h3>
                    <p className="text-xs text-slate-500">Inject real-time anomalies for testing</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Violation Scenario
                </p>

                {[
                  {
                    title: 'Secondary Face in Viewport',
                    category: 'VISION',
                    subtype: 'MULTIPLE_FACES_DETECTED',
                    severity: 'CRITICAL',
                    confidence: 0.99,
                    message: 'Secondary face detected in camera viewport at (x: 0.72, y: 0.45).',
                    penalty: 14.5,
                    studentId: '50',
                    studentName: 'Anushka Patel',
                  },
                  {
                    title: 'Unauthorized Tab Switch (ChatGPT)',
                    category: 'ENVIRONMENT',
                    subtype: 'TAB_SWITCH_BLUR',
                    severity: 'HIGH',
                    confidence: 1.0,
                    message: 'Persistent Screen Blur: Candidate switched browser tab.',
                    penalty: 12.0,
                    studentId: '12',
                    studentName: 'Rohan Sharma',
                  },
                  {
                    title: 'Gaze Deviation Outside Cones',
                    category: 'VISION',
                    subtype: 'GAZE_DEVIATION',
                    severity: 'MEDIUM',
                    confidence: 0.95,
                    message: 'Gaze deviation outside frame detected for 3.8s.',
                    penalty: 7.5,
                    studentId: '46',
                    studentName: 'Taher Sanawadwala',
                  },
                  {
                    title: 'Consistent Acoustic Whisper',
                    category: 'AUDIO',
                    subtype: 'AUDIO_WHISPER',
                    severity: 'LOW',
                    confidence: 0.89,
                    message: 'Consistent whisper detected exceeding nominal audio threshold.',
                    penalty: 5.0,
                    studentId: '49',
                    studentName: 'Atharva Mandle',
                  },
                ].map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      telemetrySocket.simulateAnomaly(scenario as any);
                      setIsSimulatorOpen(false);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900">
                        {scenario.title}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        scenario.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        scenario.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        scenario.severity === 'MEDIUM' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Target: {scenario.studentName} (-{scenario.penalty} trust penalty)
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="w-full py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Emergency Fleet Broadcast Notice Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Pushes a priority on-screen modal notification to all 28 active exam candidate screens.
              </p>
              <textarea
                rows={3}
                placeholder="e.g., Attention: 15 minutes remaining. Please ensure your face is well-lit and keep your camera centered."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {broadcastNoticeSent && (
              <p className="text-xs font-bold text-emerald-600">
                ✓ {broadcastNoticeSent}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (broadcastMessage.trim()) {
                    setBroadcastNoticeSent('Announcement dispatched to all 28 candidate screens.');
                    setTimeout(() => {
                      setIsBroadcastModalOpen(false);
                      setBroadcastNoticeSent(null);
                      setBroadcastMessage('');
                    }, 1200);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-2xs"
              >
                Broadcast to Fleet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}