import React, { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChatDemandPoint,
  ChatQueueCapacity,
  TimeframeKey,
  formatDuration,
  formatHms,
} from '../../data/mockDashboardData';

interface ChatTabProps {
  timeframe: TimeframeKey;
  isLive: boolean;
  stats: {
    totalIncoming: number;
    accepted: number;
    awtSec: number;
    frtSec: number;
    slaPercent: number;
    active: number;
    waiting: number;
    ahtSec: number;
    botDeflection: number;
    csat: number;
  };
  chatQueues: ChatQueueCapacity[];
  demandTrend: ChatDemandPoint[];
  onAdjustChatSlot: (queueId: string, delta: number) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  timeframe,
  isLive,
  stats,
  chatQueues,
  demandTrend,
  onAdjustChatSlot,
}) => {
  const timeframeLabel =
    timeframe === '15m' ? '15 phút' : timeframe === '1h' ? '1 giờ' : 'Hôm nay';

  // Aggregate ALL QUEUES capacity metrics dynamically
  const totals = useMemo(() => {
    const inQueue = chatQueues.reduce((s, q) => s + q.inQueue, 0);
    const activeChats = chatQueues.reduce((s, q) => s + q.activeChats, 0);
    const availableSlots = chatQueues.reduce((s, q) => s + q.availableSlots, 0);
    const totalCapacity = activeChats + availableSlots;
    const occupancy =
      totalCapacity > 0 ? Math.round((activeChats / totalCapacity) * 100) : 0;
    const longestWaitSec = chatQueues.reduce(
      (max, q) => (q.inQueue > 0 ? Math.max(max, q.longestWaitSec) : max),
      0
    );
    return { inQueue, activeChats, availableSlots, occupancy, longestWaitSec };
  }, [chatQueues]);

  // Compute dynamic capacity shortfall estimate based on current queue slots
  const peakInfo = useMemo(() => {
    let peakPoint = demandTrend[0];
    for (const pt of demandTrend) {
      if (pt.demand > peakPoint.demand) peakPoint = pt;
    }
    const peakStart = peakPoint.time;
    const idx = demandTrend.findIndex((p) => p.time === peakStart);
    const peakEnd =
      idx >= 0 && idx + 1 < demandTrend.length
        ? demandTrend[idx + 1].time
        : '13:30';
    const currentTotalCap = totals.activeChats + totals.availableSlots;
    const shortfall = Math.max(0, peakPoint.demand - currentTotalCap);
    return {
      windowText: `${peakStart} - ${peakEnd}`,
      shortfall,
    };
  }, [demandTrend, totals.activeChats, totals.availableSlots]);

  return (
    <div className="space-y-4">
      {/* 1. Tổng quan Chat */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
          <h2 className="text-[14.5px] font-bold text-[#0F172A]">
            1. Tổng quan Chat
          </h2>
          <span className="text-[12.5px] text-slate-500">lũy kế</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E9EEF5] text-slate-700 text-[11.5px] font-semibold">
            {timeframeLabel}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* TỔNG CHAT VÀO */}
          <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TỔNG CHAT VÀO
            </div>
            <div className="mt-2 text-[28px] leading-none font-extrabold text-[#1E293B] tabular-nums">
              {stats.totalIncoming.toLocaleString('vi-VN')}
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Tổng lượng chat phát sinh
            </div>
          </div>

          {/* ĐÃ NHẬN */}
          <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              ĐÃ NHẬN
            </div>
            <div className="mt-2 text-[28px] leading-none font-extrabold text-[#16A34A] tabular-nums">
              {stats.accepted.toLocaleString('vi-VN')}
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Chat được agent nhận
            </div>
          </div>

          {/* AWT */}
          <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              AWT
            </div>
            <div className="mt-2 text-[28px] leading-none font-extrabold font-mono text-[#EA580C] tabular-nums">
              {formatDuration(stats.awtSec)}
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Thời gian chờ trung bình
            </div>
          </div>

          {/* PHẢN HỒI ĐẦU */}
          <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              PHẢN HỒI ĐẦU
            </div>
            <div className="mt-2 text-[28px] leading-none font-extrabold font-mono text-[#16A34A] tabular-nums">
              {formatDuration(stats.frtSec)}
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Thời gian phản hồi đầu tiên
            </div>
          </div>

          {/* SLA % */}
          <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              SLA %
            </div>
            <div className="mt-2 text-[28px] leading-none font-extrabold text-[#1E293B] tabular-nums">
              {stats.slaPercent.toFixed(1)}%
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Tỷ lệ đáp ứng cam kết
            </div>
          </div>
        </div>
      </section>

      {/* 2. Năng lực queue realtime */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[14.5px] font-bold text-[#0F172A]">
              2. Năng lực queue realtime
            </h2>
            <span className="text-[12.5px] text-slate-500">realtime</span>
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold ${
                isLive ? 'text-[#16A34A]' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-[#16A34A]' : 'bg-slate-400'
                }`}
              />
              {isLive ? 'Live' : 'Tạm dừng'}
            </span>
            <span className="text-slate-500">Cắt lớp theo slot thực dụng</span>
          </div>
        </div>

        <div className="p-5">
          {/* ALL QUEUES Summary Strip */}
          <div className="rounded-xl border border-[#E5E9F2] bg-[#FAFBFD] p-4 grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-center">
            <div className="xl:col-span-2 px-1">
              <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                ALL QUEUES
              </div>
              <div className="mt-0.5 text-[15px] font-extrabold text-[#0F172A] leading-snug">
                Tổng quan năng lực phục vụ
              </div>
            </div>

            <div className="xl:col-span-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* IN QUEUE */}
              <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-3.5 py-3">
                <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                  IN QUEUE
                </div>
                <div className="mt-1 text-[22px] font-extrabold text-[#0F172A] tabular-nums">
                  {totals.inQueue}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 leading-tight">
                  Số chat đang chờ được xử lý
                </div>
              </div>

              {/* ACTIVE CHATS */}
              <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-3.5 py-3">
                <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                  ACTIVE CHATS
                </div>
                <div className="mt-1 text-[22px] font-extrabold text-[#0F172A] tabular-nums">
                  {totals.activeChats}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 leading-tight">
                  Chat đang được agent xử lý
                </div>
              </div>

              {/* AVAILABLE SLOTS */}
              <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-3.5 py-3">
                <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                  AVAILABLE SLOTS
                </div>
                <div className="mt-1 text-[22px] font-extrabold text-[#16A34A] tabular-nums">
                  {totals.availableSlots}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 leading-tight">
                  Slot còn lại có thể nhận thêm
                </div>
              </div>

              {/* OCCUPANCY % */}
              <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-3.5 py-3">
                <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                  OCCUPANCY %
                </div>
                <div
                  className={`mt-1 text-[22px] font-extrabold tabular-nums ${
                    totals.occupancy >= 85
                      ? 'text-red-600'
                      : totals.occupancy >= 70
                      ? 'text-amber-600'
                      : 'text-[#16A34A]'
                  }`}
                >
                  {totals.occupancy}%
                </div>
                <div className="mt-1 text-[11px] text-slate-400 leading-tight">
                  Mức sử dụng năng lực hiện tại
                </div>
              </div>

              {/* LONGEST WAIT */}
              <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-3.5 py-3">
                <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                  LONGEST WAIT
                </div>
                <div
                  className={`mt-1 text-[21px] font-extrabold font-mono tabular-nums ${
                    totals.longestWaitSec >= 60 ? 'text-[#DC2626]' : 'text-[#0F172A]'
                  }`}
                >
                  {formatHms(totals.longestWaitSec)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 leading-tight">
                  Chat chờ lâu nhất trên hàng đợi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Xu hướng nhu cầu & năng lực phục vụ */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
          <h2 className="text-[14.5px] font-bold text-[#0F172A]">
            3. Xu hướng nhu cầu & năng lực phục vụ
          </h2>
          <span className="text-[12.5px] text-slate-500">lũy kế Hôm nay</span>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Chart Area */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center gap-4 text-[12px] font-medium text-slate-600 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                Nhu cầu Chat
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                Năng lực phục vụ
              </span>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart
                  data={demandTrend}
                  margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chatDemandFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.14} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E9F2" vertical={false} />
                  <XAxis
                    dataKey="time"
                    interval={1}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                    formatter={(val, name) => [
                      `${val ?? 0} slot`,
                      name === 'demand' ? 'Nhu cầu Chat' : 'Năng lực phục vụ',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#chatDemandFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="#16A34A"
                    strokeWidth={2.2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right 2 Stacked Insight Cards matching screenshot */}
          <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
            <div className="flex-1 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-center">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                CAO ĐIỂM HIỆN TẠI
              </div>
              <div className="mt-2 text-[24px] font-extrabold text-[#0F172A] tabular-nums">
                {peakInfo.windowText}
              </div>
              <p className="mt-1.5 text-[12.5px] text-slate-500">
                Khung thời gian cần giữ người và slot sát nhất.
              </p>
            </div>

            <div className="flex-1 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-center">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                THIẾU NĂNG LỰC ƯỚC TÍNH
              </div>
              <div
                className={`mt-2 text-[22px] font-extrabold tabular-nums ${
                  peakInfo.shortfall > 0 ? 'text-[#DC2626]' : 'text-[#0F172A]'
                }`}
              >
                {peakInfo.shortfall > 0
                  ? `Thiếu ${peakInfo.shortfall} slot — cần bổ sung`
                  : '0 slot — đủ năng lực'}
              </div>
              <p className="mt-1.5 text-[12.5px] text-slate-500">
                Số slot còn thiếu nếu giữ nguyên pattern hiện tại.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
