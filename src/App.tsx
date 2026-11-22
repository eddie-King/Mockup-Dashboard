import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  DashboardTabId,
  MenuItem,
  SIDEBAR_MENU,
} from './data/menuConfig';
import {
  ActiveChatRow,
  AgentPresence,
  AgentRow,
  CHAT_DEMAND_TREND,
  ChatQueueCapacity,
  INITIAL_ACTIVE_CHATS,
  INITIAL_AGENTS,
  INITIAL_CHAT_QUEUES,
  INITIAL_EMAILS,
  INITIAL_LIVE_CALLS,
  INITIAL_MONITOR_AGENTS,
  INITIAL_QUEUES,
  INITIAL_ROUTING_RULES,
  INITIAL_SLA_ALERTS,
  INITIAL_VOICE_QUEUES,
  INITIAL_WAITING_CALLS,
  LiveCallRow,
  MonitorAgentRow,
  PriorityEmailRow,
  QueueStatusRow,
  RoutingRule,
  SlaAlert,
  TIMEFRAME_DATA,
  TimeframeKey,
  VOICE_HOURLY_24H,
  VoiceQueueCardData,
  WaitingCallRow,
} from './data/mockDashboardData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightRail } from './components/RightRail';
import { OmniDashboard } from './components/OmniDashboard';
import { GeneralDashboard } from './components/GeneralDashboard';
import { QualityAssuranceDashboard } from './components/QualityAssuranceDashboard';
import { WorkforceManagementDashboard } from './components/WorkforceManagementDashboard';
import { ChatSessionsWorkspace } from './components/ChatSessionsWorkspace';
import { SecondaryModuleView } from './components/SecondaryModuleView';

function findMenuItemWithPath(
  targetId: string
): { item: MenuItem; sectionTitle: string; trail: string[] } | null {
  for (const section of SIDEBAR_MENU) {
    const search = (
      list: MenuItem[],
      ancestors: string[]
    ): { item: MenuItem; sectionTitle: string; trail: string[] } | null => {
      for (const it of list) {
        if (it.id === targetId) {
          return {
            item: it,
            sectionTitle: section.title,
            trail: [...ancestors, it.label],
          };
        }
        if (it.children) {
          const found = search(it.children, [...ancestors, it.label]);
          if (found) return found;
        }
      }
      return null;
    };
    const res = search(section.items, []);
    if (res) return res;
  }
  return null;
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string>('inbound-omni-dashboard');
  const [activeTab, setActiveTab] = useState<DashboardTabId>('voice');
  const [timeframe, setTimeframe] = useState<TimeframeKey>('15m');

  // Header supervisor status (matches Image 1 default "Not ready" for ba.tuann)
  const [myStatus, setMyStatus] = useState<AgentPresence>('not-ready');
  const [myReason, setMyReason] = useState<string>('Chưa sẵn sàng · Giám sát ca trực');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Realtime simulation state
  const [isLive, setIsLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clockText, setClockText] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  });
  const [liveDelta, setLiveDelta] = useState({
    voiceAvail: 0,
    chatAvail: 0,
    emailAvail: 0,
    interactions: 0,
  });

  // Interactive workspace state
  const [queues, setQueues] = useState<QueueStatusRow[]>(INITIAL_QUEUES);
  const [voiceQueues, setVoiceQueues] = useState<VoiceQueueCardData[]>(INITIAL_VOICE_QUEUES);
  const [waitingCalls, setWaitingCalls] = useState<WaitingCallRow[]>(INITIAL_WAITING_CALLS);
  const [chatQueues, setChatQueues] = useState<ChatQueueCapacity[]>(INITIAL_CHAT_QUEUES);
  const [liveCalls, setLiveCalls] = useState<LiveCallRow[]>(INITIAL_LIVE_CALLS);
  const [chats, setChats] = useState<ActiveChatRow[]>(INITIAL_ACTIVE_CHATS);
  const [emails, setEmails] = useState<PriorityEmailRow[]>(INITIAL_EMAILS);
  const [agents, setAgents] = useState<AgentRow[]>(INITIAL_AGENTS);
  const [monitorAgents, setMonitorAgents] = useState<MonitorAgentRow[]>(
    INITIAL_MONITOR_AGENTS
  );
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(INITIAL_ROUTING_RULES);
  const [slaAlerts, setSlaAlerts] = useState<SlaAlert[]>(INITIAL_SLA_ALERTS);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 1-second live clock & duration counters
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setClockText(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );

      if (!isLive) return;

      setLiveCalls((prev) =>
        prev.map((c) => ({ ...c, durationSec: c.durationSec + 1 }))
      );
      setChats((prev) =>
        prev.map((c) => ({ ...c, durationSec: c.durationSec + 1 }))
      );
      setAgents((prev) =>
        prev.map((a) => ({ ...a, stateDurationSec: a.stateDurationSec + 1 }))
      );
      setQueues((prev) =>
        prev.map((q) => ({
          ...q,
          longestWaitSec:
            q.waiting > 0
              ? q.longestWaitSec >= q.thresholdSec + 18
                ? Math.max(8, q.thresholdSec - 16)
                : q.longestWaitSec + 1
              : 0,
        }))
      );
      setWaitingCalls((prev) =>
        prev.map((wc) => {
          const nextSec = wc.waitSec + 1;
          return {
            ...wc,
            waitSec: nextSec,
            status:
              wc.status === 'Ưu tiên VIP'
                ? 'Ưu tiên VIP'
                : nextSec >= 40
                ? 'Chờ lâu'
                : 'Đang chờ',
          };
        })
      );
      setChatQueues((prev) =>
        prev.map((cq) => ({
          ...cq,
          longestWaitSec: cq.inQueue > 0 ? cq.longestWaitSec + 1 : 0,
        }))
      );
      setMonitorAgents((prev) =>
        prev.map((ma) => ({
          ...ma,
          stateDurationSec: ma.stateDurationSec + 1,
          voiceCallDurationSec:
            ma.voiceState === 'In call' && ma.voiceCallDurationSec !== null
              ? ma.voiceCallDurationSec + 1
              : ma.voiceCallDurationSec,
        }))
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLive]);

  // Gentle 4-second live traffic fluctuation
  useEffect(() => {
    if (!isLive) return;
    const pulse = window.setInterval(() => {
      setLiveDelta((prev) => ({
        voiceAvail: (prev.voiceAvail + 1) % 3 === 0 ? 1 : 0,
        chatAvail: (prev.chatAvail + 1) % 2 === 0 ? 1 : -1,
        emailAvail: prev.emailAvail === 0 ? 1 : 0,
        interactions: prev.interactions + 2,
      }));
    }, 4000);
    return () => window.clearInterval(pulse);
  }, [isLive]);

  const activeMenuInfo = useMemo(
    () => findMenuItemWithPath(activeMenuId),
    [activeMenuId]
  );

  const isOmniDashboardActive = Boolean(activeMenuInfo?.item.dashboardTab);

  // Merge timeframe base data + live delta + supervisor status sync
  const baseData = TIMEFRAME_DATA[timeframe];
  const myStatusDelta = myStatus === 'ready' ? 1 : 0;
  const myNotReadyDelta = myStatus === 'not-ready' ? 0 : -1;

  const computedSystem = useMemo(
    () => ({
      ...baseData.system,
      totalNotReady: Math.max(0, baseData.system.totalNotReady + myNotReadyDelta),
      availVoice: Math.max(
        1,
        baseData.system.availVoice + liveDelta.voiceAvail + myStatusDelta
      ),
      availChat: Math.max(
        1,
        baseData.system.availChat + liveDelta.chatAvail + myStatusDelta
      ),
      availEmail: Math.max(
        1,
        baseData.system.availEmail + liveDelta.emailAvail
      ),
    }),
    [baseData.system, liveDelta, myNotReadyDelta, myStatusDelta]
  );

  const computedSummary = useMemo(
    () => ({
      ...baseData.summary,
      totalInteractions: baseData.summary.totalInteractions + liveDelta.interactions,
    }),
    [baseData.summary, liveDelta.interactions]
  );

  const handleSelectMenu = (item: MenuItem) => {
    setActiveMenuId(item.id);
    if (item.dashboardTab) {
      setActiveTab(item.dashboardTab);
    }
  };

  const handleGoToOmni = (tab: DashboardTabId = 'voice') => {
    if (tab === 'overview') {
      setActiveMenuId('common-general-dashboard');
      return;
    }
    setActiveMenuId('inbound-omni-dashboard');
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLiveDelta((prev) => ({
      ...prev,
      interactions: prev.interactions + 3,
    }));
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã đồng bộ dữ liệu thời gian thực mới nhất.');
    }, 450);
  };

  const handleExportCsv = () => {
    const rows: string[][] = [
      ['Chi so', 'Gia tri', 'Khung thoi gian', 'Thoi diem xuat'],
      ['Tong dang nhap', String(computedSystem.totalLoggedIn), timeframe, clockText],
      ['Tong chua san sang', String(computedSystem.totalNotReady), timeframe, clockText],
      ['Avail Thoai', String(computedSystem.availVoice), timeframe, clockText],
      ['Chat san sang', String(computedSystem.availChat), timeframe, clockText],
      ['Email san sang', String(computedSystem.availEmail), timeframe, clockText],
      ['Tong tuong tac', String(computedSummary.totalInteractions), timeframe, clockText],
      ['Ty le SLA (%)', computedSummary.slaRate.toFixed(1), timeframe, clockText],
    ];
    const csvContent =
      '\uFEFF' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniSpace-CX_OmniDashboard_${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất báo cáo CSV (${timeframe === '15m' ? '15 phút' : timeframe === '1h' ? '1 giờ' : 'Hôm nay'}).`);
  };

  const handleWhisperToChat = (chatId: string, text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  sender: 'bot',
                  time: timeStr,
                  text: `[Hướng dẫn từ Supervisor ba.tuann]: ${text}`,
                },
              ],
            }
          : c
      )
    );
    showToast('Đã gửi ghi chú hướng dẫn nội bộ cho Agent.');
  };

  const handleAssignEmail = (emailId: string, agentName: string) => {
    setEmails((prev) =>
      prev.map((em) =>
        em.id === emailId ? { ...em, assignedAgent: agentName } : em
      )
    );
    showToast(`Đã phân công email cho ${agentName}.`);
  };

  const handleChangeAgentState = (agentId: string, nextStatus: AgentPresence) => {
    const target = agents.find((a) => a.id === agentId);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              status: nextStatus,
              stateDurationSec: 0,
              reason:
                nextStatus === 'not-ready'
                  ? 'Điều chỉnh bởi Supervisor'
                  : nextStatus === 'wrap-up'
                  ? 'Hoàn thiện phiếu'
                  : undefined,
            }
          : a
      )
    );
    if (target) {
      showToast(`Đã cập nhật trạng thái của ${target.name}.`);
    }
  };

  const handleToggleRuleFlag = (
    ruleId: string,
    field: 'vipPriority' | 'overflowEnabled'
  ) => {
    setRoutingRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, [field]: !r[field] } : r))
    );
    showToast(
      field === 'vipPriority'
        ? 'Đã cập nhật quy tắc ưu tiên khách hàng VIP.'
        : 'Đã cập nhật cấu hình tự động tràn tuyến ACD.'
    );
  };

  const handleChangeStrategy = (
    ruleId: string,
    strategy: RoutingRule['strategy']
  ) => {
    setRoutingRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, strategy } : r))
    );
    showToast(`Đã chuyển thuật toán phân phối sang ${strategy}.`);
  };

  const handleToggleQueueAgent = (queueId: string, agentId: string) => {
    const ag = agents.find((a) => a.id === agentId);
    setVoiceQueues((prev) =>
      prev.map((q) => {
        if (q.id !== queueId) return q;
        const exists = q.assignedAgentIds.includes(agentId);
        const nextIds = exists
          ? q.assignedAgentIds.filter((id) => id !== agentId)
          : [...q.assignedAgentIds, agentId];
        return {
          ...q,
          assignedAgentIds: nextIds,
          ready: Math.max(0, q.ready + (exists ? -1 : 1)),
        };
      })
    );
    if (ag) {
      showToast(`Đã cập nhật điều phối Agent ${ag.name} cho hàng đợi.`);
    }
  };

  const handlePickupWaitingCall = (callId: string) => {
    const call = waitingCalls.find((c) => c.id === callId);
    setWaitingCalls((prev) => prev.filter((c) => c.id !== callId));
    if (call) {
      setVoiceQueues((prev) =>
        prev.map((q) =>
          q.name === call.queueName
            ? { ...q, inCall: q.inCall + 1, ready: Math.max(0, q.ready - 1) }
            : q
        )
      );
      showToast(`Đã ưu tiên kết nối cuộc gọi ${call.callerPhone} (${call.queueName}) tới Agent sẵn sàng.`);
    }
  };

  const handleAdjustChatSlot = (queueId: string, delta: number) => {
    const target = chatQueues.find((q) => q.id === queueId);
    setChatQueues((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? { ...q, availableSlots: Math.max(0, q.availableSlots + delta) }
          : q
      )
    );
    if (target) {
      showToast(
        delta > 0
          ? `Đã bổ sung +1 slot cho ${target.name}.`
          : `Đã giảm 1 slot tại ${target.name}.`
      );
    }
  };

  const handleChangeMonitorStatus = (
    agentId: string,
    status: 'Ready' | 'Not ready'
  ) => {
    const target = monitorAgents.find((a) => a.id === agentId);
    setMonitorAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              status,
              stateDurationSec: 0,
              voiceState:
                status === 'Not ready'
                  ? 'Not avail'
                  : a.voiceEnabled
                  ? a.voiceState === 'In call'
                    ? 'In call'
                    : 'Avail'
                  : 'Not avail',
            }
          : a
      )
    );
    if (target) {
      showToast(`Đã chuyển trạng thái ${target.username} sang ${status}.`);
    }
  };

  const handleToggleMonitorChannel = (
    agentId: string,
    channel: 'voice' | 'chat' | 'email'
  ) => {
    const target = monitorAgents.find((a) => a.id === agentId);
    setMonitorAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        if (channel === 'voice') {
          const next = !a.voiceEnabled;
          return {
            ...a,
            voiceEnabled: next,
            voiceState: next ? 'Avail' : 'Not avail',
            voiceCallDurationSec: next ? a.voiceCallDurationSec : null,
          };
        }
        if (channel === 'chat') {
          return { ...a, chatEnabled: !a.chatEnabled };
        }
        return { ...a, emailEnabled: !a.emailEnabled };
      })
    );
    if (target) {
      const label =
        channel === 'voice' ? 'Voice' : channel === 'chat' ? 'Chat' : 'Email';
      showToast(`Đã cập nhật trạng thái kênh ${label} của ${target.username}.`);
    }
  };

  const handleResetDemo = () => {
    setQueues(INITIAL_QUEUES);
    setVoiceQueues(INITIAL_VOICE_QUEUES);
    setWaitingCalls(INITIAL_WAITING_CALLS);
    setChatQueues(INITIAL_CHAT_QUEUES);
    setLiveCalls(INITIAL_LIVE_CALLS);
    setChats(INITIAL_ACTIVE_CHATS);
    setEmails(INITIAL_EMAILS);
    setAgents(INITIAL_AGENTS);
    setMonitorAgents(INITIAL_MONITOR_AGENTS);
    setRoutingRules(INITIAL_ROUTING_RULES);
    setSlaAlerts(INITIAL_SLA_ALERTS);
    setLiveDelta({ voiceAvail: 0, chatAvail: 0, emailAvail: 0, interactions: 0 });
    setTimeframe('15m');
    showToast('Đã khôi phục toàn bộ dữ liệu demo về trạng thái ban đầu.');
  };

  const breadcrumb = useMemo(() => {
    if (activeMenuId === 'inbound-omni-dashboard') {
      return ['Dashboard'];
    }
    if (activeMenuInfo) {
      return ['Dashboard', activeMenuInfo.sectionTitle, ...activeMenuInfo.trail];
    }
    return ['Dashboard'];
  }, [activeMenuId, activeMenuInfo]);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F4F6FA] text-slate-900">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeMenuId={activeMenuId}
        onSelectMenu={handleSelectMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Center Column: TopBar + Main Scrollable Viewport + Quiet Footer */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          breadcrumb={breadcrumb}
          onGoHome={() => handleGoToOmni('voice')}
          agentStatus={myStatus}
          agentReason={myReason}
          onChangeAgentStatus={(status, reason) => {
            setMyStatus(status);
            setMyReason(reason);
            showToast(
              `Trạng thái ba.tuann đã chuyển sang ${
                status === 'ready'
                  ? 'Ready (Sẵn sàng)'
                  : status === 'wrap-up'
                  ? 'Wrap-up'
                  : 'Not ready'
              }.`
            );
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            setSoundEnabled((prev) => !prev);
            showToast(
              soundEnabled ? 'Đã tắt âm thanh cảnh báo SLA.' : 'Đã bật âm thanh cảnh báo SLA.'
            );
          }}
          onResetDemoData={handleResetDemo}
        />

        {activeMenuId === 'inbound-chat-sessions' ? (
          <main className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col">
            <ChatSessionsWorkspace onNotify={showToast} />
          </main>
        ) : (
        <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-between gap-6">
          <div className="max-w-[1440px] w-full mx-auto">
            {activeMenuId === 'common-general-dashboard' ? (
              <GeneralDashboard
                timeframe={timeframe}
                onChangeTimeframe={setTimeframe}
                clockText={clockText}
                isLive={isLive}
                onToggleLive={() => {
                  setIsLive((prev) => !prev);
                  showToast(
                    isLive
                      ? 'Đã tạm dừng mô phỏng cập nhật realtime.'
                      : 'Đã bật lại cập nhật dữ liệu realtime.'
                  );
                }}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onExportCsv={handleExportCsv}
                system={computedSystem}
                onNavigateToOmniTab={(tab) => handleGoToOmni(tab)}
              />
            ) : activeMenuId === 'common-qa-dashboard' ? (
              <QualityAssuranceDashboard
                timeframe={timeframe}
                onChangeTimeframe={setTimeframe}
                clockText={clockText}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onNotify={showToast}
              />
            ) : activeMenuId === 'common-wfm-dashboard' ? (
              <WorkforceManagementDashboard />
            ) : isOmniDashboardActive ? (
              <OmniDashboard
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                timeframe={timeframe}
                onChangeTimeframe={setTimeframe}
                clockText={clockText}
                isLive={isLive}
                onToggleLive={() => {
                  setIsLive((prev) => !prev);
                  showToast(
                    isLive
                      ? 'Đã tạm dừng mô phỏng cập nhật realtime.'
                      : 'Đã bật lại cập nhật dữ liệu realtime.'
                  );
                }}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onExportCsv={handleExportCsv}
                system={computedSystem}
                summary={computedSummary}
                traffic={baseData.traffic}
                queues={queues}
                voiceStats={baseData.voiceStats}
                voiceQueues={voiceQueues}
                waitingCalls={waitingCalls}
                hourly24h={VOICE_HOURLY_24H}
                onToggleQueueAgent={handleToggleQueueAgent}
                onPickupWaitingCall={handlePickupWaitingCall}
                liveCalls={liveCalls}
                chatStats={baseData.chatStats}
                chatQueues={chatQueues}
                chatDemandTrend={CHAT_DEMAND_TREND}
                onAdjustChatSlot={handleAdjustChatSlot}
                chats={chats}
                emailStats={baseData.emailStats}
                emails={emails}
                agents={agents}
                monitorAgents={monitorAgents}
                onChangeMonitorStatus={handleChangeMonitorStatus}
                onToggleMonitorChannel={handleToggleMonitorChannel}
                routingRules={routingRules}
                onWhisperToChat={handleWhisperToChat}
                onAssignEmail={handleAssignEmail}
                onChangeAgentState={handleChangeAgentState}
                onPingAgent={(ag) =>
                  showToast(`Đã gửi tín hiệu nhắc ca tới ${ag.name} (Ext ${ag.ext}).`)
                }
                onToggleRuleFlag={handleToggleRuleFlag}
                onChangeStrategy={handleChangeStrategy}
                onNotify={showToast}
              />
            ) : activeMenuInfo ? (
              <SecondaryModuleView
                menuItem={activeMenuInfo.item}
                sectionTitle={activeMenuInfo.sectionTitle}
                onReturnToOmni={() => handleGoToOmni('voice')}
              />
            ) : null}
          </div>

          {/* Quiet Footer matching Image 1 */}
          <footer className="py-2 text-center text-[11.5px] text-slate-500 shrink-0">
            <span className="font-semibold text-slate-600">2020 - 2026 © OCX</span>
            <span className="mx-1.5 text-slate-300">-</span>
            <span>Version 202611200903</span>
          </footer>
        </main>
        )}
      </div>

      {/* Right Utility Rail */}
      <RightRail
        slaAlerts={slaAlerts}
        onDismissAlert={(id) => {
          setSlaAlerts((prev) => prev.filter((a) => a.id !== id));
          showToast('Đã xác nhận tiếp nhận cảnh báo SLA.');
        }}
        onJumpToTab={(tab) => handleGoToOmni(tab)}
        onSendBroadcast={() =>
          showToast('Đã phát thông báo điều phối đến toàn bộ điện thoại viên ca trực.')
        }
        onOpenSettingsNote={() =>
          showToast('Giao diện UniSpace-CX Enterprise Light đang được áp dụng cho bản demo.')
        }
      />

      {/* Non-blocking Confirmation Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium inline-flex items-center gap-2 max-w-[90vw]"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}
