import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  RotateCw,
  Search,
} from 'lucide-react';
import {
  INITIAL_AGENT_DETAILS,
  INITIAL_DIRECT_CALLS_SERIES,
  INITIAL_TRUNK_AGENT_GROUPS,
  INITIAL_TRUNK_KPI,
  TrunkAgentDetailRow,
  TrunkGroupTable,
  TrunkKpiState,
  formatCmsTime,
} from '../../data/trunkMonitorData';

interface VoiceTabProps {
  isLive?: boolean;
  onRefresh?: () => void;
}

type RangeKey = '6h' | '3h' | '1h' | '30m';
type DetailSortKey =
  | 'auxReason'
  | 'agentId'
  | 'agentName'
  | 'agentTimeSec'
  | 'callDirection'
  | 'durationSec'
  | 'extension'
  | 'vdnId'
  | 'vdnName'
  | 'workMode'
  | 'workSkillId'
  | 'workSkillName';

const PAGE_SIZE = 14;

const Y_TICKS = [
  6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44,
  46,
];

const GROUP_COLUMNS = [
  'AUXReason',
  'AgentId',
  'AgentName',
  'AgentTime',
  'CallDirection',
  'DURATION',
  'Extension',
] as const;

const DETAIL_COLUMNS: { key: DetailSortKey; label: string }[] = [
  { key: 'auxReason', label: 'AUXReason' },
  { key: 'agentId', label: 'AgentId' },
  { key: 'agentName', label: 'AgentName' },
  { key: 'agentTimeSec', label: 'AgentTime' },
  { key: 'callDirection', label: 'CallDirection' },
  { key: 'durationSec', label: 'DURATION' },
  { key: 'extension', label: 'Extension' },
  { key: 'vdnId', label: 'VDNId' },
  { key: 'vdnName', label: 'VDNName' },
  { key: 'workMode', label: 'WorkMode' },
  { key: 'workSkillId', label: 'WorkSkillID' },
  { key: 'workSkillName', label: 'WorkSkillName' },
];

export const VoiceTab: React.FC<VoiceTabProps> = ({
  isLive = true,
  onRefresh,
}) => {
  const [kpi, setKpi] = useState<TrunkKpiState>(INITIAL_TRUNK_KPI);
  const [groups, setGroups] = useState<TrunkGroupTable[]>(
    INITIAL_TRUNK_AGENT_GROUPS
  );
  const [details, setDetails] = useState<TrunkAgentDetailRow[]>(
    INITIAL_AGENT_DETAILS
  );
  const [range, setRange] = useState<RangeKey>('6h');
  const [refreshIntervalLabel, setRefreshIntervalLabel] = useState<
    '1m' | '30s' | '15s'
  >('1m');
  const [showConnected, setShowConnected] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);

  // Agent Details table controls
  const [detailSearch, setDetailSearch] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<string>('ALL');
  const [detailSortKey, setDetailSortKey] = useState<DetailSortKey | null>(
    null
  );
  const [detailSortDir, setDetailSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const detailsSectionRef = useRef<HTMLElement | null>(null);

  // Live 1-second timer tick for CMS AgentTime & DURATION columns + subtle KPI pulse
  useEffect(() => {
    if (!isLive) return;
    let tickCount = 0;
    const timer = window.setInterval(() => {
      tickCount += 1;

      setGroups((prev) =>
        prev.map((grp) => ({
          ...grp,
          rows: grp.rows.map((row) => ({
            ...row,
            agentTimeSec: row.agentTimeSec + 1,
            durationSec: row.durationSec + 1,
          })),
        }))
      );

      setDetails((prev) =>
        prev.map((row) => ({
          ...row,
          agentTimeSec: row.agentTimeSec + 1,
          durationSec:
            row.durationSec > 0 || row.callDirection !== ''
              ? row.durationSec + 1
              : 0,
        }))
      );

      // Gentle realistic oscillation every 5 seconds anchored near screenshot metrics
      if (tickCount % 5 === 0) {
        setKpi((prev) => {
          const deltaAcd = tickCount % 10 === 0 ? 1 : -1;
          const nextAcd = Math.max(29, Math.min(35, prev.agentAcd + deltaAcd));
          const nextAvail = Math.max(
            8,
            Math.min(14, prev.agentLogin - prev.agentAux - nextAcd - prev.agentAcw)
          );
          const nextConnected = Math.max(27, Math.min(33, nextAcd - 2));
          return {
            ...prev,
            agentAcd: nextAcd,
            agentAvail: nextAvail,
            inboundConnectedCalls: nextConnected,
            inboundCurrentCall: nextConnected + 1,
          };
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLive]);

  const chartData = useMemo(() => {
    if (range === '30m') {
      return INITIAL_DIRECT_CALLS_SERIES.slice(-16);
    }
    if (range === '1h') {
      return INITIAL_DIRECT_CALLS_SERIES.slice(-31);
    }
    if (range === '3h') {
      return INITIAL_DIRECT_CALLS_SERIES.slice(-91);
    }
    return INITIAL_DIRECT_CALLS_SERIES;
  }, [range]);

  const xTicks = useMemo(() => {
    const stepMinutes = range === '30m' || range === '1h' ? 5 : 10;
    return chartData
      .filter((pt) => {
        const [, mm] = pt.time.split(':').map(Number);
        return mm % stepMinutes === 0;
      })
      .map((pt) => pt.time);
  }, [chartData, range]);

  const filteredDetails = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    let list = details.filter((row) => {
      if (workModeFilter !== 'ALL' && row.workMode !== workModeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        row.agentId.toLowerCase().includes(q) ||
        row.agentName.toLowerCase().includes(q) ||
        row.extension.toLowerCase().includes(q) ||
        row.auxReason.toLowerCase().includes(q) ||
        row.workSkillName.toLowerCase().includes(q) ||
        row.vdnName.toLowerCase().includes(q)
      );
    });

    if (detailSortKey) {
      list = [...list].sort((a, b) => {
        const av = a[detailSortKey];
        const bv = b[detailSortKey];
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') {
          cmp = av - bv;
        } else {
          cmp = String(av).localeCompare(String(bv), 'vi', { numeric: true });
        }
        return detailSortDir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  }, [details, detailSearch, workModeFilter, detailSortKey, detailSortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredDetails.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDetails = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDetails.slice(start, start + PAGE_SIZE);
  }, [filteredDetails, safePage]);

  const handleSortDetail = (key: DetailSortKey) => {
    if (detailSortKey === key) {
      setDetailSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setDetailSortKey(key);
      setDetailSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleJumpFilterByWorkMode = (mode: string) => {
    setWorkModeFilter((prev) => (prev === mode ? 'ALL' : mode));
    setCurrentPage(1);
    detailsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleLocalRefresh = () => {
    setKpi(INITIAL_TRUNK_KPI);
    setGroups(INITIAL_TRUNK_AGENT_GROUPS);
    setDetails(INITIAL_AGENT_DETAILS);
    onRefresh?.();
  };

  const startRow =
    filteredDetails.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(safePage * PAGE_SIZE, filteredDetails.length);

  return (
    <div className="space-y-4">
      {/* Top Trunk Monitor Header Bar (Light Theme) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E9F2] bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
            <LayoutGrid size={14} />
          </div>
          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="font-medium text-slate-500">General</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-[#0F172A]">Trunk monitor</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#DCE3EE] bg-[#F8FAFC] text-[12.5px] font-medium text-slate-700">
            <Clock size={13} className="text-slate-400" />
            <select
              aria-label="Khung thời gian Trunk monitor"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="6h">Last 6 hours</option>
              <option value="3h">Last 3 hours</option>
              <option value="1h">Last 1 hour</option>
              <option value="30m">Last 30 minutes</option>
            </select>
          </div>

          <div className="inline-flex items-center rounded-lg border border-[#DCE3EE] bg-white overflow-hidden">
            <button
              type="button"
              onClick={handleLocalRefresh}
              className="h-8 px-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r border-[#DCE3EE] inline-flex items-center justify-center transition-colors"
              title="Tải lại dữ liệu Trunk monitor"
              aria-label="Tải lại dữ liệu Trunk monitor"
            >
              <RotateCw size={13} />
            </button>
            <select
              aria-label="Chu kỳ làm mới tự động"
              value={refreshIntervalLabel}
              onChange={(e) =>
                setRefreshIntervalLabel(e.target.value as '1m' | '30s' | '15s')
              }
              className="h-8 px-2 bg-white text-[12px] font-mono font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="1m">1m</option>
              <option value="30s">30s</option>
              <option value="15s">15s</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: Abanded Calls % Interval 1 Day & 30 min (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="rounded-xl border border-[#E5E9F2] bg-white px-6 py-5 min-h-[156px] flex flex-col items-center justify-between text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="text-[13px] font-semibold text-slate-600">
            Abanded Calls % Interval 1 Day
          </div>
          <div className="my-auto text-[54px] sm:text-[64px] leading-none font-extrabold text-[#16A34A] tabular-nums tracking-tight">
            {kpi.abandonedCalls1Day.toFixed(3)}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E9F2] bg-white px-6 py-5 min-h-[156px] flex flex-col items-center justify-between text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="text-[13px] font-semibold text-slate-600">
            Abanded Calls % Interval 30 min
          </div>
          <div className="my-auto text-[54px] sm:text-[64px] leading-none font-extrabold text-[#16A34A] tabular-nums tracking-tight">
            {kpi.abandonedCalls30Min.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Row 2: Call Offer Interval 30 mins (Full Width) */}
      <div className="rounded-xl border border-[#E5E9F2] bg-white px-6 py-5 min-h-[146px] flex flex-col items-center justify-between text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="text-[13px] font-semibold text-slate-600">
          Call Offer Interval 30 mins
        </div>
        <div className="my-auto text-[56px] sm:text-[68px] leading-none font-extrabold text-[#E11D48] tabular-nums tracking-tight">
          {kpi.callOffer30Min}
        </div>
      </div>

      {/* Row 3: 7 Agent State Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          {
            label: 'Agent Login',
            value: kpi.agentLogin,
            tone: 'danger' as const,
            filterMode: 'ALL',
          },
          {
            label: 'Agent Avail',
            value: kpi.agentAvail,
            tone: 'success' as const,
            filterMode: 'AVAIL',
          },
          {
            label: 'Agent AUX',
            value: kpi.agentAux,
            tone: 'success' as const,
            filterMode: 'AUX',
          },
          {
            label: 'Agent Ringing',
            value: kpi.agentRinging,
            tone: 'success' as const,
            filterMode: 'RINGING',
          },
          {
            label: 'Agent ACD',
            value: kpi.agentAcd,
            tone: 'success' as const,
            filterMode: 'ACD',
          },
          {
            label: 'Agent DACD',
            value: kpi.agentDacd,
            tone: 'success' as const,
            filterMode: 'ALL',
          },
          {
            label: 'Agent ACW',
            value: kpi.agentAcw,
            tone: 'success' as const,
            filterMode: 'ACW',
          },
        ].map((card) => {
          const isSelectedFilter =
            card.filterMode !== 'ALL' && workModeFilter === card.filterMode;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => handleJumpFilterByWorkMode(card.filterMode)}
              title={`Lọc Agent Details theo ${card.label}`}
              className={`rounded-xl border bg-white px-4 py-4 min-h-[138px] flex flex-col items-center justify-between text-center transition-all shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-slate-300 hover:shadow-xs ${
                isSelectedFilter
                  ? 'border-[#2563EB] ring-2 ring-blue-100'
                  : 'border-[#E5E9F2]'
              }`}
            >
              <div className="text-[12.5px] font-semibold text-slate-600">
                {card.label}
              </div>
              <div
                className={`my-auto text-[44px] sm:text-[52px] leading-none font-extrabold tabular-nums tracking-tight ${
                  card.tone === 'danger'
                    ? 'text-[#E11D48]'
                    : 'text-[#16A34A]'
                }`}
              >
                {card.value}
              </div>
            </button>
          );
        })}
      </div>

      {/* Row 4: 4 Inbound Call Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Inbound Connected Calls', value: kpi.inboundConnectedCalls },
          { label: 'Inbound Queue Calls', value: kpi.inboundQueueCalls },
          { label: 'Inbound Ring Calls', value: kpi.inboundRingCalls },
          { label: 'Inbound Current Call', value: kpi.inboundCurrentCall },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#E5E9F2] bg-white px-5 py-4 min-h-[134px] flex flex-col items-center justify-between text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
          >
            <div className="text-[12.5px] font-semibold text-slate-600">
              {card.label}
            </div>
            <div className="my-auto text-[46px] sm:text-[54px] leading-none font-extrabold text-[#16A34A] tabular-nums tracking-tight">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Row 5: Total Direct Calls Time-Series Chart */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="text-center mb-3">
          <h2 className="text-[14.5px] font-bold text-[#0F172A]">
            Total Direct Calls
          </h2>
        </div>

        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 14, left: -14, bottom: 4 }}
            >
              <defs>
                <linearGradient id="trunkConnectedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="trunkCurrentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#EDF1F7"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="time"
                ticks={xTicks}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#DCE3EE' }}
                tickLine={false}
              />
              <YAxis
                domain={[6, 46]}
                ticks={Y_TICKS}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#DCE3EE' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DCE3EE',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
                }}
                labelStyle={{
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: '4px',
                }}
                formatter={(val, name) => [
                  `${val ?? 0} calls`,
                  name === 'connectedCall' ? 'Connected Call' : 'Current Call',
                ]}
              />
              {showConnected && (
                <Area
                  type="linear"
                  dataKey="connectedCall"
                  stroke="#16A34A"
                  strokeWidth={1.6}
                  fill="url(#trunkConnectedFill)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#16A34A' }}
                  isAnimationActive={false}
                />
              )}
              {showCurrent && (
                <Area
                  type="linear"
                  dataKey="currentCall"
                  stroke="#D97706"
                  strokeWidth={1.6}
                  fill="url(#trunkCurrentFill)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#D97706' }}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Series Legend matching Grafana Trunk Monitor */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] font-mono">
          <button
            type="button"
            onClick={() => setShowConnected((v) => !v)}
            className={`inline-flex items-center gap-2 transition-opacity ${
              showConnected ? 'opacity-100 text-slate-700' : 'opacity-40 text-slate-400'
            }`}
          >
            <span className="w-3.5 h-[3px] rounded-full bg-[#16A34A] shrink-0" />
            <span>
              Connected Call &#123;Group=&quot;All Trunk&quot;, Type=&quot;Trunk&quot;&#125;
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className={`inline-flex items-center gap-2 transition-opacity ${
              showCurrent ? 'opacity-100 text-slate-700' : 'opacity-40 text-slate-400'
            }`}
          >
            <span className="w-3.5 h-[3px] rounded-full bg-[#D97706] shrink-0" />
            <span>
              Current Call &#123;Group=&quot;All Trunk&quot;, Type=&quot;Trunk&quot;&#125;
            </span>
          </button>
        </div>
      </section>

      {/* Row 6: 5 Agent Group Tables (2-column grid matching screenshot 4) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groups.map((group) => (
          <section
            key={group.id}
            className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col"
          >
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E5E9F2] flex items-center justify-between">
              <span className="w-10" aria-hidden="true" />
              <h3 className="text-[13.5px] font-bold text-[#0F172A] text-center">
                {group.title}
              </h3>
              <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums w-10 text-right">
                {group.rows.length}
              </span>
            </div>

            <div className="overflow-auto max-h-[264px]">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead className="sticky top-0 z-10 bg-[#F4F7FA]">
                  <tr className="border-b border-[#E5E9F2] text-[12px] font-semibold text-[#2563EB]">
                    {GROUP_COLUMNS.map((col) => (
                      <th
                        key={col}
                        className="py-2 px-3 whitespace-nowrap font-semibold"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-800">
                  {group.rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {row.auxReason}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {row.agentId}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {row.agentName}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {formatCmsTime(row.agentTimeSec)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {row.callDirection === 'IN' ? (
                          <span className="font-mono font-semibold text-[#15803D]">
                            IN
                          </span>
                        ) : row.callDirection === 'OUT' ? (
                          <span className="font-mono font-semibold text-[#1D4ED8]">
                            OUT
                          </span>
                        ) : (
                          ''
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {formatCmsTime(row.durationSec)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {row.extension}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Row 7: Agent Details Full-Width Paginated Table (matching screenshot 5) */}
      <section
        ref={detailsSectionRef}
        className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      >
        <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E9F2] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[14px] font-bold text-[#0F172A]">
              Agent Details
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-white border border-[#DCE3EE] text-[11.5px] font-mono font-semibold text-slate-600 tabular-nums">
              {filteredDetails.length} rows
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo WorkMode"
              value={workModeFilter}
              onChange={(e) => {
                setWorkModeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] font-medium text-slate-700 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">WorkMode: Tất cả</option>
              <option value="AUX">AUX</option>
              <option value="ACD">ACD</option>
              <option value="AVAIL">AVAIL</option>
              <option value="ACW">ACW</option>
              <option value="RINGING">RINGING</option>
            </select>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={detailSearch}
                onChange={(e) => {
                  setDetailSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm AgentId, AgentName, Ext, Skill..."
                className="h-8 w-[240px] pl-8 pr-3 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1120px]">
            <thead>
              <tr className="bg-[#F4F7FA] border-b border-[#E5E9F2] text-[12px] font-semibold text-[#2563EB]">
                {DETAIL_COLUMNS.map((col) => {
                  const isSorted = detailSortKey === col.key;
                  return (
                    <th key={col.key} className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSortDetail(col.key)}
                        className="inline-flex items-center gap-1 hover:text-[#1D4ED8] transition-colors"
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown
                          size={11}
                          className={
                            isSorted ? 'text-[#1D4ED8]' : 'text-blue-300'
                          }
                        />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-800">
              {paginatedDetails.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-10 text-center text-[13px] text-slate-400"
                  >
                    Không tìm thấy Agent phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedDetails.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {row.auxReason}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {row.agentId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {row.agentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {formatCmsTime(row.agentTimeSec)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.callDirection === 'IN' ? (
                        <span className="font-mono font-semibold text-[#15803D]">
                          IN
                        </span>
                      ) : row.callDirection === 'OUT' ? (
                        <span className="font-mono font-semibold text-[#1D4ED8]">
                          OUT
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {formatCmsTime(row.durationSec)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {row.extension}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {row.vdnId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {row.vdnName}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11.5px] font-mono font-semibold ${
                          row.workMode === 'ACD'
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.workMode === 'AVAIL'
                            ? 'bg-blue-50 text-blue-700'
                            : row.workMode === 'ACW'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.workMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {row.workSkillId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {row.workSkillName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot 5 (< 1 2 3 >  |  1 - 14 of 42 rows) */}
        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E5E9F2] flex flex-wrap items-center justify-between gap-3">
          <div className="hidden sm:block w-[130px]" aria-hidden="true" />

          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 rounded border border-[#DCE3EE] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const active = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[28px] h-7 px-2 rounded text-[12px] font-semibold tabular-nums transition-colors ${
                    active
                      ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-xs'
                      : 'bg-white text-slate-700 border border-[#DCE3EE] hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 rounded border border-[#DCE3EE] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors"
              aria-label="Trang sau"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="text-[12px] font-mono text-slate-500 tabular-nums min-w-[130px] text-right">
            {startRow} - {endRow} of {filteredDetails.length} rows
          </div>
        </div>
      </section>
    </div>
  );
};
