import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  ChevronRight,
  Copy,
  FileText,
  Mail,
  Paperclip,
  Plus,
  Save,
  Tag,
  X,
} from 'lucide-react';
import {
  ChatSessionRecord,
  LinkedCustomerProfile,
  ManualInteractionItem,
  TicketContactItem,
  WORKCODE_OPTIONS,
} from '../data/chatSessionsData';

interface ChatTicketPanelProps {
  session: ChatSessionRecord;
  customer: LinkedCustomerProfile;
  tickets: TicketContactItem[];
  manualInteractions: ManualInteractionItem[];
  initialTicketCode?: string | null;
  onSaveTicket: (payload: {
    code: string;
    isNewDraft: boolean;
    status: string;
    priority: 'Cao' | 'Trung bình' | 'Thấp';
    workcode: string;
    unit: string;
    assignee: string;
    requestText: string;
    resolutionText: string;
    action: 'save' | 'save-close' | 'save-transfer';
  }) => string;
  onSaveCustomer: (patch: Partial<LinkedCustomerProfile>) => void;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

interface HistoricalTicketRow {
  code: string;
  workcode: string;
  dotColor: string;
  creator: string;
  assignee: string;
  group: 'Hiện tại' | 'Quá khứ';
  status: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  requestText?: string;
}

const SAMPLE_HISTORY_ROWS: HistoricalTicketRow[] = [
  {
    code: '26111200001',
    workcode: 'Thẻ > Xử lý nghiệp vụ > Khóa Thẻ',
    dotColor: 'bg-amber-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Đang xử lý',
    priority: 'Cao',
  },
  {
    code: '26111000022',
    workcode: 'Giao dịch > Tra soát > Tra soát giao dịch',
    dotColor: 'bg-slate-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Hoàn thành',
    priority: 'Trung bình',
  },
  {
    code: '26110900088',
    workcode: 'Ngân hàng điện tử > Xử lý nghiệp vụ > Khóa dịch vụ...',
    dotColor: 'bg-amber-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Đang xử lý',
    priority: 'Cao',
  },
  {
    code: '26110800015',
    workcode: 'Thẻ > Xử lý nghiệp vụ > Mở khóa Thẻ',
    dotColor: 'bg-amber-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Đang xử lý',
    priority: 'Trung bình',
  },
  {
    code: '26110500010',
    workcode: 'Thẻ > Xử lý nghiệp vụ > Mở khóa Thẻ',
    dotColor: 'bg-amber-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Hoàn thành',
    priority: 'Thấp',
  },
  {
    code: '26110500009',
    workcode: 'Giao dịch > Tra soát > Tra soát giao dịch',
    dotColor: 'bg-indigo-400',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Đang xử lý',
    priority: 'Trung bình',
  },
  {
    code: '26110500008',
    workcode: 'Khiếu nại > Khiếu nại dịch vụ',
    dotColor: 'bg-orange-500',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Đang xử lý',
    priority: 'Cao',
  },
  {
    code: '26110100037',
    workcode: 'Ngân hàng điện tử > Xử lý nghiệp vụ > Khóa dịch vụ...',
    dotColor: 'bg-emerald-500',
    creator: 'ba.tuann',
    assignee: 'ba.tuann',
    group: 'Quá khứ',
    status: 'Hoàn thành',
    priority: 'Trung bình',
  },
];

const TICKET_WORKCODES = [
  'Thẻ > Xử lý nghiệp vụ > Khóa Thẻ',
  'Giao dịch > Tra soát > Tra soát giao dịch',
  'Ngân hàng điện tử > Xử lý nghiệp vụ > Khóa dịch vụ Digibank',
  'Thẻ > Xử lý nghiệp vụ > Mở khóa Thẻ',
  'Khiếu nại > Khiếu nại dịch vụ',
  'Giao dịch > Trả góp > Đăng ký trả góp',
  ...WORKCODE_OPTIONS,
];

export const ChatTicketPanel: React.FC<ChatTicketPanelProps> = ({
  session,
  customer,
  tickets,
  manualInteractions,
  initialTicketCode,
  onSaveTicket,
  onSaveCustomer,
  onClose,
  onNotify,
}) => {
  // Left sub-pane tabs
  const [custTab, setCustTab] = useState<'info' | 'history' | 'products'>('info');
  // Right sub-pane tabs
  const [ticketTab, setTicketTab] = useState<'form' | 'audit' | 'activity' | 'exchange'>('form');

  // Customer editable fields
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email);
  const [idCard, setIdCard] = useState('038099000001');
  const [custName, setCustName] = useState(customer.name);
  const [gender, setGender] = useState('Nữ');
  const [dob, setDob] = useState('19/03/1995');
  const [segmentType, setSegmentType] = useState(customer.segment || 'NOR');
  const [address, setAddress] = useState(`${customer.branch || 'Thanh Trì, Hà Nội'}`);
  const [custNote, setCustNote] = useState(customer.relationNote || 'Khách hàng tiềm năng');
  const [tags, setTags] = useState<string[]>(['Khách hàng Cao cấp', 'Khách hàng tiềm năng']);
  const [wcPrioritySort, setWcPrioritySort] = useState(false);

  // Active ticket form fields
  const [selectedRowCode, setSelectedRowCode] = useState<string>(
    initialTicketCode || 'Draft-1'
  );
  const [ticketStatus, setTicketStatus] = useState('New');
  const [priority, setPriority] = useState<'Bình thường' | 'Cao' | 'Khẩn cấp'>(
    session.priority === 'urgent' ? 'Cao' : 'Bình thường'
  );
  const [workcode, setWorkcode] = useState(
    session.workcode || TICKET_WORKCODES[1]
  );
  const [unit, setUnit] = useState(`Inbound - ${customer.branch || 'VCB_Hà Nội'}`);
  const [assignee, setAssignee] = useState('ba.tuann');
  const [dueDate, setDueDate] = useState('27/11/2026 17:00');
  const [requestText, setRequestText] = useState(session.lastMessagePreview || '');
  const [resolutionText, setResolutionText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<
    { time: string; actor: string; detail: string }[]
  >([
    {
      time: session.startedAt,
      actor: 'ba.tuann',
      detail: `Khởi tạo phiếu Draft-1 từ phiên chat ${session.interactionCode} (${session.channelLabel})`,
    },
  ]);

  // Sync form when switching customer/session or opening specific ticket
  useEffect(() => {
    setPhone(customer.phone);
    setEmail(customer.email);
    setCustName(customer.name);
    setSegmentType(customer.segment || 'NOR');
    setAddress(customer.branch || 'Hà Nội');
    setCustNote(customer.relationNote || 'Khách hàng tiềm năng');
  }, [customer]);

  useEffect(() => {
    if (initialTicketCode) {
      const matched = tickets.find((t) => t.code === initialTicketCode);
      if (matched) {
        setSelectedRowCode(matched.code);
        setTicketStatus(matched.status);
        setPriority(matched.priority === 'Cao' ? 'Cao' : 'Bình thường');
        setRequestText(matched.subject);
        return;
      }
    }
    setSelectedRowCode('Draft-1');
    setTicketStatus('New');
    setPriority(session.priority === 'urgent' ? 'Cao' : 'Bình thường');
    setWorkcode(session.workcode || TICKET_WORKCODES[1]);
    setRequestText(session.lastMessagePreview || '');
  }, [initialTicketCode, session.id]);

  // Build combined ticket list: Draft-1 (if active) + customer's real tickets + sample past rows
  const combinedRows: HistoricalTicketRow[] = [
    ...(selectedRowCode === 'Draft-1'
      ? [
          {
            code: 'Draft-1',
            workcode: '—',
            dotColor: 'bg-slate-400',
            creator: 'ba.tuann',
            assignee: 'ba.tuann',
            group: 'Hiện tại' as const,
            status: 'New',
            priority: 'Trung bình' as const,
            requestText: session.lastMessagePreview,
          },
        ]
      : []),
    ...tickets.map((t, idx) => ({
      code: t.code,
      workcode: workcode || t.subject,
      dotColor: t.status === 'Hoàn thành' ? 'bg-emerald-500' : 'bg-amber-400',
      creator: 'ba.tuann',
      assignee: 'ba.tuann',
      group: (idx === 0 && selectedRowCode === t.code ? 'Hiện tại' : 'Quá khứ') as
        | 'Hiện tại'
        | 'Quá khứ',
      status: t.status,
      priority: t.priority,
      requestText: t.subject,
    })),
    ...SAMPLE_HISTORY_ROWS,
  ];

  const displayedRows = wcPrioritySort
    ? [...combinedRows].sort((a, b) =>
        a.priority === 'Cao' && b.priority !== 'Cao' ? -1 : 1
      )
    : combinedRows;

  const handleSelectRow = (row: HistoricalTicketRow) => {
    setSelectedRowCode(row.code);
    setTicketStatus(row.status);
    setPriority(row.priority === 'Cao' ? 'Cao' : 'Bình thường');
    if (row.workcode !== '—') {
      setWorkcode(row.workcode);
    }
    if (row.requestText) {
      setRequestText(row.requestText);
    }
    setTicketTab('form');
  };

  const handleCreateNewDraft = () => {
    setSelectedRowCode('Draft-1');
    setTicketStatus('New');
    setPriority(session.priority === 'urgent' ? 'Cao' : 'Bình thường');
    setWorkcode(session.workcode || TICKET_WORKCODES[1]);
    setRequestText(session.lastMessagePreview || '');
    setResolutionText('');
    setTicketTab('form');
    onNotify?.('Đã khởi tạo phiếu Draft-1 mới cho phiên chat hiện tại.');
  };

  const handleTriggerSave = (action: 'save' | 'save-close' | 'save-transfer') => {
    const mappedPriority: 'Cao' | 'Trung bình' | 'Thấp' =
      priority === 'Bình thường' ? 'Trung bình' : 'Cao';
    const nextStatus =
      action === 'save-close'
        ? 'Hoàn thành'
        : action === 'save-transfer'
        ? 'Chuyển CN xử lý'
        : ticketStatus === 'New'
        ? 'Đang xử lý'
        : ticketStatus;

    const savedCode = onSaveTicket({
      code: selectedRowCode,
      isNewDraft: selectedRowCode === 'Draft-1',
      status: nextStatus,
      priority: mappedPriority,
      workcode,
      unit,
      assignee,
      requestText: requestText.trim() || `Hỗ trợ ${customer.name} qua ${session.channelLabel}`,
      resolutionText: resolutionText.trim(),
      action,
    });

    setSelectedRowCode(savedCode);
    setTicketStatus(nextStatus);
    const now = new Date();
    const hm = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setAuditLogs((prev) => [
      {
        time: hm,
        actor: assignee,
        detail: `${
          action === 'save-transfer'
            ? 'Lưu & chuyển CN'
            : action === 'save-close'
            ? 'Lưu & Đóng phiếu'
            : 'Lưu phiếu'
        } ${savedCode} (${workcode})`,
      },
      ...prev,
    ]);
  };

  const handleSaveCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomer({
      name: custName.trim() || customer.name,
      phone: phone.trim() || customer.phone,
      email: email.trim() || customer.email,
      segment: segmentType,
      branch: address.trim() || customer.branch,
      relationNote: custNote.trim(),
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Top Contextual Bar showing docked Ticket Workspace while Chat stays open */}
      <div className="h-[42px] px-4 border-b border-[#E5E9F2] bg-[#FAFBFD] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#0F172A] whitespace-nowrap">
            <FileText size={14} className="text-[#F05A28]" />
            <span>Hồ sơ & Phiếu yêu cầu (Ticket)</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="font-mono text-[12px] font-semibold text-[#3B49DF] truncate">
            {selectedRowCode}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          title="Đóng màn hình Ticket để quay lại 3 cột mặc định"
        >
          <X size={13.5} />
          <span>Đóng Ticket</span>
        </button>
      </div>

      {/* 2-COLUMN TICKET & CUSTOMER SPLIT */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E9F2] overflow-hidden">
        {/* SUB-PANE 1: CUSTOMER INFO + DANH SÁCH PHIẾU YÊU CẦU */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white">
          {/* Sub-pane 1 Tab Header */}
          <div className="px-3.5 pt-2 border-b border-[#E5E9F2] flex items-center justify-between gap-2 shrink-0 bg-white">
            <div className="flex items-center gap-4 overflow-x-auto">
              {(
                [
                  { key: 'info', label: 'Thông tin khách hàng' },
                  { key: 'history', label: 'Lịch sử liên hệ' },
                  { key: 'products', label: 'Sản phẩm dịch vụ' },
                ] as const
              ).map((tab) => {
                const active = custTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCustTab(tab.key)}
                    className={`pb-2 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#F05A28] text-[#F05A28]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 pb-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCreateNewDraft}
                className="h-7 px-2.5 rounded-md bg-[#F05A28] hover:bg-[#DC4A1A] text-white text-[11.5px] font-semibold inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus size={12.5} />
                <span>Tạo Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(customer.cif).catch(() => {});
                  onNotify?.(`Đã sao chép Mã KH ${customer.cif}.`);
                }}
                className="h-7 w-7 rounded-md border border-[#DCE3EE] bg-[#0F3557] text-white hover:bg-[#174873] inline-flex items-center justify-center shrink-0"
                title="Sao chép Mã KH"
              >
                <Copy size={12.5} />
              </button>
            </div>
          </div>

          {/* Sub-pane 1 Scrollable Body */}
          <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 space-y-4">
            {custTab === 'info' && (
              <form onSubmit={handleSaveCustomerInfo} className="space-y-2.5 text-[12px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Số điện thoại <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white font-mono text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      CMND/CCCD/PP
                    </label>
                    <input
                      type="text"
                      value={idCard}
                      onChange={(e) => setIdCard(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-[#F8FAFC] font-mono text-[11.5px] text-slate-700 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Mã KH
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={customer.cif}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-[#F1F5F9] font-mono text-[11.5px] text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white text-[11.5px] font-medium text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Giới tính
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="Nữ">Nữ</option>
                      <option value="Nam">Nam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white font-mono text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Phân loại
                    </label>
                    <select
                      value={segmentType}
                      onChange={(e) => setSegmentType(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-[#DCE3EE] bg-white text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="NOR">NOR</option>
                      <option value="VIP · GOLD">VIP · GOLD</option>
                      <option value="Priority">Priority</option>
                      <option value="Chuẩn">Chuẩn</option>
                      <option value="SME Doanh nghiệp">SME Doanh nghiệp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-7 px-2.5 rounded border border-[#DCE3EE] bg-white text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    value={custNote}
                    onChange={(e) => setCustNote(e.target.value)}
                    className="w-full h-7 px-2.5 rounded border border-[#DCE3EE] bg-white text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Thẻ
                  </label>
                  <div className="min-h-[30px] px-2 py-1 rounded border border-[#DCE3EE] bg-white flex flex-wrap items-center gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] text-slate-700"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setTags((prev) => prev.filter((x) => x !== tag))
                          }
                          className="text-slate-400 hover:text-slate-700"
                        >
                          ×
                        </button>
                        <span>{tag}</span>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextTag =
                          tags.includes('VIP') ? 'Ưu tiên xử lý' : 'VIP';
                        if (!tags.includes(nextTag)) {
                          setTags((prev) => [...prev, nextTag]);
                        }
                      }}
                      className="text-[11px] text-[#3B49DF] hover:underline inline-flex items-center gap-0.5 px-1"
                    >
                      <Tag size={10.5} />
                      <span>+ Thẻ</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      onNotify?.(
                        `Hồ sơ đầy đủ của ${custName} · CIF ${customer.cif} · SenderID ${session.senderId}`
                      )
                    }
                    className="text-[11.5px] font-medium text-[#2563EB] hover:underline"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    type="submit"
                    className="h-7 px-3 rounded-md bg-[#F05A28] hover:bg-[#DC4A1A] text-white text-[11.5px] font-semibold inline-flex items-center gap-1"
                  >
                    <Save size={12} />
                    <span>Lưu</span>
                  </button>
                </div>
              </form>
            )}

            {custTab === 'history' && (
              <div className="space-y-2 text-[12px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ticket & Cuộc gọi đi ({tickets.length}) · Thủ công ({manualInteractions.length})
                </div>
                {tickets.map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() =>
                      handleSelectRow({
                        code: t.code,
                        workcode: workcode,
                        dotColor: 'bg-amber-400',
                        creator: 'ba.tuann',
                        assignee: 'ba.tuann',
                        group: 'Quá khứ',
                        status: t.status,
                        priority: t.priority,
                        requestText: t.subject,
                      })
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-[#E5E9F2] hover:border-[#3B49DF] bg-[#FAFBFD] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3B49DF]">
                        {t.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {t.createdAt} · {t.outboundCalls.length} cuộc gọi đi
                    </div>
                  </button>
                ))}
              </div>
            )}

            {custTab === 'products' && (
              <div className="space-y-2 text-[12px]">
                {[
                  {
                    name: 'Tài khoản thanh toán VCB Priority',
                    number: '1019 4820 •••• 91',
                    status: 'Đang hoạt động',
                  },
                  {
                    name: 'Thẻ tín dụng Visa Signature',
                    number: '4283 •••• •••• 7741',
                    status: 'Đang hoạt động',
                  },
                  {
                    name: 'Ứng dụng VCB Digibank / Smart OTP',
                    number: `CIF ${customer.cif}`,
                    status: 'Đã kích hoạt',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-lg border border-[#E5E9F2] bg-[#FAFBFD] flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {item.number}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#16A34A] whitespace-nowrap">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* DANH SÁCH PHIẾU YÊU CẦU */}
            <div className="pt-2 border-t border-[#E5E9F2] space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11.5px] font-bold text-[#F05A28] uppercase tracking-wide">
                  DANH SÁCH PHIẾU YÊU CẦU{' '}
                  <span className="text-slate-500 font-normal normal-case">
                    (10 gần nhất + Ticket phiên này)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWcPrioritySort((p) => !p)}
                  className={`h-6 px-2 rounded border text-[11px] font-medium transition-colors whitespace-nowrap ${
                    wcPrioritySort
                      ? 'border-[#F05A28] bg-[#FFF5F0] text-[#F05A28]'
                      : 'border-[#F6B296] bg-white text-[#F05A28] hover:bg-[#FFF5F0]'
                  }`}
                >
                  WC by Priority
                </button>
              </div>

              <div className="border border-[#E5E9F2] rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E5E9F2] text-slate-600">
                      <th className="py-1.5 px-2 w-7" />
                      <th className="py-1.5 px-2 font-semibold whitespace-nowrap">
                        Mã ticket
                      </th>
                      <th className="py-1.5 px-2 font-semibold">Workcode</th>
                      <th className="py-1.5 px-2 font-semibold whitespace-nowrap">
                        Trạng thái
                      </th>
                      <th className="py-1.5 px-2 font-semibold whitespace-nowrap">
                        Người xử lý
                      </th>
                      <th className="py-1.5 px-2 font-semibold whitespace-nowrap">
                        Nhóm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {displayedRows.map((row) => {
                      const active = selectedRowCode === row.code;
                      return (
                        <tr
                          key={row.code}
                          onClick={() => handleSelectRow(row)}
                          className={`cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#EAF3FF]'
                              : 'bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="py-1.5 px-2">
                            <span className="w-4 h-4 rounded-full bg-[#F05A28] text-white text-[9.5px] font-bold inline-flex items-center justify-center">
                              i
                            </span>
                          </td>
                          <td className="py-1.5 px-2 font-mono font-semibold text-[#2563EB] hover:underline whitespace-nowrap">
                            {row.code}
                          </td>
                          <td className="py-1.5 px-2 text-slate-700 max-w-[140px] truncate">
                            {row.workcode}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${row.dotColor}`}
                              title={row.status}
                            />
                          </td>
                          <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                            {row.assignee}
                          </td>
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            {row.group === 'Hiện tại' ? (
                              <span className="px-1.5 py-0.5 rounded bg-white border border-[#DCE3EE] text-[10px] font-semibold text-slate-700">
                                Hiện tại
                              </span>
                            ) : (
                              <span className="text-[10.5px] text-slate-400">
                                Quá khứ
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-PANE 2: PHIẾU YÊU CẦU FORM */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white">
          {/* Sub-pane 2 Tab Header */}
          <div className="px-3.5 pt-2 border-b border-[#E5E9F2] flex items-center justify-between gap-2 shrink-0 bg-white">
            <div className="flex items-center gap-4 overflow-x-auto">
              {(
                [
                  { key: 'form', label: 'Phiếu yêu cầu' },
                  { key: 'audit', label: 'LS chỉnh sửa' },
                  { key: 'activity', label: 'Hoạt động' },
                  { key: 'exchange', label: 'Trao đổi' },
                ] as const
              ).map((tab) => {
                const active = ticketTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTicketTab(tab.key)}
                    className={`pb-2 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#F05A28] text-[#F05A28]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mb-1.5 w-6 h-6 rounded bg-[#F05A28] hover:bg-[#DC4A1A] text-white inline-flex items-center justify-center shrink-0"
              title="Thu gọn phiếu yêu cầu"
              aria-label="Thu gọn phiếu yêu cầu"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Sub-pane 2 Body */}
          {ticketTab === 'form' ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 space-y-2.5 text-[12px]">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={ticketStatus}
                      onChange={(e) => setTicketStatus(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="New">New</option>
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Chờ phản hồi">Chờ phản hồi</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Mức độ ưu tiên
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(
                          e.target.value as 'Bình thường' | 'Cao' | 'Khẩn cấp'
                        )
                      }
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="Bình thường">Bình thường</option>
                      <option value="Cao">Cao</option>
                      <option value="Khẩn cấp">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Workcode <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={workcode}
                    onChange={(e) => setWorkcode(e.target.value)}
                    className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  >
                    {TICKET_WORKCODES.map((wc) => (
                      <option key={wc} value={wc}>
                        {wc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Đơn vị xử lý
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="Inbound - VCB_Hà Nội">Inbound - VCB_Hà Nội</option>
                      <option value="Inbound - CN TP.HCM">Inbound - CN TP.HCM</option>
                      <option value="Inbound - CN Đà Nẵng">Inbound - CN Đà Nẵng</option>
                      <option value="Phòng Thẻ & Tín dụng">Phòng Thẻ & Tín dụng</option>
                      <option value="Trung tâm Tra soát 24/7">
                        Trung tâm Tra soát 24/7
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Người xử lý
                    </label>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    >
                      <option value="ba.tuann">ba.tuann</option>
                      <option value="linhln">linhln</option>
                      <option value="minhduc">minhduc</option>
                      <option value="thuphuong">thuphuong</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-white font-mono text-[11.5px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Đơn vị phụ trách hiện tại
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="VCC"
                      className="w-full h-8 px-2.5 rounded border border-[#DCE3EE] bg-[#F1F5F9] text-[12px] font-medium text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Yêu cầu
                  </label>
                  <textarea
                    rows={3}
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Nhập tóm tắt yêu cầu của khách hàng từ phiên chat..."
                    className="w-full p-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Nội dung xử lý
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Nhập hướng dẫn hoặc kết quả xử lý..."
                    className="w-full p-2.5 rounded border border-[#DCE3EE] bg-white text-[12px] text-slate-800 focus:outline-none focus:border-[#3B49DF]"
                  />
                </div>

                <div className="pt-0.5 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const file = `Chung_tu_giao_dich_${session.interactionCode}.pdf`;
                      if (!attachments.includes(file)) {
                        setAttachments((prev) => [...prev, file]);
                      }
                      onNotify?.(`Đã đính kèm tệp ${file} vào phiếu yêu cầu.`);
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1E293B] hover:text-[#F05A28]"
                  >
                    <span>Chọn tệp đính kèm</span>
                    <Paperclip size={13} />
                  </button>

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {attachments.map((file) => (
                        <span
                          key={file}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F4F5FC] border border-[#D7E0FA] text-[11px] text-[#3B49DF]"
                        >
                          <span>{file}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((prev) => prev.filter((f) => f !== file))
                            }
                            className="text-slate-400 hover:text-slate-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Form Bottom Action Bar */}
              <div className="px-3.5 py-2.5 border-t border-[#E5E9F2] bg-[#FAFBFD] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onNotify?.(
                        `Đã đặt lịch gọi lại cho ${customer.name} (${phone}) từ phiếu ${selectedRowCode}.`
                      )
                    }
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-slate-50 text-[11.5px] font-medium text-slate-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <CalendarClock size={12.5} className="text-slate-500" />
                    <span>Đặt lịch gọi lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNotify?.(
                        `Đã mở soạn Email gửi ${email} đính kèm phiếu ${selectedRowCode}.`
                      )
                    }
                    className="h-7 px-2.5 rounded-md border border-[#DCE3EE] bg-white hover:bg-slate-50 text-[11.5px] font-medium text-slate-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <Mail size={12.5} className="text-slate-500" />
                    <span>Gửi Email</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTriggerSave('save')}
                    className="h-7 px-2.5 rounded-md bg-[#F05A28] hover:bg-[#DC4A1A] text-white text-[11.5px] font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <Save size={12} />
                    <span>Lưu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerSave('save-close')}
                    className="h-7 px-2.5 rounded-md bg-[#F05A28] hover:bg-[#DC4A1A] text-white text-[11.5px] font-semibold whitespace-nowrap"
                  >
                    Lưu & Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerSave('save-transfer')}
                    className="h-7 px-2.5 rounded-md bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11.5px] font-semibold whitespace-nowrap"
                  >
                    Lưu & chuyển CN
                  </button>
                </div>
              </div>
            </div>
          ) : ticketTab === 'audit' ? (
            <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 space-y-2 text-[12px]">
              {auditLogs.map((log, i) => (
                <div
                  key={`${log.time}-${i}`}
                  className="p-2.5 rounded-lg border border-[#E5E9F2] bg-[#FAFBFD] space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{log.actor}</span>
                    <span className="font-mono tabular-nums">{log.time}</span>
                  </div>
                  <div className="text-slate-700">{log.detail}</div>
                </div>
              ))}
            </div>
          ) : ticketTab === 'activity' ? (
            <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 text-[12px] text-slate-600 space-y-2">
              <div className="p-3 rounded-lg border border-[#E5E9F2] bg-[#FAFBFD]">
                <div className="font-semibold text-slate-800">
                  Liên kết trực tiếp với phiên chat {session.interactionCode}
                </div>
                <p className="mt-1 text-[11.5px] text-slate-500">
                  Khung chat bên trái luôn mở song song để Agent tiếp tục trao đổi và giữ kết nối liên tục với khách hàng trong khi xử lý phiếu.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto sidebar-scroll p-3.5 text-[12px] text-slate-500">
              Chưa có trao đổi nội bộ nào trên phiếu {selectedRowCode}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
