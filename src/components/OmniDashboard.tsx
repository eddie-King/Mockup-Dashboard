import React from 'react';
import {
  Download,
  LineChart,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  RotateCw,
  Ticket,
  Users,
} from 'lucide-react';
import { DashboardTabId } from '../data/menuConfig';
import {
  ActiveChatRow,
  AgentPresence,
  AgentRow,
  ChannelSummary,
  ChatDemandPoint,
  ChatQueueCapacity,
  LiveCallRow,
  MonitorAgentRow,
  PriorityEmailRow,
  QueueStatusRow,
  RoutingRule,
  SystemOverviewMetrics,
  TimeframeKey,
  TrafficPoint,
  VoiceHourlyPoint,
  VoiceQueueCardData,
  WaitingCallRow,
} from '../data/mockDashboardData';
import { VoiceTab } from './tabs/VoiceTab';
import { ChatTab } from './tabs/ChatTab';
import { EmailTab } from './tabs/EmailTab';
import { FanpageCommentTab } from './tabs/FanpageCommentTab';
import { TicketTab } from './tabs/TicketTab';
import { AgentMonitorTab } from './tabs/AgentMonitorTab';

export type RefreshIntervalKey = '15s' | '30s' | '1m' | '5m' | 'off';

interface OmniDashboardProps {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  timeframe: TimeframeKey;
  onChangeTimeframe: (tf: TimeframeKey) => void;
  clockText: string;
  isLive: boolean;
  onToggleLive: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshInterval: RefreshIntervalKey;
  onChangeRefreshInterval: (val: RefreshIntervalKey) => void;
  onExportCsv: () => void;
  system: SystemOverviewMetrics;
  summary: ChannelSummary;
  traffic: TrafficPoint[];
  queues: QueueStatusRow[];
  voiceStats: {
    offered: number;
    answered: number;
    waiting: number;
    abandoned: number;
    ivrConnected: number;
    asaSec: number;
    ahtSec: number;
    sla: number;
    readyAgents: number;
    ringing: number;
    inCall: number;
  };
  voiceQueues: VoiceQueueCardData[];
  waitingCalls: WaitingCallRow[];
  hourly24h: VoiceHourlyPoint[];
  onToggleQueueAgent: (queueId: string, agentId: string) => void;
  onPickupWaitingCall: (callId: string) => void;
  liveCalls: LiveCallRow[];
  chatStats: {
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
  chatDemandTrend: ChatDemandPoint[];
  onAdjustChatSlot: (queueId: string, delta: number) => void;
  chats: ActiveChatRow[];
  emailStats: {
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
  emails: PriorityEmailRow[];
  agents: AgentRow[];
  monitorAgents: MonitorAgentRow[];
  onChangeMonitorStatus: (agentId: string, status: 'Ready' | 'Not ready') => void;
  onToggleMonitorChannel: (
    agentId: string,
    channel: 'voice' | 'chat' | 'email'
  ) => void;
  routingRules: RoutingRule[];
  onWhisperToChat: (chatId: string, text: string) => void;
  onAssignEmail: (emailId: string, agentName: string) => void;
  onChangeAgentState: (agentId: string, nextStatus: AgentPresence) => void;
  onPingAgent: (agent: AgentRow) => void;
  onToggleRuleFlag: (
    ruleId: string,
    field: 'vipPriority' | 'overflowEnabled'
  ) => void;
  onChangeStrategy: (
    ruleId: string,
    strategy: RoutingRule['strategy']
  ) => void;
  onNotify: (msg: string) => void;
}

const TABS: {
  id: DashboardTabId;
  label: string;
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
}[] = [
  { id: 'voice', label: 'Voice', icon: Phone },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'fanpage', label: 'Fanpage Comment', icon: MessagesSquare },
  { id: 'ticket', label: 'Ticket', icon: Ticket },
  { id: 'agents', label: 'Giám sát Agent', icon: Users },
];

export const OmniDashboard: React.FC<OmniDashboardProps> = ({
  activeTab,
  onSelectTab,
  timeframe,
  onChangeTimeframe,
  clockText,
  isLive,
  onToggleLive,
  isRefreshing,
  onRefresh,
  refreshInterval,
  onChangeRefreshInterval,
  onExportCsv,
  system,
  summary,
  traffic,
  queues,
  voiceStats,
  voiceQueues,
  waitingCalls,
  hourly24h,
  onToggleQueueAgent,
  onPickupWaitingCall,
  chatStats,
  chatQueues,
  chatDemandTrend,
  onAdjustChatSlot,
  emailStats,
  emails,
  agents,
  monitorAgents,
  onChangeMonitorStatus,
  onToggleMonitorChannel,
  routingRules,
  onWhisperToChat,
  onAssignEmail,
  onChangeAgentState,
  onPingAgent,
  onToggleRuleFlag,
  onChangeStrategy,
  onNotify,
}) => {
  return (
    <div className="rounded-xl bg-white border border-[#E5E9F2] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Dashboard Top Header matching Image 1 */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Title Lockup */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#F36B2C] to-[#E54F1D] text-white flex items-center justify-center shadow-xs shrink-0">
            <LineChart size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.06em] text-[#D4511E]">
              REALTIME CONTROL
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
                Centralized Dashboard
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

        {/* Right Controls: Refresh Interval + Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Split Refresh Button + Interval Dropdown */}
          <div className="inline-flex items-center h-[36px] rounded-lg border border-[#DCE3EE] bg-white overflow-hidden shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              className="h-full px-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r border-[#DCE3EE] inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              title="Làm mới dữ liệu ngay"
              aria-label="Làm mới dữ liệu"
            >
              <RotateCw
                size={15}
                className={isRefreshing ? 'animate-spin text-[#F05A28]' : ''}
              />
            </button>
            <select
              aria-label="Chu kỳ cập nhật tự động"
              value={refreshInterval}
              onChange={(e) =>
                onChangeRefreshInterval(e.target.value as RefreshIntervalKey)
              }
              className="h-full px-2.5 bg-white text-[12.5px] font-mono font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="15s">15s</option>
              <option value="30s">30s</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="off">Tắt</option>
            </select>
          </div>

          {/* Export CSV Primary CTA */}
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

      {/* 6 Sub-Tabs Bar matching Image 1 */}
      <div className="px-6 border-b border-[#E5E9F2] overflow-x-auto">
        <div
          className="flex items-center gap-1 min-w-max"
          role="tablist"
          aria-label="Chuyển đổi phân hệ giám sát"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-t-[8px] text-[13.5px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 ${
                  isActive
                    ? 'bg-[#FFF5F0] text-[#F05A28] border border-b-0 border-[#F6B296]'
                    : 'text-[#475569] hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={2}
                  className={isActive ? 'text-[#F05A28]' : 'text-slate-400'}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] bg-[#F05A28]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="p-6 bg-[#FAFBFD]">
        {activeTab === 'voice' && (
          <VoiceTab
            isLive={isLive}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'chat' && (
          <ChatTab
            timeframe={timeframe}
            isLive={isLive}
            stats={chatStats}
            chatQueues={chatQueues}
            demandTrend={chatDemandTrend}
            onAdjustChatSlot={onAdjustChatSlot}
          />
        )}

        {activeTab === 'email' && (
          <EmailTab
            stats={emailStats}
            onRefresh={onRefresh}
            onExportCsv={onExportCsv}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'fanpage' && (
          <FanpageCommentTab
            timeframe={timeframe}
            onRefresh={onRefresh}
            onExportCsv={onExportCsv}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'ticket' && (
          <TicketTab
            timeframe={timeframe}
            onRefresh={onRefresh}
            onExportCsv={onExportCsv}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'agents' && (
          <AgentMonitorTab
            agents={monitorAgents}
            onChangeStatus={onChangeMonitorStatus}
            onToggleChannel={onToggleMonitorChannel}
            onNotify={onNotify}
          />
        )}
      </div>
    </div>
  );
};
