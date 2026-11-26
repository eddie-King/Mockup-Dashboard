import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RotateCw } from 'lucide-react';
import { TimeframeKey } from '../data/mockDashboardData';

interface QualityAssuranceDashboardProps {
  timeframe?: TimeframeKey;
  onChangeTimeframe?: (tf: TimeframeKey) => void;
  clockText?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

type PeriodOption =
  | 'Hôm nay'
  | 'Hôm qua'
  | '7 ngày gần nhất'
  | 'Tháng này'
  | 'Tháng trước'
  | 'Quý này';
type SourceOption = 'Tất cả' | 'Inbound' | 'Outbound';
type ChannelOption = 'Tất cả' | 'Voice' | 'Chat' | 'Email' | 'Fanpage';

const UNITS = [
  'Tất cả',
  'CSKH Miền Bắc',
  'CSKH Miền Nam',
  'Hỗ trợ VIP',
  'Khối Thẻ & E-Banking',
  'Chi nhánh Đà Nẵng',
] as const;

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const RADIAN = Math.PI / 180;

const renderPiePercentLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.56;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pctText = `${Math.round(percent * 100)}%`;

  return (
    <g>
      <rect
        x={x - 20}
        y={y - 12}
        width={40}
        height={24}
        rx={4}
        fill="rgba(15, 23, 42, 0.78)"
      />
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
      >
        {pctText}
      </text>
    </g>
  );
};

export const QualityAssuranceDashboard: React.FC<
  QualityAssuranceDashboardProps
> = ({ isRefreshing = false, onRefresh, onNotify }) => {
  const [period, setPeriod] = useState<PeriodOption>('Hôm nay');
  const [source, setSource] = useState<SourceOption>('Tất cả');
  const [channel, setChannel] = useState<ChannelOption>('Tất cả');
  const [unit, setUnit] = useState<string>('Tất cả');

  // Dynamic deterministic scale factor based on selected filters
  const filterFactor = useMemo(() => {
    let factor = 1;
    if (period === 'Hôm qua') factor *= 0.92;
    if (period === '7 ngày gần nhất') factor *= 1.4;
    if (period === 'Tháng này') factor *= 2.1;
    if (period === 'Tháng trước') factor *= 2.3;
    if (period === 'Quý này') factor *= 3.0;
    if (source === 'Inbound') factor *= 0.72;
    if (source === 'Outbound') factor *= 0.48;
    if (channel !== 'Tất cả') factor *= 0.55;
    if (unit !== 'Tất cả') factor *= 0.45;
    return factor;
  }, [period, source, channel, unit]);

  // Subtle pass-rate shift when switching filters (default matches exact 59% / 41% in image)
  const passShift = useMemo(() => {
    let shift = 0;
    if (period === 'Hôm qua') shift -= 2;
    if (period === '7 ngày gần nhất') shift += 2;
    if (period === 'Tháng này') shift += 3;
    if (period === 'Tháng trước') shift += 1;
    if (period === 'Quý này') shift += 4;
    if (source === 'Inbound') shift += 3;
    if (source === 'Outbound') shift -= 2;
    if (channel === 'Voice') shift += 2;
    if (channel === 'Chat') shift += 4;
    if (channel === 'Email') shift += 1;
    if (channel === 'Fanpage') shift -= 3;
    if (unit === 'Hỗ trợ VIP') shift += 6;
    return shift;
  }, [period, source, channel, unit]);

  const manualPieData = useMemo(() => {
    const passPct = Math.max(
      32,
      Math.min(90, 59 + Math.round(passShift * 0.85))
    );
    const failPct = 100 - passPct;
    return [
      {
        name: 'Số tương tác không đạt chuẩn',
        value: failPct,
        color: '#3B6ED5',
      },
      {
        name: 'Số tương tác đạt chuẩn',
        value: passPct,
        color: '#ED7D31',
      },
    ];
  }, [passShift]);

  const topBranches = useMemo(
    () => [
      {
        highName: 'CN Hà Nội',
        highManual: (95.4 + passShift * 0.1).toFixed(1),
        lowName: 'CN Bắc Ninh',
        lowManual: (70.2 + passShift * 0.1).toFixed(1),
      },
      {
        highName: 'CN TP.HCM',
        highManual: (93.6 + passShift * 0.1).toFixed(1),
        lowName: 'CN Nghệ An',
        lowManual: (68.0 + passShift * 0.1).toFixed(1),
      },
      {
        highName: 'CN Đà Nẵng',
        highManual: (92.1 + passShift * 0.1).toFixed(1),
        lowName: 'CN Thừa Thiên Huế',
        lowManual: (66.5 + passShift * 0.1).toFixed(1),
      },
      {
        highName: 'CN Hải Phòng',
        highManual: (90.8 + passShift * 0.1).toFixed(1),
        lowName: 'CN Bình Dương',
        lowManual: (64.3 + passShift * 0.1).toFixed(1),
      },
      {
        highName: 'CN Cần Thơ',
        highManual: (89.5 + passShift * 0.1).toFixed(1),
        lowName: 'CN Đồng Nai',
        lowManual: (61.8 + passShift * 0.1).toFixed(1),
      },
    ],
    [passShift]
  );

  const topAgents = useMemo(
    () => [
      {
        highName: 'Nguyễn Thị Vân Anh',
        highManual: (97.2 + passShift * 0.08).toFixed(1),
        lowName: 'Trần Khắc Việt',
        lowManual: (66.0 + passShift * 0.08).toFixed(1),
      },
      {
        highName: 'Phạm Trà My',
        highManual: (95.8 + passShift * 0.08).toFixed(1),
        lowName: 'Lương Thị Quỳnh Anh',
        lowManual: (64.5 + passShift * 0.08).toFixed(1),
      },
      {
        highName: 'Trần Bích Huyền',
        highManual: (94.6 + passShift * 0.08).toFixed(1),
        lowName: 'Nguyễn Kim Trang',
        lowManual: (63.1 + passShift * 0.08).toFixed(1),
      },
      {
        highName: 'Vũ Trung Kiên',
        highManual: (93.0 + passShift * 0.08).toFixed(1),
        lowName: 'Đặng Ánh Vân',
        lowManual: (61.2 + passShift * 0.08).toFixed(1),
      },
      {
        highName: 'Nguyễn Thị Thảo Ly',
        highManual: (92.0 + passShift * 0.08).toFixed(1),
        lowName: 'Nguyễn Ngọc Bích',
        lowManual: (60.4 + passShift * 0.08).toFixed(1),
      },
    ],
    [passShift]
  );

  const agentErrorsByLevel = useMemo(() => {
    const s = Math.max(0.4, Math.min(1.3, filterFactor));
    return [
      {
        level: 'Nhắc nhở',
        skill: Math.max(1, Math.round(15 * s)),
        process: Math.max(1, Math.round(12 * s)),
        attitude: Math.max(1, Math.round(8 * s)),
        logging: Math.max(1, Math.round(10 * s)),
      },
      {
        level: 'M0',
        skill: Math.max(1, Math.round(8 * s)),
        process: Math.max(1, Math.round(6 * s)),
        attitude: Math.max(1, Math.round(4 * s)),
        logging: Math.max(1, Math.round(7 * s)),
      },
      {
        level: 'M1',
        skill: Math.max(1, Math.round(5 * s)),
        process: Math.max(1, Math.round(8 * s)),
        attitude: Math.max(1, Math.round(3 * s)),
        logging: Math.max(1, Math.round(4 * s)),
      },
      {
        level: 'M2',
        skill: Math.max(1, Math.round(3 * s)),
        process: Math.max(1, Math.round(4 * s)),
        attitude: Math.max(1, Math.round(6 * s)),
        logging: Math.max(1, Math.round(2 * s)),
      },
      {
        level: 'M3',
        skill: Math.max(0, Math.round(1 * s)),
        process: Math.max(1, Math.round(2 * s)),
        attitude: Math.max(1, Math.round(4 * s)),
        logging: Math.max(0, Math.round(1 * s)),
      },
    ];
  }, [filterFactor]);

  const branchOperationalErrors = useMemo(() => {
    const s = Math.max(0.4, Math.min(1.6, filterFactor));
    const rows = [
      { unit: 'CSKH Miền Bắc', remind: 10, m0: 5, m1: 1, m2: 3, m3: 0 },
      { unit: 'CSKH Miền Nam', remind: 12, m0: 6, m1: 2, m2: 2, m3: 1 },
      { unit: 'Hỗ trợ VIP', remind: 4, m0: 2, m1: 1, m2: 0, m3: 0 },
      { unit: 'Khối Thẻ & E-Banking', remind: 9, m0: 4, m1: 3, m2: 2, m3: 1 },
      { unit: 'Chi nhánh Đà Nẵng', remind: 7, m0: 3, m1: 1, m2: 1, m3: 0 },
    ];
    return rows
      .filter((r) => unit === 'Tất cả' || r.unit === unit)
      .map((r) => ({
        unit: r.unit,
        remind: Math.round(r.remind * s),
        m0: Math.round(r.m0 * s),
        m1: Math.round(r.m1 * s),
        m2: Math.round(r.m2 * s),
        m3: Math.round(r.m3 * s),
      }));
  }, [filterFactor, unit]);

  const handleResetAndRefresh = () => {
    setPeriod('Hôm nay');
    setSource('Tất cả');
    setChannel('Tất cả');
    setUnit('Tất cả');
    onRefresh?.();
    onNotify?.('Đã làm mới dữ liệu báo cáo Quality Assurance.');
  };

  return (
    <div className="space-y-4">
      {/* Top 4-Filter Bar + "Làm mới" */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label
              htmlFor="qa-filter-period"
              className="block text-[12px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Thời gian
            </label>
            <select
              id="qa-filter-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodOption)}
              className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[13px] text-slate-700 focus:outline-none focus:border-[#3B6ED5]"
            >
              <option value="Hôm nay">Hôm nay</option>
              <option value="Hôm qua">Hôm qua</option>
              <option value="7 ngày gần nhất">7 ngày gần nhất</option>
              <option value="Tháng này">Tháng này</option>
              <option value="Tháng trước">Tháng trước</option>
              <option value="Quý này">Quý này</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qa-filter-source"
              className="block text-[12px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Nguồn tương tác
            </label>
            <select
              id="qa-filter-source"
              value={source}
              onChange={(e) => setSource(e.target.value as SourceOption)}
              className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[13px] text-slate-700 focus:outline-none focus:border-[#3B6ED5]"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qa-filter-channel"
              className="block text-[12px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Kênh tương tác
            </label>
            <select
              id="qa-filter-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelOption)}
              className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[13px] text-slate-700 focus:outline-none focus:border-[#3B6ED5]"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Voice">Voice</option>
              <option value="Chat">Chat</option>
              <option value="Email">Email</option>
              <option value="Fanpage">Fanpage</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qa-filter-unit"
              className="block text-[12px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Đơn vị
            </label>
            <select
              id="qa-filter-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[13px] text-slate-700 focus:outline-none focus:border-[#3B6ED5]"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleResetAndRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
          >
            <RotateCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span>Làm mới</span>
          </button>
        </div>
      </section>

      {/* Row 1: Kết quả đánh giá chất lượng */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h2 className="text-[16px] font-bold text-[#1E293B] text-center mb-3">
          Kết quả đánh giá chất lượng
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="w-[240px] h-[240px] shrink-0">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={manualPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  outerRadius={104}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  labelLine={false}
                  label={renderPiePercentLabel}
                  isAnimationActive={false}
                >
                  {manualPieData.map((entry) => (
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
                  formatter={(val, name) => [
                    `${val ?? 0}%`,
                    String(name ?? ''),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 max-w-[260px]">
            {manualPieData.map((slice) => (
              <div
                key={slice.name}
                className="flex items-start gap-2.5 text-[12.5px] text-slate-700 leading-snug"
              >
                <span
                  className="w-3 h-3 rounded-[2px] mt-0.5 shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div>
                  <span className="font-medium">{slice.name}</span>
                  <span className="ml-1.5 font-mono font-bold text-slate-900 tabular-nums">
                    ({slice.value}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Row 2: Top 5 theo Chi nhánh & Top 5 theo Agent */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top 5 theo Chi nhánh */}
        <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="text-[15px] font-bold text-[#1E293B] text-center mb-3.5">
            Top 5 theo Chi nhánh
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[420px] text-[12.5px]">
              <thead>
                <tr className="bg-[#E9EEF5] text-[#1E3A5F] font-semibold">
                  <th className="py-2.5 px-2.5 text-left rounded-l-md">
                    CN điểm cao
                  </th>
                  <th className="py-2.5 px-2 border-r border-slate-300/70">
                    Điểm TB
                  </th>
                  <th className="py-2.5 px-2.5 text-left">CN điểm thấp</th>
                  <th className="py-2.5 px-2 rounded-r-md">
                    Điểm TB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topBranches.map((row) => (
                  <tr
                    key={row.highName}
                    className="hover:bg-[#FAFBFD] transition-colors"
                  >
                    <td className="py-2.5 px-2.5 text-left font-semibold text-slate-800">
                      {row.highName}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-semibold text-[#15803D] tabular-nums border-r border-slate-100">
                      {row.highManual}
                    </td>
                    <td className="py-2.5 px-2.5 text-left font-medium text-slate-700">
                      {row.lowName}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-semibold text-[#DC2626] tabular-nums">
                      {row.lowManual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top 5 theo Agent */}
        <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="text-[15px] font-bold text-[#1E293B] text-center mb-3.5">
            Top 5 theo Agent
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[440px] text-[12.5px]">
              <thead>
                <tr className="bg-[#E9EEF5] text-[#1E3A5F] font-semibold">
                  <th className="py-2.5 px-2.5 text-left rounded-l-md">
                    Agent điểm cao
                  </th>
                  <th className="py-2.5 px-2 border-r border-slate-300/70">
                    Điểm TB
                  </th>
                  <th className="py-2.5 px-2.5 text-left">Agent điểm thấp</th>
                  <th className="py-2.5 px-2 rounded-r-md">
                    Điểm TB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topAgents.map((row) => (
                  <tr
                    key={row.highName}
                    className="hover:bg-[#FAFBFD] transition-colors"
                  >
                    <td className="py-2.5 px-2.5 text-left font-semibold text-slate-800 whitespace-nowrap">
                      {row.highName}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-semibold text-[#15803D] tabular-nums border-r border-slate-100">
                      {row.highManual}
                    </td>
                    <td className="py-2.5 px-2.5 text-left font-medium text-slate-700 whitespace-nowrap">
                      {row.lowName}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-semibold text-[#DC2626] tabular-nums">
                      {row.lowManual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Row 4 (Screenshot 2): Số lượng lỗi của TVV & Số lượng lỗi tác nghiệp theo chi nhánh */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Grouped Column Chart — Số lượng lỗi của TVV */}
        <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <h2 className="text-[15.5px] font-bold text-[#1E3A5F] text-center mb-3">
            Số lượng lỗi của TVV
          </h2>

          <div className="w-full h-[275px]">
            <ResponsiveContainer width="100%" height={275}>
              <BarChart
                data={agentErrorsByLevel}
                margin={{ top: 20, right: 12, left: 4, bottom: 4 }}
                barGap={3}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#EEF2F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="level"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11.5, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  label={{
                    value: 'Số lượng lỗi',
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
                      skill: 'Lỗi kỹ năng',
                      process: 'Lỗi nghiệp vụ',
                      attitude: 'Lỗi thái độ',
                      logging: 'Lỗi lưu thông tin',
                    };
                    const key = String(name ?? '');
                    return [`${val ?? 0} lỗi`, labels[key] || key];
                  }}
                />
                <Bar
                  dataKey="skill"
                  fill="#817CE0"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="skill"
                    position="top"
                    fill="#334155"
                    fontSize={10.5}
                    fontWeight={600}
                  />
                </Bar>
                <Bar
                  dataKey="process"
                  fill="#6EC995"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="process"
                    position="top"
                    fill="#334155"
                    fontSize={10.5}
                    fontWeight={600}
                  />
                </Bar>
                <Bar
                  dataKey="attitude"
                  fill="#F9BE4F"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="attitude"
                    position="top"
                    fill="#334155"
                    fontSize={10.5}
                    fontWeight={600}
                  />
                </Bar>
                <Bar
                  dataKey="logging"
                  fill="#F66D6D"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="logging"
                    position="top"
                    fill="#334155"
                    fontSize={10.5}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-[12px] font-medium">
            <span className="inline-flex items-center gap-1.5 text-[#5E57C7]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#817CE0]" />
              Lỗi kỹ năng
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#2E9E60]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#6EC995]" />
              Lỗi nghiệp vụ
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#D98A00]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F9BE4F]" />
              Lỗi thái độ
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#DC4C4C]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F66D6D]" />
              Lỗi lưu thông tin
            </span>
          </div>
        </section>

        {/* Right: Table — Số lượng lỗi tác nghiệp theo chi nhánh */}
        <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="text-[15.5px] font-bold text-[#1E293B] text-center mb-3.5">
            Số lượng lỗi tác nghiệp theo chi nhánh
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[480px] text-[13px]">
              <thead>
                <tr className="bg-[#E9EEF5] text-[#1E3A5F] font-semibold">
                  <th className="py-3 px-4 text-left rounded-l-md">Đơn vị</th>
                  <th className="py-3 px-3">Nhắc nhở</th>
                  <th className="py-3 px-3">M0</th>
                  <th className="py-3 px-3">M1</th>
                  <th className="py-3 px-3">M2</th>
                  <th className="py-3 px-3 rounded-r-md">M3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchOperationalErrors.map((row) => (
                  <tr
                    key={row.unit}
                    className="hover:bg-[#FAFBFD] transition-colors"
                  >
                    <td className="py-3 px-4 text-left font-medium text-slate-800">
                      {row.unit}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 tabular-nums">
                      {row.remind}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 tabular-nums">
                      {row.m0}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 tabular-nums">
                      {row.m1}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 tabular-nums">
                      {row.m2}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono tabular-nums ${
                        row.m3 > 0
                          ? 'font-bold text-[#DC2626]'
                          : 'text-slate-500'
                      }`}
                    >
                      {row.m3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
