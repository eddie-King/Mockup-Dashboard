import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { TimeframeKey } from '../../data/mockDashboardData';

interface TicketTabProps {
  timeframe: TimeframeKey;
  onRefresh: () => void;
  onExportCsv: () => void;
  onNotify: (msg: string) => void;
}

type TicketPeriod = 'day' | 'week' | 'month' | 'year';

interface TicketSeriesPoint {
  label: string;
  count: number;
  avg: number;
}

interface TicketWorkcodeRow {
  name: string;
  count: number;
}

interface TicketChannelSlice {
  name: string;
  value: number;
  color: string;
}

interface TicketSnapshot {
  total: number;
  pending: number;
  completed: number;
  chartTitle: string;
  tooltipPrefix: string;
  series: TicketSeriesPoint[];
  workcodes: TicketWorkcodeRow[];
  channels: TicketChannelSlice[];
}

const BASE_HOURLY_COUNTS = [
  0, 0, 0, 0, 0, 0, 1, 3, 12, 18, 22, 24, 15, 17, 21, 16, 11, 5, 2, 1, 0, 0, 0,
  0,
];

const WEEK_COUNTS = [
  { label: 'T2', count: 162 },
  { label: 'T3', count: 178 },
  { label: 'T4', count: 154 },
  { label: 'T5', count: 185 },
  { label: 'T6', count: 168 },
  { label: 'T7', count: 84 },
  { label: 'CN', count: 55 },
];

const MONTH_COUNTS = [
  { label: '01', count: 118 },
  { label: '03', count: 134 },
  { label: '05', count: 149 },
  { label: '07', count: 122 },
  { label: '09', count: 165 },
  { label: '11', count: 172 },
  { label: '13', count: 158 },
  { label: '15', count: 184 },
  { label: '17', count: 141 },
  { label: '19', count: 168 },
  { label: '21', count: 155 },
  { label: '23', count: 139 },
  { label: '25', count: 176 },
  { label: '27', count: 162 },
  { label: '30', count: 148 },
];

const YEAR_COUNTS = [
  { label: 'Th1', count: 3120 },
  { label: 'Th2', count: 2890 },
  { label: 'Th3', count: 3540 },
  { label: 'Th4', count: 3410 },
  { label: 'Th5', count: 3680 },
  { label: 'Th6', count: 3890 },
  { label: 'Th7', count: 3720 },
  { label: 'Th8', count: 4050 },
  { label: 'Th9', count: 3810 },
  { label: 'Th10', count: 3940 },
  { label: 'Th11', count: 3620 },
  { label: 'Th12', count: 3170 },
];

function buildTicketData(period: TicketPeriod): TicketSnapshot {
  const scale =
    period === 'day'
      ? 1
      : period === 'week'
      ? 5.87
      : period === 'month'
      ? 23
      : 255;

  const workcodeBase: TicketWorkcodeRow[] = [
    { name: 'Ngành hàng bán lẻ', count: 38 },
    { name: 'WC lv1', count: 29 },
    { name: 'Ngành hàng điện gia dụng', count: 24 },
    { name: 'Test', count: 6 },
    { name: 'Chăm sóc thú cưng', count: 14 },
    { name: 'Voice_HTKT', count: 27 },
    { name: 'BT', count: 12 },
    { name: 'Other (27)', count: 18 },
  ];

  const workcodes = workcodeBase.map((row) => ({
    name: row.name,
    count: Math.round(row.count * scale),
  }));

  const total = workcodes.reduce((s, r) => s + r.count, 0);
  const pendingRatio =
    period === 'day'
      ? 0.2
      : period === 'week'
      ? 0.14
      : period === 'month'
      ? 0.09
      : 0.05;
  const pending =
    period === 'day' ? 34 : Math.max(1, Math.round(total * pendingRatio));
  const completed = Math.max(0, total - pending);

  let rawPoints: { label: string; count: number }[];
  let chartTitle: string;
  let tooltipPrefix: string;

  if (period === 'day') {
    rawPoints = BASE_HOURLY_COUNTS.map((count, idx) => ({
      label: String(idx),
      count,
    }));
    chartTitle = 'Đơn vị: Phiếu trong ngày';
    tooltipPrefix = 'Khung giờ';
  } else if (period === 'week') {
    rawPoints = WEEK_COUNTS;
    chartTitle = 'Đơn vị: Phiếu trong tuần';
    tooltipPrefix = 'Thứ';
  } else if (period === 'month') {
    rawPoints = MONTH_COUNTS;
    chartTitle = 'Đơn vị: Phiếu trong tháng';
    tooltipPrefix = 'Ngày';
  } else {
    rawPoints = YEAR_COUNTS;
    chartTitle = 'Đơn vị: Phiếu trong năm';
    tooltipPrefix = 'Tháng';
  }

  const seriesSum = rawPoints.reduce((s, p) => s + p.count, 0);
  const avgVal = Number((seriesSum / rawPoints.length).toFixed(1));
  const series: TicketSeriesPoint[] = rawPoints.map((pt) => ({
    label: pt.label,
    count: pt.count,
    avg: avgVal,
  }));

  const voiceVal = Math.round(total * 0.41);
  const chatVal = Math.round(total * 0.27);
  const emailVal = Math.round(total * 0.18);
  const fanpageVal = Math.round(total * 0.1);
  const otherVal = Math.max(
    0,
    total - voiceVal - chatVal - emailVal - fanpageVal
  );

  const channels: TicketChannelSlice[] = [
    { name: 'Voice', value: voiceVal, color: '#2563EB' },
    { name: 'Chat', value: chatVal, color: '#16A34A' },
    { name: 'Email', value: emailVal, color: '#F05A28' },
    { name: 'Fanpage', value: fanpageVal, color: '#8B5CF6' },
    { name: 'Khác', value: otherVal, color: '#94A3B8' },
  ];

  return {
    total,
    pending,
    completed,
    chartTitle,
    tooltipPrefix,
    series,
    workcodes,
    channels,
  };
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
    <div className="relative shrink-0">
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

export const TicketTab: React.FC<TicketTabProps> = ({
  onRefresh,
  onExportCsv,
  onNotify,
}) => {
  const [period, setPeriod] = useState<TicketPeriod>('day');
  const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCountSeries, setShowCountSeries] = useState(true);
  const [showAvgSeries, setShowAvgSeries] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocClick = () => setOpenMenuId(null);
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleDocClick);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  const data = useMemo(() => buildTicketData(period), [period]);

  const handleLocalRefresh = () => {
    setIsLocalRefreshing(true);
    onRefresh();
    window.setTimeout(() => setIsLocalRefreshing(false), 450);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top-Right Filter Bar: Làm mới + Theo ngày / Theo tuần / Theo tháng / Theo năm */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handleLocalRefresh}
          className="h-9 px-3.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E4E68] text-[13px] font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <RefreshCw
            size={14}
            strokeWidth={2.2}
            className={isLocalRefreshing ? 'animate-spin' : ''}
          />
          <span>Làm mới</span>
        </button>

        <select
          aria-label="Lọc báo cáo Ticket theo thời gian"
          value={period}
          onChange={(e) => setPeriod(e.target.value as TicketPeriod)}
          className="h-9 min-w-[144px] px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] font-medium text-slate-800 hover:border-slate-400 focus:outline-none focus:border-[#F05A28] transition-colors cursor-pointer"
        >
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
      </div>

      {/* Row 1: Left Stacked KPI Cards (Tổng phiếu + Phiếu chưa xử lý / Phiếu hoàn thành) & Right Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left KPI Column */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Top Full-Width KPI: Tổng phiếu */}
          <div className="flex-1 rounded-xl border border-[#E5E9F2] bg-white px-5 py-4 min-h-[146px] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[14.5px] font-bold text-[#1E293B]">
                Tổng phiếu
              </h2>
              <CardMenuButton
                cardId="ticket-kpi-total"
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                items={[
                  { label: 'Làm mới số liệu', onClick: onRefresh },
                  { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                ]}
              />
            </div>

            <div className="my-auto text-center text-[42px] leading-none font-bold text-[#1E293B] tabular-nums py-2">
              {data.total.toLocaleString('vi-VN')}
            </div>
          </div>

          {/* Bottom 2 Side-by-Side KPI Cards */}
          <div className="flex-1 grid grid-cols-2 gap-3.5">
            {/* Phiếu chưa xử lý */}
            <div className="rounded-xl border border-[#E5E9F2] bg-white px-3.5 py-4 min-h-[146px] flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <h2
                  title="Phiếu chưa xử lý"
                  className="text-[13px] font-bold text-[#1E293B] leading-snug"
                >
                  Phiếu chưa xử lý
                </h2>
                <CardMenuButton
                  cardId="ticket-kpi-pending"
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  items={[
                    { label: 'Làm mới số liệu', onClick: onRefresh },
                    { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                  ]}
                />
              </div>

              <div className="my-auto text-center text-[38px] leading-none font-bold text-[#EA580C] tabular-nums py-1">
                {data.pending.toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Phiếu hoàn thành */}
            <div className="rounded-xl border border-[#E5E9F2] bg-white px-3.5 py-4 min-h-[146px] flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <h2
                  title="Phiếu hoàn thành"
                  className="text-[13px] font-bold text-[#1E293B] leading-snug"
                >
                  Phiếu hoàn thành
                </h2>
                <CardMenuButton
                  cardId="ticket-kpi-completed"
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  items={[
                    { label: 'Làm mới số liệu', onClick: onRefresh },
                    { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                  ]}
                />
              </div>

              <div className="my-auto text-center text-[38px] leading-none font-bold text-[#16A34A] tabular-nums py-1">
                {data.completed.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Chart Card: Đơn vị: Phiếu trong ngày */}
        <section className="lg:col-span-9 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-bold text-[#1E293B]">
                {data.chartTitle}
              </h2>
              <CardMenuButton
                cardId="ticket-daily-chart"
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                items={[
                  {
                    label: 'Bật/tắt đường Trung bình',
                    onClick: () => {
                      setShowAvgSeries((v) => !v);
                      onNotify('Đã cập nhật hiển thị đường Trung bình.');
                    },
                  },
                  { label: 'Làm mới biểu đồ', onClick: handleLocalRefresh },
                  { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                ]}
              />
            </div>

            {/* Legend matching screenshot */}
            <div className="mt-2 mb-3 flex items-center gap-4 text-[12.5px] font-medium text-slate-700">
              <button
                type="button"
                onClick={() => setShowCountSeries((v) => !v)}
                className={`inline-flex items-center gap-1.5 transition-opacity ${
                  showCountSeries ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#F4C430]" />
                <span>Số phiếu</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAvgSeries((v) => !v)}
                className={`inline-flex items-center gap-1.5 transition-opacity ${
                  showAvgSeries ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#E54D4D]" />
                <span>Trung bình</span>
              </button>
            </div>
          </div>

          <div className="w-full flex-1 min-h-[245px]">
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart
                data={data.series}
                margin={{ top: 20, right: 14, left: 6, bottom: 2 }}
              >
                <CartesianGrid
                  stroke="#EEF2F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11.5, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'Tổng số',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 8,
                    style: {
                      textAnchor: 'middle',
                      fill: '#475569',
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                  labelFormatter={(label) =>
                    period === 'day'
                      ? `${data.tooltipPrefix} ${label}:00`
                      : `${data.tooltipPrefix} ${label}`
                  }
                  formatter={(val, name) => [
                    `${val ?? 0} phiếu`,
                    name === 'count' ? 'Số phiếu' : 'Trung bình',
                  ]}
                />
                {showCountSeries && (
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#F4C430"
                    strokeWidth={2.4}
                    dot={{
                      r: 3.5,
                      fill: '#FFFFFF',
                      stroke: '#F4C430',
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 5, fill: '#F4C430' }}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={8}
                      fill="#1E293B"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Line>
                )}
                {showAvgSeries && (
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#E54D4D"
                    strokeWidth={1.8}
                    strokeDasharray="6 4"
                    dot={{
                      r: 3,
                      fill: '#FFFFFF',
                      stroke: '#E54D4D',
                      strokeWidth: 1.8,
                    }}
                    activeDot={{ r: 4.5, fill: '#E54D4D' }}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 2: Bottom-Left Workcode Horizontal Bar Chart + Bottom-Right Channel Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Bottom-Left: Đơn vị: Phiếu theo loại yêu cầu */}
        <section className="lg:col-span-7 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-bold text-[#1E293B]">
                Đơn vị: Phiếu theo loại yêu cầu
              </h2>
              <CardMenuButton
                cardId="ticket-workcode-chart"
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                items={[
                  { label: 'Làm mới biểu đồ', onClick: onRefresh },
                  { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
                ]}
              />
            </div>

            <div className="mt-2 mb-3 flex items-center gap-2 text-[12.5px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#67C7D8]" />
              <span>Số lượng phiếu theo Workcode</span>
            </div>
          </div>

          <div className="w-full flex-1 min-h-[290px]">
            <ResponsiveContainer width="100%" height={295}>
              <BarChart
                data={data.workcodes}
                layout="vertical"
                margin={{ top: 4, right: 36, left: 26, bottom: 20 }}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  stroke="#EEF2F6"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11.5, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  label={{
                    value: 'Tổng số',
                    position: 'insideBottom',
                    offset: -12,
                    style: {
                      fill: '#475569',
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={158}
                  tick={{ fontSize: 12, fill: '#334155' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  label={{
                    value: 'Workcode',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -16,
                    style: {
                      textAnchor: 'middle',
                      fill: '#475569',
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
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
                  formatter={(val) => [`${val ?? 0} phiếu`, 'Tổng số']}
                />
                <Bar
                  dataKey="count"
                  fill="#67C7D8"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    fill="#334155"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Bottom-Right: Đơn vị: Phiếu theo Kênh */}
        <section className="lg:col-span-5 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-[15px] font-bold text-[#1E293B]">
              Đơn vị: Phiếu theo Kênh
            </h2>
            <CardMenuButton
              cardId="ticket-channel-donut"
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              items={[
                { label: 'Làm mới biểu đồ', onClick: onRefresh },
                { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
              ]}
            />
          </div>

          <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-6 py-2">
            {/* Donut Chart with Center Total */}
            <div className="relative w-[224px] h-[224px] shrink-0">
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={data.channels}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={104}
                    paddingAngle={1.5}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {data.channels.map((entry) => (
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
                      const pct =
                        data.total > 0
                          ? ((num / data.total) * 100).toFixed(1)
                          : '0.0';
                      return [`${num} phiếu (${pct}%)`, String(name ?? '')];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[30px] leading-none font-bold text-[#1E293B] tabular-nums">
                  {data.total.toLocaleString('vi-VN')}
                </span>
                <span className="mt-1.5 text-[13px] font-medium text-slate-500">
                  Total
                </span>
              </div>
            </div>

            {/* Channel Legend */}
            <div className="w-full xl:w-auto xl:min-w-[168px] space-y-2.5">
              {data.channels.map((slice) => {
                const pct =
                  data.total > 0
                    ? ((slice.value / data.total) * 100).toFixed(1)
                    : '0.0';
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
                      <span className="text-slate-400 font-normal">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
