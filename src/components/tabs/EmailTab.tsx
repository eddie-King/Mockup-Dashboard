import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import {
  EMAIL_CENTER_STATUS,
  EmailStatusSlice,
} from '../../data/mockDashboardData';
import {
  DEFAULT_HALF_HOUR_RANGE,
  HALF_HOUR_LABELS,
  HalfHourFilterBar,
  HalfHourRange,
  formatSlotRange,
  getHalfHourWeight,
} from './HalfHourFilterBar';

interface EmailTabProps {
  stats: {
    received: number;
    accepted: number;
    unassigned: number;
    spam: number;
    inProgress: number;
    pendingCustomer: number;
    overdue: number;
    resolvedRate: number;
    avgResponseMin: number;
  };
  onRefresh: () => void;
  onExportCsv: () => void;
  onNotify: (msg: string) => void;
}

interface CardMenuButtonProps {
  cardId: string;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  items: { label: string; onClick: () => void }[];
}

const CardMenuButton: React.FC<CardMenuButtonProps> = ({
  cardId,
  openMenuId,
  setOpenMenuId,
  items,
}) => {
  const isOpen = openMenuId === cardId;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isOpen ? null : cardId);
        }}
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-label="Tùy chọn thẻ"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpenMenuId(null);
              }}
              className="w-full px-3 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface DonutWidgetProps {
  title: string;
  cardId: string;
  data: EmailStatusSlice[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
}

const DonutWidget: React.FC<DonutWidgetProps> = ({
  title,
  cardId,
  data,
  openMenuId,
  setOpenMenuId,
  onRefresh,
  onExportCsv,
}) => {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  return (
    <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[14.5px] font-bold text-[#1E293B] truncate">
          {title}
        </h2>
        <CardMenuButton
          cardId={cardId}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          items={[
            { label: 'Làm mới biểu đồ', onClick: onRefresh },
            { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
          ]}
        />
      </div>

      {/* Donut Chart + Legend */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-5 py-2">
        <div className="relative w-[204px] h-[204px] shrink-0">
          <ResponsiveContainer width="100%" height={204}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={94}
                paddingAngle={1.5}
                stroke="#FFFFFF"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
                formatter={(val, name) => {
                  const num = Number(val ?? 0);
                  const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0';
                  return [`${num} email (${pct}%)`, String(name ?? '')];
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] leading-none font-bold text-[#1E293B] tabular-nums">
              {total.toLocaleString('vi-VN')}
            </span>
            <span className="mt-1 text-[12.5px] font-medium text-slate-500">
              Total
            </span>
          </div>
        </div>

        {/* Status Breakdown Legend */}
        <div className="w-full xl:w-auto xl:min-w-[185px] space-y-2.5">
          {data.map((slice) => {
            const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div
                key={slice.name}
                className="flex items-center justify-between gap-3 text-[12.5px]"
              >
                <span className="inline-flex items-center gap-2 text-slate-700 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{slice.name}</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                  {slice.value}{' '}
                  <span className="text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const EmailTab: React.FC<EmailTabProps> = ({
  stats,
  onRefresh,
  onExportCsv,
  onNotify,
}) => {
  const [hourRange, setHourRange] = useState<HalfHourRange>(DEFAULT_HALF_HOUR_RANGE);
  const [dailyChartType, setDailyChartType] = useState<'bar' | 'area'>('bar');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const handleDocClick = () => setOpenMenuId(null);
    document.addEventListener('click', handleDocClick);
    document.addEventListener('mousedown', closeMenus);
    return () => {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('mousedown', closeMenus);
    };
  }, []);

  // Build 48 half-hour email buckets (00:00..23:30) and filter to selected [startSlot, endSlot)
  const filteredSeries = useMemo(() => {
    const full48 = Array.from({ length: 48 }, (_, idx) => {
      const w = getHalfHourWeight(idx);
      const accepted = Math.max(1, Math.round(14 * w + ((idx * 3) % 4)));
      const unassigned = Math.max(0, Math.round(2.6 * w + (idx % 3 === 0 ? 1 : 0)));
      const spam = Math.max(0, Math.round(1.1 * w + (idx % 5 === 0 ? 1 : 0)));
      return {
        hour: HALF_HOUR_LABELS[idx],
        accepted,
        unassigned,
        spam,
      };
    });
    return full48.slice(hourRange.startSlot, hourRange.endSlot);
  }, [hourRange]);

  const filteredKpis = useMemo(() => {
    const accepted = filteredSeries.reduce((s, r) => s + r.accepted, 0);
    const unassigned = filteredSeries.reduce((s, r) => s + r.unassigned, 0);
    const spam = filteredSeries.reduce((s, r) => s + r.spam, 0);
    const received = accepted + unassigned + spam;
    return { received, accepted, unassigned, spam };
  }, [filteredSeries]);

  const filteredDonutData = useMemo<EmailStatusSlice[]>(() => {
    const baseTotal = EMAIL_CENTER_STATUS.reduce((s, x) => s + x.value, 0) || 1;
    const scale =
      stats.received > 0 ? filteredKpis.received / Math.max(1, stats.received) : 1;
    return EMAIL_CENTER_STATUS.map((slice) => ({
      ...slice,
      value: Math.max(
        slice.value > 0 ? 1 : 0,
        Math.round((slice.value / baseTotal) * filteredKpis.received * Math.min(1.4, Math.max(0.6, scale + 0.3)))
      ),
    }));
  }, [filteredKpis.received, stats.received]);

  const rangeLabel = formatSlotRange(hourRange);

  const kpiCards = [
    {
      id: 'kpi-total',
      title: 'Tổng Email',
      value: filteredKpis.received,
      valueColor: 'text-[#1E293B]',
    },
    {
      id: 'kpi-accepted',
      title: 'Email đã tiếp nhận',
      value: filteredKpis.accepted,
      valueColor: 'text-[#1E293B]',
    },
    {
      id: 'kpi-unassigned',
      title: 'Email chưa tiếp nhận',
      value: filteredKpis.unassigned,
      valueColor: filteredKpis.unassigned >= 10 ? 'text-[#EA580C]' : 'text-[#1E293B]',
    },
    {
      id: 'kpi-spam',
      title: 'Email Spam',
      value: filteredKpis.spam,
      valueColor: 'text-[#1E293B]',
    },
  ];

  return (
    <div ref={containerRef} className="space-y-4">
      <HalfHourFilterBar
        value={hourRange}
        onChange={setHourRange}
        channelName="Email"
      />

      {/* Row 1: 4 Equal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-[#E5E9F2] bg-white px-5 py-4 min-h-[118px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[14px] font-bold text-[#1E293B] truncate">
                {card.title}
              </h2>
              <CardMenuButton
                cardId={card.id}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                items={[
                  { label: 'Làm mới số liệu', onClick: onRefresh },
                  { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                ]}
              />
            </div>

            <div
              className={`text-center text-[34px] leading-none font-bold pb-2 tabular-nums ${card.valueColor}`}
            >
              {card.value.toLocaleString('vi-VN')}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Balanced 2-Column Layout — Email trong ngày (7 cols) + Trung tâm Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <section className="lg:col-span-7 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-[14.5px] font-bold text-[#1E293B]">
                  Email theo khung giờ (30 phút)
                </h2>
                <div className="text-[11.5px] font-mono text-slate-500 tabular-nums mt-0.5">
                  {rangeLabel}
                </div>
              </div>
              <div className="flex items-center gap-3.5 text-[12px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                  Đã tiếp nhận
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F05A28]" />
                  Chưa tiếp nhận
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#94A3B8]" />
                  Email Spam
                </span>
              </div>
            </div>

            <CardMenuButton
              cardId="card-daily"
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              items={[
                {
                  label:
                    dailyChartType === 'bar'
                      ? 'Chuyển sang biểu đồ vùng'
                      : 'Chuyển sang biểu đồ cột',
                  onClick: () => {
                    const next = dailyChartType === 'bar' ? 'area' : 'bar';
                    setDailyChartType(next);
                    onNotify(
                      next === 'area'
                        ? 'Đã chuyển "Email trong ngày" sang biểu đồ vùng.'
                        : 'Đã chuyển "Email trong ngày" sang biểu đồ cột.'
                    );
                  },
                },
                { label: 'Làm mới biểu đồ', onClick: onRefresh },
                { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
              ]}
            />
          </div>

          <div className="w-full flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height={265}>
              {dailyChartType === 'bar' ? (
                <BarChart
                  data={filteredSeries}
                  margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    interval="preserveStartEnd"
                    minTickGap={18}
                    tick={{ fontSize: 11.5, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11.5, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                    formatter={(val, name) => {
                      const labels: Record<string, string> = {
                        accepted: 'Đã tiếp nhận',
                        unassigned: 'Chưa tiếp nhận',
                        spam: 'Email Spam',
                      };
                      const key = String(name ?? '');
                      return [`${val ?? 0} email`, labels[key] || key];
                    }}
                  />
                  <Bar
                    dataKey="accepted"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="unassigned"
                    fill="#F05A28"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="spam"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={14}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={filteredSeries}
                  margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="emailAcceptedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="emailUnassignedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F05A28" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F05A28" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    interval="preserveStartEnd"
                    minTickGap={18}
                    tick={{ fontSize: 11.5, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11.5, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => {
                      const labels: Record<string, string> = {
                        accepted: 'Đã tiếp nhận',
                        unassigned: 'Chưa tiếp nhận',
                        spam: 'Email Spam',
                      };
                      const key = String(name ?? '');
                      return [`${val ?? 0} email`, labels[key] || key];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#emailAcceptedGrad)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="unassigned"
                    stroke="#F05A28"
                    strokeWidth={2}
                    fill="url(#emailUnassignedGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        <div className="lg:col-span-5">
          <DonutWidget
            title="Trung tâm: Email theo trạng thái"
            cardId="donut-center"
            data={filteredDonutData}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onRefresh={onRefresh}
            onExportCsv={onExportCsv}
          />
        </div>
      </div>
    </div>
  );
};
