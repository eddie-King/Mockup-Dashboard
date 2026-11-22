import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Mail,
  MapPin,
  Phone,
  PhoneOutgoing,
  Plus,
  Ticket,
  UserPlus,
  Users,
  X,
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
  onOpenCreateTicket: () => void;
  onOpenManualInteraction: () => void;
  onAddOutboundCallToTicket: (
    ticketCode: string,
    call: Omit<OutboundCallRecord, 'id' | 'callCode'>
  ) => void;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export const ChatCrmPanel: React.FC<ChatCrmPanelProps> = ({
  session,
  tickets,
  manualInteractions,
  onSwitchCustomer,
  onAddCustomerToSenderId,
  onOpenCreateTicket,
  onOpenManualInteraction,
  onAddOutboundCallToTicket,
  onClose,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [copiedSender, setCopiedSender] = useState(false);

  // Add customer to same SenderID inline form
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCif, setNewCif] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSegment, setNewSegment] = useState('Chuẩn');
  const [newRelation, setNewRelation] = useState('');

  // Expandable tickets in Contact History (default all expanded so STT 41 nested calls are immediately visible)
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

  const totalOutboundCalls = tickets.reduce(
    (sum, t) => sum + t.outboundCalls.length,
    0
  );

  const handleCopySender = () => {
    navigator.clipboard?.writeText(session.senderId).catch(() => {});
    setCopiedSender(true);
    window.setTimeout(() => setCopiedSender(false), 1500);
    onNotify?.(`Đã sao chép SenderID: ${session.senderId}`);
  };

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    onAddCustomerToSenderId({
      name: newName.trim(),
      cif: newCif.trim() || `00${Math.floor(100000 + Math.random() * 899999)}`,
      phone: newPhone.trim(),
      email: `${newName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '.')}@khachhang.vn`,
      segment: newSegment,
      branch: activeCustomer?.branch || 'CN Hà Nội',
      relationNote: newRelation.trim() || 'Gắn bổ sung trên cùng SenderID',
    });
    setNewName('');
    setNewCif('');
    setNewPhone('');
    setNewRelation('');
    setShowAddCustomer(false);
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
    <aside className="h-full bg-[#FAFBFD] flex flex-col overflow-hidden">
      {/* Header + Tabs */}
      <div className="px-3.5 pt-3 border-b border-[#E5E9F2] bg-white shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11.5px] font-bold tracking-wider text-slate-500 uppercase">
            CRM & Lịch sử liên hệ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Ẩn ngăn CRM"
            aria-label="Ẩn ngăn CRM"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 text-[12.5px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#3B49DF] text-[#3B49DF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hồ sơ & SenderID ({session.linkedCustomers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2 text-[12.5px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#3B49DF] text-[#3B49DF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lịch sử liên hệ ({tickets.length})
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 space-y-3.5">
        {activeTab === 'profile' ? (
          <>
            {/* SenderID Mapping Card (1 SenderID -> N Customers, STT 37) */}
            <div className="rounded-xl border border-[#E5E9F2] bg-white p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                    SenderID kênh {session.channelLabel}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySender}
                    className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold text-slate-800 hover:text-[#3B49DF] transition-colors"
                    title="Sao chép SenderID"
                  >
                    <span className="truncate">{session.senderId}</span>
                    {copiedSender ? (
                      <Check size={12} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Copy size={12} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCustomer((p) => !p)}
                  className="h-7 px-2 rounded-md border border-[#DCE3EE] bg-white hover:bg-[#F4F5FC] hover:border-[#3B49DF] text-[11.5px] font-semibold text-[#3B49DF] inline-flex items-center gap-1 shrink-0 transition-colors"
                  title="Gắn thêm hồ sơ khách hàng vào cùng SenderID"
                >
                  <UserPlus size={12.5} />
                  <span>Gắn KH</span>
                </button>
              </div>

              {/* Inline Add Customer Form */}
              {showAddCustomer && (
                <form
                  onSubmit={handleSubmitCustomer}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#DCE3EE] space-y-2 text-[12px]"
                >
                  <div className="font-semibold text-slate-700">
                    Gắn thêm khách hàng cho {session.senderId}
                  </div>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Họ tên / Tên doanh nghiệp *"
                    className="w-full h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={newCif}
                      onChange={(e) => setNewCif(e.target.value)}
                      placeholder="Mã CIF"
                      className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white font-mono text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Số điện thoại *"
                      className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white font-mono text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={newSegment}
                      onChange={(e) => setNewSegment(e.target.value)}
                      className="h-8 px-2 rounded-md border border-[#DCE3EE] bg-white text-slate-700 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="Chuẩn">Chuẩn</option>
                      <option value="Priority">Priority</option>
                      <option value="VIP · GOLD">VIP · GOLD</option>
                      <option value="SME Doanh nghiệp">SME Doanh nghiệp</option>
                    </select>
                    <input
                      type="text"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      placeholder="Quan hệ / ghi chú"
                      className="h-8 px-2.5 rounded-md border border-[#DCE3EE] bg-white text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomer(false)}
                      className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white text-slate-600 hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="h-7 px-3 rounded-md bg-[#3B49DF] hover:bg-[#2F3CC7] text-white font-semibold"
                    >
                      Lưu gắn kết
                    </button>
                  </div>
                </form>
              )}

              {/* Linked Customers Selector (1 SenderID -> Many Customers) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Users size={12} />
                    Khách hàng đã gắn ({session.linkedCustomers.length})
                  </span>
                  <span>Chọn hồ sơ áp dụng</span>
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
                          ? 'border-[#3B49DF] bg-[#F4F5FC]'
                          : 'border-[#E5E9F2] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[12.5px] font-bold truncate ${
                            isCurrent ? 'text-[#3B49DF]' : 'text-slate-800'
                          }`}
                        >
                          {cust.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-[#3B49DF] uppercase shrink-0">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono tabular-nums">CIF {cust.cif}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">
                          {cust.segment}
                        </span>
                      </div>
                      {cust.relationNote && (
                        <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                          {cust.relationNote}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Customer Detail */}
            {activeCustomer && (
              <div className="rounded-xl border border-[#E5E9F2] bg-white p-3.5 space-y-2.5">
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Thông tin liên hệ hồ sơ đang chọn
                </div>
                <div className="space-y-1.5 text-[12px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums font-medium">
                      {activeCustomer.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{activeCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span>{activeCustomer.branch}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bot & Classification Metadata */}
            <div className="rounded-xl border border-[#E5E9F2] bg-white p-3.5 space-y-2">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Thông tin phiên & định tuyến Bot
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <div>
                  <span className="text-slate-400 block">Nguồn Bot</span>
                  <span className="font-semibold text-slate-800">
                    {session.botSource}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mức ưu tiên</span>
                  <span
                    className={`font-bold ${
                      session.priority === 'urgent'
                        ? 'text-[#DC2626]'
                        : 'text-slate-700'
                    }`}
                  >
                    {session.priority === 'urgent'
                      ? 'Hỗ trợ khẩn cấp'
                      : 'Hỗ trợ khác'}
                  </span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-100 text-[12px]">
                <span className="text-slate-400 text-[11px] block">
                  Phân loại (Workcode)
                </span>
                <span className="font-semibold text-slate-800">
                  {session.workcode || 'Chưa phân loại'}
                </span>
              </div>
              {session.interactionNote && (
                <p className="text-[11.5px] text-slate-600 leading-relaxed pt-1">
                  {session.interactionNote}
                </p>
              )}
            </div>
          </>
        ) : (
          /* TAB 2: LỊCH SỬ LIÊN HỆ — Tickets with nested Outbound Calls (STT 41) + Manual Interactions (STT 37) */
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11.5px] text-slate-500">
                Hồ sơ:{' '}
                <strong className="text-slate-800">{activeCustomer?.name}</strong>
              </div>
              <button
                type="button"
                onClick={onOpenCreateTicket}
                className="text-[11.5px] font-semibold text-[#3B49DF] hover:underline inline-flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>Tạo ticket</span>
              </button>
            </div>

            {/* Ticket List with Nested Outbound Calls directly beneath each ticket */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <span>Ticket & Cuộc gọi đi từ ticket</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {totalOutboundCalls} cuộc gọi đi
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-xl border border-[#E5E9F2] bg-white p-4 text-center text-[12px] text-slate-400">
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
                      {/* Ticket Row */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedTickets((prev) => ({
                                ...prev,
                                [tk.code]: !prev[tk.code],
                              }))
                            }
                            className="flex items-center gap-1.5 text-left min-w-0"
                          >
                            {isCollapsed ? (
                              <ChevronRight
                                size={14}
                                className="text-slate-400 shrink-0"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-slate-400 shrink-0"
                              />
                            )}
                            <Ticket size={13} className="text-[#3B49DF] shrink-0" />
                            <span className="font-mono text-[12px] font-bold text-[#3B49DF]">
                              {tk.code}
                            </span>
                          </button>
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
                            className="text-[#3B49DF] font-semibold hover:underline"
                          >
                            + Gọi đi
                          </button>
                        </div>
                      </div>

                      {/* Inline Quick Log Outbound Call from Ticket */}
                      {addingCallForTicket === tk.code && (
                        <form
                          onSubmit={(e) => handleSubmitOutboundCall(e, tk.code)}
                          className="mx-3 mb-2.5 p-2.5 rounded-lg bg-[#F4F5FC] border border-[#D7E0FA] space-y-2 text-[11.5px]"
                        >
                          <div className="font-semibold text-[#3B49DF]">
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
                              className="h-6 px-2.5 rounded bg-[#3B49DF] text-white font-semibold"
                            >
                              Lưu cuộc gọi
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Nested Outbound Calls Directly Beneath Ticket (STT 41) */}
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
                                      className="text-[#3B49DF] shrink-0"
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

            {/* Manual Interactions Recorded for Customer (STT 37) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <span>Tương tác thủ công ({manualInteractions.length})</span>
                <button
                  type="button"
                  onClick={onOpenManualInteraction}
                  className="text-[#3B49DF] normal-case font-semibold hover:underline"
                >
                  + Tạo thủ công
                </button>
              </div>

              {manualInteractions.length === 0 ? (
                <div className="rounded-xl border border-[#E5E9F2] bg-white p-3 text-center text-[11.5px] text-slate-400">
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
                      <span className="text-[11px] font-semibold text-[#3B49DF]">
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
          </>
        )}
      </div>
    </aside>
  );
};
