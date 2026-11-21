export type TimeframeKey = '15m' | '1h' | 'today';

export type AgentPresence = 'ready' | 'busy' | 'not-ready' | 'wrap-up';

export interface SystemOverviewMetrics {
  totalLoggedIn: number;
  onlineSubtext: string;
  totalNotReady: number;
  notReadySubtext: string;
  availVoice: number;
  voiceSubtext: string;
  availChat: number;
  chatSubtext: string;
  availEmail: number;
  emailSubtext: string;
}

export interface ChannelSummary {
  totalInteractions: number;
  deltaPercent: string;
  slaRate: number;
  slaTarget: number;
  avgWaitSec: number;
  abandonRate: number;
  csatScore: number;
}

export interface TrafficPoint {
  time: string;
  voice: number;
  chat: number;
  email: number;
  sla: number;
}

export interface QueueStatusRow {
  id: string;
  name: string;
  channel: 'Voice' | 'Chat' | 'Email';
  waiting: number;
  longestWaitSec: number;
  agentsReady: number;
  agentsBusy: number;
  slaPercent: number;
  thresholdSec: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface LiveCallRow {
  id: string;
  callerName: string;
  phone: string;
  tier: 'VIP' | 'Doanh nghiệp' | 'Cá nhân';
  queue: string;
  agentName: string;
  agentExt: string;
  durationSec: number;
  waitSec: number;
  state: 'Đang đàm thoại' | 'Đang giữ máy' | 'Đang đổ chuông';
}

export interface ActiveChatRow {
  id: string;
  customerName: string;
  source: 'Zalo OA' | 'Website Livechat' | 'Facebook Fanpage' | 'Mobile App';
  topic: string;
  agentName: string;
  durationSec: number;
  unread: number;
  slaState: 'Đạt SLA' | 'Sắp quá hạn' | 'Quá hạn';
  messages: { sender: 'customer' | 'agent' | 'bot'; time: string; text: string }[];
}

export interface PriorityEmailRow {
  id: string;
  ticketCode: string;
  subject: string;
  sender: string;
  queue: string;
  receivedAt: string;
  slaRemainingMin: number; // negative means breached
  assignedAgent: string;
  priority: 'Cao' | 'Trung bình' | 'Tiêu chuẩn';
}

export interface AgentRow {
  id: string;
  name: string;
  username: string;
  ext: string;
  team: 'Inbound Voice' | 'Omnichannel Chat' | 'VIP Care' | 'Email Support';
  channels: ('Voice' | 'Chat' | 'Email')[];
  status: AgentPresence;
  reason?: string;
  stateDurationSec: number;
  handledToday: number;
  ahtSec: number;
  csat: number;
}

export interface RoutingRule {
  id: string;
  queueName: string;
  channel: 'Voice' | 'Chat' | 'Email';
  strategy: 'Skill-Based' | 'Least Occupied' | 'Round Robin';
  maxWaitSec: number;
  overflowTarget: string;
  utilization: number;
  activeCallsOrSessions: number;
  capacity: number;
  vipPriority: boolean;
  overflowEnabled: boolean;
}

export interface SlaAlert {
  id: string;
  severity: 'critical' | 'warning';
  queue: string;
  channel: 'Voice' | 'Chat' | 'Email';
  message: string;
  timeAgo: string;
  targetTab: 'voice' | 'chat' | 'email' | 'ticket';
}

export const TIMEFRAME_DATA: Record<
  TimeframeKey,
  {
    system: SystemOverviewMetrics;
    summary: ChannelSummary;
    traffic: TrafficPoint[];
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
  }
> = {
  '15m': {
    system: {
      totalLoggedIn: 48,
      onlineSubtext: '41 trực tuyến · 7 tạm nghỉ',
      totalNotReady: 7,
      notReadySubtext: '4 nghỉ giải lao · 3 đào tạo',
      availVoice: 14,
      voiceSubtext: '16 đang đàm thoại',
      availChat: 12,
      chatSubtext: '29 phiên đang mở',
      availEmail: 8,
      emailSubtext: '14 thư chờ xử lý',
    },
    summary: {
      totalInteractions: 164,
      deltaPercent: '+8.4% so với 15 phút trước',
      slaRate: 93.8,
      slaTarget: 90,
      avgWaitSec: 19,
      abandonRate: 2.1,
      csatScore: 4.8,
    },
    traffic: [
      { time: '11:10', voice: 22, chat: 28, email: 9, sla: 95 },
      { time: '11:13', voice: 25, chat: 31, email: 11, sla: 94 },
      { time: '11:16', voice: 30, chat: 35, email: 10, sla: 91 },
      { time: '11:19', voice: 28, chat: 38, email: 13, sla: 93 },
      { time: '11:22', voice: 33, chat: 34, email: 12, sla: 92 },
      { time: '11:25', voice: 26, chat: 36, email: 14, sla: 95 },
    ],
    voiceStats: {
      offered: 68,
      answered: 61,
      waiting: 4,
      abandoned: 3,
      ivrConnected: 4,
      asaSec: 18,
      ahtSec: 194,
      sla: 92.6,
      readyAgents: 14,
      ringing: 2,
      inCall: 16,
    },
    chatStats: {
      totalIncoming: 42,
      accepted: 39,
      awtSec: 24,
      frtSec: 14,
      slaPercent: 93.5,
      active: 29,
      waiting: 4,
      ahtSec: 312,
      botDeflection: 42.5,
      csat: 4.82,
    },
    emailStats: {
      received: 24,
      accepted: 20,
      unassigned: 3,
      spam: 1,
      inProgress: 14,
      pendingCustomer: 7,
      overdue: 2,
      resolvedRate: 88.5,
      avgResponseMin: 34,
    },
  },
  '1h': {
    system: {
      totalLoggedIn: 52,
      onlineSubtext: '45 trực tuyến · 7 tạm nghỉ',
      totalNotReady: 7,
      notReadySubtext: '4 nghỉ giải lao · 3 họp nhanh',
      availVoice: 16,
      voiceSubtext: '19 đang đàm thoại',
      availChat: 14,
      chatSubtext: '34 phiên đang mở',
      availEmail: 9,
      emailSubtext: '18 thư chờ xử lý',
    },
    summary: {
      totalInteractions: 618,
      deltaPercent: '+12.1% so với giờ trước',
      slaRate: 94.4,
      slaTarget: 90,
      avgWaitSec: 17,
      abandonRate: 1.9,
      csatScore: 4.84,
    },
    traffic: [
      { time: '10:30', voice: 42, chat: 56, email: 18, sla: 96 },
      { time: '10:40', voice: 48, chat: 61, email: 21, sla: 95 },
      { time: '10:50', voice: 54, chat: 68, email: 24, sla: 93 },
      { time: '11:00', voice: 61, chat: 74, email: 22, sla: 92 },
      { time: '11:10', voice: 57, chat: 70, email: 25, sla: 94 },
      { time: '11:20', voice: 52, chat: 66, email: 20, sla: 95 },
    ],
    voiceStats: {
      offered: 248,
      answered: 229,
      waiting: 4,
      abandoned: 7,
      ivrConnected: 12,
      asaSec: 17,
      ahtSec: 202,
      sla: 93.8,
      readyAgents: 16,
      ringing: 3,
      inCall: 19,
    },
    chatStats: {
      totalIncoming: 168,
      accepted: 161,
      awtSec: 21,
      frtSec: 16,
      slaPercent: 94.2,
      active: 34,
      waiting: 5,
      ahtSec: 325,
      botDeflection: 44.1,
      csat: 4.85,
    },
    emailStats: {
      received: 82,
      accepted: 72,
      unassigned: 8,
      spam: 2,
      inProgress: 18,
      pendingCustomer: 15,
      overdue: 2,
      resolvedRate: 91.2,
      avgResponseMin: 38,
    },
  },
  today: {
    system: {
      totalLoggedIn: 56,
      onlineSubtext: '48 trực tuyến · 8 ca luân phiên',
      totalNotReady: 8,
      notReadySubtext: '5 nghỉ trưa · 3 đào tạo QA',
      availVoice: 18,
      voiceSubtext: '21 đang đàm thoại',
      availChat: 15,
      chatSubtext: '38 phiên đang mở',
      availEmail: 11,
      emailSubtext: '22 thư chờ xử lý',
    },
    summary: {
      totalInteractions: 2846,
      deltaPercent: '+6.7% so với hôm qua',
      slaRate: 95.1,
      slaTarget: 90,
      avgWaitSec: 16,
      abandonRate: 1.7,
      csatScore: 4.87,
    },
    traffic: [
      { time: '08:00', voice: 98, chat: 124, email: 45, sla: 97 },
      { time: '09:00', voice: 168, chat: 215, email: 72, sla: 95 },
      { time: '10:00', voice: 212, chat: 268, email: 88, sla: 94 },
      { time: '11:00', voice: 246, chat: 304, email: 96, sla: 93 },
      { time: '12:00', voice: 174, chat: 238, email: 64, sla: 96 },
      { time: '13:00', voice: 196, chat: 256, email: 78, sla: 95 },
    ],
    voiceStats: {
      offered: 1142,
      answered: 1054,
      waiting: 4,
      abandoned: 24,
      ivrConnected: 64,
      asaSec: 16,
      ahtSec: 198,
      sla: 94.9,
      readyAgents: 18,
      ringing: 3,
      inCall: 21,
    },
    chatStats: {
      totalIncoming: 742,
      accepted: 718,
      awtSec: 19,
      frtSec: 15,
      slaPercent: 95.4,
      active: 38,
      waiting: 4,
      ahtSec: 308,
      botDeflection: 46.8,
      csat: 4.89,
    },
    emailStats: {
      received: 412,
      accepted: 368,
      unassigned: 32,
      spam: 12,
      inProgress: 22,
      pendingCustomer: 39,
      overdue: 2,
      resolvedRate: 93.4,
      avgResponseMin: 31,
    },
  },
};

export const INITIAL_QUEUES: QueueStatusRow[] = [
  {
    id: 'q-1',
    name: 'Hotline CSKH 1900 6868',
    channel: 'Voice',
    waiting: 4,
    longestWaitSec: 52,
    agentsReady: 6,
    agentsBusy: 9,
    slaPercent: 86.4,
    thresholdSec: 45,
    status: 'critical',
  },
  {
    id: 'q-2',
    name: 'Hỗ trợ Thẻ & Tín dụng VIP',
    channel: 'Voice',
    waiting: 1,
    longestWaitSec: 14,
    agentsReady: 5,
    agentsBusy: 4,
    slaPercent: 97.2,
    thresholdSec: 20,
    status: 'normal',
  },
  {
    id: 'q-3',
    name: 'Zalo OA & Website Livechat',
    channel: 'Chat',
    waiting: 5,
    longestWaitSec: 38,
    agentsReady: 7,
    agentsBusy: 11,
    slaPercent: 91.5,
    thresholdSec: 30,
    status: 'warning',
  },
  {
    id: 'q-4',
    name: 'Facebook Fanpage CSKH',
    channel: 'Chat',
    waiting: 2,
    longestWaitSec: 22,
    agentsReady: 5,
    agentsBusy: 6,
    slaPercent: 95.8,
    thresholdSec: 45,
    status: 'normal',
  },
  {
    id: 'q-5',
    name: 'Email Khiếu nại & Tra soát',
    channel: 'Email',
    waiting: 14,
    longestWaitSec: 195,
    agentsReady: 8,
    agentsBusy: 5,
    slaPercent: 92.0,
    thresholdSec: 240,
    status: 'normal',
  },
];

export const INITIAL_LIVE_CALLS: LiveCallRow[] = [
  {
    id: 'call-101',
    callerName: 'Nguyễn Minh Quân',
    phone: '0904 821 394',
    tier: 'VIP',
    queue: 'Hỗ trợ Thẻ & Tín dụng VIP',
    agentName: 'Trần Thu Hà',
    agentExt: '1042',
    durationSec: 245,
    waitSec: 8,
    state: 'Đang đàm thoại',
  },
  {
    id: 'call-102',
    callerName: 'Lê Thị Hồng Nhung',
    phone: '0988 512 709',
    tier: 'Cá nhân',
    queue: 'Hotline CSKH 1900 6868',
    agentName: 'Phạm Quốc Bảo',
    agentExt: '1018',
    durationSec: 132,
    waitSec: 34,
    state: 'Đang đàm thoại',
  },
  {
    id: 'call-103',
    callerName: 'Công ty TNHH Minh Phát',
    phone: '024 3918 2201',
    tier: 'Doanh nghiệp',
    queue: 'Hotline CSKH 1900 6868',
    agentName: 'Vũ Hoàng Nam',
    agentExt: '1029',
    durationSec: 318,
    waitSec: 19,
    state: 'Đang giữ máy',
  },
  {
    id: 'call-104',
    callerName: 'Đỗ Khánh Linh',
    phone: '0912 664 180',
    tier: 'Cá nhân',
    queue: 'Hotline CSKH 1900 6868',
    agentName: 'Nguyễn Hải Yến',
    agentExt: '1055',
    durationSec: 54,
    waitSec: 12,
    state: 'Đang đàm thoại',
  },
  {
    id: 'call-105',
    callerName: 'Hoàng Gia Huy',
    phone: '0973 409 882',
    tier: 'VIP',
    queue: 'Hỗ trợ Thẻ & Tín dụng VIP',
    agentName: 'Đặng Phương Thảo',
    agentExt: '1031',
    durationSec: 16,
    waitSec: 6,
    state: 'Đang đổ chuông',
  },
];

export const INITIAL_ACTIVE_CHATS: ActiveChatRow[] = [
  {
    id: 'chat-201',
    customerName: 'Trịnh Bảo Ngọc',
    source: 'Zalo OA',
    topic: 'Tra cứu hạn mức chuyển khoản quốc tế',
    agentName: 'Lê Minh Anh',
    durationSec: 214,
    unread: 2,
    slaState: 'Đạt SLA',
    messages: [
      { sender: 'customer', time: '11:20', text: 'Chào shop, mình muốn kiểm tra hạn mức chuyển khoản quốc tế cho thẻ Platinum.' },
      { sender: 'bot', time: '11:20', text: 'Hệ thống đã tiếp nhận yêu cầu của chị Bảo Ngọc và chuyển ngay đến chuyên viên hỗ trợ.' },
      { sender: 'agent', time: '11:21', text: 'Em chào chị Ngọc ạ! Em là Minh Anh từ UniSpace-CX. Chị vui lòng cung cấp 4 số cuối thẻ để em kiểm tra ngay nhé.' },
      { sender: 'customer', time: '11:22', text: '4 số cuối là 8842 nhé em. Mình cần nâng tạm trong tuần này.' },
    ],
  },
  {
    id: 'chat-202',
    customerName: 'Phạm Đức Anh',
    source: 'Website Livechat',
    topic: 'Lỗi xác thực OTP khi đăng nhập ứng dụng',
    agentName: 'Ngô Thanh Tùng',
    durationSec: 396,
    unread: 1,
    slaState: 'Sắp quá hạn',
    messages: [
      { sender: 'customer', time: '11:16', text: 'Mình không nhận được mã Smart OTP sau khi đổi điện thoại mới.' },
      { sender: 'agent', time: '11:17', text: 'Dạ anh Đức Anh kiểm tra giúp em xem thiết bị cũ đã hủy liên kết Smart OTP chưa ạ?' },
      { sender: 'customer', time: '11:21', text: 'Máy cũ mình bị hỏng màn hình rồi nên không mở app lên được.' },
    ],
  },
  {
    id: 'chat-203',
    customerName: 'Bùi Thị Mai Phương',
    source: 'Facebook Fanpage',
    topic: 'Tư vấn gói dịch vụ doanh nghiệp mới',
    agentName: 'Trần Mỹ Duyên',
    durationSec: 145,
    unread: 0,
    slaState: 'Đạt SLA',
    messages: [
      { sender: 'customer', time: '11:21', text: 'Bên mình có hỗ trợ tích hợp tổng đài đa kênh với CRM nội bộ không ạ?' },
      { sender: 'agent', time: '11:22', text: 'Dạ hoàn toàn được ạ! UniSpace-CX có sẵn bộ Webhook & REST API đồng bộ hồ sơ khách hàng 360° theo thời gian thực.' },
    ],
  },
  {
    id: 'chat-204',
    customerName: 'Vương Tiến Đạt',
    source: 'Mobile App',
    topic: 'Yêu cầu xuất hóa đơn VAT kỳ tháng 11',
    agentName: 'Lê Minh Anh',
    durationSec: 520,
    unread: 3,
    slaState: 'Quá hạn',
    messages: [
      { sender: 'customer', time: '11:14', text: 'Cho mình xin file PDF hóa đơn VAT cho giao dịch mã HD-20261119 nhé.' },
      { sender: 'agent', time: '11:15', text: 'Em đang tra soát hệ thống kế toán và sẽ gửi bản PDF cho anh trong ít phút nữa ạ.' },
      { sender: 'customer', time: '11:23', text: 'Nhờ em kiểm tra giúp mình gấp nhé vì phòng kế toán cần chốt sổ.' },
    ],
  },
];

export const INITIAL_EMAILS: PriorityEmailRow[] = [
  {
    id: 'em-301',
    ticketCode: 'OCX-88412',
    subject: 'Đề nghị tra soát giao dịch thanh toán QR bị trừ tiền 2 lần',
    sender: 'hoang.nguyen@viettech.vn',
    queue: 'Email Khiếu nại & Tra soát',
    receivedAt: '08:15',
    slaRemainingMin: -18,
    assignedAgent: 'Nguyễn Thùy Trang',
    priority: 'Cao',
  },
  {
    id: 'em-302',
    ticketCode: 'OCX-88419',
    subject: 'Yêu cầu cấp lại hợp đồng dịch vụ khách hàng ưu tiên',
    sender: 'linh.tran@saigoncorp.com',
    queue: 'Email Khách hàng VIP',
    receivedAt: '09:40',
    slaRemainingMin: 24,
    assignedAgent: 'Chưa phân công',
    priority: 'Cao',
  },
  {
    id: 'em-303',
    ticketCode: 'OCX-88425',
    subject: 'Hỗ trợ cập nhật địa chỉ nhận sao kê định kỳ quý IV',
    sender: 'minh.pham89@gmail.com',
    queue: 'Email CSKH Chung',
    receivedAt: '10:12',
    slaRemainingMin: 95,
    assignedAgent: 'Đỗ Quang Vinh',
    priority: 'Trung bình',
  },
  {
    id: 'em-304',
    ticketCode: 'OCX-88431',
    subject: 'Đăng ký mở rộng thêm 20 nhánh tổng đài cho chi nhánh Đà Nẵng',
    sender: 'it.admin@anphagroup.vn',
    queue: 'Email Khách hàng VIP',
    receivedAt: '10:55',
    slaRemainingMin: 142,
    assignedAgent: 'Nguyễn Thùy Trang',
    priority: 'Trung bình',
  },
  {
    id: 'em-305',
    ticketCode: 'OCX-88438',
    subject: 'Phản hồi chất lượng cuộc gọi tư vấn sáng 19/11',
    sender: 'lan.anh.vu@outlook.com',
    queue: 'Email CSKH Chung',
    receivedAt: '11:10',
    slaRemainingMin: 185,
    assignedAgent: 'Chưa phân công',
    priority: 'Tiêu chuẩn',
  },
];

export const INITIAL_AGENTS: AgentRow[] = [
  {
    id: 'ag-1',
    name: 'Trần Thu Hà',
    username: 'ha.tran',
    ext: '1042',
    team: 'VIP Care',
    channels: ['Voice', 'Chat'],
    status: 'busy',
    stateDurationSec: 245,
    handledToday: 38,
    ahtSec: 186,
    csat: 4.95,
  },
  {
    id: 'ag-2',
    name: 'Phạm Quốc Bảo',
    username: 'bao.pham',
    ext: '1018',
    team: 'Inbound Voice',
    channels: ['Voice'],
    status: 'busy',
    stateDurationSec: 132,
    handledToday: 44,
    ahtSec: 174,
    csat: 4.82,
  },
  {
    id: 'ag-3',
    name: 'Lê Minh Anh',
    username: 'anh.le',
    ext: '1061',
    team: 'Omnichannel Chat',
    channels: ['Chat', 'Email'],
    status: 'ready',
    stateDurationSec: 94,
    handledToday: 62,
    ahtSec: 285,
    csat: 4.91,
  },
  {
    id: 'ag-4',
    name: 'Nguyễn Hải Yến',
    username: 'yen.nguyen',
    ext: '1055',
    team: 'Inbound Voice',
    channels: ['Voice', 'Chat'],
    status: 'ready',
    stateDurationSec: 312,
    handledToday: 35,
    ahtSec: 204,
    csat: 4.78,
  },
  {
    id: 'ag-5',
    name: 'Vũ Hoàng Nam',
    username: 'nam.vu',
    ext: '1029',
    team: 'Inbound Voice',
    channels: ['Voice'],
    status: 'wrap-up',
    reason: 'Ghi chú phiếu',
    stateDurationSec: 42,
    handledToday: 41,
    ahtSec: 215,
    csat: 4.74,
  },
  {
    id: 'ag-6',
    name: 'Nguyễn Thùy Trang',
    username: 'trang.nguyen',
    ext: '1074',
    team: 'Email Support',
    channels: ['Email', 'Chat'],
    status: 'ready',
    stateDurationSec: 188,
    handledToday: 29,
    ahtSec: 340,
    csat: 4.88,
  },
  {
    id: 'ag-7',
    name: 'Ngô Thanh Tùng',
    username: 'tung.ngo',
    ext: '1068',
    team: 'Omnichannel Chat',
    channels: ['Chat'],
    status: 'busy',
    stateDurationSec: 396,
    handledToday: 51,
    ahtSec: 298,
    csat: 4.86,
  },
  {
    id: 'ag-8',
    name: 'Đặng Phương Thảo',
    username: 'thao.dang',
    ext: '1031',
    team: 'VIP Care',
    channels: ['Voice', 'Email'],
    status: 'not-ready',
    reason: 'Nghỉ giải lao',
    stateDurationSec: 428,
    handledToday: 33,
    ahtSec: 190,
    csat: 4.93,
  },
  {
    id: 'ag-9',
    name: 'Đỗ Quang Vinh',
    username: 'vinh.do',
    ext: '1082',
    team: 'Email Support',
    channels: ['Email'],
    status: 'not-ready',
    reason: 'Đào tạo nghiệp vụ',
    stateDurationSec: 815,
    handledToday: 24,
    ahtSec: 312,
    csat: 4.8,
  },
];

export const INITIAL_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'rt-1',
    queueName: 'Hotline CSKH 1900 6868',
    channel: 'Voice',
    strategy: 'Skill-Based',
    maxWaitSec: 45,
    overflowTarget: 'Nhóm Hỗ trợ Dự phòng (Miền Nam)',
    utilization: 86,
    activeCallsOrSessions: 18,
    capacity: 21,
    vipPriority: true,
    overflowEnabled: true,
  },
  {
    id: 'rt-2',
    queueName: 'Hỗ trợ Thẻ & Tín dụng VIP',
    channel: 'Voice',
    strategy: 'Least Occupied',
    maxWaitSec: 20,
    overflowTarget: 'Trưởng ca VIP Care',
    utilization: 58,
    activeCallsOrSessions: 7,
    capacity: 12,
    vipPriority: true,
    overflowEnabled: true,
  },
  {
    id: 'rt-3',
    queueName: 'Zalo OA & Website Livechat',
    channel: 'Chat',
    strategy: 'Round Robin',
    maxWaitSec: 30,
    overflowTarget: 'AI Chatbot Fallback + Callback',
    utilization: 78,
    activeCallsOrSessions: 28,
    capacity: 36,
    vipPriority: true,
    overflowEnabled: true,
  },
  {
    id: 'rt-4',
    queueName: 'Facebook Fanpage CSKH',
    channel: 'Chat',
    strategy: 'Least Occupied',
    maxWaitSec: 45,
    overflowTarget: 'Nhóm Omnichannel Chat',
    utilization: 54,
    activeCallsOrSessions: 13,
    capacity: 24,
    vipPriority: false,
    overflowEnabled: true,
  },
  {
    id: 'rt-5',
    queueName: 'Email Khiếu nại & Tra soát',
    channel: 'Email',
    strategy: 'Skill-Based',
    maxWaitSec: 240,
    overflowTarget: 'Bộ phận Back-office QA',
    utilization: 64,
    activeCallsOrSessions: 16,
    capacity: 25,
    vipPriority: true,
    overflowEnabled: false,
  },
];

export const INITIAL_SLA_ALERTS: SlaAlert[] = [
  {
    id: 'sla-1',
    severity: 'critical',
    queue: 'Hotline CSKH 1900 6868',
    channel: 'Voice',
    message: 'Thời gian chờ lâu nhất đạt 00:52 (vượt ngưỡng cảnh báo 45 giây). Đang có 4 cuộc gọi chờ.',
    timeAgo: '1 phút trước',
    targetTab: 'voice',
  },
  {
    id: 'sla-2',
    severity: 'warning',
    queue: 'Email Khiếu nại & Tra soát',
    channel: 'Email',
    message: 'Phiếu OCX-88412 quá hạn phản hồi SLA 18 phút. Cần ưu tiên xử lý ngay.',
    timeAgo: '4 phút trước',
    targetTab: 'email',
  },
];

export interface VoiceQueueCardData {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  waiting: number;
  longestWaitSec: number;
  ready: number;
  ringing: number;
  inCall: number;
  asaSec: number | null;
  missed: number | null;
  slaPercent: number | null;
  assignedAgentIds: string[];
}

export interface WaitingCallRow {
  id: string;
  callerPhone: string;
  callerName: string;
  didNumber: string;
  queueName: string;
  waitSec: number;
  status: 'Đang chờ' | 'Ưu tiên VIP' | 'Chờ lâu';
}

export interface VoiceHourlyPoint {
  hour: string;
  answered: number;
  missed: number;
}

export const INITIAL_VOICE_QUEUES: VoiceQueueCardData[] = [
  {
    id: 'vq-1',
    name: 'ACD-1100',
    status: 'warning',
    waiting: 2,
    longestWaitSec: 46,
    ready: 4,
    ringing: 1,
    inCall: 7,
    asaSec: 21,
    missed: 4,
    slaPercent: 89.2,
    assignedAgentIds: ['ag-1', 'ag-2', 'ag-4', 'ag-5'],
  },
  {
    id: 'vq-2',
    name: 'Connect CS',
    status: 'normal',
    waiting: 1,
    longestWaitSec: 18,
    ready: 5,
    ringing: 1,
    inCall: 5,
    asaSec: 14,
    missed: 1,
    slaPercent: 96.4,
    assignedAgentIds: ['ag-1', 'ag-4', 'ag-8'],
  },
  {
    id: 'vq-3',
    name: 'Queue Dai Ly',
    status: 'normal',
    waiting: 1,
    longestWaitSec: 12,
    ready: 3,
    ringing: 0,
    inCall: 3,
    asaSec: 16,
    missed: 2,
    slaPercent: 94.1,
    assignedAgentIds: ['ag-2', 'ag-5'],
  },
  {
    id: 'vq-4',
    name: 'ACD-2147483647',
    status: 'normal',
    waiting: 0,
    longestWaitSec: 0,
    ready: 2,
    ringing: 0,
    inCall: 1,
    asaSec: 12,
    missed: 0,
    slaPercent: 98.5,
    assignedAgentIds: ['ag-4'],
  },
];

export const INITIAL_WAITING_CALLS: WaitingCallRow[] = [
  {
    id: 'wc-1',
    callerPhone: '0904 821 394',
    callerName: 'Nguyễn Minh Quân',
    didNumber: '1900 6868',
    queueName: 'ACD-1100',
    waitSec: 46,
    status: 'Chờ lâu',
  },
  {
    id: 'wc-2',
    callerPhone: '0988 512 709',
    callerName: 'Lê Thị Hồng Nhung',
    didNumber: '1900 6868',
    queueName: 'ACD-1100',
    waitSec: 24,
    status: 'Đang chờ',
  },
  {
    id: 'wc-3',
    callerPhone: '0912 664 180',
    callerName: 'Đỗ Khánh Linh',
    didNumber: '1800 1100',
    queueName: 'Connect CS',
    waitSec: 18,
    status: 'Ưu tiên VIP',
  },
  {
    id: 'wc-4',
    callerPhone: '0973 409 882',
    callerName: 'Đại lý Minh Khang',
    didNumber: '1900 6886',
    queueName: 'Queue Dai Ly',
    waitSec: 12,
    status: 'Đang chờ',
  },
];

export const VOICE_HOURLY_24H: VoiceHourlyPoint[] = [
  { hour: '00h', answered: 6, missed: 0 },
  { hour: '01h', answered: 4, missed: 0 },
  { hour: '02h', answered: 3, missed: 0 },
  { hour: '03h', answered: 2, missed: 0 },
  { hour: '04h', answered: 3, missed: 0 },
  { hour: '05h', answered: 5, missed: 1 },
  { hour: '06h', answered: 14, missed: 1 },
  { hour: '07h', answered: 42, missed: 2 },
  { hour: '08h', answered: 118, missed: 4 },
  { hour: '09h', answered: 164, missed: 6 },
  { hour: '10h', answered: 192, missed: 5 },
  { hour: '11h', answered: 148, missed: 4 },
  { hour: '12h', answered: 0, missed: 0 },
  { hour: '13h', answered: 0, missed: 0 },
  { hour: '14h', answered: 0, missed: 0 },
  { hour: '15h', answered: 0, missed: 0 },
  { hour: '16h', answered: 0, missed: 0 },
  { hour: '17h', answered: 0, missed: 0 },
  { hour: '18h', answered: 0, missed: 0 },
  { hour: '19h', answered: 0, missed: 0 },
  { hour: '20h', answered: 0, missed: 0 },
  { hour: '21h', answered: 0, missed: 0 },
  { hour: '22h', answered: 0, missed: 0 },
  { hour: '23h', answered: 0, missed: 0 },
];

export interface ChatQueueCapacity {
  id: string;
  name: string;
  inQueue: number;
  activeChats: number;
  availableSlots: number;
  longestWaitSec: number;
}

export interface ChatDemandPoint {
  time: string;
  demand: number;
  capacity: number;
}

export const INITIAL_CHAT_QUEUES: ChatQueueCapacity[] = [
  {
    id: 'cq-1',
    name: 'DEFAULT QUEUE',
    inQueue: 3,
    activeChats: 29,
    availableSlots: 19,
    longestWaitSec: 102,
  },
];

export const CHAT_DEMAND_TREND: ChatDemandPoint[] = [
  { time: '00:00', demand: 4, capacity: 45 },
  { time: '00:30', demand: 3, capacity: 45 },
  { time: '01:00', demand: 3, capacity: 45 },
  { time: '01:30', demand: 2, capacity: 45 },
  { time: '02:00', demand: 2, capacity: 45 },
  { time: '02:30', demand: 2, capacity: 45 },
  { time: '03:00', demand: 3, capacity: 45 },
  { time: '03:30', demand: 3, capacity: 45 },
  { time: '04:00', demand: 4, capacity: 45 },
  { time: '04:30', demand: 5, capacity: 45 },
  { time: '05:00', demand: 6, capacity: 45 },
  { time: '05:30', demand: 8, capacity: 45 },
  { time: '06:00', demand: 10, capacity: 45 },
  { time: '06:30', demand: 12, capacity: 45 },
  { time: '07:00', demand: 16, capacity: 45 },
  { time: '07:30', demand: 21, capacity: 45 },
  { time: '08:00', demand: 28, capacity: 50 },
  { time: '08:30', demand: 34, capacity: 52 },
  { time: '09:00', demand: 39, capacity: 52 },
  { time: '09:30', demand: 36, capacity: 48 },
  { time: '10:00', demand: 38, capacity: 48 },
  { time: '10:30', demand: 41, capacity: 48 },
  { time: '11:00', demand: 43, capacity: 48 },
  { time: '11:30', demand: 37, capacity: 46 },
  { time: '12:00', demand: 32, capacity: 42 },
  { time: '12:30', demand: 35, capacity: 42 },
  { time: '13:00', demand: 42, capacity: 48 },
];

export interface EmailDailyPoint {
  hour: string;
  accepted: number;
  unassigned: number;
  spam: number;
}

export interface EmailStatusSlice {
  name: string;
  value: number;
  color: string;
}

export const EMAIL_DAILY_HOURLY: EmailDailyPoint[] = [
  { hour: '08:00', accepted: 26, unassigned: 2, spam: 1 },
  { hour: '09:00', accepted: 48, unassigned: 4, spam: 2 },
  { hour: '10:00', accepted: 64, unassigned: 5, spam: 2 },
  { hour: '11:00', accepted: 72, unassigned: 6, spam: 2 },
  { hour: '12:00', accepted: 34, unassigned: 4, spam: 1 },
  { hour: '13:00', accepted: 42, unassigned: 5, spam: 1 },
  { hour: '14:00', accepted: 46, unassigned: 3, spam: 2 },
  { hour: '15:00', accepted: 36, unassigned: 3, spam: 1 },
];

export const EMAIL_CENTER_STATUS: EmailStatusSlice[] = [
  { name: 'Đã xử lý', value: 264, color: '#16A34A' },
  { name: 'Đang xử lý', value: 65, color: '#2563EB' },
  { name: 'Chờ phản hồi khách', value: 39, color: '#D97706' },
  { name: 'Chưa tiếp nhận', value: 32, color: '#F05A28' },
  { name: 'Email Spam', value: 12, color: '#94A3B8' },
];

export const EMAIL_UNIT_STATUS_MAP: Record<string, EmailStatusSlice[]> = {
  'Khối CSKH Miền Bắc': [
    { name: 'Đã xử lý', value: 108, color: '#16A34A' },
    { name: 'Đang xử lý', value: 24, color: '#2563EB' },
    { name: 'Chờ phản hồi khách', value: 15, color: '#D97706' },
    { name: 'Chưa tiếp nhận', value: 11, color: '#F05A28' },
    { name: 'Email Spam', value: 4, color: '#94A3B8' },
  ],
  'Khối CSKH Miền Nam': [
    { name: 'Đã xử lý', value: 92, color: '#16A34A' },
    { name: 'Đang xử lý', value: 21, color: '#2563EB' },
    { name: 'Chờ phản hồi khách', value: 13, color: '#D97706' },
    { name: 'Chưa tiếp nhận', value: 12, color: '#F05A28' },
    { name: 'Email Spam', value: 5, color: '#94A3B8' },
  ],
  'Trung tâm Thẻ & VIP': [
    { name: 'Đã xử lý', value: 44, color: '#16A34A' },
    { name: 'Đang xử lý', value: 12, color: '#2563EB' },
    { name: 'Chờ phản hồi khách', value: 7, color: '#D97706' },
    { name: 'Chưa tiếp nhận', value: 5, color: '#F05A28' },
    { name: 'Email Spam', value: 2, color: '#94A3B8' },
  ],
  'Bộ phận Tra soát': [
    { name: 'Đã xử lý', value: 20, color: '#16A34A' },
    { name: 'Đang xử lý', value: 8, color: '#2563EB' },
    { name: 'Chờ phản hồi khách', value: 4, color: '#D97706' },
    { name: 'Chưa tiếp nhận', value: 4, color: '#F05A28' },
    { name: 'Email Spam', value: 1, color: '#94A3B8' },
  ],
};

export interface FanpageHourlyPoint {
  hour: string;
  replied: number;
  unreplied: number;
  spam: number;
}

export interface FanpagePostStat {
  id: string;
  postCode: string;
  title: string;
  fanpageName: string;
  publishedAt: string;
  replied: number;
  unreplied: number;
  spam: number;
  hourly: FanpageHourlyPoint[];
}

export const INITIAL_FANPAGE_POSTS: FanpagePostStat[] = [
  {
    id: 'fp-1',
    postCode: 'POST-1119A',
    title: 'Ưu đãi mở thẻ Platinum hoàn tiền lên đến 2.000.000đ tháng 11',
    fanpageName: 'UniSpace-CX Official',
    publishedAt: '19/11 · 08:00',
    replied: 142,
    unreplied: 18,
    spam: 11,
    hourly: [
      { hour: '08:00', replied: 14, unreplied: 2, spam: 1 },
      { hour: '09:00', replied: 26, unreplied: 3, spam: 2 },
      { hour: '10:00', replied: 31, unreplied: 4, spam: 2 },
      { hour: '11:00', replied: 28, unreplied: 4, spam: 3 },
      { hour: '12:00', replied: 16, unreplied: 2, spam: 1 },
      { hour: '13:00', replied: 14, unreplied: 2, spam: 1 },
      { hour: '14:00', replied: 13, unreplied: 1, spam: 1 },
    ],
  },
  {
    id: 'fp-2',
    postCode: 'POST-1119B',
    title: 'Hướng dẫn kích hoạt Smart OTP thế hệ mới chỉ trong 30 giây',
    fanpageName: 'Chăm sóc Khách hàng 24/7',
    publishedAt: '19/11 · 09:15',
    replied: 96,
    unreplied: 9,
    spam: 6,
    hourly: [
      { hour: '08:00', replied: 0, unreplied: 0, spam: 0 },
      { hour: '09:00', replied: 18, unreplied: 2, spam: 1 },
      { hour: '10:00', replied: 24, unreplied: 2, spam: 2 },
      { hour: '11:00', replied: 21, unreplied: 2, spam: 1 },
      { hour: '12:00', replied: 11, unreplied: 1, spam: 1 },
      { hour: '13:00', replied: 12, unreplied: 1, spam: 1 },
      { hour: '14:00', replied: 10, unreplied: 1, spam: 0 },
    ],
  },
  {
    id: 'fp-3',
    postCode: 'POST-1118C',
    title: 'Livestream giải đáp chính sách gói Tổng đài Doanh nghiệp Quý IV',
    fanpageName: 'UniSpace-CX Official',
    publishedAt: '18/11 · 19:30',
    replied: 84,
    unreplied: 6,
    spam: 9,
    hourly: [
      { hour: '08:00', replied: 12, unreplied: 1, spam: 2 },
      { hour: '09:00', replied: 15, unreplied: 1, spam: 2 },
      { hour: '10:00', replied: 18, unreplied: 1, spam: 2 },
      { hour: '11:00', replied: 14, unreplied: 1, spam: 1 },
      { hour: '12:00', replied: 9, unreplied: 1, spam: 1 },
      { hour: '13:00', replied: 8, unreplied: 1, spam: 1 },
      { hour: '14:00', replied: 8, unreplied: 0, spam: 0 },
    ],
  },
  {
    id: 'fp-4',
    postCode: 'POST-1118D',
    title: 'Thông báo nâng cấp tính năng định tuyến đa kênh & bảo mật tài khoản',
    fanpageName: 'Chăm sóc Khách hàng 24/7',
    publishedAt: '18/11 · 14:00',
    replied: 52,
    unreplied: 4,
    spam: 3,
    hourly: [
      { hour: '08:00', replied: 8, unreplied: 1, spam: 0 },
      { hour: '09:00', replied: 9, unreplied: 1, spam: 1 },
      { hour: '10:00', replied: 10, unreplied: 0, spam: 1 },
      { hour: '11:00', replied: 9, unreplied: 1, spam: 1 },
      { hour: '12:00', replied: 6, unreplied: 0, spam: 0 },
      { hour: '13:00', replied: 5, unreplied: 1, spam: 0 },
      { hour: '14:00', replied: 5, unreplied: 0, spam: 0 },
    ],
  },
];

export interface MonitorAgentRow {
  id: string;
  username: string;
  initial: string;
  ext: string | null;
  queues: string[];
  status: 'Ready' | 'Not ready';
  stateDurationSec: number;
  voiceAssigned: boolean;
  voiceEnabled: boolean;
  voiceState: 'Avail' | 'In call' | 'Not avail';
  voiceCallDurationSec: number | null;
  chatAssigned: boolean;
  chatEnabled: boolean;
  chatActiveCount: number;
  emailAssigned: boolean;
  emailEnabled: boolean;
  emailActiveCount: number;
}

export const INITIAL_MONITOR_AGENTS: MonitorAgentRow[] = [
  {
    id: 'ma-1',
    username: 'thangbq',
    initial: 'T',
    ext: null,
    queues: ['DEFAULT QUEUE'],
    status: 'Ready',
    stateDurationSec: 495550, // 137:39:10
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 3,
    emailAssigned: false,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-2',
    username: 'huyenpt06',
    initial: 'H',
    ext: '1010',
    queues: ['Connect CS', 'ACD-1100'],
    status: 'Ready',
    stateDurationSec: 12260, // 03:24:20
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'In call',
    voiceCallDurationSec: 214,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 2,
  },
  {
    id: 'ma-3',
    username: 'Dev',
    initial: 'D',
    ext: null,
    queues: ['DEFAULT QUEUE'],
    status: 'Ready',
    stateDurationSec: 101952, // 28:19:12
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 4,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 31,
  },
  {
    id: 'ma-4',
    username: 'Mint',
    initial: 'M',
    ext: '1002',
    queues: ['Connect CS', 'Queue Dai Ly'],
    status: 'Ready',
    stateDurationSec: 162953, // 45:15:53
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'Avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 52,
  },
  {
    id: 'ma-5',
    username: 'annelele',
    initial: 'A',
    ext: '1013',
    queues: ['Connect CS', 'Queue Dai Ly'],
    status: 'Ready',
    stateDurationSec: 257232, // 71:27:12
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'In call',
    voiceCallDurationSec: 98,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 2,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 9,
  },
  {
    id: 'ma-6',
    username: 'ba.huyen',
    initial: 'B',
    ext: null,
    queues: ['DEFAULT QUEUE'],
    status: 'Ready',
    stateDurationSec: 18420,
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-7',
    username: 'huyenpt',
    initial: 'H',
    ext: '1006',
    queues: ['Connect CS', 'ACD-1100'],
    status: 'Ready',
    stateDurationSec: 647, // 00:10:47
    voiceAssigned: true,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 1,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 13,
  },
  {
    id: 'ma-8',
    username: 'thangth',
    initial: 'T',
    ext: '1014',
    queues: ['Connect CS', 'Queue Dai Ly'],
    status: 'Not ready',
    stateDurationSec: 17452, // 04:50:52
    voiceAssigned: true,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-9',
    username: 'hieunl',
    initial: 'H',
    ext: null,
    queues: ['DEFAULT QUEUE'],
    status: 'Not ready',
    stateDurationSec: 255262, // 70:54:22
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-10',
    username: 'ba.tuann',
    initial: 'B',
    ext: null,
    queues: ['ACD-1100'],
    status: 'Not ready',
    stateDurationSec: 10409, // 02:53:29
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-11',
    username: 'linh.ntk',
    initial: 'L',
    ext: '1019',
    queues: ['ACD-1100', 'Connect CS'],
    status: 'Ready',
    stateDurationSec: 4820,
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'In call',
    voiceCallDurationSec: 342,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 2,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 7,
  },
  {
    id: 'ma-12',
    username: 'quang.dv',
    initial: 'Q',
    ext: '1024',
    queues: ['Queue Dai Ly'],
    status: 'Ready',
    stateDurationSec: 8920,
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'Avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 15,
  },
  {
    id: 'ma-13',
    username: 'trang.nt',
    initial: 'T',
    ext: '1028',
    queues: ['Connect CS', 'ACD-2147483647'],
    status: 'Ready',
    stateDurationSec: 3410,
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'Avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 3,
    emailAssigned: true,
    emailEnabled: true,
    emailActiveCount: 19,
  },
  {
    id: 'ma-14',
    username: 'nam.vh',
    initial: 'N',
    ext: '1032',
    queues: ['ACD-1100'],
    status: 'Ready',
    stateDurationSec: 1520,
    voiceAssigned: true,
    voiceEnabled: true,
    voiceState: 'In call',
    voiceCallDurationSec: 165,
    chatAssigned: false,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: false,
    emailEnabled: false,
    emailActiveCount: 0,
  },
  {
    id: 'ma-15',
    username: 'duyen.tm',
    initial: 'D',
    ext: null,
    queues: ['DEFAULT QUEUE'],
    status: 'Ready',
    stateDurationSec: 6380,
    voiceAssigned: false,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: true,
    chatActiveCount: 5,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 4,
  },
  {
    id: 'ma-16',
    username: 'tung.nt',
    initial: 'T',
    ext: '1035',
    queues: ['ACD-2147483647'],
    status: 'Not ready',
    stateDurationSec: 2140,
    voiceAssigned: true,
    voiceEnabled: false,
    voiceState: 'Not avail',
    voiceCallDurationSec: null,
    chatAssigned: true,
    chatEnabled: false,
    chatActiveCount: 0,
    emailAssigned: true,
    emailEnabled: false,
    emailActiveCount: 6,
  },
];

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatHms(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
