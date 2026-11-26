import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  History,
  Info,
  Lightbulb,
  List,
  Maximize2,
  PanelRightClose,
  Pencil,
  PhoneOutgoing,
  Plus,
  Sparkles,
  Ticket,
  User,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import {
  ChatSessionRecord,
  LinkedCustomerProfile,
  ManualInteractionItem,
  OutboundCallRecord,
  TicketContactItem,
} from '../data/chatSessionsData';

interface ChatCrmPanelProps {
  session: ChatSessionRecord;
  tickets: TicketContactItem[];
  manualInteractions: ManualInteractionItem[];
  onSwitchCustomer: (customerId: string) => void;
  onAddCustomerToSenderId: (profile: Omit<LinkedCustomerProfile, 'id'>) => void;
  onUpdateCustomer?: (patch: Partial<LinkedCustomerProfile>) => void;
  onOpenCreateTicket: () => void;
  onOpenTicketCode?: (ticketCode: string) => void;
  onOpenManualInteraction: () => void;
  onAddOutboundCallToTicket: (
    ticketCode: string,
    call: Omit<OutboundCallRecord, 'id' | 'callCode'>
  ) => void;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

type CrmIconTab = 'customer' | 'details' | 'history' | 'tickets' | 'suggestions';

interface MatchCandidate {
  id: string;
  initials: string;
  name: string;
  matchPercent: number;
  phone: string;
  email: string;
  cif: string;
  segment: string;
  branch: string;
}

const CRM_CANDIDATE_DIRECTORY: MatchCandidate[] = [
  {
    id: 'cand-ly-tk',
    initials: 'KL',
    name: 'Trần Khánh Ly',
    matchPercent: 61,
    phone: '0912 448 ×09',
    email: 'ly.tk@email.vn',
    cif: 'KH-0093415',
    segment: 'Priority',
    branch: 'CN Cầu Giấy, Hà Nội',
  },
  {
    id: 'cand-linh-tt',
    initials: 'KL',
    name: 'Trần Thị Khánh Linh',
    matchPercent: 48,
    phone: '0904 233 ×18',
    email: 'khanhlinh.tt@email.vn',
    cif: 'KH-0092810',
    segment: 'Chuẩn',
    branch: 'CN Hoàn Kiếm, Hà Nội',
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export const ChatCrmPanel: React.FC<ChatCrmPanelProps> = ({
  session,
  tickets,
  manualInteractions,
  onSwitchCustomer,
  onAddCustomerToSenderId,
  onUpdateCustomer,
  onOpenCreateTicket,
  onOpenTicketCode,
  onOpenManualInteraction,
  onAddOutboundCallToTicket,
  onClose,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<CrmIconTab>('customer');
  const [copiedSender, setCopiedSender] = useState(false);

  // Reassign / Match Customer panel state
  const [showReassignBox, setShowReassignBox] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isUnidentified, setIsUnidentified] = useState(false);

  // New customer inline form
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCif, setNewCif] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSegment, setNewSegment] = useState('VIP Gold');

  // Inline customer profile edit & tags
  const [editingProfile, setEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [customerTags, setCustomerTags] = useState<string[]>([
    'Khiếu nại 2 lần/30d',
  ]);
  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState('');

  // History tab: nested tickets & outbound calls
  const [collapsedTickets, setCollapsedTickets] = useState<Record<string, boolean>>({});
  const [addingCallForTicket, setAddingCallForTicket] = useState<string | null>(null);
  const [callResult, setCallResult] = useState<OutboundCallRecord['result']>(
    'Kết nối thành công'
  );
  const [callDuration, setCallDuration] = useState('02:15');
  const [callNote, setCallNote] = useState('');

  const activeCustomer =
    session.linkedCustomers.find((c) => c.id === session.activeCustomerId) ??
    session.linkedCustomers[0];

  const openTicketCount = tickets.filter((t) => t.status !== 'Hoàn thành').length || tickets.length;

  const totalOutboundCalls = tickets.reduce(
    (sum, t) => sum + t.outboundCalls.length,
    0
  );

  const matchResults = useMemo(() => {
    const linkedMatches: MatchCandidate[] = session.linkedCustomers
      .filter((c) => c.id !== activeCustomer?.id)
      .map((c, idx) => ({
        id: c.id,
        initials: getInitials(c.name),
        name: c.name,
        matchPercent: Math.max(55, 84 - idx * 14),
        phone: c.phone,
        email: c.email,
        cif: c.cif,
        segment: c.segment,
        branch: c.branch,
      }));

    const pool = [...linkedMatches, ...CRM_CANDIDATE_DIRECTORY].filter(
      (item, idx, arr) => arr.findIndex((x) => x.name === item.name) === idx
    );

    const q = submittedSearch.trim().toLowerCase();
    if (!q) return pool.slice(0, 2);
    return pool.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.cif.toLowerCase().includes(q)
    );
  }, [session.linkedCustomers, activeCustomer?.id, submittedSearch]);

  const handleCopySender = () => {
    navigator.clipboard?.writeText(session.senderId).catch(() => {});
    setCopiedSender(true);
    window.setTimeout(() => setCopiedSender(false), 1500);
    onNotify?.(`Đã sao chép SenderID: ${session.senderId}`);
  };

  const handleAssignCandidate = (cand: MatchCandidate) => {
    setIsUnidentified(false);
    const existing = session.linkedCustomers.find(
      (c) => c.id === cand.id || c.name === cand.name
    );
    if (existing) {
      onSwitchCustomer(existing.id);
    } else {
      onAddCustomerToSenderId({
        name: cand.name,
        cif: cand.cif,
        phone: cand.phone.replace('×', '5'),
        email: cand.email,
        segment: cand.segment,
        branch: cand.branch,
        relationNote: `Gán lại theo độ khớp ${cand.matchPercent}%`,
      });
    }
    onNotify?.(`Đã gán khách hàng ${cand.name} (${cand.cif}) cho phiên hiện tại.`);
  };

  const handleSubmitNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    setIsUnidentified(false);
    onAddCustomerToSenderId({
      name: newName.trim(),
      cif: newCif.trim() || `KH-${Math.floor(1000000 + Math.random() * 8999999)}`,
      phone: newPhone.trim(),
      email:
        newEmail.trim() ||
        `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@email.vn`,
      segment: newSegment,
      branch: activeCustomer?.branch || 'CN Cầu Giấy, Hà Nội',
      relationNote: 'Tạo hồ sơ mới từ màn hình định danh',
    });
    setNewName('');
    setNewCif('');
    setNewPhone('');
    setNewEmail('');
    setShowAddCustomer(false);
  };

  const handleStartEditProfile = () => {
    if (!activeCustomer) return;
    setEditPhone(activeCustomer.phone);
    setEditEmail(activeCustomer.email);
    setEditBranch(activeCustomer.branch);
    setEditingProfile((p) => !p);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomer?.({
      phone: editPhone.trim() || activeCustomer?.phone,
      email: editEmail.trim() || activeCustomer?.email,
      branch: editBranch.trim() || activeCustomer?.branch,
    });
    setEditingProfile(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tagDraft.trim();
    if (cleaned && !customerTags.includes(cleaned)) {
      setCustomerTags((prev) => [...prev, cleaned]);
    }
    setTagDraft('');
    setAddingTag(false);
  };

  const handleSubmitOutboundCall = (e: React.FormEvent, ticketCode: string) => {
    e.preventDefault();
    const now = new Date();
    const calledAt = `10/11/2026 ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    onAddOutboundCallToTicket(ticketCode, {
      agentName: 'ba.tuann',
      calledAt,
      durationText: callResult === 'Kết nối thành công' ? callDuration : '00:00',
      result: callResult,
      note:
        callNote.trim() ||
        (callResult === 'Kết nối thành công'
          ? 'Đã liên hệ khách hàng thông báo tiến độ xử lý phiếu.'
          : 'Gọi ra từ ticket nhưng chưa kết nối được khách hàng.'),
    });
    setAddingCallForTicket(null);
    setCallNote('');
  };

  return (
    <aside className="h-full bg-white flex flex-col overflow-hidden">
      {/* TOP CONTEXT CHIPS STRIP */}
      <div className="px-3 py-2 border-b border-[#E5E9F2] bg-[#FAFBFD] flex flex-wrap items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className="h-7 px-2.5 rounded-lg border border-[#DCE3EE] bg-white hover:bg-slate-50 text-[11.5px] font-semibold text-slate-800 inline-flex items-center gap-1.5 max-w-full"
          title={session.workcode || 'Thông tin phiên'}
        >
          <span className="truncate max-w-[140px]">
            {session.workcode || 'Chưa phân loại'}
          </span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#7E22CE] font-mono text-[10px] font-bold">
            <Sparkles size={9.5} />
            92%
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateTicket}
          className="h-7 px-2.5 rounded-lg border border-[#F6B296] bg-[#FFF5F0] hover:bg-[#FFECE3] text-[11.5px] font-semibold text-[#C2410C] inline-flex items-center gap-1.5 whitespace-nowrap"
          title="Mở phiếu yêu cầu song song với khung chat"
        >
          <Ticket size={12} className="text-[#EA580C]" />
          <span>{openTicketCount} đang mở</span>
        </button>
      </div>

      {/* ICON NAVIGATION BAR (Matching screenshot layout) */}
      <div className="border-b border-[#E5E9F2] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center flex-1">
          {(
            [
              {
                key: 'customer',
                icon: User,
                title: 'Hồ sơ & Đổi / Gán lại khách hàng',
              },
              {
                key: 'details',
                icon: List,
                title: 'Chi tiết phiên & Hồ sơ gắn SenderID',
              },
              {
                key: 'history',
                icon: History,
                title: 'Lịch sử liên hệ (Ticket & Cuộc gọi đi)',
              },
              {
                key: 'tickets',
                icon: Ticket,
                title: 'Danh sách phiếu yêu cầu',
              },
              {
                key: 'suggestions',
                icon: Lightbulb,
                title: 'Gợi ý xử lý & Kịch bản',
                hasDot: true,
              },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                title={item.title}
                aria-label={item.title}
                className={`relative flex-1 h-10 inline-flex items-center justify-center border-b-2 transition-colors ${
                  active
                    ? 'border-[#EA580C] text-[#0F172A] bg-[#FFFDFB]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.1 : 1.75} />
                {'hasDot' in item && item.hasDot && (
                  <span className="absolute top-2 right-[28%] w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center border-l border-[#E5E9F2] px-1 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateTicket}
            className="w-8 h-9 inline-flex items-center justify-center text-slate-500 hover:text-[#EA580C] hover:bg-slate-50 rounded"
            title="Mở rộng sang màn hình Ticket song song Chat"
            aria-label="Mở rộng Ticket"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-9 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded"
            title="Thu gọn ngăn phải"
            aria-label="Thu gọn ngăn phải"
          >
            <PanelRightClose size={14.5} />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {activeTab === 'customer' && (
          <div>
            {/* 1. ĐỔI / GÁN LẠI KHÁCH HÀNG */}
            <div className="px-3.5 pt-3 pb-3.5 border-b-2 border-[#EA580C] bg-[#FFFCFA]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide text-[#C2410C] uppercase">
                  <User size={13.5} />
                  <span>ĐỔI / GÁN LẠI KHÁCH HÀNG</span>
                  <Info size={12.5} className="text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowReassignBox((p) => !p)}
                  className="text-[12px] font-semibold text-[#C2410C] hover:underline"
                >
                  {showReassignBox ? 'Hủy' : 'Đổi KH'}
                </button>
              </div>

              {showReassignBox && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmittedSearch(searchTerm);
                  }}
                  className="flex items-center gap-0"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="SĐT, email, CCCD hoặc tên..."
                    className="flex-1 h-9 px-3 rounded-l-lg border border-r-0 border-[#CBD5E1] bg-white text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#EA580C]"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-r-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-[12.5px] font-semibold shrink-0 transition-colors"
                  >
                    Tìm
                  </button>
                </form>
              )}
            </div>

            {showReassignBox && (
              <div className="px-3.5 py-3 border-b border-[#E5E9F2] space-y-2.5 bg-white">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold tracking-wider text-slate-500 uppercase">
                    KẾT QUẢ KHỚP
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {matchResults.length} hồ sơ
                  </span>
                </div>

                {matchResults.length === 0 ? (
                  <div className="p-3 rounded-xl border border-[#E5E9F2] bg-[#F8FAFC] text-center text-[12px] text-slate-400">
                    Không tìm thấy hồ sơ khớp từ khóa "{submittedSearch}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matchResults.map((cand) => (
                      <div
                        key={cand.id}
                        className="p-2.5 rounded-xl bg-[#F4F6F9] border border-[#E6EAF2] flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#DCE4EE] text-slate-700 text-[11.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {cand.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[12.5px] font-bold text-slate-900">
                                {cand.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-[#DCE3EE] text-[10px] font-bold text-slate-700 tabular-nums">
                                KHỚP {cand.matchPercent}%
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11.5px] text-slate-600 truncate">
                              <span className="font-mono tabular-nums">{cand.phone}</span> ·{' '}
                              <span>{cand.email}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAssignCandidate(cand)}
                          className="h-7 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:border-[#EA580C] hover:text-[#C2410C] text-[12px] font-semibold text-slate-800 shrink-0 transition-colors"
                        >
                          Gán
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chưa định danh + Hồ sơ mới buttons */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnidentified((p) => !p);
                      onNotify?.(
                        !isUnidentified
                          ? `Đã đánh dấu phiên ${session.interactionCode} ở trạng thái Chưa định danh.`
                          : 'Đã khôi phục định danh khách hàng hiện tại.'
                      );
                    }}
                    className={`h-8 px-3 rounded-lg border text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      isUnidentified
                        ? 'border-[#EA580C] bg-[#FFF5F0] text-[#C2410C]'
                        : 'border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserX size={13.5} />
                    <span>Chưa định danh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddCustomer((p) => !p)}
                    className="h-8 px-3.5 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus size={13.5} />
                    <span>Hồ sơ mới</span>
                  </button>
                </div>

                {/* Inline New Customer Form */}
                {showAddCustomer && (
                  <form
                    onSubmit={handleSubmitNewCustomer}
                    className="mt-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#DCE3EE] space-y-2 text-[12px]"
                  >
                    <div className="font-semibold text-slate-800">
                      Tạo hồ sơ mới & gắn SenderID {session.senderId}
                    </div>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Họ và tên khách hàng *"
                      className="w-full h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white text-slate-800 focus:outline-none focus:border-[#EA580C]"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Số điện thoại *"
                        className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white font-mono text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                      <input
                        type="text"
                        value={newCif}
                        onChange={(e) => setNewCif(e.target.value)}
                        placeholder="Mã KH (CIF)"
                        className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white font-mono text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Email"
                        className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                      <select
                        value={newSegment}
                        onChange={(e) => setNewSegment(e.target.value)}
                        className="h-8 px-2 rounded-md border border-[#DCE3EE] bg-white text-slate-700 focus:outline-none focus:border-[#EA580C]"
                      >
                        <option value="VIP Gold">VIP Gold</option>
                        <option value="Priority">Priority</option>
                        <option value="Chuẩn">Chuẩn</option>
                        <option value="SME Doanh nghiệp">SME Doanh nghiệp</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomer(false)}
                        className="h-7 px-2.5 rounded border border-[#DCE3EE] bg-white text-slate-600"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="h-7 px-3 rounded bg-[#C2410C] text-white font-semibold"
                      >
                        Lưu & Gán
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 2. SELECTED CUSTOMER IDENTITY BLOCK */}
            {activeCustomer && (
              <div className="px-3.5 py-3.5 border-b border-[#E5E9F2] space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1E293B] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                    {isUnidentified ? '?' : getInitials(activeCustomer.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-bold text-slate-900 truncate">
                      {isUnidentified ? 'Khách hàng chưa định danh' : activeCustomer.name}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySender}
                      className="mt-0.5 text-[11.5px] font-mono text-slate-500 hover:text-[#3B49DF] inline-flex items-center gap-1 text-left break-all"
                      title="Nhấp để sao chép SenderID"
                    >
                      <span>
                        {isUnidentified ? 'Chưa gắn CIF' : activeCustomer.cif} · Sender ID{' '}
                        {session.senderId}
                      </span>
                      {copiedSender ? (
                        <Check size={11} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={11} className="text-slate-400 shrink-0" />
                      )}
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] text-white text-[11px] font-bold">
                        {activeCustomer.segment}
                      </span>
                      {customerTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full border border-[#F6B296] bg-[#FFF5F0] text-[#C2410C] text-[11px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAddingTag((p) => !p)}
                        className="px-2.5 py-0.5 rounded-full border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600"
                      >
                        + Tag
                      </button>
                    </div>

                    {addingTag && (
                      <form onSubmit={handleAddTag} className="mt-2 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          placeholder="Nhập tên tag..."
                          className="flex-1 h-7 px-2 rounded border border-[#CBD5E1] text-[11.5px] focus:outline-none focus:border-[#EA580C]"
                        />
                        <button
                          type="submit"
                          className="h-7 px-2.5 rounded bg-[#C2410C] text-white text-[11px] font-semibold"
                        >
                          Thêm
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. HỒ SƠ KHÁCH HÀNG */}
            {activeCustomer && (
              <div className="px-3.5 py-3.5">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wider text-[#0F172A] uppercase">
                    <span>HỒ SƠ KHÁCH HÀNG</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEditProfile}
                    className="p-1 rounded text-[#EA580C] hover:bg-[#FFF5F0] transition-colors"
                    title="Chỉnh sửa hồ sơ khách hàng"
                    aria-label="Chỉnh sửa hồ sơ khách hàng"
                  >
                    <Pencil size={13.5} />
                  </button>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-2 text-[12px]">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] font-mono text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">
                        Chi nhánh / địa chỉ
                      </label>
                      <input
                        type="text"
                        value={editBranch}
                        onChange={(e) => setEditBranch(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] text-slate-800 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="h-7 px-2.5 rounded border border-[#DCE3EE] text-slate-600"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="h-7 px-3 rounded bg-[#C2410C] text-white font-semibold"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="divide-y divide-[#F1F5F9] text-[12.5px]">
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">Mã KH</dt>
                      <dd className="col-span-7 font-bold font-mono tabular-nums text-slate-900">
                        {activeCustomer.cif}
                      </dd>
                    </div>
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">Số điện thoại</dt>
                      <dd className="col-span-7 font-bold font-mono tabular-nums text-slate-900">
                        {activeCustomer.phone}
                      </dd>
                    </div>
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">Email</dt>
                      <dd className="col-span-7 font-bold text-slate-900 truncate">
                        {activeCustomer.email}
                      </dd>
                    </div>
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">CCCD</dt>
                      <dd className="col-span-7 font-bold text-slate-900">
                        0011 •••• 8827 (đã xác thực)
                      </dd>
                    </div>
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">Hạng</dt>
                      <dd className="col-span-7 font-bold text-slate-900">
                        {activeCustomer.segment}
                      </dd>
                    </div>
                    <div className="py-2 grid grid-cols-12 gap-2 items-center">
                      <dt className="col-span-5 text-slate-500">Chi nhánh / địa chỉ</dt>
                      <dd className="col-span-7 font-bold text-slate-900">
                        {activeCustomer.branch}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-3.5 space-y-3 text-[12px]">
            <div className="rounded-xl border border-[#E5E9F2] bg-[#FAFBFD] p-3 space-y-2">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Thông tin phiên & Định tuyến Bot
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Mã tương tác</span>
                  <span className="font-mono font-bold text-slate-800">
                    {session.interactionCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nguồn Bot</span>
                  <span className="font-semibold text-slate-800">{session.botSource}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-200/70">
                <span className="text-slate-400 block text-[11px]">
                  Phân loại (Workcode)
                </span>
                <span className="font-semibold text-slate-800">
                  {session.workcode || 'Chưa phân loại'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Hồ sơ gắn cùng SenderID ({session.linkedCustomers.length})
              </div>
              {session.linkedCustomers.map((cust) => {
                const isCurrent = cust.id === activeCustomer?.id;
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => onSwitchCustomer(cust.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
                      isCurrent
                        ? 'border-[#EA580C] bg-[#FFF5F0]'
                        : 'border-[#E5E9F2] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{cust.name}</span>
                      {isCurrent && (
                        <span className="text-[10.5px] font-bold text-[#C2410C]">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {cust.cif} · {cust.phone}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-3.5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11.5px] text-slate-500">
                Hồ sơ:{' '}
                <strong className="text-slate-800">{activeCustomer?.name}</strong>
              </div>
              <button
                type="button"
                onClick={onOpenCreateTicket}
                className="text-[11.5px] font-semibold text-[#C2410C] hover:underline inline-flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>Tạo ticket</span>
              </button>
            </div>

            {/* Ticket List with Nested Outbound Calls Directly Beneath Ticket */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <span>Ticket & Cuộc gọi đi từ ticket</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {totalOutboundCalls} cuộc gọi đi
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-xl border border-[#E5E9F2] bg-[#FAFBFD] p-4 text-center text-[12px] text-slate-400">
                  Khách hàng chưa có ticket nào trong lịch sử liên hệ.
                </div>
              ) : (
                tickets.map((tk) => {
                  const isCollapsed = Boolean(collapsedTickets[tk.code]);
                  return (
                    <div
                      key={tk.code}
                      className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setCollapsedTickets((prev) => ({
                                  ...prev,
                                  [tk.code]: !prev[tk.code],
                                }))
                              }
                              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 shrink-0"
                              aria-label={isCollapsed ? 'Mở rộng ticket' : 'Thu gọn ticket'}
                            >
                              {isCollapsed ? (
                                <ChevronRight size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </button>
                            <Ticket size={13} className="text-[#EA580C] shrink-0" />
                            <button
                              type="button"
                              onClick={() => onOpenTicketCode?.(tk.code)}
                              className="font-mono text-[12px] font-bold text-[#2563EB] hover:underline truncate"
                              title="Mở phiếu yêu cầu song song với khung chat"
                            >
                              {tk.code}
                            </button>
                          </div>
                          <span
                            className={`text-[11px] font-semibold shrink-0 ${
                              tk.status === 'Hoàn thành'
                                ? 'text-[#16A34A]'
                                : 'text-[#D97706]'
                            }`}
                          >
                            {tk.status}
                          </span>
                        </div>

                        <p className="mt-1 pl-5 text-[12px] font-medium text-slate-800 leading-snug">
                          {tk.subject}
                        </p>

                        <div className="mt-1.5 pl-5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                          <span className="font-mono tabular-nums">
                            {tk.createdAt} · {tk.channel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAddingCallForTicket(
                                addingCallForTicket === tk.code ? null : tk.code
                              )
                            }
                            className="text-[#C2410C] font-semibold hover:underline"
                          >
                            + Gọi đi
                          </button>
                        </div>
                      </div>

                      {addingCallForTicket === tk.code && (
                        <form
                          onSubmit={(e) => handleSubmitOutboundCall(e, tk.code)}
                          className="mx-3 mb-2.5 p-2.5 rounded-lg bg-[#FFF5F0] border border-[#F6B296] space-y-2 text-[11.5px]"
                        >
                          <div className="font-semibold text-[#C2410C]">
                            Ghi nhận cuộc gọi đi từ {tk.code}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <select
                              value={callResult}
                              onChange={(e) =>
                                setCallResult(
                                  e.target.value as OutboundCallRecord['result']
                                )
                              }
                              className="h-7 px-2 rounded border border-[#DCE3EE] bg-white text-slate-700"
                            >
                              <option value="Kết nối thành công">
                                Kết nối thành công
                              </option>
                              <option value="Khách không nghe máy">
                                Khách không nghe máy
                              </option>
                              <option value="Máy bận">Máy bận</option>
                            </select>
                            <input
                              type="text"
                              value={callDuration}
                              onChange={(e) => setCallDuration(e.target.value)}
                              disabled={callResult !== 'Kết nối thành công'}
                              placeholder="02:15"
                              className="h-7 px-2 rounded border border-[#DCE3EE] bg-white font-mono text-slate-700 disabled:bg-slate-100"
                            />
                          </div>
                          <input
                            type="text"
                            value={callNote}
                            onChange={(e) => setCallNote(e.target.value)}
                            placeholder="Ghi chú nội dung cuộc gọi đi..."
                            className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white text-slate-700"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddingCallForTicket(null)}
                              className="h-6 px-2 rounded border border-[#DCE3EE] bg-white text-slate-600"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="h-6 px-2.5 rounded bg-[#C2410C] text-white font-semibold"
                            >
                              Lưu cuộc gọi
                            </button>
                          </div>
                        </form>
                      )}

                      {!isCollapsed && (
                        <div className="border-t border-[#F1F5F9] bg-[#FAFBFD] px-3 py-2 space-y-2">
                          {tk.outboundCalls.length === 0 ? (
                            <div className="pl-4 text-[11px] text-slate-400">
                              Chưa có cuộc gọi đi phát sinh từ ticket này.
                            </div>
                          ) : (
                            tk.outboundCalls.map((call) => (
                              <div
                                key={call.id}
                                className="pl-4 relative text-[11.5px] space-y-0.5"
                              >
                                <span
                                  className="absolute left-1 top-1.5 w-2 h-2 border-l border-b border-slate-300"
                                  aria-hidden="true"
                                />
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700">
                                    <PhoneOutgoing
                                      size={11.5}
                                      className="text-[#EA580C] shrink-0"
                                    />
                                    <span>{call.callCode}</span>
                                  </span>
                                  <span
                                    className={`text-[10.5px] font-semibold ${
                                      call.result === 'Kết nối thành công'
                                        ? 'text-[#16A34A]'
                                        : 'text-[#D97706]'
                                    }`}
                                  >
                                    {call.result}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                                  {call.calledAt} · {call.durationText} ·{' '}
                                  <span className="font-sans text-slate-600">
                                    {call.agentName}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                  {call.note}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Manual Interactions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <span>Tương tác thủ công ({manualInteractions.length})</span>
                <button
                  type="button"
                  onClick={onOpenManualInteraction}
                  className="text-[#C2410C] normal-case font-semibold hover:underline"
                >
                  + Tạo thủ công
                </button>
              </div>

              {manualInteractions.length === 0 ? (
                <div className="rounded-xl border border-[#E5E9F2] bg-[#FAFBFD] p-3 text-center text-[11.5px] text-slate-400">
                  Chưa có tương tác thủ công nào cho hồ sơ này.
                </div>
              ) : (
                manualInteractions.map((mi) => (
                  <div
                    key={mi.id}
                    className="rounded-xl border border-[#E5E9F2] bg-white p-3 space-y-1 text-[11.5px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-800">
                        {mi.code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#C2410C]">
                        Kênh {mi.channel}
                      </span>
                    </div>
                    <div className="font-medium text-slate-700">{mi.workcode}</div>
                    <p className="text-slate-500 leading-snug">{mi.note}</p>
                    <div className="text-[10.5px] text-slate-400 font-mono tabular-nums">
                      {mi.createdAt} · {mi.agentName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Phiếu yêu cầu của khách hàng ({tickets.length})
              </span>
              <button
                type="button"
                onClick={onOpenCreateTicket}
                className="h-7 px-2.5 rounded-md bg-[#C2410C] hover:bg-[#9A3412] text-white text-[11.5px] font-semibold inline-flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Tạo Ticket</span>
              </button>
            </div>

            {tickets.map((tk) => (
              <button
                key={tk.code}
                type="button"
                onClick={() => onOpenTicketCode?.(tk.code)}
                className="w-full text-left p-3 rounded-xl border border-[#E5E9F2] hover:border-[#EA580C] bg-[#FAFBFD] space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                    {tk.code}
                  </span>
                  <span className="text-[11px] font-semibold text-[#D97706]">
                    {tk.status}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-slate-800">{tk.subject}</p>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {tk.createdAt} · Bấm để mở song song khung chat
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="p-3.5 space-y-2.5 text-[12px]">
            <div className="rounded-xl border border-[#F6B296] bg-[#FFF5F0] p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#C2410C]">
                <UserCheck size={14} />
                <span>Gợi ý định tuyến & xử lý (92%)</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Khách hàng thuộc nhóm <strong>{activeCustomer?.segment}</strong> và đang trao đổi nghiệp vụ{' '}
                <strong>{session.workcode || 'hỗ trợ giao dịch'}</strong>. Ưu tiên xác minh giao dịch qua mã tra soát trước khi tạo phiếu chuyển đơn vị xử lý.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
