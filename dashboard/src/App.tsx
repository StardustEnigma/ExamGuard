import { useState, useEffect } from 'react';
import { ShieldAlert, Users, AlertTriangle, Eye, Video, Mic, Bell, RefreshCw, Search, Filter, Activity } from 'lucide-react';
import type { Candidate, TelemetryEvent } from './types';
import { telemetrySocket } from './services/websocket';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FLAGGED' | 'WARNING'>('ALL');
  const [activeAuditModal, setActiveAuditModal] = useState<{ event: TelemetryEvent; candidate: Candidate; } | null>(null);

  // REAL-TIME WEBSOCKET INTEGRATION (Replaced fake setInterval)
  useEffect(() => {
    // 1. Connect to backend
    telemetrySocket.connect();

    // 2. Subscribe to incoming telemetry events
    const unsubscribe = telemetrySocket.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
      
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.student_id === newEvent.student_id) {
            // Calculate penalty based on severity
            const penalty = newEvent.severity === 'CRITICAL' ? 15 : newEvent.severity === 'HIGH' ? 10 : 5;
            const nextScore = Math.max(0, c.trust_score - penalty);
            
            const updated: Candidate = { 
              ...c, 
              trust_score: nextScore, 
              status: nextScore < 60 ? 'FLAGGED' : c.status, 
              last_violation: newEvent.subtype 
            };
            
            setSelectedCandidate((curr) => (curr?.student_id === c.student_id ? updated : curr));
            return updated;
          }
          return c;
        })
      );
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      telemetrySocket.disconnect();
    };
  }, []);

  const activeCount = candidates.filter((c) => c.status === 'ACTIVE').length;
  const flaggedCount = candidates.filter((c) => c.status === 'FLAGGED').length;

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.student_id.includes(searchQuery);
    const matchesFilter = filterType === 'ALL' ? true : filterType === 'FLAGGED' ? c.status === 'FLAGGED' : (c.trust_score >= 60 && c.trust_score < 85);
    return matchesSearch && matchesFilter;
  });

  return (
    // Premium Background with subtle mesh gradient
    <div className="min-h-screen bg-[#FAFAFA] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-200">
      
      {/* Glassmorphism Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-slate-200/60 px-8 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight leading-none">
              ExamGuard
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600/80">ProctorSentinel Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm font-bold">
          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-sm text-slate-600">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Active Sessions <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{activeCount}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 text-rose-700 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            Flagged <span className="bg-rose-200/50 px-2 py-0.5 rounded-md">{flaggedCount}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          
          {/* Action Bar (Search & Filter) */}
          <div className="flex items-center justify-between">
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search candidates by name or roll..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm">
              {(['ALL', 'WARNING', 'FLAGGED'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    filterType === type 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-1 mt-4">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Users className="w-4 h-4" /> Live Grid Monitoring
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Live Edge Sync
            </span>
          </div>

          {/* Floating Candidate Cards */}
          <div className="grid grid-cols-3 gap-6">
            {filteredCandidates.map((c) => {
              const isDanger = c.trust_score < 60;
              const isWarning = c.trust_score >= 60 && c.trust_score < 85;
              
              // Dynamic gradients for trust score
              const gradientFill = isDanger ? 'from-rose-500 to-red-600' : isWarning ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500';
              const ringColor = isDanger ? 'ring-rose-500/20' : isWarning ? 'ring-amber-500/20' : 'ring-emerald-500/20';

              return (
                <div
                  key={c.student_id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`group cursor-pointer rounded-3xl bg-white p-5 transition-all duration-300 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 ${
                    selectedCandidate?.student_id === c.student_id ? `ring-4 ${ringColor} border-transparent` : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">#{c.student_id}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{c.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-black ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.trust_score}%
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Trust</span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${gradientFill} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${c.trust_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-3 border-t border-slate-100/80">
                    <span className="truncate max-w-[120px] bg-slate-50 px-2 py-1 rounded-md">{c.last_violation ?? 'Nominal'}</span>
                    <div className="flex items-center gap-2">
                      <Video className={`w-4 h-4 ${isDanger ? 'text-rose-500' : 'text-emerald-500'}`} />
                      <Mic className={`w-4 h-4 ${isDanger ? 'text-rose-500' : 'text-emerald-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 flex flex-col gap-8">
          
          {/* Glass Incident Feed */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[380px] overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-white">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-black text-slate-900 tracking-wide">Live Anomaly Feed</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <Activity className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500">Awaiting edge telemetry...</p>
                </div>
              ) : (
                events.map((e) => (
                  <div
                    key={e.event_id}
                    onClick={() => {
                      const candidate = candidates.find((c) => c.student_id === e.student_id);
                      if (candidate) setActiveAuditModal({ event: e, candidate });
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">#{e.student_id}</span>
                        <span className="text-[10px] font-bold text-slate-400">{e.timestamp}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        e.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {e.subtype}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{e.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Premium Inspector Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.2)] flex-1 p-6 text-white relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <h2 className="text-sm font-black text-white/90 mb-6 flex items-center gap-2 z-10 relative">
              <Eye className="w-5 h-5 text-blue-400" /> Candidate Inspector
            </h2>
            
            {selectedCandidate ? (
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Profile Focus</p>
                  <p className="text-xl font-black text-white">{selectedCandidate.name} <span className="text-slate-400 font-medium">#{selectedCandidate.student_id}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Live Trust Index</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-black tracking-tighter ${selectedCandidate.trust_score < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCandidate.trust_score}
                    </p>
                    <span className="text-sm text-slate-500 font-bold">/ 100</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Flag</p>
                  <p className="font-bold text-sm text-white/90">{selectedCandidate.last_violation ?? 'Clear Record'}</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                    Warn Student
                  </button>
                  <button className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95">
                    Terminate
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 relative z-10 pb-8">
                <Eye className="w-10 h-10 mb-4 text-slate-500" />
                <p className="text-sm font-bold text-slate-400">Select a candidate to<br/>initiate deep inspection</p>
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
          alert(`Action [${action}] dispatched!`);
          setActiveAuditModal(null);
        }}
      />
    </div>
  );
}