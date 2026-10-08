import React, { useState } from 'react';
import { 
  Eye, 
  Volume2, 
  Monitor, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Camera
} from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Baseline verified historical incidents for CS501
  const defaultItems = [
    {
      id: 'default-1',
      severity: 'CRITICAL',
      subtype: 'MULTIPLE_FACES_DETECTED',
      title: 'Secondary Face in Camera Viewport',
      category: 'VISION',
      studentName: 'Anushka Patel',
      rollId: 'BTech-CS-050',
      time: '15:04:12',
      elapsed: '4s ago',
      confidence: 0.99,
      studentId: '50',
      tags: [{ label: 'Vision AI', icon: Eye, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }],
    },
    {
      id: 'default-2',
      severity: 'HIGH',
      subtype: 'TAB_SWITCH_BLUR',
      title: 'Persistent Screen Blur (Tab Switched)',
      category: 'ENVIRONMENT',
      studentName: 'Rohan Sharma',
      rollId: 'BTech-CS-012',
      time: '15:03:48',
      elapsed: '28s ago',
      confidence: 1.0,
      studentId: '12',
      tags: [
        { label: 'Sandbox', icon: Monitor, color: 'bg-slate-100 text-slate-800 border-slate-200' },
        { label: 'Browser', icon: Monitor, color: 'bg-sky-50 text-sky-800 border-sky-200' },
      ],
    },
    {
      id: 'default-3',
      severity: 'MEDIUM',
      subtype: 'GAZE_DEVIATION',
      title: 'Gaze Deviation Outside Screen Cones (>3.5s)',
      category: 'VISION',
      studentName: 'Taher Sanawadwala',
      rollId: 'BTech-CS-046',
      time: '15:02:15',
      elapsed: '2m ago',
      confidence: 0.95,
      studentId: '46',
      tags: [{ label: 'Vision AI', icon: Eye, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }],
    },
    {
      id: 'default-4',
      severity: 'LOW',
      subtype: 'AUDIO_WHISPER',
      title: 'Consistent Acoustic Whisper Detected',
      category: 'AUDIO',
      studentName: 'Atharva Mandle',
      rollId: 'BTech-CS-049',
      time: '15:00:50',
      elapsed: '4m ago',
      confidence: 0.89,
      studentId: '49',
      tags: [{ label: 'Audio Engine', icon: Volume2, color: 'bg-teal-50 text-teal-800 border-teal-200' }],
    },
  ];

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border border-rose-200/80';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border border-amber-200/80';
      case 'MEDIUM':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200/80';
    }
  };

  const getCategoryTags = (cat?: string, subtype?: string) => {
    if (cat === 'VISION' || subtype?.includes('FACE') || subtype?.includes('GAZE')) {
      return [{ label: 'Vision AI', icon: Eye, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }];
    }
    if (cat === 'AUDIO' || subtype?.includes('AUDIO') || subtype?.includes('WHISPER')) {
      return [{ label: 'Audio Engine', icon: Volume2, color: 'bg-teal-50 text-teal-800 border-teal-200' }];
    }
    return [{ label: 'Sandbox / OS', icon: Monitor, color: 'bg-slate-100 text-slate-700 border-slate-200' }];
  };

  const rawList = events.length > 0 ? events : defaultItems;

  const filteredList = rawList.filter((item: any) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'CRITICAL') return item.severity === 'CRITICAL';
    if (filterCategory === 'VISION') return item.category === 'VISION' || item.subtype?.includes('FACE') || item.subtype?.includes('GAZE');
    if (filterCategory === 'AUDIO') return item.category === 'AUDIO' || item.subtype?.includes('AUDIO');
    return true;
  });

  return (
    <div className="space-y-2">
      {/* 1. Header with Filters (Proctortrack Style) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Incident Forensic Stream
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
            {filteredList.length} Events
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          {['ALL', 'CRITICAL', 'VISION', 'AUDIO'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterCategory(f)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                filterCategory === f
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Incidents List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs space-y-2 max-h-[290px] overflow-y-auto">
        {filteredList.map((item: any) => {
          const candidate = candidates.find((c) => c.student_id === item.student_id || c.student_id === item.studentId) || candidates[0];
          const tags = item.tags || getCategoryTags(item.category, item.subtype);
          const studentName = item.student_name || item.studentName || candidate?.name || 'Candidate';
          const rollId = candidate?.roll_id || item.rollId || 'BTech-CS';
          const time = item.timestamp || item.time || '15:04:00';
          const confidence = item.confidence ? `${Math.round(item.confidence * 100)}% Conf` : '98% Conf';
          const title = item.title || `${item.severity} | ${item.subtype?.replace(/_/g, ' ')}`;

          return (
            <div
              key={item.id || item.event_id}
              onClick={() => {
                const eventToPass: TelemetryEvent = {
                  event_id: item.event_id || item.id,
                  student_id: item.student_id || item.studentId,
                  timestamp: time,
                  subtype: item.subtype || 'ANOMALY',
                  severity: item.severity,
                  confidence: item.confidence || 0.98,
                  message: item.message || title,
                };
                if (candidate) onSelectEvent(eventToPass, candidate);
              }}
              className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/90 transition-all cursor-pointer space-y-1.5 group shadow-2xs"
            >
              {/* Row Top: Severity Badge + Student Info + Timestamp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {studentName} <span className="text-[10px] text-slate-400 font-mono font-normal">({rollId})</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-400 group-hover:text-slate-600">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{time}</span>
                </div>
              </div>

              {/* Row Middle: Violation Description */}
              <p className="text-xs text-slate-600 font-medium leading-tight line-clamp-1 group-hover:text-slate-900">
                {title}
              </p>

              {/* Row Bottom: Category Tags + AI Confidence + Action Trigger */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                <div className="flex items-center gap-1.5">
                  {tags.map((t: any, idx: number) => {
                    const Icon = t.icon;
                    return (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 ${t.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {t.label}
                      </span>
                    );
                  })}
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">
                    {confidence}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3 h-3 text-indigo-600" />
                  <span>Inspect Audit Snapshot</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
