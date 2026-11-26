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
  FanpageHourlyPoint,
  INITIAL_FANPAGE_POSTS,
  TimeframeKey,
} from '../../data/mockDashboardData';
import {
  DEFAULT_HALF_HOUR_RANGE,
  HALF_HOUR_LABELS,
  HalfHourFilterBar,
  HalfHourRange,
  formatSlotRange,
  getHalfHourWeight,
} from './HalfHourFilterBar';

interface FanpageCommentTabProps {
  timeframe: TimeframeKey;
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

export const FanpageCommentTab: React.FC<FanpageCommentTabProps> = ({
  onRefresh,
  onExportCsv,
  onNotify,
}) => {
  const [hourRange, setHourRange] = useState<HalfHourRange>(DEFAULT_HALF_HOUR_RANGE);
  const [selectedPage, setSelectedPage] = useState<string>('ALL');
  const [selectedPostId, setSelectedPostId] = useState<string>('ALL');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
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

  const fanpageNames = useMemo(
    () => Array.from(new Set(INITIAL_FANPAGE_POSTS.map((p) => p.fanpageName))),
    []
  );

  const pageFilteredPosts = useMemo(() => {
    if (selectedPage === 'ALL') return INITIAL_FANPAGE_POSTS;
    return INITIAL_FANPAGE_POSTS.filter((p) => p.fanpageName === selectedPage);
  }, [selectedPage]);

  const activePosts = useMemo(() => {
    if (selectedPostId === 'ALL') return pageFilteredPosts;
    const match = pageFilteredPosts.find((p) => p.id === selectedPostId);
    return match ? [match] : pageFilteredPosts;
  }, [pageFilteredPosts, selectedPostId]);

  const selectedPostObj = useMemo(
    () => pageFilteredPosts.find((p) => p.id === selectedPostId) ?? null,
    [pageFilteredPosts, selectedPostId]
  );

  // Build 48 half-hour slots (00:00..23:30) from activePosts and slice to [startSlot, endSlot)
  const hourlySeries = useMemo<FanpageHourlyPoint[]>(() => {
    const totalBaseReplied = activePosts.reduce((s, p) => s + p.replied, 0);
    const totalBaseUnreplied = activePosts.reduce((s, p) => s + p.unreplied, 0);
    const totalBaseSpam = activePosts.reduce((s, p) => s + p.spam, 0);

    let defaultWeightSum = 0;
    for (let i = DEFAULT_HALF_HOUR_RANGE.startSlot; i < DEFAULT_HALF_HOUR_RANGE.endSlot; i++) {
      defaultWeightSum += getHalfHourWeight(i);
    }

    const full48: FanpageHourlyPoint[] = Array.from({ length: 48 }, (_, idx) => {
      const w = getHalfHourWeight(idx);
      const share = defaultWeightSum > 0 ? w / defaultWeightSum : 1 / 20;
      return {
        hour: HALF_HOUR_LABELS[idx],
        replied: Math.max(0, Math.round(totalBaseReplied * share)),
        unreplied: Math.max(0, Math.round(totalBaseUnreplied * share)),
        spam: Math.max(0, Math.round(totalBaseSpam * share)),
      };
    });

    return full48.slice(hourRange.startSlot, hourRange.endSlot);
  }, [activePosts, hourRange]);

  // Aggregated KPIs directly from the selected 30-min intervals
  const totals = useMemo(() => {
    const replied = hourlySeries.reduce((s, pt) => s + pt.replied, 0);
    const unreplied = hourlySeries.reduce((s, pt) => s + pt.unreplied, 0);
    const spam = hourlySeries.reduce((s, pt) => s + pt.spam, 0);
    const total = replied + unreplied + spam;
    return { total, replied, unreplied, spam };
  }, [hourlySeries]);

  const rangeLabel = formatSlotRange(hourRange);

  const donutSlices = useMemo(
    () => [
      { name: 'Comment đã trả lời', value: totals.replied, color: '#16A34A' },
      { name: 'Comment chưa trả lời', value: totals.unreplied, color: '#F05A28' },
      { name: 'Comment Spam', value: totals.spam, color: '#94A3B8' },
    ],
    [totals]
  );

  const kpiCards = [
    {
      id: 'fp-kpi-total',
      title: 'Tổng Comment',
      value: totals.total,
      valueColor: 'text-[#1E293B]',
    },
    {
      id: 'fp-kpi-replied',
      title: 'Comment đã trả lời',
      value: totals.replied,
      valueColor: 'text-[#16A34A]',
    },
    {
      id: 'fp-kpi-unreplied',
      title: 'Comment chưa trả lời',
      value: totals.unreplied,
      valueColor: totals.unreplied > 0 ? 'text-[#EA580C]' : 'text-[#1E293B]',
    },
    {
      id: 'fp-kpi-spam',
      title: 'Comment Spam',
      value: totals.spam,
      valueColor: 'text-[#475569]',
    },
  ];

  const scopeLabel = selectedPostObj
    ? `${selectedPostObj.postCode} · ${selectedPostObj.fanpageName}`
    : selectedPage === 'ALL'
    ? 'Tổng tất cả bài viết'
    : `Tổng bài viết · ${selectedPage}`;

  return (
    <div ref={containerRef} className="space-y-4">
      <HalfHourFilterBar
        value={hourRange}
        onChange={setHourRange}
        channelName="Fanpage Comment"
      />

      {/* Scope Filter Bar: Tổng toàn kênh hoặc theo từng bài viết */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented quick switch: Tổng / Từng bài viết */}
          <div
            className="inline-flex items-center p-1 rounded-lg bg-[#F1F5F9] border border-[#E6EAF2]"
            role="group"
            aria-label="Chế độ xem tổng hoặc theo bài viết"
          >
            <button
              type="button"
              onClick={() => setSelectedPostId('ALL')}
              className={`px-3 py-1 rounded-[6px] text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                selectedPostId === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng tất cả bài viết
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedPostId === 'ALL' && pageFilteredPosts[0]) {
                  setSelectedPostId(pageFilteredPosts[0].id);
                }
              }}
              className={`px-3 py-1 rounded-[6px] text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                selectedPostId !== 'ALL'
                  ? 'bg-white text-[#F05A28] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo từng bài viết
            </button>
          </div>

          {/* Post Selector Dropdown */}
          <select
            aria-label="Chọn bài viết Fanpage"
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="h-9 max-w-[360px] px-3 text-[12.5px] font-medium text-slate-800 bg-[#F8FAFC] border border-[#DCE3EE] rounded-lg focus:outline-none focus:border-[#F05A28]"
          >
            <option value="ALL">Tất cả bài viết ({pageFilteredPosts.length} bài)</option>
            {pageFilteredPosts.map((post) => (
              <option key={post.id} value={post.id}>
                [{post.postCode}] {post.title}
              </option>
            ))}
          </select>
        </div>

        {/* Fanpage Selector */}
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="text-slate-500 whitespace-nowrap">Fanpage:</span>
          <select
            aria-label="Lọc theo trang Fanpage"
            value={selectedPage}
            onChange={(e) => {
              setSelectedPage(e.target.value);
              setSelectedPostId('ALL');
            }}
            className="h-9 px-3 text-[12.5px] font-medium text-slate-800 bg-[#F8FAFC] border border-[#DCE3EE] rounded-lg focus:outline-none focus:border-[#F05A28]"
          >
            <option value="ALL">Tất cả Fanpage</option>
            {fanpageNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Row 1: 4 Equal KPI Cards matching EmailTab visual language */}
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

      {/* Row 2: Balanced 7 : 5 Split — Comment trong ngày + Phân bổ theo trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <section className="lg:col-span-7 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-[14.5px] font-bold text-[#1E293B]">
                  Comment theo khung giờ (30 phút)
                </h2>
                <div className="text-[11.5px] text-slate-500 mt-0.5">
                  Phạm vi: {scopeLabel} ·{' '}
                  <span className="font-mono tabular-nums">{rangeLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 text-[12px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" />
                  Đã trả lời
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F05A28]" />
                  Chưa trả lời
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#94A3B8]" />
                  Spam
                </span>
              </div>
            </div>

            <CardMenuButton
              cardId="fp-daily-chart"
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              items={[
                {
                  label:
                    chartType === 'bar'
                      ? 'Chuyển sang biểu đồ vùng'
                      : 'Chuyển sang biểu đồ cột',
                  onClick: () => {
                    const next = chartType === 'bar' ? 'area' : 'bar';
                    setChartType(next);
                    onNotify(
                      next === 'area'
                        ? 'Đã chuyển "Comment trong ngày" sang biểu đồ vùng.'
                        : 'Đã chuyển "Comment trong ngày" sang biểu đồ cột.'
                    );
                  },
                },
                { label: 'Làm mới biểu đồ', onClick: onRefresh },
                { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
              ]}
            />
          </div>

          <div className="w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height={255}>
              {chartType === 'bar' ? (
                <BarChart
                  data={hourlySeries}
                  margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                  barGap={3}
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
                        replied: 'Đã trả lời',
                        unreplied: 'Chưa trả lời',
                        spam: 'Comment Spam',
                      };
                      const key = String(name ?? '');
                      return [`${val ?? 0} comment`, labels[key] || key];
                    }}
                  />
                  <Bar
                    dataKey="replied"
                    fill="#16A34A"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="unreplied"
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
                  data={hourlySeries}
                  margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fpRepliedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fpUnrepliedGrad" x1="0" y1="0" x2="0" y2="1">
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
                        replied: 'Đã trả lời',
                        unreplied: 'Chưa trả lời',
                        spam: 'Comment Spam',
                      };
                      const key = String(name ?? '');
                      return [`${val ?? 0} comment`, labels[key] || key];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="replied"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fill="url(#fpRepliedGrad)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="unreplied"
                    stroke="#F05A28"
                    strokeWidth={2}
                    fill="url(#fpUnrepliedGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Right Donut: Comment theo trạng thái */}
        <section className="lg:col-span-5 rounded-xl border border-[#E5E9F2] bg-white p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-[14.5px] font-bold text-[#1E293B] truncate">
              Fanpage: Comment theo trạng thái
            </h2>
            <CardMenuButton
              cardId="fp-donut"
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              items={[
                { label: 'Làm mới biểu đồ', onClick: onRefresh },
                { label: 'Xuất báo cáo CSV', onClick: onExportCsv },
              ]}
            />
          </div>

          <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-5 py-2">
            <div className="relative w-[204px] h-[204px] shrink-0">
              <ResponsiveContainer width="100%" height={204}>
                <PieChart>
                  <Pie
                    data={donutSlices}
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
                    {donutSlices.map((entry) => (
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
                        totals.total > 0 ? ((num / totals.total) * 100).toFixed(1) : '0';
                      return [`${num} comment (${pct}%)`, String(name ?? '')];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] leading-none font-bold text-[#1E293B] tabular-nums">
                  {totals.total.toLocaleString('vi-VN')}
                </span>
                <span className="mt-1 text-[12.5px] font-medium text-slate-500">
                  Total
                </span>
              </div>
            </div>

            <div className="w-full xl:w-auto xl:min-w-[185px] space-y-3">
              {donutSlices.map((slice) => {
                const pct =
                  totals.total > 0
                    ? ((slice.value / totals.total) * 100).toFixed(1)
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
                      <span className="text-slate-400 font-normal">({pct}%)</span>
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
