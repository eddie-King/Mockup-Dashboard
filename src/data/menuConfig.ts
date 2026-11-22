export type MenuIconKey =
  | 'monitor'
  | 'chart-box'
  | 'receive'
  | 'mail'
  | 'chat'
  | 'page'
  | 'workflow'
  | 'users'
  | 'database'
  | 'type'
  | 'target'
  | 'user-check'
  | 'phone';

export type DashboardTabId =
  | 'overview'
  | 'voice'
  | 'chat'
  | 'email'
  | 'fanpage'
  | 'ticket'
  | 'agents';

export interface MenuItem {
  id: string;
  label: string;
  icon: MenuIconKey;
  children?: MenuItem[];
  /** If set, clicking this item activates the Centralized Omni Dashboard on the target tab */
  dashboardTab?: DashboardTabId;
  description?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export const SIDEBAR_MENU: MenuSection[] = [
  {
    id: 'inbound',
    title: 'Inbound',
    items: [
      {
        id: 'inbound-omni-dashboard',
        label: 'Omni Dashboard',
        icon: 'chart-box',
        dashboardTab: 'voice',
        description:
          'Bảng điều khiển tập trung giám sát thời gian thực toàn bộ kênh Voice, Chat, Email, Fanpage Comment, Ticket và Agent.',
      },
      {
        id: 'inbound-receive',
        label: 'Tiếp nhận',
        icon: 'receive',
        children: [
          {
            id: 'inbound-email-mgmt',
            label: 'Quản lý Email',
            icon: 'mail',
            dashboardTab: 'email',
            description:
              'Hộp thư đa kênh quản lý email khách hàng và cam kết thời gian phản hồi SLA.',
            children: [
              {
                id: 'inbound-email-inbox',
                label: 'Hộp thư đến',
                icon: 'mail',
                dashboardTab: 'email',
                description: 'Theo dõi email mới tiếp nhận và phân bổ theo hàng đợi.',
              },
              {
                id: 'inbound-email-sla',
                label: 'Email sắp quá hạn',
                icon: 'mail',
                dashboardTab: 'email',
                description: 'Cảnh báo sớm các yêu cầu email gần chạm ngưỡng SLA.',
              },
            ],
          },
          {
            id: 'inbound-chat-sessions',
            label: 'Quản lý phiên chat',
            icon: 'chat',
            description:
              'Quản trị toàn bộ phiên hội thoại từ Digiweb / Web VCB, Digibank Chatbot, Zalo OA và Facebook Messenger.',
          },
          {
            id: 'inbound-fanpage',
            label: 'Fanpage',
            icon: 'page',
            dashboardTab: 'fanpage',
            description:
              'Tiếp nhận bình luận và tin nhắn từ hệ thống Facebook Fanpage doanh nghiệp.',
          },
        ],
      },
      {
        id: 'inbound-requests',
        label: 'Xử lý yêu cầu',
        icon: 'workflow',
        dashboardTab: 'ticket',
        description:
          'Quản lý vòng đời phiếu ghi (Ticket), luồng phê duyệt và chuyển cấp xử lý.',
        children: [
          {
            id: 'inbound-tickets',
            label: 'Danh sách phiếu ghi',
            icon: 'page',
            dashboardTab: 'ticket',
            description: 'Theo dõi toàn bộ phiếu yêu cầu khách hàng theo mức độ ưu tiên.',
          },
          {
            id: 'inbound-escalations',
            label: 'Phiếu chuyển cấp',
            icon: 'page',
            description: 'Các yêu cầu phức tạp đã chuyển sang bộ phận Back-office xử lý.',
          },
        ],
      },
      {
        id: 'inbound-customers',
        label: 'Quản lý khách hàng',
        icon: 'users',
        description:
          'Hồ sơ khách hàng hợp nhất 360° với lịch sử tương tác đa kênh Voice, Chat, Email.',
      },
      {
        id: 'inbound-master-data',
        label: 'Dữ liệu cơ sở',
        icon: 'database',
        description:
          'Thiết lập danh mục lý do liên hệ, phân loại khiếu nại và nhãn tương tác Inbound.',
        children: [
          {
            id: 'inbound-reason-codes',
            label: 'Mã lý do liên hệ',
            icon: 'page',
            description: 'Danh mục phân loại mục đích gọi và chủ đề trao đổi.',
          },
          {
            id: 'inbound-sla-profiles',
            label: 'Cấu hình SLA',
            icon: 'page',
            description:
              'Định nghĩa ngưỡng thời gian phản hồi chuẩn theo phân khúc khách hàng.',
          },
        ],
      },
    ],
  },
  {
    id: 'outbound',
    title: 'Outbound',
    items: [
      {
        id: 'outbound-monitor',
        label: 'Giám sát',
        icon: 'monitor',
        description:
          'Giám sát tiến độ gọi ra, tỷ lệ kết nối thành công và hiệu quả quay số tự động.',
        children: [
          {
            id: 'outbound-live-campaign',
            label: 'Giám sát chiến dịch',
            icon: 'chart-box',
            description: 'Theo dõi thời gian thực các chiến dịch Auto-dialer đang chạy.',
          },
        ],
      },
      {
        id: 'outbound-campaign-types',
        label: 'Quản lý loại chiến dịch',
        icon: 'type',
        description:
          'Cấu hình mẫu chiến dịch CSKH sau bán hàng, nhắc lịch thanh toán và khảo sát.',
      },
      {
        id: 'outbound-campaigns',
        label: 'Quản lý chiến dịch',
        icon: 'target',
        description:
          'Khởi tạo, lập lịch và điều phối nguồn lực cho các chiến dịch Outbound.',
      },
      {
        id: 'outbound-customer-lists',
        label: 'Danh sách khách hàng',
        icon: 'users',
        description: 'Quản lý tệp dữ liệu khách hàng mục tiêu và bộ lọc loại trừ DNC.',
        children: [
          {
            id: 'outbound-import-list',
            label: 'Tệp dữ liệu gọi ra',
            icon: 'page',
            description: 'Nhập và phân nhóm danh sách khách hàng cho từng chiến dịch.',
          },
        ],
      },
      {
        id: 'outbound-assign',
        label: 'Phân công khách hàng',
        icon: 'user-check',
        description: 'Phân bổ danh sách khách hàng theo kỹ năng và hạn mức của từng Agent.',
      },
      {
        id: 'outbound-calls',
        label: 'Quản lý cuộc gọi',
        icon: 'phone',
        description:
          'Tra cứu lịch sử cuộc gọi ra, file ghi âm và kết quả phân loại cuộc gọi.',
        children: [
          {
            id: 'outbound-call-history',
            label: 'Lịch sử cuộc gọi ra',
            icon: 'phone',
            description: 'Chi tiết trạng thái kết nối và ghi chú kết quả tương tác.',
          },
        ],
      },
      {
        id: 'outbound-master-data',
        label: 'Dữ liệu cơ sở',
        icon: 'database',
        description:
          'Quản lý mã kết quả cuộc gọi ra, khung giờ gọi cho phép và kịch bản gọi.',
        children: [
          {
            id: 'outbound-disposition',
            label: 'Mã kết quả cuộc gọi',
            icon: 'page',
            description: 'Thiết lập bộ mã trạng thái sau cuộc gọi Outbound.',
          },
        ],
      },
    ],
  },
  {
    id: 'common',
    title: 'Chung',
    items: [
      {
        id: 'common-routing',
        label: 'Tiếp nhận & phân phối',
        icon: 'monitor',
        description:
          'Thiết lập kịch bản định tuyến thông minh ACD, nhóm kỹ năng và quy tắc tràn hàng đợi.',
        children: [
          {
            id: 'common-acd-rules',
            label: 'Luật định tuyến ACD',
            icon: 'chart-box',
            description: 'Cấu hình ưu tiên phân phối theo kỹ năng và phân khúc VIP.',
          },
        ],
      },
      {
        id: 'common-dashboard',
        label: 'Dashboard',
        icon: 'chart-box',
        description: 'Khu vực bảng điều khiển giám sát tổng thể hệ thống.',
        children: [
          {
            id: 'common-general-dashboard',
            label: 'General',
            icon: 'chart-box',
            description:
              'Tổng quan toàn hệ thống theo thời gian thực: tổng đăng nhập, chưa sẵn sàng và nhân sự sẵn sàng theo từng kênh.',
          },
          {
            id: 'common-qa-dashboard',
            label: 'Quality Assurance',
            icon: 'chart-box',
            description:
              'Tổng quan và chi tiết kết quả đánh giá chất lượng (QA) theo kênh Inbound và chiến dịch Outbound.',
          },
          {
            id: 'common-wfm-dashboard',
            label: 'Workforce Management',
            icon: 'users',
            description:
              'Theo dõi số lượng Agent hoạt động trong ca trực, AHT, Talk Time trung bình và Occupancy Rate.',
          },
        ],
      },
    ],
  },
];

export function stripVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}
