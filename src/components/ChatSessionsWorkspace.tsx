import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  FilePlus2,
  Image as ImageIcon,
  Layers,
  ListFilter,
  MessageSquare,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Paperclip,
  Search,
  Send,
  Smile,
  Square,
  Ticket,
  UserCheck,
  X,
} from 'lucide-react';
import {
  CHANNEL_META,
  ChatChannelType,
  ChatSessionRecord,
  COMPLETION_OUTCOMES,
  CompletionOutcome,
  EXTRA_LOAD_TEST_SESSIONS,
  INITIAL_CHAT_SESSIONS,
  INITIAL_MANUAL_INTERACTIONS,
  INITIAL_TICKETS_BY_CUSTOMER,
  LIFECYCLE_LABELS,
  LinkedCustomerProfile,
  ManualInteractionItem,
  MAX_CONCURRENT_SESSIONS,
  OutboundCallRecord,
  QUICK_REPLY_TEMPLATES,
  SessionLifecycleStatus,
  TicketContactItem,
  TRANSFER_TARGETS,
  WORKCODE_OPTIONS,
} from '../data/chatSessionsData';
import { stripVietnameseAccents } from '../data/menuConfig';
import { ChatCrmPanel } from './ChatCrmPanel';

interface ChatSessionsWorkspaceProps {
  onNotify?: (msg: string) => void;
}

type StatusFilterKey = 'all-open' | SessionLifecycleStatus;
type ModalMode = 'update' | 'ticket' | 'transfer' | 'assist' | 'complete' | 'manual' | null;
type LayoutMode = 'three-pane' | 'two-pane' | 'focus';

const QUICK_EMOJIS = ['😊', '👍', '🙏', '✅', '📄', '💳', '⏳', '🎉'];

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.abs(Math.floor(totalSec)));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getNowHm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getNowFullDateTime(): string {
  const d = new Date();
  return `10/11/2026 ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

function getAvatarBg(tone: ChatSessionRecord['avatarTone']): string {
  switch (tone) {
    case 'navy':
      return 'bg-[#1E3A5F] text-white';
    case 'indigo':
      return 'bg-[#3B49DF] text-white';
    case 'teal':
      return 'bg-[#0F766E] text-white';
    case 'violet':
      return 'bg-[#4F46E5] text-white';
    case 'slate':
    default:
      return 'bg-[#E2E8F0] text-[#334155]';
  }
}

interface SlaInfo {
  level: 'idle' | 'normal' | 'warning' | 'overdue';
  label: string;
  timerText: string;
  badgeClass: string;
  headerTextClass: string;
}

function computeSlaInfo(session: ChatSessionRecord): SlaInfo {
  if (session.lifecycleStatus === 'completed') {
    return {
      level: 'idle',
      label: 'Hoàn thành',
      timerText: '--:--',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      headerTextClass: 'text-slate-500',
    };
  }
  if (session.customerWaitSec <= 0) {
    return {
      level: 'idle',
      label: 'Đã phản hồi',
      timerText: '00:00',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      headerTextClass: 'text-slate-600',
    };
  }
  const remaining = session.slaLimitSec - session.customerWaitSec;
  if (remaining <= 0) {
    return {
      level: 'overdue',
      label: 'Quá hạn SLA',
      timerText: `-${formatMmSs(Math.abs(remaining))}`,
      badgeClass: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
      headerTextClass: 'text-[#DC2626]',
    };
  }
  if (remaining <= 60) {
    return {
      level: 'warning',
      label: 'Sắp đến hạn',
      timerText: formatMmSs(remaining),
      badgeClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
      headerTextClass: 'text-[#D97706]',
    };
  }
  return {
    level: 'normal',
    label: 'Trong hạn',
    timerText: formatMmSs(remaining),
    badgeClass: 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]',
    headerTextClass: 'text-[#15803D]',
  };
}

const ChannelIcon: React.FC<{
  channel: ChatChannelType;
  size?: 'xs' | 'sm';
}> = ({ channel, size = 'xs' }) => {
  const meta = CHANNEL_META[channel];
  const box = size === 'xs' ? 'w-4 h-4 text-[8.5px]' : 'w-5 h-5 text-[9.5px]';
  return (
    <span
      className={`${box} rounded-full ${meta.bg} text-white font-bold inline-flex items-center justify-center shrink-0`}
      title={meta.label}
    >
      {meta.badgeText}
    </span>
  );
};

export const ChatSessionsWorkspace: React.FC<ChatSessionsWorkspaceProps> = ({
  onNotify,
}) => {
  const [sessions, setSessions] = useState<ChatSessionRecord[]>(
    INITIAL_CHAT_SESSIONS
  );
  const [selectedId, setSelectedId] = useState<string>('chat-act-2');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all-open');
  const [channelFilter, setChannelFilter] = useState<'all' | ChatChannelType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // 10-session load simulation toggle (STT 34)
  const [loadTestEnabled, setLoadTestEnabled] = useState(false);

  // Per-session in-memory draft map (STT 35 — lost on exit/reload per VDC)
  const [draftsBySession, setDraftsBySession] = useState<Record<string, string>>({
    'chat-act-1': 'Dạ em đang kiểm tra 2 giao dịch 120 USD và hỗ trợ khóa thẻ ngay cho chị...',
  });

  // CRM & Contact History state (STT 37 & STT 41)
  const [ticketsByCustomer, setTicketsByCustomer] = useState<
    Record<string, TicketContactItem[]>
  >(INITIAL_TICKETS_BY_CUSTOMER);
  const [manualInteractions, setManualInteractions] = useState<
    ManualInteractionItem[]
  >(INITIAL_MANUAL_INTERACTIONS);

  // Fixed vertical resizable layout (STT 34)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('three-pane');
  const [leftWidth, setLeftWidth] = useState(348);
  const [rightWidth, setRightWidth] = useState(324);
  const draggingHandleRef = useRef<'left' | 'right' | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  // Composer helpers
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalWorkcode, setModalWorkcode] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalTicketSubject, setModalTicketSubject] = useState('');
  const [modalTicketPriority, setModalTicketPriority] = useState<
    'Cao' | 'Trung bình' | 'Thấp'
  >('Cao');
  const [modalTransferTarget, setModalTransferTarget] = useState(
    TRANSFER_TARGETS[0].id
  );
  const [modalTransferNote, setModalTransferNote] = useState('');
  const [modalAssistNote, setModalAssistNote] = useState('');
  const [modalCompletionOutcome, setModalCompletionOutcome] =
    useState<CompletionOutcome>('Đã xử lý qua Chat');
  const [modalCompletionNote, setModalCompletionNote] = useState('');

  // Manual Interaction Modal state (STT 37)
  const [manualChannel, setManualChannel] = useState<'Call' | 'Email' | 'Chat'>('Call');
  const [manualWorkcode, setManualWorkcode] = useState(WORKCODE_OPTIONS[0]);
  const [manualNote, setManualNote] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Drag resize handlers (smooth, fixed workspace without overlap)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingHandleRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      if (draggingHandleRef.current === 'left') {
        const next = Math.max(280, Math.min(440, dragStartWidthRef.current + dx));
        setLeftWidth(next);
      } else {
        const next = Math.max(270, Math.min(430, dragStartWidthRef.current - dx));
        setRightWidth(next);
      }
    };
    const handleMouseUp = () => {
      if (draggingHandleRef.current) {
        draggingHandleRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (handle: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    draggingHandleRef.current = handle;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = handle === 'left' ? leftWidth : rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Single centralized 1-second timer for SLA countdown & duration across all open sessions
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.lifecycleStatus === 'accepted') {
            return {
              ...s,
              durationSec: s.durationSec + 1,
              customerWaitSec: s.customerWaitSec > 0 ? s.customerWaitSec + 1 : 0,
            };
          }
          if (s.lifecycleStatus === 'assigned') {
            const nextRem = (s.inviteRemainingSec ?? 20) - 1;
            return {
              ...s,
              customerWaitSec: s.customerWaitSec + 1,
              inviteRemainingSec:
                nextRem <= 0 ? s.inviteTotalSec ?? 30 : nextRem,
            };
          }
          if (s.lifecycleStatus === 'new') {
            return {
              ...s,
              customerWaitSec: s.customerWaitSec + 1,
            };
          }
          return s;
        })
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? sessions[0] ?? null,
    [sessions, selectedId]
  );

  const activeCustomer = useMemo(() => {
    if (!selectedSession) return null;
    return (
      selectedSession.linkedCustomers.find(
        (c) => c.id === selectedSession.activeCustomerId
      ) ?? selectedSession.linkedCustomers[0]
    );
  }, [selectedSession]);

  const currentDraftText = selectedSession
    ? draftsBySession[selectedSession.id] ?? ''
    : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.id, selectedSession?.messages.length]);

  // Lifecycle counts
  const countsByLifecycle = useMemo(() => {
    const c = {
      allOpen: 0,
      new: 0,
      assigned: 0,
      accepted: 0,
      completed: 0,
    };
    for (const s of sessions) {
      c[s.lifecycleStatus] += 1;
      if (s.lifecycleStatus !== 'completed') c.allOpen += 1;
    }
    return c;
  }, [sessions]);

  // Pool for channel counts based on selected lifecycle tab
  const statusFilteredPool = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter === 'all-open') return s.lifecycleStatus !== 'completed';
      return s.lifecycleStatus === statusFilter;
    });
  }, [sessions, statusFilter]);

  // Per-channel session & unread counts (STT 39)
  const channelStats = useMemo(() => {
    const init: Record<
      'all' | ChatChannelType,
      { sessions: number; unread: number }
    > = {
      all: { sessions: 0, unread: 0 },
      digiweb: { sessions: 0, unread: 0 },
      digibank: { sessions: 0, unread: 0 },
      zalo: { sessions: 0, unread: 0 },
      facebook: { sessions: 0, unread: 0 },
    };
    for (const s of statusFilteredPool) {
      init.all.sessions += 1;
      init.all.unread += s.unreadCount;
      init[s.channel].sessions += 1;
      init[s.channel].unread += s.unreadCount;
    }
    return init;
  }, [statusFilteredPool]);

  const matchesFilters = useCallback(
    (s: ChatSessionRecord) => {
      if (channelFilter !== 'all' && s.channel !== channelFilter) return false;
      if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = stripVietnameseAccents(searchQuery.trim());
      const customerTexts = s.linkedCustomers
        .map((c) => `${c.name} ${c.phone} ${c.cif}`)
        .join(' ');
      const hay = stripVietnameseAccents(
        `${customerTexts} ${s.senderId} ${s.interactionCode} ${s.lastMessagePreview} ${s.queueName}`
      );
      return hay.includes(q);
    },
    [channelFilter, priorityFilter, searchQuery]
  );

  // Filtered & priority-sorted list (urgent first, then overdue SLA first)
  const visibleSessions = useMemo(() => {
    return statusFilteredPool.filter(matchesFilters).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === 'urgent' ? -1 : 1;
      const aRem = a.slaLimitSec - a.customerWaitSec;
      const bRem = b.slaLimitSec - b.customerWaitSec;
      return aRem - bRem;
    });
  }, [statusFilteredPool, matchesFilters]);

  const visibleNew = useMemo(
    () => visibleSessions.filter((s) => s.lifecycleStatus === 'new'),
    [visibleSessions]
  );
  const visibleAssigned = useMemo(
    () => visibleSessions.filter((s) => s.lifecycleStatus === 'assigned'),
    [visibleSessions]
  );
  const visibleAccepted = useMemo(
    () => visibleSessions.filter((s) => s.lifecycleStatus === 'accepted'),
    [visibleSessions]
  );
  const visibleCompleted = useMemo(
    () => visibleSessions.filter((s) => s.lifecycleStatus === 'completed'),
    [visibleSessions]
  );

  const handleToggleLoadTest = () => {
    if (!loadTestEnabled) {
      setSessions((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = EXTRA_LOAD_TEST_SESSIONS.filter((x) => !existingIds.has(x.id));
        return [...prev, ...toAdd];
      });
      setLoadTestEnabled(true);
      onNotify?.(
        'Đã nạp chế độ tải 10 phiên đồng thời (Digiweb, Digibank, Zalo, Facebook) để kiểm thử chuyển phiên & lưu nháp.'
      );
    } else {
      const extraIds = new Set(EXTRA_LOAD_TEST_SESSIONS.map((x) => x.id));
      setSessions((prev) => prev.filter((p) => !extraIds.has(p.id)));
      if (extraIds.has(selectedId)) {
        setSelectedId('chat-act-2');
      }
      setLoadTestEnabled(false);
      onNotify?.('Đã tắt chế độ giả lập 10 phiên, trở về danh sách tiêu chuẩn.');
    }
  };

  const handleSelectSession = (id: string) => {
    setSelectedId(id);
    setTemplatePickerOpen(false);
    setEmojiPickerOpen(false);
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, unreadCount: 0 } : s))
    );
  };

  // Lifecycle transition: Mới -> Đã phân công
  const handleAssignToMe = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    const nowHm = getNowHm();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lifecycleStatus: 'assigned',
              inviteType: 'new',
              inviteTotalSec: 30,
              inviteRemainingSec: 25,
              messages: [
                ...s.messages,
                {
                  id: `m-asg-${Date.now()}`,
                  sender: 'routing',
                  time: nowHm,
                  text: 'Hàng đợi chung phân bổ phiên cho Agent ba.tuann (Chờ tiếp nhận)',
                },
              ],
            }
          : s
      )
    );
    setSelectedId(id);
    onNotify?.(`Đã phân công phiên ${target.interactionCode} sang trạng thái Đã phân công.`);
  };

  // Lifecycle transition: Đã phân công -> Đã tiếp nhận
  const handleAcceptSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    if (countsByLifecycle.accepted >= MAX_CONCURRENT_SESSIONS) {
      onNotify?.(
        `Đã đạt giới hạn tối đa ${MAX_CONCURRENT_SESSIONS}/${MAX_CONCURRENT_SESSIONS} phiên đang xử lý đồng thời.`
      );
      return;
    }
    const nowHm = getNowHm();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lifecycleStatus: 'accepted',
              unreadCount: 0,
              inviteRemainingSec: undefined,
              messages: [
                ...s.messages,
                {
                  id: `m-acc-${Date.now()}`,
                  sender: 'routing',
                  time: nowHm,
                  text: `Agent ba.tuann đã tiếp nhận phiên từ ${
                    s.transferFrom ? s.transferFrom : `hàng đợi ${s.queueName}`
                  } · Đã đồng bộ toàn bộ lịch sử Bot`,
                },
              ],
            }
          : s
      )
    );
    setSelectedId(id);
    const activeName =
      target.linkedCustomers.find((c) => c.id === target.activeCustomerId)?.name ??
      target.linkedCustomers[0]?.name;
    onNotify?.(`Đã tiếp nhận phiên của ${activeName}.`);
  };

  // Decline assigned -> return to Mới (general queue)
  const handleDeclineAssigned = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    const nowHm = getNowHm();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lifecycleStatus: 'new',
              inviteRemainingSec: undefined,
              messages: [
                ...s.messages,
                {
                  id: `m-dec-${Date.now()}`,
                  sender: 'routing',
                  time: nowHm,
                  text: 'Agent ba.tuann từ chối nhận · Phiên quay về hàng đợi chung (Trạng thái Mới)',
                },
              ],
            }
          : s
      )
    );
    onNotify?.(`Đã trả phiên ${target.interactionCode} về hàng đợi chung.`);
  };

  // Draft change (in-memory per session, STT 35)
  const handleDraftChange = (val: string) => {
    if (!selectedSession || val.length > 1000) return;
    setDraftsBySession((prev) => ({
      ...prev,
      [selectedSession.id]: val,
    }));
    if (val === '/' || val.endsWith(' /')) {
      setTemplatePickerOpen(true);
    }
  };

  const handleInsertTemplate = (content: string) => {
    if (!selectedSession) return;
    setDraftsBySession((prev) => {
      const existing = prev[selectedSession.id] ?? '';
      const cleaned = existing.endsWith('/') ? existing.slice(0, -1) : existing;
      return {
        ...prev,
        [selectedSession.id]: (cleaned ? `${cleaned} ${content}` : content).slice(
          0,
          1000
        ),
      };
    });
    setTemplatePickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleSendMessage = () => {
    if (!selectedSession || selectedSession.lifecycleStatus !== 'accepted') return;
    const trimmed = currentDraftText.trim();
    if (!trimmed && !pendingAttachment) return;
    const nowHm = getNowHm();
    const msgText = trimmed || `Đã gửi tệp đính kèm: ${pendingAttachment}`;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? {
              ...s,
              lastMessageTime: nowHm,
              lastMessagePreview: msgText,
              subStatusText: 'Đã phản hồi · chờ KH xác nhận',
              customerWaitSec: 0, // Resets SLA waiting counter
              messages: [
                ...s.messages,
                {
                  id: `m-ag-${Date.now()}`,
                  sender: 'agent',
                  senderLabel: 'ba.tuann',
                  roleTag: 'AGENT',
                  time: nowHm,
                  text: msgText,
                  attachment: pendingAttachment ?? undefined,
                },
              ],
            }
          : s
      )
    );
    setDraftsBySession((prev) => {
      const next = { ...prev };
      delete next[selectedSession.id];
      return next;
    });
    setPendingAttachment(null);
    setTemplatePickerOpen(false);
    setEmojiPickerOpen(false);
  };

  const handleCopyCode = () => {
    if (!selectedSession) return;
    navigator.clipboard?.writeText(selectedSession.interactionCode).catch(() => {});
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1500);
    onNotify?.(`Đã sao chép mã tương tác ${selectedSession.interactionCode}.`);
  };

  // CRM handlers (STT 37 & STT 41)
  const handleSwitchCustomer = (customerId: string) => {
    if (!selectedSession) return;
    const picked = selectedSession.linkedCustomers.find((c) => c.id === customerId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? { ...s, activeCustomerId: customerId }
          : s
      )
    );
    if (picked) {
      onNotify?.(
        `Đã chuyển hồ sơ làm việc trên SenderID ${selectedSession.senderId} sang ${picked.name} (CIF ${picked.cif}).`
      );
    }
  };

  const handleAddCustomerToSenderId = (
    profile: Omit<LinkedCustomerProfile, 'id'>
  ) => {
    if (!selectedSession) return;
    const newId = `cust-add-${Date.now()}`;
    const fullProfile: LinkedCustomerProfile = { id: newId, ...profile };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? {
              ...s,
              linkedCustomers: [...s.linkedCustomers, fullProfile],
              activeCustomerId: newId,
            }
          : s
      )
    );
    onNotify?.(
      `Đã gắn thêm khách hàng ${profile.name} vào SenderID ${selectedSession.senderId}.`
    );
  };

  const handleAddOutboundCallToTicket = (
    ticketCode: string,
    call: Omit<OutboundCallRecord, 'id' | 'callCode'>
  ) => {
    if (!activeCustomer) return;
    const newCall: OutboundCallRecord = {
      ...call,
      id: `ob-${Date.now()}`,
      callCode: `OB-${Math.floor(99610 + Math.random() * 380)}`,
    };
    setTicketsByCustomer((prev) => {
      const list = prev[activeCustomer.id] ?? [];
      return {
        ...prev,
        [activeCustomer.id]: list.map((tk) =>
          tk.code === ticketCode
            ? { ...tk, outboundCalls: [...tk.outboundCalls, newCall] }
            : tk
        ),
      };
    });
    onNotify?.(`Đã ghi nhận cuộc gọi đi ${newCall.callCode} ngay dưới ticket ${ticketCode}.`);
  };

  const openModal = (mode: ModalMode) => {
    if (!selectedSession && mode !== 'manual') return;
    setModalMode(mode);
    if (mode === 'update' && selectedSession) {
      setModalWorkcode(selectedSession.workcode || WORKCODE_OPTIONS[0]);
      setModalNote(selectedSession.interactionNote || '');
    } else if (mode === 'ticket' && selectedSession) {
      setModalTicketSubject(
        `${selectedSession.workcode || 'Hỗ trợ khách hàng'} - ${
          activeCustomer?.name ?? ''
        }`
      );
      setModalTicketPriority(
        selectedSession.priority === 'urgent' ? 'Cao' : 'Trung bình'
      );
    } else if (mode === 'transfer') {
      setModalTransferTarget(TRANSFER_TARGETS[0].id);
      setModalTransferNote('');
    } else if (mode === 'assist') {
      setModalAssistNote('');
    } else if (mode === 'complete') {
      setModalCompletionOutcome('Đã xử lý qua Chat');
      setModalCompletionNote('');
    } else if (mode === 'manual') {
      setManualChannel('Call');
      setManualWorkcode(selectedSession?.workcode || WORKCODE_OPTIONS[0]);
      setManualNote('');
    }
  };

  const handleConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode) return;
    const nowHm = getNowHm();

    if (modalMode === 'manual') {
      const custId = activeCustomer?.id ?? 'cust-kl-1';
      const custName = activeCustomer?.name ?? 'Trần Khánh Linh';
      const senderId = selectedSession?.senderId ?? 'manual_channel';
      const code = `MN-${Math.floor(2611200 + Math.random() * 700)}`;
      const item: ManualInteractionItem = {
        id: `man-${Date.now()}`,
        code,
        channel: manualChannel,
        customerId: custId,
        customerName: custName,
        senderId,
        workcode: manualWorkcode,
        createdAt: getNowFullDateTime(),
        agentName: 'ba.tuann',
        note:
          manualNote.trim() ||
          `Tạo tương tác ${manualChannel} thủ công (không bật screen-pop tự động).`,
      };
      setManualInteractions((prev) => [item, ...prev]);
      if (selectedSession) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    {
                      id: `m-man-${Date.now()}`,
                      sender: 'system',
                      time: nowHm,
                      text: `Đã tạo tương tác thủ công ${code} (Kênh ${manualChannel}) cho ${custName}`,
                    },
                  ],
                }
              : s
          )
        );
      }
      onNotify?.(`Đã tạo tương tác thủ công ${code} (Kênh ${manualChannel}) vào Lịch sử liên hệ.`);
      setModalMode(null);
      return;
    }

    if (!selectedSession) return;

    if (modalMode === 'update') {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                workcode: modalWorkcode,
                interactionNote: modalNote,
                messages: [
                  ...s.messages,
                  {
                    id: `m-upd-${Date.now()}`,
                    sender: 'system',
                    time: nowHm,
                    text: `Đã cập nhật phân loại tương tác: ${modalWorkcode}`,
                  },
                ],
              }
            : s
        )
      );
      onNotify?.(`Đã cập nhật tương tác ${selectedSession.interactionCode}.`);
    } else if (modalMode === 'ticket' && activeCustomer) {
      const code = `TK-${Math.floor(2611300 + Math.random() * 600)}`;
      const newTk: TicketContactItem = {
        code,
        subject: modalTicketSubject.trim() || 'Phiếu hỗ trợ khách hàng',
        channel: selectedSession.channelLabel,
        createdAt: getNowFullDateTime(),
        status: 'Đang xử lý',
        priority: modalTicketPriority,
        outboundCalls: [],
      };
      setTicketsByCustomer((prev) => ({
        ...prev,
        [activeCustomer.id]: [newTk, ...(prev[activeCustomer.id] ?? [])],
      }));
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: `m-tk-${Date.now()}`,
                    sender: 'system',
                    time: nowHm,
                    text: `Đã tạo ticket ${code} (Ưu tiên: ${modalTicketPriority}) cho ${activeCustomer.name}`,
                  },
                ],
              }
            : s
        )
      );
      onNotify?.(`Đã tạo ticket ${code} và cập nhật vào Lịch sử liên hệ.`);
    } else if (modalMode === 'transfer') {
      const target = TRANSFER_TARGETS.find((t) => t.id === modalTransferTarget);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                lifecycleStatus: 'assigned',
                transferFrom: 'ba.tuann',
                handoverNote:
                  modalTransferNote.trim() || 'Chuyển xử lý chuyên sâu theo nghiệp vụ.',
                inviteType: 'transfer',
                inviteTotalSec: 30,
                inviteRemainingSec: 25,
                messages: [
                  ...s.messages,
                  {
                    id: `m-tr-${Date.now()}`,
                    sender: 'routing',
                    time: nowHm,
                    text: `ba.tuann chuyển phiên → ${target?.label ?? 'Hàng đợi'}${
                      modalTransferNote ? ` · Ghi chú: ${modalTransferNote}` : ''
                    }`,
                  },
                ],
              }
            : s
        )
      );
      onNotify?.(`Đã chuyển phiên tới ${target?.label}.`);
    } else if (modalMode === 'assist') {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: `m-as-${Date.now()}`,
                    sender: 'routing',
                    time: nowHm,
                    text: `Đã gửi yêu cầu hỗ trợ tới Supervisor Ca 1${
                      modalAssistNote ? `: "${modalAssistNote}"` : ''
                    }`,
                  },
                ],
              }
            : s
        )
      );
      onNotify?.('Đã gửi tín hiệu xin hỗ trợ tới Supervisor ca trực.');
    } else if (modalMode === 'complete') {
      const remainingAccepted = sessions.filter(
        (s) =>
          s.lifecycleStatus === 'accepted' && s.id !== selectedSession.id
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                lifecycleStatus: 'completed',
                completionOutcome: modalCompletionOutcome,
                completedByAgent: 'ba.tuann',
                customerWaitSec: 0,
                subStatusText: `Hoàn thành · ${modalCompletionOutcome}`,
                messages: [
                  ...s.messages,
                  {
                    id: `m-div-${Date.now()}`,
                    sender: 'session-divider',
                    time: nowHm,
                    text: modalCompletionNote.trim() || 'Phiên đã hoàn thành',
                    previousSessionCode: s.interactionCode,
                    completedByAgent: 'ba.tuann',
                    completedOutcome: modalCompletionOutcome,
                    dividerSenderId: s.senderId,
                  },
                ],
              }
            : s
        )
      );
      setDraftsBySession((prev) => {
        const next = { ...prev };
        delete next[selectedSession.id];
        return next;
      });
      if (remainingAccepted.length > 0) {
        setSelectedId(remainingAccepted[0].id);
      }
      onNotify?.(
        `Đã hoàn thành phiên ${selectedSession.interactionCode} (${modalCompletionOutcome}).`
      );
    }

    setModalMode(null);
  };

  const showLeftPane = layoutMode !== 'focus';
  const showRightPane = layoutMode === 'three-pane';

  const activeSla = selectedSession ? computeSlaInfo(selectedSession) : null;
  const activeCustomerTickets = activeCustomer
    ? ticketsByCustomer[activeCustomer.id] ?? []
    : [];
  const activeCustomerManuals = activeCustomer
    ? manualInteractions.filter((m) => m.customerId === activeCustomer.id)
    : [];

  const renderSessionRow = (chat: ChatSessionRecord) => {
    const isSelected = selectedSession?.id === chat.id;
    const rowCustomer =
      chat.linkedCustomers.find((c) => c.id === chat.activeCustomerId) ??
      chat.linkedCustomers[0];
    const draft = draftsBySession[chat.id]?.trim();
    const sla = computeSlaInfo(chat);

    return (
      <button
        key={chat.id}
        type="button"
        onClick={() => handleSelectSession(chat.id)}
        className={`w-full px-3 py-2.5 text-left flex items-start gap-2.5 transition-colors relative ${
          isSelected
            ? 'bg-[#F4F5FC] ring-1 ring-inset ring-[#3B49DF]'
            : 'bg-white hover:bg-[#F8FAFC]'
        }`}
      >
        <div className="relative shrink-0 mt-0.5">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[11.5px] font-bold ${getAvatarBg(
              chat.avatarTone
            )}`}
          >
            {chat.initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
            <ChannelIcon channel={chat.channel} size="xs" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`text-[13px] truncate ${
                  isSelected
                    ? 'font-bold text-[#3B49DF]'
                    : chat.unreadCount > 0
                    ? 'font-bold text-slate-900'
                    : 'font-semibold text-slate-800'
                }`}
              >
                {rowCustomer?.name}
              </span>
              {chat.linkedCustomers.length > 1 && (
                <span
                  className="text-[10px] font-mono font-bold text-[#3B49DF] bg-[#EEF2FF] px-1 rounded shrink-0"
                  title={`1 SenderID gắn ${chat.linkedCustomers.length} hồ sơ khách hàng`}
                >
                  {chat.linkedCustomers.length} KH
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                {chat.lastMessageTime}
              </span>
              {/* Numeric unread message count replacing red dot (STT 35) */}
              {chat.unreadCount > 0 && (
                <span
                  className="min-w-[19px] h-[19px] px-1.5 rounded-full bg-[#DC2626] text-white text-[10.5px] font-bold font-mono tabular-nums inline-flex items-center justify-center"
                  title={`${chat.unreadCount} tin nhắn mới chưa đọc`}
                >
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Per-session draft displayed right below customer name (STT 35) */}
          {draft ? (
            <p className="mt-0.5 text-[12px] truncate text-[#B45309] font-medium">
              <span className="font-bold text-[#D97706]">Nháp: </span>
              {draft}
            </p>
          ) : (
            <p
              className={`mt-0.5 text-[12px] truncate ${
                chat.unreadCount > 0
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {chat.lastMessagePreview}
            </p>
          )}

          {/* Bottom metadata + Color-coded SLA countdown (STT 38) */}
          <div className="mt-1.5 flex items-center justify-between gap-1.5 flex-wrap text-[10.5px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate text-slate-500">
              {chat.priority === 'urgent' && (
                <span className="font-bold text-[#DC2626] uppercase shrink-0">
                  Khẩn cấp
                </span>
              )}
              {chat.priority === 'urgent' && <span className="text-slate-300">·</span>}
              <span className="truncate">{chat.queueName}</span>
            </div>

            {chat.lifecycleStatus !== 'completed' && chat.customerWaitSec > 0 && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono tabular-nums font-bold text-[10.5px] shrink-0 ${sla.badgeClass}`}
                title={`${sla.label} (tính từ tin nhắn cuối của khách hàng)`}
              >
                <Clock size={10} />
                <span>{sla.timerText}</span>
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-xl border border-[#E5E9F2] overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* FIXED WORKSPACE UTILITY STRIP */}
      <div className="h-[44px] px-4 border-b border-[#E5E9F2] bg-[#FAFBFD] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12.5px] font-bold text-slate-800 whitespace-nowrap">
            Quản lý phiên chat
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-[12px] text-slate-600 font-mono tabular-nums whitespace-nowrap">
            Đang xử lý:{' '}
            <strong
              className={
                countsByLifecycle.accepted >= 8
                  ? 'text-[#D97706]'
                  : 'text-[#3B49DF]'
              }
            >
              {countsByLifecycle.accepted}/{MAX_CONCURRENT_SESSIONS}
            </strong>
          </span>
          <span className="hidden lg:inline text-[11.5px] text-slate-400 truncate">
            Kéo thanh dọc giữa các cột để điều chỉnh độ rộng khung làm việc
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 10-Session Load Test Toggle (STT 34) */}
          <button
            type="button"
            onClick={handleToggleLoadTest}
            className={`h-7 px-2.5 rounded-md border text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              loadTestEnabled
                ? 'bg-[#EEF2FF] border-[#3B49DF] text-[#3B49DF]'
                : 'bg-white border-[#DCE3EE] text-slate-700 hover:bg-slate-50'
            }`}
            title="Giả lập 10 phiên đang xử lý đồng thời để kiểm tra chuyển phiên, SLA và bản nháp"
          >
            <Layers size={13} />
            <span>{loadTestEnabled ? 'Đang tải 10 phiên' : 'Giả lập 10 phiên'}</span>
          </button>

          {/* Manual Interaction Creation (STT 37) */}
          <button
            type="button"
            onClick={() => openModal('manual')}
            className="h-7 px-2.5 rounded-md bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            title="Tạo tương tác thủ công khi màn hình Call / Email / Chat không tự bật"
          >
            <FilePlus2 size={13} />
            <span>Tạo tương tác thủ công</span>
          </button>

          {/* Layout Mode Controls */}
          <div className="flex items-center gap-0.5 p-0.5 bg-white border border-[#DCE3EE] rounded-md">
            <button
              type="button"
              onClick={() => setLayoutMode('three-pane')}
              title="Bố cục dọc 3 cột cố định (Danh sách · Chat · CRM)"
              className={`p-1 rounded transition-colors ${
                layoutMode === 'three-pane'
                  ? 'bg-[#EEF2FF] text-[#3B49DF]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <PanelRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('two-pane')}
              title="Bố cục 2 cột (Danh sách · Chat)"
              className={`p-1 rounded transition-colors ${
                layoutMode === 'two-pane'
                  ? 'bg-[#EEF2FF] text-[#3B49DF]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <PanelLeftClose size={14} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('focus')}
              title="Mở rộng tối đa khung Chat"
              className={`p-1 rounded transition-colors ${
                layoutMode === 'focus'
                  ? 'bg-[#EEF2FF] text-[#3B49DF]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Square size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3-PANE RESIZABLE HORIZONTAL ROW */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT PANE: CONVERSATION LIST */}
        {showLeftPane && (
          <>
            <aside
              style={{ width: `${leftWidth}px` }}
              className="shrink-0 flex flex-col bg-white h-full overflow-hidden"
            >
              {/* Search + Priority Filter */}
              <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 relative shrink-0">
                <div className="relative flex-1">
                  <Search
                    size={13.5}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên, SĐT, CIF, SenderID, mã..."
                    className="w-full h-8 pl-8 pr-7 text-[12px] bg-[#F8FAFC] border border-[#DCE3EE] rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3B49DF] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Xóa từ khóa"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setFilterPopoverOpen((p) => !p)}
                  className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    priorityFilter !== 'all' || filterPopoverOpen
                      ? 'border-[#3B49DF] bg-[#F4F5FC] text-[#3B49DF]'
                      : 'border-[#DCE3EE] bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Lọc mức độ ưu tiên từ Bot"
                >
                  <ListFilter size={14} />
                </button>

                {filterPopoverOpen && (
                  <div className="absolute right-3 top-11 z-30 w-52 bg-white border border-[#DCE3EE] rounded-lg shadow-lg p-2">
                    <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-500">
                      Ưu tiên định tuyến từ Bot
                    </div>
                    {(
                      [
                        { id: 'all', label: 'Tất cả mức ưu tiên' },
                        { id: 'urgent', label: 'Hỗ trợ khẩn cấp' },
                        { id: 'normal', label: 'Hỗ trợ khác' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPriorityFilter(opt.id);
                          setFilterPopoverOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-md text-left text-[12px] flex items-center justify-between ${
                          priorityFilter === opt.id
                            ? 'bg-[#F4F5FC] text-[#3B49DF] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {priorityFilter === opt.id && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4-State Lifecycle Tabs (STT 30): Đang mở | Mới | Đã phân công | Đã tiếp nhận | Hoàn thành */}
              <div className="px-3 pb-2 border-b border-[#E5E9F2] flex items-center gap-1 overflow-x-auto shrink-0">
                {(
                  [
                    {
                      key: 'all-open',
                      label: 'Đang mở',
                      count: countsByLifecycle.allOpen,
                    },
                    { key: 'new', label: 'Mới', count: countsByLifecycle.new },
                    {
                      key: 'assigned',
                      label: 'Phân công',
                      count: countsByLifecycle.assigned,
                    },
                    {
                      key: 'accepted',
                      label: 'Tiếp nhận',
                      count: countsByLifecycle.accepted,
                    },
                    {
                      key: 'completed',
                      label: 'Hoàn thành',
                      count: countsByLifecycle.completed,
                    },
                  ] as { key: StatusFilterKey; label: string; count: number }[]
                ).map((tab) => {
                  const active = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`h-7 px-2 rounded-md text-[11.5px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#3B49DF] text-white'
                          : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`font-mono tabular-nums text-[10.5px] ${
                          active ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Channel Filter Tabs — Icon-only with Unread Message Counts (STT 30, 39) */}
              <div className="px-3 py-2 border-b border-[#EEF2F6] flex items-center gap-1.5 shrink-0 bg-[#FAFBFD]">
                <button
                  type="button"
                  onClick={() => setChannelFilter('all')}
                  aria-label={`Tất cả kênh (${channelStats.all.sessions} phiên, ${channelStats.all.unread} tin chưa đọc)`}
                  title={`Tất cả kênh: ${channelStats.all.sessions} phiên · ${channelStats.all.unread} tin chưa đọc`}
                  className={`relative h-8 px-2.5 rounded-lg inline-flex items-center justify-center gap-1 border transition-colors ${
                    channelFilter === 'all'
                      ? 'bg-[#EEF2FF] border-[#3B49DF] text-[#3B49DF]'
                      : 'bg-white border-[#E5E9F2] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers size={15} />
                  {channelStats.all.unread > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded bg-[#DC2626] text-white font-mono text-[10px] font-bold leading-4 text-center tabular-nums">
                      {channelStats.all.unread}
                    </span>
                  )}
                </button>

                {(['digiweb', 'digibank', 'zalo', 'facebook'] as ChatChannelType[]).map(
                  (ch) => {
                    const active = channelFilter === ch;
                    const stat = channelStats[ch];
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannelFilter(active ? 'all' : ch)}
                        aria-label={`${CHANNEL_META[ch].label} (${stat.sessions} phiên, ${stat.unread} tin chưa đọc)`}
                        title={`${CHANNEL_META[ch].label}: ${stat.sessions} phiên · ${stat.unread} tin chưa đọc`}
                        className={`relative h-8 px-2 rounded-lg inline-flex items-center justify-center gap-1 border transition-colors ${
                          active
                            ? 'bg-[#EEF2FF] border-[#3B49DF] text-[#3B49DF]'
                            : 'bg-white border-[#E5E9F2] text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ChannelIcon channel={ch} size="xs" />
                        {stat.unread > 0 && (
                          <span className="min-w-[16px] h-4 px-1 rounded bg-[#DC2626] text-white font-mono text-[10px] font-bold leading-4 text-center tabular-nums">
                            {stat.unread}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Scrollable Conversation Groups */}
              <div className="flex-1 overflow-y-auto sidebar-scroll">
                {/* 1. MỚI (General Queue) */}
                {(statusFilter === 'all-open' || statusFilter === 'new') &&
                  visibleNew.length > 0 && (
                    <div className="px-3 pt-2.5 pb-2 space-y-2 border-b border-[#EEF2F6]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold tracking-wide text-slate-500 uppercase">
                          MỚI · HÀNG ĐỢI CHUNG ({visibleNew.length})
                        </span>
                      </div>
                      {visibleNew.map((s) => {
                        const cust = s.linkedCustomers[0];
                        const sla = computeSlaInfo(s);
                        return (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSession(s.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectSession(s.id);
                              }
                            }}
                            className={`rounded-xl border p-2.5 cursor-pointer transition-colors ${
                              selectedSession?.id === s.id
                                ? 'border-[#3B49DF] bg-[#F4F5FC]'
                                : 'border-[#E5E9F2] bg-[#FAFBFD] hover:border-[#A5B4FC]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <ChannelIcon channel={s.channel} size="sm" />
                                <span className="text-[12.5px] font-bold text-slate-900 truncate">
                                  {cust?.name}
                                </span>
                              </div>
                              {s.priority === 'urgent' && (
                                <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded shrink-0">
                                  KHẨN CẤP
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[12px] text-slate-600 line-clamp-1">
                              {s.lastMessagePreview}
                            </p>
                            <div className="mt-2 pt-2 border-t border-[#E5E9F2] flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono tabular-nums text-[10.5px] font-bold ${sla.badgeClass}`}
                              >
                                <Clock size={10} />
                                {sla.timerText}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignToMe(s.id);
                                  }}
                                  className="h-6 px-2 rounded border border-[#DCE3EE] bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                                >
                                  Phân công
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptSession(s.id);
                                  }}
                                  className="h-6 px-2.5 rounded bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[11px] font-semibold"
                                >
                                  Tiếp nhận
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* 2. ĐÃ PHÂN CÔNG (Mời nhận) */}
                {(statusFilter === 'all-open' || statusFilter === 'assigned') &&
                  visibleAssigned.length > 0 && (
                    <div className="px-3 pt-2.5 pb-2 space-y-2 border-b border-[#EEF2F6]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold tracking-wide text-[#3B49DF] uppercase">
                          ĐÃ PHÂN CÔNG · MỜI NHẬN ({visibleAssigned.length})
                        </span>
                      </div>

                      {visibleAssigned.map((inv) => {
                        const cust = inv.linkedCustomers[0];
                        const rem = inv.inviteRemainingSec ?? 20;
                        const tot = inv.inviteTotalSec ?? 30;
                        const pct = Math.max(4, Math.round((rem / tot) * 100));
                        return (
                          <div
                            key={inv.id}
                            onClick={() => handleSelectSession(inv.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectSession(inv.id);
                              }
                            }}
                            className={`rounded-xl border p-2.5 transition-colors cursor-pointer ${
                              selectedSession?.id === inv.id
                                ? 'border-[#3B49DF] bg-[#F4F5FC]'
                                : 'border-[#DCE3F8] bg-[#F8FAFF] hover:border-[#A5B4FC]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="relative shrink-0">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${getAvatarBg(
                                    inv.avatarTone
                                  )}`}
                                >
                                  {inv.initials}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                                  <ChannelIcon channel={inv.channel} size="xs" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[12.5px] font-bold text-slate-900 truncate">
                                    {cust?.name}
                                  </span>
                                  {inv.priority === 'urgent' ? (
                                    <span className="text-[10px] font-bold text-[#DC2626] shrink-0">
                                      KHẨN CẤP
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-[#3B49DF] shrink-0">
                                      {inv.inviteType === 'transfer'
                                        ? 'CHUYỂN GIAO'
                                        : 'PHIÊN MỚI'}
                                    </span>
                                  )}
                                </div>
                                {inv.transferFrom && (
                                  <div className="text-[10.5px] font-semibold text-[#6D28D9]">
                                    Chuyển từ {inv.transferFrom}
                                  </div>
                                )}
                                <p className="mt-0.5 text-[11.5px] text-slate-600 line-clamp-1">
                                  {inv.lastMessagePreview}
                                </p>
                              </div>
                            </div>

                            {inv.handoverNote && (
                              <div className="mt-2 px-2 py-1.5 rounded-lg bg-white border border-dashed border-[#CBD5E1] text-[11px] text-slate-600">
                                <strong className="text-slate-800">
                                  Ghi chú:{' '}
                                </strong>
                                {inv.handoverNote}
                              </div>
                            )}

                            <div className="mt-2 pt-2 border-t border-[#E5E9F2] flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                                  <div
                                    className="h-full bg-[#3B49DF] transition-[width] duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10.5px] font-mono tabular-nums font-semibold text-[#DC2626]">
                                  Còn {formatMmSs(rem)} để nhận
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeclineAssigned(inv.id);
                                  }}
                                  className="h-6 px-2 rounded border border-[#DCE3EE] bg-white text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  Từ chối
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptSession(inv.id);
                                  }}
                                  className="h-6 px-2.5 rounded bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[11.5px] font-semibold"
                                >
                                  Nhận
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* 3. ĐÃ TIẾP NHẬN (Active handling) */}
                {(statusFilter === 'all-open' || statusFilter === 'accepted') && (
                  <div className="pt-2 pb-2">
                    <div className="px-3 pb-1.5 flex items-center justify-between">
                      <span className="text-[10.5px] font-bold tracking-wide text-slate-500 uppercase">
                        ĐÃ TIẾP NHẬN · ĐANG XỬ LÝ ({visibleAccepted.length})
                      </span>
                    </div>
                    {visibleAccepted.length === 0 ? (
                      <div className="px-4 py-6 text-center text-[12px] text-slate-400">
                        Không có phiên đang xử lý khớp bộ lọc.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F1F5F9]">
                        {visibleAccepted.map(renderSessionRow)}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. HOÀN THÀNH */}
                {statusFilter === 'completed' && (
                  <div className="divide-y divide-[#F1F5F9]">
                    {visibleCompleted.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[12px] text-slate-400">
                        Chưa có phiên hoàn thành khớp bộ lọc.
                      </div>
                    ) : (
                      visibleCompleted.map((chat) => {
                        const isSelected = selectedSession?.id === chat.id;
                        const cust = chat.linkedCustomers[0];
                        return (
                          <button
                            key={chat.id}
                            type="button"
                            onClick={() => handleSelectSession(chat.id)}
                            className={`w-full px-3 py-2.5 text-left flex items-start gap-2.5 transition-colors ${
                              isSelected
                                ? 'bg-[#F4F5FC] ring-1 ring-inset ring-[#3B49DF]'
                                : 'bg-white hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <div className="relative shrink-0 mt-0.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${getAvatarBg(
                                  chat.avatarTone
                                )}`}
                              >
                                {chat.initials}
                              </div>
                              <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                                <ChannelIcon channel={chat.channel} size="xs" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[12.5px] font-semibold text-slate-900 truncate">
                                  {cust?.name}
                                </span>
                                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                                  {chat.lastMessageTime}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11.5px] text-slate-500 truncate">
                                {chat.completionOutcome || 'Hoàn thành'} ·{' '}
                                {chat.completedByAgent || 'Agent'}
                              </p>
                              <div className="mt-0.5 text-[10.5px] font-mono text-slate-400 truncate">
                                SenderID: {chat.senderId}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Left Footer Summary */}
              <div className="px-3.5 py-2 border-t border-[#E5E9F2] bg-[#FAFBFD] flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                <span>
                  Tổng chưa đọc:{' '}
                  <strong className="font-mono tabular-nums text-[#DC2626]">
                    {channelStats.all.unread}
                  </strong>
                </span>
                <span>
                  Bản nháp đã lưu:{' '}
                  <strong className="font-mono tabular-nums text-[#D97706]">
                    {
                      Object.values(draftsBySession).filter((v) => v.trim().length > 0)
                        .length
                    }
                  </strong>
                </span>
              </div>
            </aside>

            {/* DRAG HANDLE: LEFT <-> CENTER */}
            <div
              onMouseDown={(e) => startResize('left', e)}
              onDoubleClick={() => setLeftWidth(348)}
              role="separator"
              aria-orientation="vertical"
              aria-label="Kéo để thay đổi độ rộng danh sách hội thoại"
              title="Kéo để thay đổi độ rộng (nhấp đúp để đặt lại)"
              className="w-1.5 shrink-0 bg-[#EEF2F6] hover:bg-[#3B49DF]/40 active:bg-[#3B49DF] cursor-col-resize transition-colors flex items-center justify-center group"
            >
              <span className="w-0.5 h-8 rounded-full bg-slate-300 group-hover:bg-[#3B49DF]" />
            </div>
          </>
        )}

        {/* CENTER PANE: FIXED VERTICAL CHAT WORKSPACE */}
        <section className="flex-1 min-w-[380px] flex flex-col h-full bg-white overflow-hidden">
          {selectedSession && activeCustomer && activeSla ? (
            <>
              {/* Top Session Header */}
              <div className="px-4 py-2.5 border-b border-[#E5E9F2] flex items-center justify-between gap-3 shrink-0 bg-white">
                <div className="flex items-center gap-2.5 min-w-0">
                  {!showLeftPane && (
                    <button
                      type="button"
                      onClick={() => setLayoutMode('three-pane')}
                      className="p-1.5 rounded-md border border-[#DCE3EE] text-slate-500 hover:text-[#3B49DF] hover:bg-[#F4F5FC] shrink-0"
                      title="Mở lại danh sách hội thoại"
                    >
                      <PanelLeftOpen size={14} />
                    </button>
                  )}

                  <div className="relative shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${getAvatarBg(
                        selectedSession.avatarTone
                      )}`}
                    >
                      {selectedSession.initials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                      <ChannelIcon channel={selectedSession.channel} size="xs" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[14.5px] font-bold text-slate-900 truncate">
                        {activeCustomer.name}
                      </h2>
                      <span className="text-[11.5px] font-medium text-slate-500">
                        {selectedSession.channelLabel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[11px] font-bold uppercase ${
                          selectedSession.lifecycleStatus === 'accepted'
                            ? 'text-[#16A34A]'
                            : selectedSession.lifecycleStatus === 'completed'
                            ? 'text-slate-500'
                            : 'text-[#3B49DF]'
                        }`}
                      >
                        {LIFECYCLE_LABELS[selectedSession.lifecycleStatus]}
                      </span>
                      {selectedSession.priority === 'urgent' && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] uppercase">
                            <AlertTriangle size={11.5} />
                            Hỗ trợ khẩn cấp
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-500 flex-wrap">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 font-mono tabular-nums font-medium text-slate-700 hover:text-[#3B49DF]"
                        title="Sao chép mã tương tác"
                      >
                        <span>{selectedSession.interactionCode}</span>
                        {copiedCode ? (
                          <Check size={11.5} className="text-emerald-600" />
                        ) : (
                          <Copy size={11.5} className="text-slate-400" />
                        )}
                      </button>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-600">
                        SenderID: {selectedSession.senderId}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>
                        Bắt đầu{' '}
                        <span className="font-mono tabular-nums">
                          {selectedSession.startedAt}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Color-Coded SLA Countdown + Duration (STT 38) */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      SLA PHẢN HỒI · {activeSla.label}
                    </div>
                    <div
                      className={`text-[16px] font-bold font-mono tabular-nums leading-tight ${activeSla.headerTextClass}`}
                    >
                      {activeSla.timerText}
                    </div>
                  </div>
                  <div className="hidden xl:block text-right">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      THỜI LƯỢNG
                    </div>
                    <div className="text-[16px] font-bold font-mono tabular-nums text-slate-800 leading-tight">
                      {formatMmSs(selectedSession.durationSec)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-2 border-b border-[#E5E9F2] bg-white flex items-center justify-between gap-2 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openModal('update')}
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-[#F8FAFC] text-[12px] font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Edit3 size={13} className="text-slate-500" />
                    <span>Cập nhật</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('ticket')}
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-[#F8FAFC] text-[12px] font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Ticket size={13} className="text-slate-500" />
                    <span>Tạo ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('transfer')}
                    disabled={selectedSession.lifecycleStatus !== 'accepted'}
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-[#F8FAFC] disabled:opacity-45 disabled:cursor-not-allowed text-[12px] font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowLeftRight size={13} className="text-slate-500" />
                    <span>Chuyển</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('assist')}
                    disabled={selectedSession.lifecycleStatus !== 'accepted'}
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-[#F8FAFC] disabled:opacity-45 disabled:cursor-not-allowed text-[12px] font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowUpCircle size={13} className="text-slate-500" />
                    <span>Xin hỗ trợ</span>
                  </button>
                </div>

                {selectedSession.lifecycleStatus === 'accepted' ? (
                  <button
                    type="button"
                    onClick={() => openModal('complete')}
                    className="h-7 px-3 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 size={13.5} />
                    <span>Hoàn thành phiên</span>
                  </button>
                ) : selectedSession.lifecycleStatus === 'assigned' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDeclineAssigned(selectedSession.id)}
                      className="h-7 px-2.5 rounded-md border border-[#DCE3EE] text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptSession(selectedSession.id)}
                      className="h-7 px-3 rounded-md bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[12px] font-semibold inline-flex items-center gap-1.5"
                    >
                      <UserCheck size={13.5} />
                      <span>Tiếp nhận</span>
                    </button>
                  </div>
                ) : selectedSession.lifecycleStatus === 'new' ? (
                  <button
                    type="button"
                    onClick={() => handleAcceptSession(selectedSession.id)}
                    className="h-7 px-3 rounded-md bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[12px] font-semibold inline-flex items-center gap-1.5"
                  >
                    <UserCheck size={13.5} />
                    <span>Tiếp nhận từ hàng đợi</span>
                  </button>
                ) : (
                  <span className="text-[11.5px] font-medium text-slate-500">
                    {selectedSession.completionOutcome || 'Đã hoàn thành'}
                  </span>
                )}
              </div>

              {/* Message Timeline (Full Bot History with Roles + Session Dividers STT 31 & 42) */}
              <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-4 bg-[#FAFBFD] space-y-4">
                <div className="text-center">
                  <span className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                    HÔM NAY · 10/11/2026
                  </span>
                </div>

                {selectedSession.messages.map((msg) => {
                  // Session Divider showing Agent who completed + SenderID (STT 42)
                  if (msg.sender === 'session-divider') {
                    return (
                      <div key={msg.id} className="py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-[#CBD5E1]" />
                          <div className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EE] text-[11.5px] text-slate-600 text-center">
                            <div className="font-bold text-slate-800">
                              Phân cách phiên · {msg.previousSessionCode}{' '}
                              {msg.completedOutcome ? `(${msg.completedOutcome})` : ''}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500 flex items-center justify-center gap-2 flex-wrap">
                              <span>
                                Agent hoàn thành:{' '}
                                <strong className="text-[#3B49DF]">
                                  {msg.completedByAgent}
                                </strong>
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono text-slate-600">
                                SenderID: {msg.dividerSenderId || selectedSession.senderId}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono tabular-nums">{msg.time}</span>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-[#CBD5E1]" />
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === 'system' || msg.sender === 'routing') {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[11.5px] text-slate-600 text-center max-w-[90%]">
                          <span className="font-bold text-slate-700">
                            {msg.sender === 'system' ? 'HỆ THỐNG' : 'ĐỊNH TUYẾN'}
                          </span>
                          <span className="mx-1.5 text-slate-400">·</span>
                          <span>{msg.text}</span>
                          <span className="ml-2 font-mono tabular-nums text-[10.5px] text-slate-400">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === 'agent') {
                    return (
                      <div key={msg.id} className="flex flex-col items-end">
                        <div className="mb-1 flex items-center gap-1.5 text-[10.5px]">
                          <span className="font-bold tracking-wide text-[#3B49DF] uppercase">
                            AGENT · {msg.senderLabel || 'ba.tuann'}
                          </span>
                          <span className="font-mono tabular-nums text-slate-400">
                            {msg.time}
                          </span>
                        </div>
                        <div className="max-w-[76%] rounded-xl rounded-tr-xs bg-[#EEF2FF] border border-[#D7E0FA] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800">
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          {msg.attachment && (
                            <div className="mt-1.5 pt-1.5 border-t border-[#D7E0FA] inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#3B49DF]">
                              <Paperclip size={12} />
                              <span>{msg.attachment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const isBot = msg.sender === 'bot';
                  return (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="mb-1 flex items-center gap-1.5 text-[10.5px]">
                        <span
                          className={`font-bold tracking-wide uppercase ${
                            isBot ? 'text-[#0D9488]' : 'text-slate-700'
                          }`}
                        >
                          {isBot ? 'BOT' : 'KHÁCH HÀNG'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-600">
                          {msg.senderLabel ||
                            (isBot ? selectedSession.botSource : activeCustomer.name)}
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {msg.time}
                        </span>
                      </div>
                      <div
                        className={`max-w-[76%] rounded-xl rounded-tl-xs px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 ${
                          isBot
                            ? 'bg-[#F0FDFA] border border-[#CCFBF1]'
                            : 'bg-white border border-[#E5E9F2]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Composer with Automatic Per-Session Draft Memory (STT 35) */}
              <div className="px-4 py-3 border-t border-[#E5E9F2] bg-white shrink-0 relative">
                {templatePickerOpen && (
                  <div className="absolute left-4 bottom-[112px] z-30 w-[420px] max-w-[calc(100%-32px)] bg-white border border-[#DCE3EE] rounded-xl shadow-lg overflow-hidden">
                    <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-[#E5E9F2] flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-700">
                        Mẫu trả lời nhanh (gõ / để chèn)
                      </span>
                      <button
                        type="button"
                        onClick={() => setTemplatePickerOpen(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {QUICK_REPLY_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleInsertTemplate(tpl.content)}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#F4F5FC] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-semibold text-slate-800">
                              {tpl.title}
                            </span>
                            <span className="text-[11px] font-mono text-[#3B49DF]">
                              {tpl.shortcut}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                            {tpl.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {emojiPickerOpen && (
                  <div className="absolute left-36 bottom-[72px] z-30 bg-white border border-[#DCE3EE] rounded-lg shadow-lg p-1.5 flex items-center gap-1">
                    {QUICK_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          handleDraftChange(currentDraftText + em);
                          setEmojiPickerOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className="w-7 h-7 rounded hover:bg-slate-100 text-[15px] flex items-center justify-center"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSession.lifecycleStatus === 'accepted' ? (
                  <div className="rounded-xl border border-[#DCE3EE] bg-white focus-within:border-[#3B49DF] transition-colors">
                    {pendingAttachment && (
                      <div className="px-3 pt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#3B49DF] bg-[#F4F5FC] border border-[#D7E0FA] px-2 py-0.5 rounded">
                          <Paperclip size={11.5} />
                          <span>{pendingAttachment}</span>
                          <button
                            type="button"
                            onClick={() => setPendingAttachment(null)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <X size={11.5} />
                          </button>
                        </span>
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      rows={2}
                      value={currentDraftText}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Nhập nội dung trả lời... (tự động lưu nháp theo từng phiên · gõ / để chèn mẫu)"
                      className="w-full resize-none px-3.5 pt-2.5 pb-1 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />

                    <div className="px-3 pb-2 pt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTemplatePickerOpen((p) => !p);
                            setEmojiPickerOpen(false);
                          }}
                          className={`h-7 px-2 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                            templatePickerOpen
                              ? 'bg-[#F4F5FC] text-[#3B49DF]'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <MessageSquareText size={13.5} />
                          <span>Mẫu trả lời</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingAttachment('Bien_lai_tra_soat_VCB.pdf');
                            onNotify?.('Đã đính kèm tệp Bien_lai_tra_soat_VCB.pdf.');
                          }}
                          className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                          title="Đính kèm tệp"
                        >
                          <Paperclip size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingAttachment('Huong_dan_SmartOTP.png');
                            onNotify?.('Đã đính kèm hình ảnh hướng dẫn.');
                          }}
                          className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                          title="Đính kèm hình ảnh"
                        >
                          <ImageIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmojiPickerOpen((p) => !p);
                            setTemplatePickerOpen(false);
                          }}
                          className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                          title="Biểu tượng cảm xúc"
                        >
                          <Smile size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {currentDraftText.trim().length > 0 && (
                          <span className="text-[11px] font-medium text-[#D97706] hidden sm:inline">
                            Đã lưu nháp tạm
                          </span>
                        )}
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {currentDraftText.length}/1000
                        </span>
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={!currentDraftText.trim() && !pendingAttachment}
                          className={`h-7 w-8 rounded-md inline-flex items-center justify-center transition-colors ${
                            currentDraftText.trim() || pendingAttachment
                              ? 'bg-[#3B49DF] hover:bg-[#2F3CC7] text-white'
                              : 'bg-[#EEF2FF] text-[#A5B4FC] cursor-not-allowed'
                          }`}
                          title="Gửi tin nhắn (Enter)"
                        >
                          <Send size={13.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#E5E9F2] bg-[#F8FAFC] px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-[12px] text-slate-600">
                      {selectedSession.lifecycleStatus === 'completed'
                        ? `Phiên đã hoàn thành (${selectedSession.completionOutcome || 'Đã xử lý'}).`
                        : 'Nhấn "Tiếp nhận" để mở khóa khung soạn thảo và phản hồi khách hàng.'}
                    </span>
                    {selectedSession.lifecycleStatus !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptSession(selectedSession.id)}
                        className="h-7 px-3 rounded-md bg-[#3B49DF] hover:bg-[#2F3CC7] text-white text-[12px] font-semibold whitespace-nowrap"
                      >
                        Tiếp nhận ngay
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <MessageSquare size={26} />
              <p className="text-[13px]">Chọn một phiên hội thoại ở cột trái để xử lý.</p>
            </div>
          )}
        </section>

        {/* RIGHT PANE: CRM SENDERID MULTI-CUSTOMER + CONTACT HISTORY (STT 37 & 41) */}
        {showRightPane && selectedSession && (
          <>
            <div
              onMouseDown={(e) => startResize('right', e)}
              onDoubleClick={() => setRightWidth(324)}
              role="separator"
              aria-orientation="vertical"
              aria-label="Kéo để thay đổi độ rộng ngăn CRM"
              title="Kéo để thay đổi độ rộng ngăn CRM (nhấp đúp để đặt lại)"
              className="w-1.5 shrink-0 bg-[#EEF2F6] hover:bg-[#3B49DF]/40 active:bg-[#3B49DF] cursor-col-resize transition-colors flex items-center justify-center group"
            >
              <span className="w-0.5 h-8 rounded-full bg-slate-300 group-hover:bg-[#3B49DF]" />
            </div>

            <div
              style={{ width: `${rightWidth}px` }}
              className="shrink-0 h-full overflow-hidden"
            >
              <ChatCrmPanel
                session={selectedSession}
                tickets={activeCustomerTickets}
                manualInteractions={activeCustomerManuals}
                onSwitchCustomer={handleSwitchCustomer}
                onAddCustomerToSenderId={handleAddCustomerToSenderId}
                onOpenCreateTicket={() => openModal('ticket')}
                onOpenManualInteraction={() => openModal('manual')}
                onAddOutboundCallToTicket={handleAddOutboundCallToTicket}
                onClose={() => setLayoutMode('two-pane')}
                onNotify={onNotify}
              />
            </div>
          </>
        )}
      </div>

      {/* UNIFIED ACTION MODALS */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4"
          onClick={() => setModalMode(null)}
        >
          <form
            onSubmit={handleConfirmModal}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl border border-[#E5E9F2] shadow-xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E5E9F2] flex items-center justify-between">
              <h3 className="text-[14.5px] font-bold text-slate-900">
                {modalMode === 'update' && 'Cập nhật thông tin tương tác'}
                {modalMode === 'ticket' && 'Tạo phiếu ghi (Ticket)'}
                {modalMode === 'transfer' && 'Chuyển phiên hội thoại'}
                {modalMode === 'assist' && 'Gửi yêu cầu xin hỗ trợ'}
                {modalMode === 'complete' && 'Đánh dấu hoàn thành phiên'}
                {modalMode === 'manual' && 'Tạo tương tác thủ công (Call / Email / Chat)'}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-[13px]">
              {activeCustomer && (
                <div className="text-[12px] text-slate-500">
                  Khách hàng:{' '}
                  <strong className="text-slate-800">{activeCustomer.name}</strong>
                  {' · '}
                  <span className="font-mono">CIF {activeCustomer.cif}</span>
                </div>
              )}

              {modalMode === 'complete' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Kết quả xử lý phiên
                    </label>
                    <div className="space-y-1.5">
                      {COMPLETION_OUTCOMES.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            modalCompletionOutcome === opt
                              ? 'border-[#3B49DF] bg-[#F4F5FC] text-[#3B49DF] font-semibold'
                              : 'border-[#DCE3EE] bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="completion-outcome"
                            checked={modalCompletionOutcome === opt}
                            onChange={() => setModalCompletionOutcome(opt)}
                            className="accent-[#3B49DF]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ghi chú kết thúc (tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      value={modalCompletionNote}
                      onChange={(e) => setModalCompletionNote(e.target.value)}
                      placeholder="Nhập tóm tắt kết quả xử lý hoặc số lần gọi ra..."
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                </>
              )}

              {modalMode === 'manual' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Kênh tương tác (khi không bật screen-pop tự động)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Call', 'Email', 'Chat'] as const).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setManualChannel(ch)}
                          className={`h-9 rounded-lg border text-[12.5px] font-semibold transition-colors ${
                            manualChannel === ch
                              ? 'border-[#3B49DF] bg-[#EEF2FF] text-[#3B49DF]'
                              : 'border-[#DCE3EE] bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Phân loại yêu cầu (Workcode)
                    </label>
                    <select
                      value={manualWorkcode}
                      onChange={(e) => setManualWorkcode(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      {WORKCODE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Nội dung tương tác thủ công
                    </label>
                    <textarea
                      rows={3}
                      value={manualNote}
                      onChange={(e) => setManualNote(e.target.value)}
                      placeholder="Ghi nhận nội dung trao đổi khi màn hình tiếp nhận không bật tự động..."
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                </>
              )}

              {modalMode === 'update' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Phân loại yêu cầu (Workcode)
                    </label>
                    <select
                      value={modalWorkcode}
                      onChange={(e) => setModalWorkcode(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      {WORKCODE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ghi chú xử lý
                    </label>
                    <textarea
                      rows={3}
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="Nhập ghi chú kết quả trao đổi..."
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                </>
              )}

              {modalMode === 'ticket' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tiêu đề phiếu ghi
                    </label>
                    <input
                      type="text"
                      required
                      value={modalTicketSubject}
                      onChange={(e) => setModalTicketSubject(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Mức độ ưu tiên
                    </label>
                    <select
                      value={modalTicketPriority}
                      onChange={(e) =>
                        setModalTicketPriority(
                          e.target.value as 'Cao' | 'Trung bình' | 'Thấp'
                        )
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="Cao">Cao</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Thấp">Thấp</option>
                    </select>
                  </div>
                </>
              )}

              {modalMode === 'transfer' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Chuyển tới hàng đợi / chuyên viên
                    </label>
                    <select
                      value={modalTransferTarget}
                      onChange={(e) => setModalTransferTarget(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      {TRANSFER_TARGETS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label} ({t.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ghi chú bàn giao
                    </label>
                    <textarea
                      rows={3}
                      value={modalTransferNote}
                      onChange={(e) => setModalTransferNote(e.target.value)}
                      placeholder="Tóm tắt tình trạng xác thực & nội dung cần xử lý..."
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                </>
              )}

              {modalMode === 'assist' && (
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Nội dung cần Supervisor hỗ trợ
                  </label>
                  <textarea
                    rows={3}
                    value={modalAssistNote}
                    onChange={(e) => setModalAssistNote(e.target.value)}
                    placeholder="Ví dụ: Xin phê duyệt tra soát gấp cho khách hàng VIP Gold..."
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EE] text-[12.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-[#FAFBFD] border-t border-[#E5E9F2] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="h-8 px-3.5 rounded-lg border border-[#DCE3EE] bg-white text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`h-8 px-4 rounded-lg text-white text-[12.5px] font-semibold transition-colors ${
                  modalMode === 'complete'
                    ? 'bg-[#16A34A] hover:bg-[#15803D]'
                    : 'bg-[#3B49DF] hover:bg-[#2F3CC7]'
                }`}
              >
                {modalMode === 'complete' ? 'Xác nhận hoàn thành' : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
