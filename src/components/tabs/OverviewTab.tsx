import React from 'react';
import {
  ArrowUpRight,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  UserCheck,
} from 'lucide-react';
import { SystemOverviewMetrics } from '../../data/mockDashboardData';
import { DashboardTabId } from '../../data/menuConfig';

interface OverviewTabProps {
  system: SystemOverviewMetrics;
  onNavigateTab: (tab: DashboardTabId) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  system,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Section 1: 1. Tổng quan hệ thống */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-[14.5px] font-bold text-[#1E293B]">
            1. Tổng quan hệ thống
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('agents')}
            className="text-[12.5px] font-semibold text-[#3B49DF] hover:text-[#2A37B8] inline-flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Xem danh sách Agent
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Tổng đăng nhập */}
          <button
            type="button"
            onClick={() => onNavigateTab('agents')}
            className="text-left rounded-[10px] border border-[#E6EAF2] bg-white hover:border-slate-300 hover:bg-[#FAFBFD] px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#475569]">
              <UserCheck size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">Tổng đăng nhập</span>
            </div>
            <div className="mt-2 text-[28px] leading-tight font-bold text-[#0F172A] tabular-nums">
              {system.totalLoggedIn}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500 truncate">
              {system.onlineSubtext}
            </div>
          </button>

          {/* Card 2: Tổng chưa sẵn sàng */}
          <button
            type="button"
            onClick={() => onNavigateTab('agents')}
            className="text-left rounded-[10px] border border-[#E6EAF2] bg-white hover:border-slate-300 hover:bg-[#FAFBFD] px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#475569]">
              <Clock size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">Tổng chưa sẵn sàng</span>
            </div>
            <div className="mt-2 text-[28px] leading-tight font-bold text-[#0F172A] tabular-nums">
              {system.totalNotReady}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500 truncate">
              {system.notReadySubtext}
            </div>
          </button>

          {/* Card 3: Avail Thoại */}
          <button
            type="button"
            onClick={() => onNavigateTab('voice')}
            className="text-left rounded-[10px] border border-[#E6EAF2] bg-white hover:border-blue-300 hover:bg-[#F8FAFF] px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#475569]">
              <Phone size={14} className="text-[#2563EB] shrink-0" />
              <span className="truncate">Avail Thoại</span>
            </div>
            <div className="mt-2 text-[28px] leading-tight font-bold text-[#2563EB] tabular-nums">
              {system.availVoice}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500 truncate">
              {system.voiceSubtext}
            </div>
          </button>

          {/* Card 4: Chat sẵn sàng */}
          <button
            type="button"
            onClick={() => onNavigateTab('chat')}
            className="text-left rounded-[10px] border border-[#E6EAF2] bg-white hover:border-emerald-300 hover:bg-[#F6FDF9] px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#475569]">
              <MessageSquare size={14} className="text-[#16A34A] shrink-0" />
              <span className="truncate">Chat sẵn sàng</span>
            </div>
            <div className="mt-2 text-[28px] leading-tight font-bold text-[#16A34A] tabular-nums">
              {system.availChat}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500 truncate">
              {system.chatSubtext}
            </div>
          </button>

          {/* Card 5: Email sẵn sàng */}
          <button
            type="button"
            onClick={() => onNavigateTab('email')}
            className="text-left rounded-[10px] border border-[#E6EAF2] bg-white hover:border-orange-300 hover:bg-[#FFF9F6] px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#475569]">
              <Mail size={14} className="text-[#EA580C] shrink-0" />
              <span className="truncate">Email sẵn sàng</span>
            </div>
            <div className="mt-2 text-[28px] leading-tight font-bold text-[#EA580C] tabular-nums">
              {system.availEmail}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500 truncate">
              {system.emailSubtext}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
