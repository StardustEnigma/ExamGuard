import React from 'react';
import { Shield } from 'lucide-react';
import type { ConnectionStatus } from '../types';

interface SidebarProps {
  connectionStatus: ConnectionStatus;
  onlineCount?: number;
  flaggedCount?: number;
  activeCommand?: string;
  onCommandClick?: () => void;
  onAuditClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  connectionStatus,
  onlineCount = 28,
  flaggedCount = 1,
  onAuditClick,
}) => {
  const isConnected = connectionStatus === 'CONNECTED';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Top Blue Logo Header */}
        <div className="h-16 bg-[#3B82F6] px-5 flex items-center gap-2.5 text-white rounded-br-2xl shadow-xs">
          <div className="p-1 rounded-lg bg-white/20">
            <Shield className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ExamGuard</span>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 space-y-4">
          {/* Exam Info Card */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
            <p className="font-bold text-[13px] text-slate-800 leading-snug">
              CS501 - Distributed Systems
            </p>
            <p className="font-bold text-[13px] text-slate-800">
              End-Semester
            </p>
          </div>

          {/* Status Pills */}
          <div className="space-y-2.5">
            {/* Online Candidates Pill */}
            <div className="w-full py-1.5 px-3 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold text-center shadow-xs">
              {onlineCount} Candidates Online
            </div>

            {/* Flagged Candidates Pill */}
            <div className="w-full py-1.5 px-3 rounded-full bg-[#FFE4E6] text-[#BE123C] text-xs font-semibold text-center shadow-xs">
              {flaggedCount} Candidates Flagged
            </div>

            {/* Connection Status Pill */}
            <div className="w-full py-1.5 px-3 rounded-full bg-[#F1F5F9] text-slate-700 text-xs font-medium flex items-center justify-center gap-2 border border-slate-200/80">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isConnected ? 'Connected | Go Edge:8080' : 'Reconnecting...'}</span>
            </div>
          </div>

          {/* Section Divider */}
          <div className="pt-2 border-t border-slate-200">
            <button
              className="text-[11px] font-bold tracking-wider text-slate-700 uppercase hover:text-blue-600 transition-colors cursor-pointer text-left w-full py-1"
            >
              LIVE PROCTORING COMMAND
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Link */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onAuditClick}
          className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-left w-full flex items-center justify-between"
        >
          <span>Audit Capture & Action</span>
        </button>
      </div>
    </aside>
  );
};
