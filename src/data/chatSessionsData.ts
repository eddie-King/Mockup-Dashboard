export type ChatChannelType = 'digiweb' | 'digibank' | 'zalo' | 'facebook';

export type SessionLifecycleStatus =
  | 'new'
  | 'assigned'
  | 'accepted'
  | 'completed';

export type SessionPriority = 'urgent' | 'normal';

export type CompletionOutcome =
  | 'Đã xử lý qua Chat'
  | 'Đã gọi cho khách hàng'
  | 'Đã gọi – khách không nghe máy';

export type ChatMessageSender =
  | 'system'
  | 'routing'
  | 'bot'
  | 'customer'
  | 'agent'
  | 'session-divider';

export interface ChatTimelineMessage {
  id: string;
  sender: ChatMessageSender;
  senderLabel?: string;
  /** Explicit role badge for Bot / Customer / Agent clarity (STT 31) */
  roleTag?: 'KHÁCH HÀNG' | 'BOT' | 'AGENT';
  /** Absolute timestamp HH:mm only (no relative time strings per STT 38) */
  time: string;
  text: string;
  attachment?: string;
  /** Metadata for session-divider (STT 42) */
  previousSessionCode?: string;
  completedByAgent?: string;
  completedOutcome?: string;
  dividerSenderId?: string;
}

export interface LinkedCustomerProfile {
  id: string;
  cif: string;
  name: string;
  phone: string;
  email: string;
  segment: string;
  branch: string;
  relationNote?: string;
}

export interface OutboundCallRecord {
  id: string;
  callCode: string;
  agentName: string;
  calledAt: string;
  durationText: string;
  result: 'Kết nối thành công' | 'Khách không nghe máy' | 'Máy bận';
  note: string;
}

export interface TicketContactItem {
  code: string;
  subject: string;
  channel: string;
  createdAt: string;
  status: 'Đang xử lý' | 'Hoàn thành' | 'Chờ xác minh';
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  outboundCalls: OutboundCallRecord[];
}

export interface ManualInteractionItem {
  id: string;
  code: string;
  channel: 'Call' | 'Email' | 'Chat';
  customerId: string;
  customerName: string;
  senderId: string;
  workcode: string;
  createdAt: string;
  agentName: string;
  note: string;
}

export interface ChatSessionRecord {
  id: string;
  interactionCode: string;
  senderId: string;
  channel: ChatChannelType;
  channelLabel: string;
  botSource: 'Chatbot Digibank' | 'Bot FPT → CSM' | 'Bot Digiweb';
  priority: SessionPriority;
  lifecycleStatus: SessionLifecycleStatus;
  completionOutcome?: CompletionOutcome;
  completedByAgent?: string;
  startedAt: string;
  lastMessageTime: string;
  lastMessagePreview: string;
  subStatusText?: string;
  unreadCount: number;
  queueName: string;
  initials: string;
  avatarTone: 'navy' | 'indigo' | 'slate' | 'teal' | 'violet';
  /** Multiple customers linked to a single SenderID (STT 37) */
  linkedCustomers: LinkedCustomerProfile[];
  activeCustomerId: string;
  isUnmapped?: boolean;
  /** SLA tracking calculated from customer's last message (STT 38) */
  slaLimitSec: number;
  /** Seconds elapsed since customer's last message (0 if agent already replied) */
  customerWaitSec: number;
  /** Total conversation duration in seconds */
  durationSec: number;
  /** Assigned/invite fields */
  inviteType?: 'new' | 'transfer';
  transferFrom?: string;
  handoverNote?: string;
  inviteTotalSec?: number;
  inviteRemainingSec?: number;
  /** Interaction metadata */
  workcode?: string;
  interactionNote?: string;
  messages: ChatTimelineMessage[];
}

export interface QuickReplyTemplate {
  id: string;
  shortcut: string;
  title: string;
  category: string;
  content: string;
}

export const MAX_CONCURRENT_SESSIONS = 10;

export const CHANNEL_META: Record<
  ChatChannelType,
  { label: string; shortLabel: string; bg: string; badgeText: string }
> = {
  digiweb: {
    label: 'Digiweb / Web VCB',
    shortLabel: 'Digiweb',
    bg: 'bg-[#0D9488]',
    badgeText: 'W',
  },
  digibank: {
    label: 'Digibank Chatbot',
    shortLabel: 'Digibank',
    bg: 'bg-[#16A34A]',
    badgeText: 'DB',
  },
  zalo: {
    label: 'Zalo OA (Bot FPT)',
    shortLabel: 'Zalo OA',
    bg: 'bg-[#0068FF]',
    badgeText: 'Z',
  },
  facebook: {
    label: 'Facebook (Bot FPT)',
    shortLabel: 'Facebook',
    bg: 'bg-[#1877F2]',
    badgeText: 'f',
  },
};

export const LIFECYCLE_LABELS: Record<SessionLifecycleStatus, string> = {
  new: 'Mới',
  assigned: 'Đã phân công',
  accepted: 'Đã tiếp nhận',
  completed: 'Hoàn thành',
};

export const COMPLETION_OUTCOMES: CompletionOutcome[] = [
  'Đã xử lý qua Chat',
  'Đã gọi cho khách hàng',
  'Đã gọi – khách không nghe máy',
];

export const QUICK_REPLY_TEMPLATES: QuickReplyTemplate[] = [
  {
    id: 'qr-1',
    shortcut: '/chao',
    title: 'Chào khách hàng & tiếp nhận từ Bot',
    category: 'Chào hỏi',
    content:
      'Dạ em chào anh/chị, em là chuyên viên hỗ trợ của VCB Contact Center. Em đã xem toàn bộ nội dung anh/chị trao đổi với trợ lý ảo và đang kiểm tra xử lý ngay cho mình ạ.',
  },
  {
    id: 'qr-2',
    shortcut: '/trasoat',
    title: 'Xin mã giao dịch tra soát chuyển khoản',
    category: 'Tài chính',
    content:
      'Dạ anh/chị vui lòng xác nhận giúp em mã giao dịch, thời gian chuyển khoản và ngân hàng thụ hưởng để em lập yêu cầu tra soát ngay ạ.',
  },
  {
    id: 'qr-3',
    shortcut: '/khoathe',
    title: 'Xác nhận khóa thẻ khẩn cấp',
    category: 'Khẩn cấp',
    content:
      'Dạ để đảm bảo an toàn tài khoản, em đã ưu tiên kiểm tra trạng thái thẻ của anh/chị. Anh/chị xác nhận khóa tạm thời 4 số cuối thẻ ngay lúc này nhé ạ.',
  },
  {
    id: 'qr-4',
    shortcut: '/dinhky',
    title: 'Xác nhận hủy lệnh chuyển tiền định kỳ',
    category: 'Tài chính',
    content:
      'Dạ em đã kiểm tra hồ sơ xác thực SĐT của anh/chị. Để hoàn tất hủy lệnh chuyển tiền định kỳ, anh/chị vui lòng nhập mã OTP vừa được gửi về số điện thoại đăng ký ạ.',
  },
  {
    id: 'qr-5',
    shortcut: '/ketthuc',
    title: 'Cảm ơn & hoàn thành phiên',
    category: 'Hoàn thành',
    content:
      'Dạ yêu cầu của anh/chị đã được ghi nhận và xử lý hoàn tất. Cảm ơn anh/chị đã sử dụng dịch vụ, chúc anh/chị một ngày tốt lành ạ!',
  },
];

export const TRANSFER_TARGETS = [
  { id: 'q-khancap', label: 'Hàng đợi Hỗ trợ Khẩn cấp (Khóa thẻ / Gian lận)', type: 'Hàng đợi' },
  { id: 'q-taichinh', label: 'Hàng đợi Tài chính · Chuyển khoản', type: 'Hàng đợi' },
  { id: 'q-the', label: 'Hàng đợi Thẻ & Tín dụng', type: 'Hàng đợi' },
  { id: 'q-digibank', label: 'Hàng đợi Hỗ trợ Digibank / Digiweb', type: 'Hàng đợi' },
  { id: 'ag-minhduc', label: 'Trần Minh Đức (Chuyên viên Tài chính)', type: 'Agent' },
  { id: 'ag-thuphuong', label: 'Nguyễn Thu Phương (Chuyên viên Thẻ)', type: 'Agent' },
];

export const WORKCODE_OPTIONS = [
  'Khóa thẻ khẩn cấp / Nghi ngờ gian lận',
  'Tra soát chuyển khoản nhanh 24/7',
  'Hủy lệnh chuyển tiền định kỳ',
  'Yêu cầu nâng hạng thẻ tín dụng',
  'Lỗi đăng nhập / Smart OTP Digibank',
  'Tư vấn mở tài khoản & gói dịch vụ Digiweb',
];

export const INITIAL_TICKETS_BY_CUSTOMER: Record<string, TicketContactItem[]> = {
  'cust-kl-1': [
    {
      code: 'TK-2611081',
      subject: 'Tra soát giao dịch chuyển khoản liên ngân hàng 5.000.000đ',
      channel: 'Zalo OA',
      createdAt: '09/11/2026 16:20',
      status: 'Đang xử lý',
      priority: 'Cao',
      outboundCalls: [
        {
          id: 'ob-101',
          callCode: 'OB-99412',
          agentName: 'Nguyễn Thu Phương',
          calledAt: '10/11/2026 09:15',
          durationText: '00:00',
          result: 'Khách không nghe máy',
          note: 'Gọi báo tiến độ tra soát Napas lần 1, khách không nhấc máy.',
        },
        {
          id: 'ob-102',
          callCode: 'OB-99458',
          agentName: 'Trần Minh Đức',
          calledAt: '10/11/2026 11:05',
          durationText: '03:42',
          result: 'Kết nối thành công',
          note: 'Đã xác nhận mã giao dịch FT250909-8827 và thông báo dự kiến hoàn tiền trong 24h.',
        },
      ],
    },
    {
      code: 'TK-2610944',
      subject: 'Yêu cầu gia hạn thẻ Visa Signature VIP Gold',
      channel: 'Digibank',
      createdAt: '02/11/2026 10:12',
      status: 'Hoàn thành',
      priority: 'Trung bình',
      outboundCalls: [
        {
          id: 'ob-103',
          callCode: 'OB-98104',
          agentName: 'Lê Thị Ngọc Linh',
          calledAt: '03/11/2026 14:30',
          durationText: '02:18',
          result: 'Kết nối thành công',
          note: 'Xác nhận địa chỉ giao thẻ mới về CN Hà Nội.',
        },
      ],
    },
  ],
  'cust-kl-2': [
    {
      code: 'TK-2611022',
      subject: 'Hỗ trợ kích hoạt chữ ký số doanh nghiệp Digibiz',
      channel: 'Digiweb',
      createdAt: '05/11/2026 08:40',
      status: 'Hoàn thành',
      priority: 'Trung bình',
      outboundCalls: [
        {
          id: 'ob-201',
          callCode: 'OB-98901',
          agentName: 'Vũ Trung Kiên',
          calledAt: '05/11/2026 09:20',
          durationText: '05:11',
          result: 'Kết nối thành công',
          note: 'Hướng dẫn kế toán công ty cài đặt USB Token thành công.',
        },
      ],
    },
  ],
  'cust-mt-1': [
    {
      code: 'TK-2611104',
      subject: 'Cảnh báo giao dịch lạ qua cổng thanh toán quốc tế',
      channel: 'Digibank',
      createdAt: '10/11/2026 14:10',
      status: 'Đang xử lý',
      priority: 'Cao',
      outboundCalls: [
        {
          id: 'ob-301',
          callCode: 'OB-99601',
          agentName: 'ba.tuann',
          calledAt: '10/11/2026 14:25',
          durationText: '00:00',
          result: 'Máy bận',
          note: 'Gọi xác minh giao dịch thẻ khẩn cấp, thuê bao báo bận.',
        },
      ],
    },
  ],
  'cust-cl-1': [
    {
      code: 'TK-2610889',
      subject: 'Mở khóa truy cập Digibank do nhập sai mật khẩu',
      channel: 'Facebook',
      createdAt: '08/11/2026 15:02',
      status: 'Hoàn thành',
      priority: 'Thấp',
      outboundCalls: [],
    },
  ],
};

export const INITIAL_MANUAL_INTERACTIONS: ManualInteractionItem[] = [
  {
    id: 'man-1',
    code: 'MN-2611004',
    channel: 'Call',
    customerId: 'cust-kl-1',
    customerName: 'Trần Khánh Linh',
    senderId: 'zalo_uid_9948271',
    workcode: 'Tra soát chuyển khoản nhanh 24/7',
    createdAt: '10/11/2026 11:08',
    agentName: 'ba.tuann',
    note: 'Tạo tương tác thủ công bổ sung sau cuộc gọi xác minh không bật screen-pop.',
  },
];

export const INITIAL_CHAT_SESSIONS: ChatSessionRecord[] = [
  // 1 NEW SESSION (Hàng đợi chung - chưa phân công)
  {
    id: 'chat-new-1',
    interactionCode: 'IN-2611195',
    senderId: 'digiweb_sid_84210',
    channel: 'digiweb',
    channelLabel: 'Digiweb / Web VCB',
    botSource: 'Bot Digiweb',
    priority: 'urgent',
    lifecycleStatus: 'new',
    startedAt: '14:48',
    lastMessageTime: '14:48',
    lastMessagePreview: 'Mình bị mất điện thoại, cần khóa khẩn cấp Digibank ngay!',
    unreadCount: 2,
    queueName: 'Hỗ trợ Khẩn cấp',
    initials: 'QH',
    avatarTone: 'navy',
    linkedCustomers: [
      {
        id: 'cust-qh-new',
        cif: '00419283',
        name: 'Đặng Quốc Hùng',
        phone: '0918 552 390',
        email: 'hung.dangquoc@gmail.com',
        segment: 'Priority',
        branch: 'CN TP.HCM',
      },
    ],
    activeCustomerId: 'cust-qh-new',
    slaLimitSec: 180,
    customerWaitSec: 65,
    durationSec: 75,
    workcode: 'Khóa thẻ khẩn cấp / Nghi ngờ gian lận',
    messages: [
      {
        id: 'm-new1-1',
        sender: 'system',
        time: '14:47',
        text: 'Phiên mới vào hàng đợi chung từ Digiweb / Web VCB · Ưu tiên: Hỗ trợ khẩn cấp',
      },
      {
        id: 'm-new1-2',
        sender: 'bot',
        senderLabel: 'BOT DIGIWEB',
        roleTag: 'BOT',
        time: '14:47',
        text: 'Xin chào Quý khách! Trợ lý ảo VCB Digiweb có thể hỗ trợ gì cho Quý khách hôm nay?',
      },
      {
        id: 'm-new1-3',
        sender: 'customer',
        senderLabel: 'ĐẶNG QUỐC HÙNG',
        roleTag: 'KHÁCH HÀNG',
        time: '14:48',
        text: 'Mình vừa bị rơi mất điện thoại, cần khóa khẩn cấp tài khoản Digibank và thẻ ghi nợ ngay lập tức!',
      },
      {
        id: 'm-new1-4',
        sender: 'bot',
        senderLabel: 'BOT DIGIWEB',
        roleTag: 'BOT',
        time: '14:48',
        text: 'Hệ thống nhận diện yêu cầu KHẨN CẤP (Khóa tài khoản / thẻ). Đang đưa phiên vào đầu hàng đợi ưu tiên để kết nối chuyên viên ngay.',
      },
    ],
  },

  // 2 ASSIGNED SESSIONS (Đã phân công - Mời nhận)
  {
    id: 'chat-asg-1',
    interactionCode: 'IN-2611188',
    senderId: 'fb_psid_3019284',
    channel: 'facebook',
    channelLabel: 'Facebook (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'assigned',
    startedAt: '14:46',
    lastMessageTime: '14:47',
    lastMessagePreview: 'Mình muốn nâng hạng thẻ tín dụng lên Platinum',
    unreadCount: 1,
    queueName: 'Thẻ',
    initials: 'TT',
    avatarTone: 'indigo',
    linkedCustomers: [
      {
        id: 'cust-tt-1',
        cif: '00338219',
        name: 'Lý Thanh Trúc',
        phone: '0908 441 290',
        email: 'truc.lythanh@gmail.com',
        segment: 'Chuẩn',
        branch: 'CN TP.HCM',
      },
    ],
    activeCustomerId: 'cust-tt-1',
    slaLimitSec: 300,
    customerWaitSec: 52,
    durationSec: 88,
    inviteType: 'new',
    inviteTotalSec: 30,
    inviteRemainingSec: 18,
    workcode: 'Yêu cầu nâng hạng thẻ tín dụng',
    messages: [
      {
        id: 'm-asg1-1',
        sender: 'system',
        time: '14:46',
        text: 'Phiên bắt đầu qua Facebook Messenger · Bot FPT tiếp nhận và chuyển CSM',
      },
      {
        id: 'm-asg1-2',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:46',
        text: 'Chào anh/chị, em là trợ lý ảo VCB trên Facebook. Anh/chị cần tư vấn về sản phẩm thẻ, tài khoản hay giao dịch ạ?',
      },
      {
        id: 'm-asg1-3',
        sender: 'customer',
        senderLabel: 'LÝ THANH TRÚC',
        roleTag: 'KHÁCH HÀNG',
        time: '14:47',
        text: 'Mình muốn nâng hạng thẻ tín dụng từ Classic lên Platinum thì cần điều kiện thu nhập thế nào ạ?',
      },
      {
        id: 'm-asg1-4',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:47',
        text: 'Em đã ghi nhận nhu cầu nâng hạng thẻ (Hỗ trợ khác) và chuyển toàn bộ hội thoại sang chuyên viên Thẻ hỗ trợ anh/chị ngay ạ.',
      },
    ],
  },
  {
    id: 'chat-asg-2',
    interactionCode: 'IN-2611179',
    senderId: 'zalo_uid_6620194',
    channel: 'zalo',
    channelLabel: 'Zalo OA (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'urgent',
    lifecycleStatus: 'assigned',
    startedAt: '14:41',
    lastMessageTime: '14:46',
    lastMessagePreview: 'Em cần hủy lệnh chuyển tiền định kỳ hôm nay',
    unreadCount: 2,
    queueName: 'Tài chính',
    initials: 'HY',
    avatarTone: 'violet',
    linkedCustomers: [
      {
        id: 'cust-hy-1',
        cif: '00291045',
        name: 'Võ Hoàng Yến',
        phone: '0932 718 554',
        email: 'yen.vohoang@outlook.com',
        segment: 'Priority',
        branch: 'CN Hà Nội',
      },
    ],
    activeCustomerId: 'cust-hy-1',
    slaLimitSec: 180,
    customerWaitSec: 135,
    durationSec: 312,
    inviteType: 'transfer',
    transferFrom: 'NGUYỄN THU PHƯƠNG',
    handoverNote:
      'KH cần hủy lệnh định kỳ trước giờ cắt sổ 15:00, em không có quyền nghiệp vụ này. Đã xác thực SĐT.',
    inviteTotalSec: 30,
    inviteRemainingSec: 22,
    workcode: 'Hủy lệnh chuyển tiền định kỳ',
    messages: [
      {
        id: 'm-asg2-1',
        sender: 'system',
        time: '14:41',
        text: 'Phiên bắt đầu qua Zalo OA · Bot FPT chuyển tiếp sang CSM',
      },
      {
        id: 'm-asg2-2',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:41',
        text: 'Xin chào Quý khách trên Zalo OA VCB. Quý khách cần hỗ trợ nghiệp vụ nào ạ?',
      },
      {
        id: 'm-asg2-3',
        sender: 'customer',
        senderLabel: 'VÕ HOÀNG YẾN',
        roleTag: 'KHÁCH HÀNG',
        time: '14:42',
        text: 'Em cần hủy lệnh chuyển tiền định kỳ ngày 10 hàng tháng gấp trước 15h hôm nay ạ.',
      },
      {
        id: 'm-asg2-4',
        sender: 'agent',
        senderLabel: 'NGUYỄN THU PHƯƠNG',
        roleTag: 'AGENT',
        time: '14:44',
        text: 'Dạ em đã xác thực SĐT thành công. Em xin phép chuyển phiên gấp sang chuyên viên Tài chính để hỗ trợ chị hủy lệnh ngay ạ.',
      },
      {
        id: 'm-asg2-5',
        sender: 'routing',
        time: '14:46',
        text: 'Nguyễn Thu Phương chuyển phiên → hàng đợi Tài chính (Ưu tiên: Hỗ trợ khẩn cấp)',
      },
    ],
  },

  // 3 ACCEPTED SESSIONS (Đã tiếp nhận - Đang xử lý)
  {
    id: 'chat-act-2',
    interactionCode: 'IN-2611172',
    senderId: 'zalo_uid_9948271',
    channel: 'zalo',
    channelLabel: 'Zalo OA (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'urgent',
    lifecycleStatus: 'accepted',
    startedAt: '14:39',
    lastMessageTime: '14:45',
    lastMessagePreview: 'Mã giao dịch là FT250909-8827 ạ, STK 19034452819011',
    unreadCount: 0,
    queueName: 'Tài chính',
    initials: 'KL',
    avatarTone: 'navy',
    // 1 SenderID linked to 2 customer profiles (STT 37)
    linkedCustomers: [
      {
        id: 'cust-kl-1',
        cif: '00192844',
        name: 'Trần Khánh Linh',
        phone: '0912 884 510',
        email: 'khanhlinh.tran@vngroup.vn',
        segment: 'VIP · GOLD',
        branch: 'CN Hà Nội',
        relationNote: 'Chủ tài khoản cá nhân chính',
      },
      {
        id: 'cust-kl-2',
        cif: '00881209',
        name: 'Công ty TNHH Minh Khang',
        phone: '024 3884 5100',
        email: 'ketoan@minhkhang.vn',
        segment: 'SME Doanh nghiệp',
        branch: 'CN Hà Nội',
        relationNote: 'Cùng SenderID Zalo người đại diện pháp luật',
      },
    ],
    activeCustomerId: 'cust-kl-1',
    slaLimitSec: 300, // 5m SLA
    customerWaitSec: 252, // 04:12 elapsed -> 00:48 left (Amber Warning!)
    durationSec: 806,
    workcode: 'Tra soát chuyển khoản nhanh 24/7',
    interactionNote:
      'Khách VIP Gold phản ánh giao dịch 5.000.000đ ngày 09/11 chưa ghi có.',
    messages: [
      // Previous session in same conversation thread (demonstrates Session Divider STT 42)
      {
        id: 'm-act2-prev1',
        sender: 'customer',
        senderLabel: 'TRẦN KHÁNH LINH',
        roleTag: 'KHÁCH HÀNG',
        time: '10:12',
        text: 'Em kiểm tra giúp chị hạn mức chuyển khoản online gói VIP Gold nhé.',
      },
      {
        id: 'm-act2-prev2',
        sender: 'agent',
        senderLabel: 'NGUYỄN THU PHƯƠNG',
        roleTag: 'AGENT',
        time: '10:16',
        text: 'Dạ hạn mức chuyển khoản của chị hiện là 3 tỷ/ngày trên Digibank ạ. Chị cần điều chỉnh thêm không ạ?',
      },
      {
        id: 'm-act2-div1',
        sender: 'session-divider',
        time: '10:18',
        text: 'Kết thúc phiên trước',
        previousSessionCode: 'IN-2611098',
        completedByAgent: 'Nguyễn Thu Phương',
        completedOutcome: 'Đã xử lý qua Chat',
        dividerSenderId: 'zalo_uid_9948271',
      },
      // Current session with full Bot ↔ Customer transcript (STT 31)
      {
        id: 'm-act2-1',
        sender: 'system',
        time: '14:39',
        text: 'Phiên mới bắt đầu qua Zalo OA · Bot FPT tiếp nhận trước khi bàn giao CSM',
      },
      {
        id: 'm-act2-2',
        sender: 'bot',
        senderLabel: 'BOT FPT · TRỢ LÝ ẢO',
        roleTag: 'BOT',
        time: '14:40',
        text: 'Chào anh/chị, em là trợ lý ảo trên Zalo OA. Anh/chị cần hỗ trợ về giao dịch chuyển tiền, thẻ hay tài khoản ạ?',
      },
      {
        id: 'm-act2-3',
        sender: 'customer',
        senderLabel: 'TRẦN KHÁNH LINH',
        roleTag: 'KHÁCH HÀNG',
        time: '14:41',
        text: 'Toi chuyen khoan 5tr tu hom qua ma ben kia chua nhan duoc tien',
      },
      {
        id: 'm-act2-4',
        sender: 'bot',
        senderLabel: 'BOT FPT · TRỢ LÝ ẢO',
        roleTag: 'BOT',
        time: '14:42',
        text: 'Em đã ghi nhận: Giao dịch chuyển tiền · 5.000.000đ · 09/11. Vấn đề này cần chuyên viên tra soát khẩn cấp, em chuyển toàn bộ lịch sử trò chuyện tới hàng đợi Tài chính ạ.',
      },
      {
        id: 'm-act2-5',
        sender: 'routing',
        time: '14:43',
        text: 'Bot FPT bàn giao → hàng đợi Tài chính (Hỗ trợ khẩn cấp) · ba.tuann tiếp nhận',
      },
      {
        id: 'm-act2-6',
        sender: 'agent',
        senderLabel: 'TRẦN MINH ĐỨC',
        roleTag: 'AGENT',
        time: '14:44',
        text: 'Dạ em hỗ trợ mình ngay ạ. Chị cho em xin mã giao dịch và số tài khoản người nhận để em tra soát giúp mình nhé.',
      },
      {
        id: 'm-act2-7',
        sender: 'customer',
        senderLabel: 'TRẦN KHÁNH LINH',
        roleTag: 'KHÁCH HÀNG',
        time: '14:45',
        text: 'Mã giao dịch là FT250909-8827 ạ, STK người nhận 19034452819011 Techcombank nhé em.',
      },
    ],
  },
  {
    id: 'chat-act-1',
    interactionCode: 'IN-2611175',
    senderId: 'digibank_app_77102',
    channel: 'digibank',
    channelLabel: 'Digibank Chatbot',
    botSource: 'Chatbot Digibank',
    priority: 'urgent',
    lifecycleStatus: 'accepted',
    startedAt: '14:40',
    lastMessageTime: '14:46',
    lastMessagePreview: 'App báo trừ tiền 2 lần ở nước ngoài, khóa thẻ giúp em gấp!',
    unreadCount: 3,
    queueName: 'Hỗ trợ Khẩn cấp',
    initials: 'MT',
    avatarTone: 'teal',
    linkedCustomers: [
      {
        id: 'cust-mt-1',
        cif: '00518290',
        name: 'Phạm Minh Thư',
        phone: '0905 339 102',
        email: 'minhthu.pham@danangtech.vn',
        segment: 'Priority',
        branch: 'CN Đà Nẵng',
      },
    ],
    activeCustomerId: 'cust-mt-1',
    slaLimitSec: 180, // 3m urgent SLA
    customerWaitSec: 205, // Overdue by 00:25 (Red Overdue!)
    durationSec: 365,
    workcode: 'Khóa thẻ khẩn cấp / Nghi ngờ gian lận',
    messages: [
      {
        id: 'm-act1-1',
        sender: 'system',
        time: '14:40',
        text: 'Phiên bắt đầu từ Chatbot Digibank (Mobile App) · Ưu tiên: Hỗ trợ khẩn cấp',
      },
      {
        id: 'm-act1-2',
        sender: 'bot',
        senderLabel: 'CHATBOT DIGIBANK',
        roleTag: 'BOT',
        time: '14:41',
        text: 'Xin chào Phạm Minh Thư! Chatbot Digibank sẵn sàng hỗ trợ. Bạn gặp vấn đề về giao dịch nào?',
      },
      {
        id: 'm-act1-3',
        sender: 'customer',
        senderLabel: 'PHẠM MINH THƯ',
        roleTag: 'KHÁCH HÀNG',
        time: '14:42',
        text: 'Thẻ tín dụng của mình vừa bị báo trừ tiền 2 giao dịch lạ 120 USD ở nước ngoài dù mình đang ở Đà Nẵng!',
      },
      {
        id: 'm-act1-4',
        sender: 'bot',
        senderLabel: 'CHATBOT DIGIBANK',
        roleTag: 'BOT',
        time: '14:42',
        text: 'Phát hiện yêu cầu KHẨN CẤP (Giao dịch nghi ngờ gian lận). Chatbot Digibank chuyển toàn bộ nội dung sang chuyên viên hỗ trợ khẩn cấp.',
      },
      {
        id: 'm-act1-5',
        sender: 'routing',
        time: '14:43',
        text: 'Chatbot Digibank bàn giao → Hàng đợi Hỗ trợ Khẩn cấp · ba.tuann tiếp nhận',
      },
      {
        id: 'm-act1-6',
        sender: 'customer',
        senderLabel: 'PHẠM MINH THƯ',
        roleTag: 'KHÁCH HÀNG',
        time: '14:46',
        text: 'App báo trừ tiền 2 lần ở nước ngoài, khóa thẻ giúp em gấp ạ! Em có cần ra chi nhánh không?',
      },
    ],
  },
  {
    id: 'chat-act-3',
    interactionCode: 'IN-2611164',
    senderId: 'fb_psid_5582910',
    channel: 'facebook',
    channelLabel: 'Facebook (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:22',
    lastMessageTime: '14:49',
    lastMessagePreview: 'Em ơi chị vừa nhận được SMS OTP rồi, bước tiếp theo làm sao ạ?',
    subStatusText: 'Khách hàng vừa nhắn tin mới',
    unreadCount: 1,
    queueName: 'Digibank / E-Banking',
    initials: 'CL',
    avatarTone: 'slate',
    linkedCustomers: [
      {
        id: 'cust-cl-1',
        cif: '00612940',
        name: 'Cao Thị Lan',
        phone: '0984 312 609',
        email: 'lan.caothi@gmail.com',
        segment: 'Chuẩn',
        branch: 'CN Hải Phòng',
      },
    ],
    activeCustomerId: 'cust-cl-1',
    slaLimitSec: 300,
    customerWaitSec: 45, // Normal green SLA (04:15 remaining)
    durationSec: 1120,
    workcode: 'Lỗi đăng nhập / Smart OTP Digibank',
    messages: [
      {
        id: 'm-act3-1',
        sender: 'system',
        time: '14:22',
        text: 'Phiên bắt đầu qua Facebook Messenger · Bot FPT bàn giao CSM',
      },
      {
        id: 'm-act3-2',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:22',
        text: 'Chào anh/chị, trợ lý ảo có thể giúp gì cho mình ạ?',
      },
      {
        id: 'm-act3-3',
        sender: 'customer',
        senderLabel: 'CAO THỊ LAN',
        roleTag: 'KHÁCH HÀNG',
        time: '14:23',
        text: 'Chị đăng nhập app Digibank báo sai mật khẩu quá 5 lần bị khóa tạm thời rồi em ơi.',
      },
      {
        id: 'm-act3-4',
        sender: 'routing',
        time: '14:24',
        text: 'Bot FPT bàn giao → Hàng đợi Digibank / E-Banking · ba.tuann tiếp nhận',
      },
      {
        id: 'm-act3-5',
        sender: 'agent',
        senderLabel: 'TRẦN MINH ĐỨC',
        roleTag: 'AGENT',
        time: '14:26',
        text: 'Dạ em đã mở khóa truy cập Digibank cho chị và gửi liên kết cấp lại mật khẩu qua SMS rồi ạ. Chị kiểm tra tin nhắn giúp em nhé.',
      },
      {
        id: 'm-act3-6',
        sender: 'customer',
        senderLabel: 'CAO THỊ LAN',
        roleTag: 'KHÁCH HÀNG',
        time: '14:31',
        text: 'Dạ để chị kiểm tra SMS rồi báo lại em nhé',
      },
      {
        id: 'm-act3-7',
        sender: 'customer',
        senderLabel: 'CAO THỊ LAN',
        roleTag: 'KHÁCH HÀNG',
        time: '14:49',
        text: 'Em ơi chị vừa nhận được SMS OTP rồi, bước tiếp theo làm sao ạ?',
      },
    ],
  },

  // 2 COMPLETED SESSIONS (Hoàn thành)
  {
    id: 'chat-cmp-1',
    interactionCode: 'IN-2611141',
    senderId: 'zalo_uid_1120938',
    channel: 'zalo',
    channelLabel: 'Zalo OA (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'completed',
    completionOutcome: 'Đã xử lý qua Chat',
    completedByAgent: 'ba.tuann',
    startedAt: '13:45',
    lastMessageTime: '13:58',
    lastMessagePreview: 'Cảm ơn bạn đã hỗ trợ rất nhanh nhé!',
    subStatusText: 'Hoàn thành · Đã xử lý qua Chat',
    unreadCount: 0,
    queueName: 'Tài chính',
    initials: 'QH',
    avatarTone: 'violet',
    linkedCustomers: [
      {
        id: 'cust-qh-his',
        cif: '00201833',
        name: 'Nguyễn Quang Huy',
        phone: '0904 119 882',
        email: 'huy.nguyenquang@fpt.vn',
        segment: 'VIP · SILVER',
        branch: 'CN Hà Nội',
      },
    ],
    activeCustomerId: 'cust-qh-his',
    slaLimitSec: 300,
    customerWaitSec: 0,
    durationSec: 780,
    workcode: 'Tư vấn mở tài khoản & gói dịch vụ Digiweb',
    messages: [
      {
        id: 'm-cmp1-1',
        sender: 'system',
        time: '13:45',
        text: 'Phiên bắt đầu qua Zalo OA · Bot FPT chuyển tiếp CSM',
      },
      {
        id: 'm-cmp1-2',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '13:45',
        text: 'Chào anh/chị, anh/chị cần tra cứu lãi suất hay sản phẩm tiết kiệm online ạ?',
      },
      {
        id: 'm-cmp1-3',
        sender: 'customer',
        senderLabel: 'NGUYỄN QUANG HUY',
        roleTag: 'KHÁCH HÀNG',
        time: '13:46',
        text: 'Cho mình hỏi lãi suất gửi tiết kiệm kỳ hạn 6 tháng online hiện tại là bao nhiêu?',
      },
      {
        id: 'm-cmp1-4',
        sender: 'agent',
        senderLabel: 'ba.tuann',
        roleTag: 'AGENT',
        time: '13:48',
        text: 'Dạ lãi suất tiết kiệm online kỳ hạn 6 tháng hiện là 5.4%/năm (cộng thêm 0.2% ưu đãi hạng VIP Silver của anh là 5.6%/năm) ạ.',
      },
      {
        id: 'm-cmp1-5',
        sender: 'customer',
        senderLabel: 'NGUYỄN QUANG HUY',
        roleTag: 'KHÁCH HÀNG',
        time: '13:57',
        text: 'Cảm ơn bạn đã hỗ trợ rất nhanh nhé!',
      },
      {
        id: 'm-cmp1-6',
        sender: 'session-divider',
        time: '13:58',
        text: 'Phiên đã hoàn thành',
        previousSessionCode: 'IN-2611141',
        completedByAgent: 'ba.tuann',
        completedOutcome: 'Đã xử lý qua Chat',
        dividerSenderId: 'zalo_uid_1120938',
      },
    ],
  },
  {
    id: 'chat-cmp-2',
    interactionCode: 'IN-2611120',
    senderId: 'digiweb_sid_50912',
    channel: 'digiweb',
    channelLabel: 'Digiweb / Web VCB',
    botSource: 'Bot Digiweb',
    priority: 'normal',
    lifecycleStatus: 'completed',
    completionOutcome: 'Đã gọi – khách không nghe máy',
    completedByAgent: 'Nguyễn Thu Phương',
    startedAt: '11:10',
    lastMessageTime: '11:24',
    lastMessagePreview: 'Gọi lại cho chị số 0977520114 nhé',
    subStatusText: 'Hoàn thành · Đã gọi – khách không nghe máy',
    unreadCount: 0,
    queueName: 'Thẻ',
    initials: 'MH',
    avatarTone: 'slate',
    linkedCustomers: [
      {
        id: 'cust-mh-his',
        cif: '00772811',
        name: 'Đỗ Thị Minh Hằng',
        phone: '0977 520 114',
        email: 'hang.dothiminh@gmail.com',
        segment: 'Chuẩn',
        branch: 'CN TP.HCM',
      },
    ],
    activeCustomerId: 'cust-mh-his',
    slaLimitSec: 300,
    customerWaitSec: 0,
    durationSec: 840,
    workcode: 'Yêu cầu nâng hạng thẻ tín dụng',
    messages: [
      {
        id: 'm-cmp2-1',
        sender: 'system',
        time: '11:10',
        text: 'Phiên bắt đầu từ Digiweb / Web VCB',
      },
      {
        id: 'm-cmp2-2',
        sender: 'customer',
        senderLabel: 'ĐỖ THỊ MINH HẰNG',
        roleTag: 'KHÁCH HÀNG',
        time: '11:11',
        text: 'Gọi lại tư vấn giúp chị gói mở thẻ tín dụng hoàn tiền nhé, SĐT 0977520114.',
      },
      {
        id: 'm-cmp2-3',
        sender: 'session-divider',
        time: '11:24',
        text: 'Phiên đã hoàn thành',
        previousSessionCode: 'IN-2611120',
        completedByAgent: 'Nguyễn Thu Phương',
        completedOutcome: 'Đã gọi – khách không nghe máy',
        dividerSenderId: 'digiweb_sid_50912',
      },
    ],
  },
];

/** 7 additional concurrent active sessions to test 10-session load smoothly (STT 34) */
export const EXTRA_LOAD_TEST_SESSIONS: ChatSessionRecord[] = [
  {
    id: 'chat-load-4',
    interactionCode: 'IN-2611201',
    senderId: 'digiweb_sid_91021',
    channel: 'digiweb',
    channelLabel: 'Digiweb / Web VCB',
    botSource: 'Bot Digiweb',
    priority: 'urgent',
    lifecycleStatus: 'accepted',
    startedAt: '14:44',
    lastMessageTime: '14:47',
    lastMessagePreview: 'Mình chuyển nhầm số tài khoản, nhờ hỗ trợ giữ lệnh ngay!',
    unreadCount: 2,
    queueName: 'Hỗ trợ Khẩn cấp',
    initials: 'NH',
    avatarTone: 'navy',
    linkedCustomers: [
      {
        id: 'cust-load-4',
        cif: '00810291',
        name: 'Nguyễn Hoàng Nam',
        phone: '0913 221 904',
        email: 'nam.nguyenhoang@gmail.com',
        segment: 'Priority',
        branch: 'CN Hà Nội',
      },
    ],
    activeCustomerId: 'cust-load-4',
    slaLimitSec: 180,
    customerWaitSec: 145, // 35s left -> Warning
    durationSec: 210,
    workcode: 'Tra soát chuyển khoản nhanh 24/7',
    messages: [
      {
        id: 'ml4-1',
        sender: 'bot',
        senderLabel: 'BOT DIGIWEB',
        roleTag: 'BOT',
        time: '14:44',
        text: 'Xin chào Quý khách! Trợ lý ảo Digiweb sẵn sàng hỗ trợ.',
      },
      {
        id: 'ml4-2',
        sender: 'customer',
        senderLabel: 'NGUYỄN HOÀNG NAM',
        roleTag: 'KHÁCH HÀNG',
        time: '14:47',
        text: 'Mình chuyển nhầm số tài khoản 15 triệu, nhờ hỗ trợ tra soát giữ lệnh ngay giúp mình!',
      },
    ],
  },
  {
    id: 'chat-load-5',
    interactionCode: 'IN-2611202',
    senderId: 'digibank_app_44910',
    channel: 'digibank',
    channelLabel: 'Digibank Chatbot',
    botSource: 'Chatbot Digibank',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:42',
    lastMessageTime: '14:46',
    lastMessagePreview: 'Smart OTP không nhận được mã kích hoạt mới',
    unreadCount: 1,
    queueName: 'Digibank / E-Banking',
    initials: 'LT',
    avatarTone: 'teal',
    linkedCustomers: [
      {
        id: 'cust-load-5',
        cif: '00449102',
        name: 'Lê Thanh Tâm',
        phone: '0989 112 480',
        email: 'tam.lethanh@company.vn',
        segment: 'Chuẩn',
        branch: 'CN Bình Dương',
      },
    ],
    activeCustomerId: 'cust-load-5',
    slaLimitSec: 300,
    customerWaitSec: 95,
    durationSec: 290,
    workcode: 'Lỗi đăng nhập / Smart OTP Digibank',
    messages: [
      {
        id: 'ml5-1',
        sender: 'bot',
        senderLabel: 'CHATBOT DIGIBANK',
        roleTag: 'BOT',
        time: '14:42',
        text: 'Chào Lê Thanh Tâm, Chatbot Digibank đã tiếp nhận yêu cầu lỗi Smart OTP và chuyển chuyên viên.',
      },
      {
        id: 'ml5-2',
        sender: 'customer',
        senderLabel: 'LÊ THANH TÂM',
        roleTag: 'KHÁCH HÀNG',
        time: '14:46',
        text: 'Mình đổi sang điện thoại mới nhưng Smart OTP không nhận được mã kích hoạt ạ.',
      },
    ],
  },
  {
    id: 'chat-load-6',
    interactionCode: 'IN-2611203',
    senderId: 'zalo_uid_8812034',
    channel: 'zalo',
    channelLabel: 'Zalo OA (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:38',
    lastMessageTime: '14:45',
    lastMessagePreview: 'Cho em hỏi biểu phí rút tiền mặt thẻ tín dụng JCB',
    unreadCount: 1,
    queueName: 'Thẻ',
    initials: 'PA',
    avatarTone: 'indigo',
    linkedCustomers: [
      {
        id: 'cust-load-6',
        cif: '00559128',
        name: 'Bùi Phương Anh',
        phone: '0902 773 819',
        email: 'anh.buiphuong@gmail.com',
        segment: 'Chuẩn',
        branch: 'CN Hải Phòng',
      },
    ],
    activeCustomerId: 'cust-load-6',
    slaLimitSec: 300,
    customerWaitSec: 120,
    durationSec: 410,
    workcode: 'Yêu cầu nâng hạng thẻ tín dụng',
    messages: [
      {
        id: 'ml6-1',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:38',
        text: 'Chào anh/chị trên Zalo OA! Anh/chị cần tư vấn thông tin thẻ nào ạ?',
      },
      {
        id: 'ml6-2',
        sender: 'customer',
        senderLabel: 'BÙI PHƯƠNG ANH',
        roleTag: 'KHÁCH HÀNG',
        time: '14:45',
        text: 'Cho em hỏi biểu phí rút tiền mặt và lãi suất thẻ tín dụng JCB Platinum nhé.',
      },
    ],
  },
  {
    id: 'chat-load-7',
    interactionCode: 'IN-2611204',
    senderId: 'fb_psid_7721904',
    channel: 'facebook',
    channelLabel: 'Facebook (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:35',
    lastMessageTime: '14:44',
    lastMessagePreview: 'Em muốn đăng ký gói tài khoản số đẹp miễn phí quản lý',
    unreadCount: 4,
    queueName: 'Tài chính',
    initials: 'DK',
    avatarTone: 'violet',
    linkedCustomers: [
      {
        id: 'cust-load-7',
        cif: '00661204',
        name: 'Trương Duy Khánh',
        phone: '0966 401 228',
        email: 'khanh.truongduy@gmail.com',
        segment: 'Chuẩn',
        branch: 'CN Cần Thơ',
      },
    ],
    activeCustomerId: 'cust-load-7',
    slaLimitSec: 300,
    customerWaitSec: 315, // Overdue 15s
    durationSec: 540,
    workcode: 'Tư vấn mở tài khoản & gói dịch vụ Digiweb',
    messages: [
      {
        id: 'ml7-1',
        sender: 'bot',
        senderLabel: 'BOT FPT',
        roleTag: 'BOT',
        time: '14:35',
        text: 'Chào anh/chị, Bot FPT đã ghi nhận nhu cầu mở tài khoản số đẹp.',
      },
      {
        id: 'ml7-2',
        sender: 'customer',
        senderLabel: 'TRƯƠNG DUY KHÁNH',
        roleTag: 'KHÁCH HÀNG',
        time: '14:44',
        text: 'Em muốn đăng ký gói tài khoản số đẹp miễn phí quản lý thì thao tác trên Digibank ở mục nào ạ?',
      },
    ],
  },
  {
    id: 'chat-load-8',
    interactionCode: 'IN-2611205',
    senderId: 'digiweb_sid_31904',
    channel: 'digiweb',
    channelLabel: 'Digiweb / Web VCB',
    botSource: 'Bot Digiweb',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:33',
    lastMessageTime: '14:43',
    lastMessagePreview: 'Cần cấp lại giấy xác nhận số dư để xin visa du học',
    unreadCount: 0,
    queueName: 'Tài chính',
    initials: 'HM',
    avatarTone: 'slate',
    linkedCustomers: [
      {
        id: 'cust-load-8',
        cif: '00391082',
        name: 'Hoàng Ngọc Mai',
        phone: '0915 882 104',
        email: 'mai.hoangngoc@gmail.com',
        segment: 'Priority',
        branch: 'CN Hà Nội',
      },
    ],
    activeCustomerId: 'cust-load-8',
    slaLimitSec: 300,
    customerWaitSec: 70,
    durationSec: 615,
    workcode: 'Tư vấn mở tài khoản & gói dịch vụ Digiweb',
    messages: [
      {
        id: 'ml8-1',
        sender: 'customer',
        senderLabel: 'HOÀNG NGỌC MAI',
        roleTag: 'KHÁCH HÀNG',
        time: '14:43',
        text: 'Mình cần cấp giấy xác nhận số dư sổ tiết kiệm song ngữ Anh-Việt để xin visa, có đặt lịch trên Digiweb được không?',
      },
    ],
  },
  {
    id: 'chat-load-9',
    interactionCode: 'IN-2611206',
    senderId: 'digibank_app_99201',
    channel: 'digibank',
    channelLabel: 'Digibank Chatbot',
    botSource: 'Chatbot Digibank',
    priority: 'urgent',
    lifecycleStatus: 'accepted',
    startedAt: '14:41',
    lastMessageTime: '14:46',
    lastMessagePreview: 'Thanh toán hóa đơn điện bị trừ tiền nhưng EVN báo chưa gạch nợ',
    unreadCount: 2,
    queueName: 'Hỗ trợ Khẩn cấp',
    initials: 'VT',
    avatarTone: 'navy',
    linkedCustomers: [
      {
        id: 'cust-load-9',
        cif: '00718294',
        name: 'Vũ Quốc Thắng',
        phone: '0938 661 209',
        email: 'thang.vuquoc@gmail.com',
        segment: 'VIP · GOLD',
        branch: 'CN TP.HCM',
      },
    ],
    activeCustomerId: 'cust-load-9',
    slaLimitSec: 180,
    customerWaitSec: 132, // 48s left -> Warning
    durationSec: 330,
    workcode: 'Tra soát chuyển khoản nhanh 24/7',
    messages: [
      {
        id: 'ml9-1',
        sender: 'bot',
        senderLabel: 'CHATBOT DIGIBANK',
        roleTag: 'BOT',
        time: '14:41',
        text: 'Chatbot Digibank ghi nhận giao dịch thanh toán hóa đơn EVN bị treo.',
      },
      {
        id: 'ml9-2',
        sender: 'customer',
        senderLabel: 'VŨ QUỐC THẮNG',
        roleTag: 'KHÁCH HÀNG',
        time: '14:46',
        text: 'Thanh toán hóa đơn điện 2.4 triệu bị trừ tiền rồi nhưng bên EVN báo chưa gạch nợ và sắp cắt điện!',
      },
    ],
  },
  {
    id: 'chat-load-10',
    interactionCode: 'IN-2611207',
    senderId: 'zalo_uid_5519082',
    channel: 'zalo',
    channelLabel: 'Zalo OA (Bot FPT)',
    botSource: 'Bot FPT → CSM',
    priority: 'normal',
    lifecycleStatus: 'accepted',
    startedAt: '14:30',
    lastMessageTime: '14:41',
    lastMessagePreview: 'Nhờ kiểm tra điểm thưởng VCB Loyalty tháng này',
    unreadCount: 0,
    queueName: 'Thẻ',
    initials: 'NL',
    avatarTone: 'teal',
    linkedCustomers: [
      {
        id: 'cust-load-10',
        cif: '00119044',
        name: 'Ngô Bảo Long',
        phone: '0944 108 772',
        email: 'long.ngobao@gmail.com',
        segment: 'VIP · SILVER',
        branch: 'CN Đà Nẵng',
      },
    ],
    activeCustomerId: 'cust-load-10',
    slaLimitSec: 300,
    customerWaitSec: 0,
    durationSec: 720,
    workcode: 'Yêu cầu nâng hạng thẻ tín dụng',
    messages: [
      {
        id: 'ml10-1',
        sender: 'customer',
        senderLabel: 'NGÔ BẢO LONG',
        roleTag: 'KHÁCH HÀNG',
        time: '14:41',
        text: 'Nhờ em kiểm tra giúp anh số điểm VCB Loyalty đã cộng tháng 10 nhé.',
      },
    ],
  },
];
