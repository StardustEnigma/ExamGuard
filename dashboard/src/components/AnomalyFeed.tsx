import React from 'react';
import { Eye, Volume2, Monitor } from 'lucide-react';
import type { TelemetryEvent, Candidate } from '../types';

interface AnomalyFeedProps {
  events: TelemetryEvent[];
  candidates: Candidate[];
  onSelectEvent: (event: TelemetryEvent, candidate: Candidate) => void;
}

export const AnomalyFeed: React.FC<AnomalyFeedProps> = ({
  events,
  candidates,
  onSelectEvent,
}) => {
  // Pre-configured fallback items if no real-time events have arrived yet
  const defaultItems = [
    {
      id: 'default-1',
      severity: 'CRITICAL',
      title: 'CRITICAL | Multi-Face Detected',
      badgeBg: 'bg-[#FEE2E2] text-[#B91C1C]',
      time: '15:04:12',
      tags: [{ label: 'Vision', icon: Eye, color: 'bg-[#DCFCE7] text-[#15803D]' }],
      studentId: '50',
    },
    {
      id: 'default-2',
      severity: 'HIGH',
      title: 'HIGH | Tab Switched',
      badgeBg: 'bg-[#FEF3C7] text-[#B45309]',
      time: '15:03:48',
      tags: [
        { label: 'Audio', icon: Volume2, color: 'bg-[#E0F2FE] text-[#0369A1]' },
        { label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' },
      ],
      studentId: '12',
    },
    {
      id: 'default-3',
      severity: 'MEDIUM',
      title: 'MEDIUM | Gaze Deviation',
      badgeBg: 'bg-[#DBEAFE] text-[#1D4ED8]',
      time: '15:02:15',
      tags: [{ label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' }],
      studentId: '46',
    },
    {
      id: 'default-4',
      severity: 'LOW',
      title: 'LOW | Mic Anomaly',
      badgeBg: 'bg-[#F1F5F9] text-[#475569]',
      time: '15:00:50',
      tags: [
        { label: 'Audio', icon: Volume2, color: 'bg-[#E0F2FE] text-[#0369A1]' },
        { label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' },
      ],
      studentId: '49',
    },
  ];

  const getSeverityPill = (sev: string, subtype: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          title: `CRITICAL | ${subtype.replace(/_/g, ' ')}`,
          style: 'bg-[#FEE2E2] text-[#B91C1C]',
          tags: [{ label: 'Vision', icon: Eye, color: 'bg-[#DCFCE7] text-[#15803D]' }],
        };
      case 'HIGH':
        return {
          title: `HIGH | ${subtype.replace(/_/g, ' ')}`,
          style: 'bg-[#FEF3C7] text-[#B45309]',
          tags: [
            { label: 'Audio', icon: Volume2, color: 'bg-[#E0F2FE] text-[#0369A1]' },
            { label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' },
          ],
        };
      case 'MEDIUM':
        return {
          title: `MEDIUM | ${subtype.replace(/_/g, ' ')}`,
          style: 'bg-[#DBEAFE] text-[#1D4ED8]',
          tags: [{ label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' }],
        };
      default:
        return {
          title: `LOW | ${subtype.replace(/_/g, ' ')}`,
          style: 'bg-[#F1F5F9] text-[#475569]',
          tags: [
            { label: 'Audio', icon: Volume2, color: 'bg-[#E0F2FE] text-[#0369A1]' },
            { label: 'System', icon: Monitor, color: 'bg-[#F1F5F9] text-[#475569]' },
          ],
        };
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Live AI Diagnostics Feed
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Edge:8080 • Active
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5 max-h-[310px] overflow-y-auto">
        {events.length === 0 ? (
          // Exact rows matching the approved single-line layout
          defaultItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const candidate = candidates.find((c) => c.student_id === item.studentId) || candidates[0];
                const mockEvent: TelemetryEvent = {
                  event_id: item.id,
                  student_id: item.studentId,
                  timestamp: item.time,
                  subtype: item.title.split('|')[1]?.trim() || 'VIOLATION',
                  severity: item.severity as any,
                  confidence: 0.98,
                  message: `Automatic diagnostic trigger: ${item.title}.`,
                };
                if (candidate) onSelectEvent(mockEvent, candidate);
              }}
              className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-50/90 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight shrink-0 ${item.badgeBg}`}>
                  {item.title}
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {item.time}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tags.map((t, idx) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${t.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          events.slice(0, 8).map((e) => {
            const pill = getSeverityPill(e.severity, e.subtype);
            const candidate = candidates.find((c) => c.student_id === e.student_id) || candidates[0];

            return (
              <div
                key={e.event_id}
                onClick={() => candidate && onSelectEvent(e, candidate)}
                className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-50/90 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight shrink-0 ${pill.style}`}>
                    {pill.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    {e.timestamp || 'Just now'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {pill.tags.map((t, idx) => {
                    const Icon = t.icon;
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${t.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {t.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
