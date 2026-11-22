import React from 'react';
import {
  Download,
  LayoutGrid,
  RotateCw,
} from 'lucide-react';
import { DashboardTabId } from '../data/menuConfig';
import {
  SystemOverviewMetrics,
  TimeframeKey,
} from '../data/mockDashboardData';
import { OverviewTab } from './tabs/OverviewTab';

interface GeneralDashboardProps {
  timeframe: TimeframeKey;
  onChangeTimeframe: (tf: TimeframeKey) => void;
  clockText: string;
  isLive: boolean;
  onToggleLive: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  system: SystemOverviewMetrics;
  onNavigateToOmniTab: (tab: DashboardTabId) => void;
}

export const GeneralDashboard: React.FC<GeneralDashboardProps> = ({
  timeframe,
  onChangeTimeframe,
  clockText,
  isLive,
  onToggleLive,
  isRefreshing,
  onRefresh,
  onExportCsv,
  system,
  onNavigateToOmniTab,
}) => {
  return (
    <div className="rounded-xl bg-white border border-[#E5E9F2] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header matching Centralized Dashboard style */}
      <div className="px-6 pt-5 pb-4 border-b border-[#E5E9F2] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#F36B2C] to-[#E54F1D] text-white flex items-center justify-center shadow-xs shrink-0">
            <LayoutGrid size={21} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.06em] text-[#D4511E]">
              SYSTEM OVERVIEW
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
                General Dashboard
              </h1>
              <button
                type="button"
                onClick={onToggleLive}
                title={
                  isLive
                    ? 'Đang nhận dữ liệu thời gian thực (nhấn để tạm dừng)'
                    : 'Đang tạm dừng cập nhật trực tiếp (nhấn để tiếp tục)'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isLive
                    ? 'bg-[#E9F9EF] text-[#15803D] hover:bg-[#DCFCE7]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLive ? 'bg-[#16A34A]' : 'bg-slate-400'
                  }`}
                />
                {isLive ? 'LIVE' : 'TẠM DỪNG'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Controls: Refresh + Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            className="h-[36px] w-[36px] rounded-lg border border-[#DCE3EE] bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0"
            title="Làm mới dữ liệu ngay"
            aria-label="Làm mới dữ liệu"
          >
            <RotateCw
              size={15}
              className={isRefreshing ? 'animate-spin text-[#F05A28]' : ''}
            />
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="h-[36px] px-4 rounded-lg bg-[#F05A28] hover:bg-[#D94A1A] active:bg-[#C24115] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-orange-500"
          >
            <Download size={15} strokeWidth={2.2} />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Content */}
      <div className="p-6 bg-[#FAFBFD]">
        <OverviewTab
          system={system}
          onNavigateTab={onNavigateToOmniTab}
        />
      </div>
    </div>
  );
};
