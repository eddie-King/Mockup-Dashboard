import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Headphones,
  Mail,
  MessageSquare,
  Mic,
  Phone,
  Radio,
  Search,
  Square,
  User,
  X,
} from 'lucide-react';
import {
  MonitorAgentRow,
  formatDuration,
  formatHms,
} from '../../data/mockDashboardData';

interface AgentMonitorTabProps {
  agents: MonitorAgentRow[];
  onChangeStatus: (agentId: string, status: 'Ready' | 'Not ready') => void;
  onToggleChannel: (
    agentId: string,
    channel: 'voice' | 'chat' | 'email'
  ) => void;
  onNotify: (msg: string) => void;
}

type QueueTypeFilter = 'ALL' | 'voice' | 'chat' | 'email';
type MonitorMode = 'listen' | 'whisper';

export const AgentMonitorTab: React.FC<AgentMonitorTabProps> = ({
  agents,
  onChangeStatus,
  onToggleChannel,
  onNotify,
}) => {
  const [queueType, setQueueType] = useState<QueueTypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortStatusAsc, setSortStatusAsc] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Active voice monitoring session
  const [activeMonitor, setActiveMonitor] = useState<{
    agentId: string;
    mode: MonitorMode;
  } | null>(null);

  // Workload inspection modal (when clicking Chat or Email count pill)
  const [inspectWorkload, setInspectWorkload] = useState<{
    agent: MonitorAgentRow;
    channel: 'chat' | 'email';
  } | null>(null);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = agents.filter((ag) => {
      if (queueType === 'voice' && !ag.voiceAssigned) return false;
      if (queueType === 'chat' && !ag.chatAssigned) return false;
      if (queueType === 'email' && !ag.emailAssigned) return false;
      if (q) {
        const hitName = ag.username.toLowerCase().includes(q);
        const hitExt = ag.ext ? ag.ext.includes(q) : false;
        const hitQueue = ag.queues.some((qn) => qn.toLowerCase().includes(q));
        if (!hitName && !hitExt && !hitQueue) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (a.status === b.status) return 0;
      if (sortStatusAsc) {
        return a.status === 'Ready' ? -1 : 1;
      }
      return a.status === 'Ready' ? 1 : -1;
    });
  }, [agents, queueType, searchQuery, sortStatusAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageAgents = filteredAgents.slice(startIdx, startIdx + pageSize);
  const showingFrom = filteredAgents.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, filteredAgents.length);

  const monitoredAgent = activeMonitor
    ? agents.find((a) => a.id === activeMonitor.agentId) ?? null
    : null;

  const startCallMonitor = (ag: MonitorAgentRow, mode: MonitorMode) => {
    setActiveMonitor({ agentId: ag.id, mode });
    const labels: Record<MonitorMode, string> = {
      listen: 'Nghe xen (Silent)',
      whisper: 'Nhắc thoại (Whisper)',
    };
    onNotify(`Đang bật ${labels[mode]} — ${ag.username} (Ext ${ag.ext})`);
  };

  return (
    <div className="rounded-xl border border-[#E5E9F2] bg-white p-5 space-y-4">
      {/* Top Toolbar matching Agent Monitor screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[16px] font-extrabold text-[#0F172A] tracking-tight">
            Agent Monitor
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2F7] text-[#334155] text-[11.5px] font-bold tabular-nums">
            {filteredAgents.length} / {agents.length} Agent
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Loại kênh */}
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium text-slate-600 whitespace-nowrap">
              Loại kênh
            </span>
            <select
              aria-label="Lọc theo loại kênh"
              value={queueType}
              onChange={(e) => {
                setQueueType(e.target.value as QueueTypeFilter);
                setCurrentPage(1);
              }}
              className="h-9 min-w-[118px] px-3 text-[12.5px] font-medium text-slate-800 bg-white border border-[#D8DFE9] rounded-lg focus:outline-none focus:border-[#F05A28]"
            >
              <option value="ALL">Tất cả</option>
              <option value="voice">Voice</option>
              <option value="chat">Chat</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Search input */}
          <div className="relative w-56 sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm tên Agent hoặc ext"
              className="w-full h-9 pl-8 pr-3 text-[12.5px] bg-white border border-[#D8DFE9] rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#F05A28]"
            />
          </div>
        </div>
      </div>

      {/* Active Supervisor Voice Monitor Strip */}
      {monitoredAgent && activeMonitor && (
        <div className="rounded-lg border border-blue-200 bg-[#F0F5FF] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[12.5px] text-slate-800">
            <Radio size={15} className="text-[#2563EB] shrink-0" />
            <span>
              Đang giám sát cuộc gọi của{' '}
              <strong>{monitoredAgent.username}</strong> (Ext {monitoredAgent.ext}) — chế
              độ{' '}
              <strong className="text-[#2563EB]">
                {activeMonitor.mode === 'listen'
                  ? 'Nghe xen'
                  : 'Nhắc thoại'}
              </strong>{' '}
              ·{' '}
              <span className="font-mono font-bold tabular-nums">
                {formatDuration(monitoredAgent.voiceCallDurationSec ?? 0)}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveMonitor(null);
              onNotify('Đã kết thúc giám sát cuộc gọi.');
            }}
            className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5"
          >
            <Square size={11} fill="currentColor" />
            Ngắt giám sát
          </button>
        </div>
      )}

      {/* Multi-Level Grouped Table matching screenshot */}
      <div className="rounded-lg border border-[#E2E8F0] border-t-[2.5px] border-t-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1040px]">
            <thead>
              {/* Group Header Row */}
              <tr className="bg-[#EEF3F8] border-b border-[#E2E8F0] text-[12.5px] font-bold text-[#1E293B]">
                <th
                  colSpan={3}
                  className="py-2.5 px-4 border-r border-[#DCE3EE]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <User size={14} className="text-slate-500" />
                    Agent
                  </span>
                </th>
                <th
                  colSpan={3}
                  className="py-2.5 px-4 border-r border-[#DCE3EE]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-500" />
                    Voice
                  </span>
                </th>
                <th
                  colSpan={2}
                  className="py-2.5 px-4 border-r border-[#DCE3EE]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-slate-500" />
                    Chat
                  </span>
                </th>
                <th colSpan={2} className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-500" />
                    Email
                  </span>
                </th>
              </tr>

              {/* Sub-Column Header Row */}
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-bold text-[#334155]">
                <th className="py-2.5 px-4 w-[240px]">Agent</th>
                <th className="py-2.5 px-3 w-[135px]">
                  <button
                    type="button"
                    onClick={() => setSortStatusAsc((prev) => !prev)}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                    title="Sắp xếp theo trạng thái Ready / Not ready"
                  >
                    <span>Trạng thái</span>
                    <span className="text-[10px] text-slate-500">
                      {sortStatusAsc ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
                <th className="py-2.5 px-3 w-[120px] border-r border-[#EEF2F6]">
                  TL trạng thái
                </th>

                <th className="py-2.5 px-3.5 w-[155px]">Bật/Tắt</th>
                <th className="py-2.5 px-3 w-[95px]">TL thoại</th>
                <th className="py-2.5 px-3 w-[115px] border-r border-[#EEF2F6]">
                  Giám sát
                </th>

                <th className="py-2.5 px-3.5 w-[80px]">Bật/Tắt</th>
                <th className="py-2.5 px-3 w-[105px] border-r border-[#EEF2F6]">
                  Đang xử lý
                </th>

                <th className="py-2.5 px-3.5 w-[80px]">Bật/Tắt</th>
                <th className="py-2.5 px-3 w-[110px]">Đang xử lý</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF2F6] text-[13px]">
              {pageAgents.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-[13px] text-slate-400"
                  >
                    Không tìm thấy Agent phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                pageAgents.map((ag) => {
                  const isReady = ag.status === 'Ready';
                  const queueText = ag.queues.join(', ');
                  const isInCall = ag.voiceAssigned && ag.voiceState === 'In call';

                  return (
                    <tr
                      key={ag.id}
                      className="hover:bg-[#FAFBFD] transition-colors"
                    >
                      {/* Col 1: Agent Avatar + Name + Ext/Queues */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-[7px] bg-[#E25B26] text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                            {ag.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#0F172A] leading-tight truncate">
                              {ag.username}
                            </div>
                            <div
                              className="text-[11px] text-slate-400 truncate max-w-[185px] mt-0.5"
                              title={`Ext ${ag.ext ?? '-'} · ${queueText}`}
                            >
                              Ext {ag.ext ?? '-'}
                              {ag.ext ? ` · ${queueText}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Trạng thái (Ready / Not ready pill selector) */}
                      <td className="py-2.5 px-3">
                        <div className="relative inline-flex items-center">
                          <select
                            aria-label={`Đổi trạng thái cho ${ag.username}`}
                            value={ag.status}
                            onChange={(e) =>
                              onChangeStatus(
                                ag.id,
                                e.target.value as 'Ready' | 'Not ready'
                              )
                            }
                            className={`appearance-none h-[28px] pl-3 pr-7 rounded-full border text-[12px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors ${
                              isReady
                                ? 'bg-[#E9F9EE] border-[#B8E6C7] text-[#15803D]'
                                : 'bg-[#FEECEC] border-[#F5C2C2] text-[#C83228]'
                            }`}
                          >
                            <option value="Ready">Ready</option>
                            <option value="Not ready">Not ready</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className={`pointer-events-none absolute right-2.5 ${
                              isReady ? 'text-[#15803D]' : 'text-[#C83228]'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Col 3: TL trạng thái */}
                      <td className="py-2.5 px-3 font-mono text-[12.5px] font-bold text-[#1E293B] tabular-nums border-r border-[#F1F5F9]">
                        {formatHms(ag.stateDurationSec)}
                      </td>

                      {/* Col 4: Voice Bật/Tắt + status chip */}
                      <td className="py-2.5 px-3.5">
                        {!ag.voiceAssigned ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={ag.voiceEnabled}
                              aria-label={`Bật tắt Voice cho ${ag.username}`}
                              onClick={() => onToggleChannel(ag.id, 'voice')}
                              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                                ag.voiceEnabled ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                                  ag.voiceEnabled
                                    ? 'translate-x-[18px]'
                                    : 'translate-x-[3px]'
                                }`}
                              />
                            </button>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                                ag.voiceState === 'In call'
                                  ? 'bg-[#EAF2FF] text-[#2563EB]'
                                  : ag.voiceState === 'Avail'
                                  ? 'bg-[#E9F9EE] text-[#15803D]'
                                  : 'bg-[#EEF2F7] text-[#475569]'
                              }`}
                            >
                              {ag.voiceState}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Col 5: TL thoại */}
                      <td className="py-2.5 px-3 font-mono text-[12.5px] font-semibold tabular-nums text-slate-700">
                        {isInCall && ag.voiceCallDurationSec !== null ? (
                          <span className="text-[#2563EB]">
                            {formatDuration(ag.voiceCallDurationSec)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans font-normal">—</span>
                        )}
                      </td>

                      {/* Col 6: Giám sát (Listen / Whisper when In call) */}
                      <td className="py-2.5 px-3 border-r border-[#F1F5F9]">
                        {isInCall ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startCallMonitor(ag, 'listen')}
                              className="w-7 h-7 rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 inline-flex items-center justify-center transition-colors"
                              title="Nghe xen"
                              aria-label={`Nghe xen ${ag.username}`}
                            >
                              <Headphones size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => startCallMonitor(ag, 'whisper')}
                              className="w-7 h-7 rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 inline-flex items-center justify-center transition-colors"
                              title="Nhắc thoại"
                              aria-label={`Nhắc thoại ${ag.username}`}
                            >
                              <Mic size={13} />
                            </button>
                          </div>
                        ) : null}
                      </td>

                      {/* Col 7: Chat Bật/Tắt */}
                      <td className="py-2.5 px-3.5">
                        {!ag.chatAssigned ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ag.chatEnabled}
                            aria-label={`Bật tắt Chat cho ${ag.username}`}
                            onClick={() => onToggleChannel(ag.id, 'chat')}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                              ag.chatEnabled ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                                ag.chatEnabled
                                  ? 'translate-x-[18px]'
                                  : 'translate-x-[3px]'
                              }`}
                            />
                          </button>
                        )}
                      </td>

                      {/* Col 8: Chat Đang xử lý */}
                      <td className="py-2.5 px-3 border-r border-[#F1F5F9]">
                        {!ag.chatAssigned ? (
                          <span className="text-slate-400">—</span>
                        ) : ag.chatActiveCount > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setInspectWorkload({ agent: ag, channel: 'chat' })
                            }
                            className="h-[26px] px-2.5 rounded-full border border-[#86EFAC] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] text-[12px] font-bold inline-flex items-center gap-1.5 tabular-nums transition-colors"
                          >
                            <MessageSquare size={12} />
                            <span>{ag.chatActiveCount}</span>
                            <ArrowUpRight size={11} />
                          </button>
                        ) : (
                          <span className="h-[26px] px-2.5 rounded-full bg-[#EEF2F7] text-[#475569] text-[12px] font-semibold inline-flex items-center gap-1.5 tabular-nums">
                            <MessageSquare size={12} />
                            <span>0</span>
                          </span>
                        )}
                      </td>

                      {/* Col 9: Email Bật/Tắt */}
                      <td className="py-2.5 px-3.5">
                        {!ag.emailAssigned ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ag.emailEnabled}
                            aria-label={`Bật tắt Email cho ${ag.username}`}
                            onClick={() => onToggleChannel(ag.id, 'email')}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                              ag.emailEnabled ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                                ag.emailEnabled
                                  ? 'translate-x-[18px]'
                                  : 'translate-x-[3px]'
                              }`}
                            />
                          </button>
                        )}
                      </td>

                      {/* Col 10: Email Đang xử lý (orange outline pill matching screenshot) */}
                      <td className="py-2.5 px-3">
                        {!ag.emailAssigned ? (
                          <span className="text-slate-400">—</span>
                        ) : ag.emailActiveCount > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setInspectWorkload({ agent: ag, channel: 'email' })
                            }
                            className="h-[26px] px-2.5 rounded-full border border-[#F5B08B] bg-[#FFF5F0] hover:bg-[#FFE9DD] text-[#E6531D] text-[12px] font-bold inline-flex items-center gap-1.5 tabular-nums transition-colors"
                          >
                            <Mail size={12} />
                            <span>{ag.emailActiveCount}</span>
                            <ArrowUpRight size={11} />
                          </button>
                        ) : (
                          <span className="h-[26px] px-2.5 rounded-full bg-[#EEF2F7] text-[#475569] text-[12px] font-semibold inline-flex items-center gap-1.5 tabular-nums">
                            <Mail size={12} />
                            <span>0</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination Bar matching screenshot */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-slate-500">
        {/* Left: entries per page */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Số dòng mỗi trang"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 text-[12.5px] font-medium text-slate-700 bg-white border border-[#D8DFE9] rounded-md focus:outline-none focus:border-[#F05A28]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-[12px] text-slate-500">entries per page</span>
        </div>

        {/* Center: Showing X to Y of Z entries */}
        <div className="text-[12px] text-slate-500 tabular-nums">
          Showing {showingFrom} to {showingTo} of {filteredAgents.length} entries
        </div>

        {/* Right: Pagination buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(1)}
            className="w-7 h-7 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-35 inline-flex items-center justify-center"
            aria-label="Trang đầu"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-35 inline-flex items-center justify-center"
            aria-label="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-[28px] h-7 px-2 rounded text-[12.5px] font-semibold tabular-nums transition-colors ${
                pageNum === safePage
                  ? 'bg-[#334155] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-35 inline-flex items-center justify-center"
            aria-label="Trang sau"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="w-7 h-7 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-35 inline-flex items-center justify-center"
            aria-label="Trang cuối"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      {/* Workload Quick Preview Modal (Chat / Email count click) */}
      {inspectWorkload && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-[460px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  {inspectWorkload.channel === 'email'
                    ? `Email đang xử lý — ${inspectWorkload.agent.username}`
                    : `Phiên Chat đang mở — ${inspectWorkload.agent.username}`}
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Tổng đang phụ trách:{' '}
                  <strong>
                    {inspectWorkload.channel === 'email'
                      ? `${inspectWorkload.agent.emailActiveCount} email`
                      : `${inspectWorkload.agent.chatActiveCount} phiên chat`}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectWorkload(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Đóng cửa sổ"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 divide-y divide-slate-100 text-[13px]">
              {(inspectWorkload.channel === 'email'
                ? [
                    {
                      code: 'OCX-88412',
                      title: 'Tra soát giao dịch thanh toán QR bị trừ tiền 2 lần',
                      meta: 'Hạn SLA: còn 22 phút · Ưu tiên Cao',
                    },
                    {
                      code: 'OCX-88425',
                      title: 'Cập nhật địa chỉ nhận sao kê định kỳ quý IV',
                      meta: 'Hạn SLA: còn 1 giờ 35 phút · Tiêu chuẩn',
                    },
                    {
                      code: 'OCX-88431',
                      title: 'Yêu cầu cấp lại hợp đồng dịch vụ khách hàng VIP',
                      meta: 'Hạn SLA: còn 2 giờ 10 phút · Ưu tiên Cao',
                    },
                  ]
                : [
                    {
                      code: 'Zalo OA',
                      title: 'Trịnh Bảo Ngọc — Tra cứu hạn mức chuyển khoản thẻ Platinum',
                      meta: 'Đang mở 03:40 · Đạt SLA',
                    },
                    {
                      code: 'Website Livechat',
                      title: 'Phạm Đức Anh — Hỗ trợ kích hoạt Smart OTP trên thiết bị mới',
                      meta: 'Đang mở 05:12 · Sắp chạm ngưỡng SLA',
                    },
                  ]
              ).map((item) => (
                <div key={item.code} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="text-[11.5px] font-mono font-semibold text-[#3B49DF]">
                    {item.code}
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {item.title}
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-0.5">
                    {item.meta}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectWorkload(null)}
                className="px-4 py-1.5 rounded-lg bg-[#334155] hover:bg-slate-800 text-white text-[12.5px] font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
