import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface WfmMetrics {
  label: string;
  activeAgents: number;
  aht: string;
  talkTime: string;
  occupancyRate: number;
}

const WFM_CATEGORIES: Record<string, WfmMetrics> = {
  all: {
    label: 'Tất cả',
    activeAgents: 92,
    aht: '4:32',
    talkTime: '3:45',
    occupancyRate: 85,
  },
  'inbound-voice': {
    label: 'Inbound - Voice',
    activeAgents: 46,
    aht: '4:18',
    talkTime: '3:36',
    occupancyRate: 88,
  },
  'inbound-digital': {
    label: 'Inbound - Chat & Email',
    activeAgents: 28,
    aht: '5:05',
    talkTime: '3:58',
    occupancyRate: 82,
  },
  outbound: {
    label: 'Outbound',
    activeAgents: 18,
    aht: '4:12',
    talkTime: '3:40',
    occupancyRate: 83,
  },
  vip: {
    label: 'Hỗ trợ VIP',
    activeAgents: 14,
    aht: '4:48',
    talkTime: '4:02',
    occupancyRate: 79,
  },
};

export const WorkforceManagementDashboard: React.FC = () => {
  const [categoryKey, setCategoryKey] = useState<string>('all');
  const metrics = WFM_CATEGORIES[categoryKey] ?? WFM_CATEGORIES.all;

  return (
    <div className="rounded-2xl bg-white border border-[#E5E9F2] shadow-[0_1px_4px_rgba(15,23,42,0.04)] p-6 sm:p-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-7 border-b border-[#EDF1F7]">
        <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#1E293B] tracking-tight">
          Workforce Management
        </h1>

        <div className="flex items-center gap-3">
          <label
            htmlFor="wfm-category-select"
            className="text-[13.5px] font-medium text-slate-500 whitespace-nowrap"
          >
            Phân loại:
          </label>
          <div className="relative">
            <select
              id="wfm-category-select"
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="appearance-none h-10 min-w-[168px] pl-3.5 pr-9 rounded-lg border border-[#DCE3EE] bg-white text-[13.5px] font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-[#0E8FA3] transition-colors cursor-pointer"
            >
              {Object.entries(WFM_CATEGORIES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 4-Card 3-Column Grid matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: TỔNG SỐ AGENT HOẠT ĐỘNG (Teal) */}
        <div className="rounded-xl bg-gradient-to-br from-[#0B93A7] to-[#0A7D92] text-white p-6 min-h-[205px] flex flex-col justify-start shadow-[0_2px_8px_rgba(10,125,146,0.16)]">
          <div className="text-[12px] font-bold tracking-[0.04em] uppercase text-white/95">
            TỔNG SỐ AGENT HOẠT ĐỘNG
          </div>
          <div className="mt-4 text-[46px] leading-none font-extrabold tabular-nums tracking-tight">
            {metrics.activeAgents}
          </div>
          <div className="mt-3 text-[13.5px] font-medium text-white/90">
            Agent có mặt trong ca trực
          </div>
        </div>

        {/* Card 2: AHT - AVERAGE HANDLING TIME (White) */}
        <div className="rounded-xl border border-[#E5E9F2] bg-white p-6 min-h-[205px] flex flex-col justify-between">
          <div>
            <div className="text-[12px] font-bold tracking-[0.04em] uppercase text-[#5A6A7E] leading-snug">
              AHT - AVERAGE HANDLING TIME
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-[42px] leading-none font-extrabold text-[#1E293B] tabular-nums tracking-tight">
                {metrics.aht}
              </span>
              <span className="text-[15px] font-bold text-[#0E8FA3]">phút</span>
            </div>
          </div>
          <div className="text-[13.5px] font-medium text-slate-500">
            Thời gian xử lý trung bình
          </div>
        </div>

        {/* Card 3: TALK TIME TRUNG BÌNH (White) */}
        <div className="rounded-xl border border-[#E5E9F2] bg-white p-6 min-h-[205px] flex flex-col justify-start">
          <div className="text-[12px] font-bold tracking-[0.04em] uppercase text-[#5A6A7E]">
            TALK TIME TRUNG BÌNH
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[42px] leading-none font-extrabold text-[#1E293B] tabular-nums tracking-tight">
              {metrics.talkTime}
            </span>
            <span className="text-[15px] font-bold text-[#0E8FA3]">phút</span>
          </div>
          <div className="mt-3 text-[13.5px] font-medium text-slate-500">
            Thời gian đàm thoại TB/cuộc gọi
          </div>
        </div>

        {/* Card 4: OCCUPANCY RATE (Green, Row 2 Col 1) */}
        <div className="rounded-xl bg-gradient-to-br from-[#23A440] to-[#198B33] text-white p-6 min-h-[195px] flex flex-col justify-between shadow-[0_2px_8px_rgba(25,139,51,0.16)]">
          <div>
            <div className="text-[12px] font-bold tracking-[0.04em] uppercase text-white/95">
              OCCUPANCY RATE
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-[46px] leading-none font-extrabold tabular-nums tracking-tight">
                {metrics.occupancyRate}
              </span>
              <span className="text-[20px] font-bold text-white/95">%</span>
            </div>
          </div>
          <div className="text-[13.5px] font-medium text-white/90">
            Tỷ lệ sử dụng thời gian làm việc
          </div>
        </div>
      </div>
    </div>
  );
};
