import React from 'react';
import { ArrowLeft, CheckCircle2, LineChart } from 'lucide-react';
import { MenuItem } from '../data/menuConfig';

interface SecondaryModuleViewProps {
  menuItem: MenuItem;
  sectionTitle: string;
  onReturnToOmni: () => void;
}

const MODULE_ROWS: Record<
  string,
  {
    kpis: { label: string; value: string; note: string }[];
    columns: string[];
    rows: string[][];
  }
> = {
  'inbound-csat': {
    kpis: [
      { label: 'Điểm CSAT tổng hợp', value: '4.86 / 5.0', note: '+0.14 so với tuần trước' },
      { label: 'Tỷ lệ khách phản hồi khảo sát', value: '38.4%', note: '1,092 lượt đánh giá hôm nay' },
      { label: 'Đánh giá 5 sao', value: '87.2%', note: 'Kênh VIP Care dẫn đầu 94%' },
      { label: 'Cảnh báo đánh giá ≤ 2 sao', value: '6 lượt', note: 'Đã tự động tạo phiếu QA gọi lại' },
    ],
    columns: ['Kênh tương tác', 'Số lượt khảo sát', 'Điểm CSAT', 'NPS', 'Trạng thái'],
    rows: [
      ['Hotline CSKH 1900 6868', '482', '4.81 / 5.0', '+64', 'Đạt mục tiêu'],
      ['Zalo OA & Livechat', '368', '4.91 / 5.0', '+72', 'Vượt mục tiêu'],
      ['Facebook Fanpage', '144', '4.84 / 5.0', '+66', 'Đạt mục tiêu'],
      ['Email Khiếu nại & Tra soát', '98', '4.76 / 5.0', '+58', 'Đạt mục tiêu'],
    ],
  },
  'inbound-fanpage': {
    kpis: [
      { label: 'Fanpage đang kết nối', value: '4 trang', note: 'Đồng bộ Webhook realtime' },
      { label: 'Tin nhắn chờ xử lý', value: '7 phiên', note: 'Phản hồi TB 26 giây' },
      { label: 'Bình luận mới hôm nay', value: '184', note: 'Tự động ẩn SĐT khách hàng' },
      { label: 'Tỷ lệ chuyển đổi Ticket', value: '18.5%', note: '34 phiếu yêu cầu đã tạo' },
    ],
    columns: ['Tên Fanpage', 'Tin nhắn đang mở', 'Bình luận mới', 'Agent trực', 'Kết nối'],
    rows: [
      ['UniSpace-CX Official', '12', '86', '6 Agent', 'Hoạt động'],
      ['Chăm sóc Khách hàng 24/7', '9', '54', '5 Agent', 'Hoạt động'],
      ['Hỗ trợ Doanh nghiệp B2B', '4', '28', '3 Agent', 'Hoạt động'],
      ['Cộng đồng Khách hàng VIP', '2', '16', '2 Agent', 'Hoạt động'],
    ],
  },
  'outbound-campaigns': {
    kpis: [
      { label: 'Chiến dịch đang chạy', value: '5', note: '3 Auto-dialer · 2 Preview' },
      { label: 'Cuộc gọi ra hôm nay', value: '3,420', note: 'Tỷ lệ kết nối 68.4%' },
      { label: 'Hoàn thành mục tiêu', value: '74.2%', note: '2,538 khách hàng đã tiếp cận' },
      { label: 'Agent Outbound trực', value: '18', note: '15 đang gọi · 3 sẵn sàng' },
    ],
    columns: ['Tên chiến dịch', 'Loại', 'Tiến độ', 'Tỷ lệ kết nối', 'Trạng thái'],
    rows: [
      ['CSKH sau mở thẻ Platinum T11', 'Auto-dialer', '820 / 1,000', '74.5%', 'Đang chạy'],
      ['Nhắc lịch gia hạn gói Doanh nghiệp', 'Preview', '415 / 500', '81.2%', 'Đang chạy'],
      ['Khảo sát mức độ hài lòng Quý IV', 'Voicebot + Agent', '1,120 / 1,500', '64.8%', 'Đang chạy'],
      ['Tri ân khách hàng thân thiết 2026', 'Progressive', '183 / 420', '69.0%', 'Tạm dừng trưa'],
    ],
  },
};

export const SecondaryModuleView: React.FC<SecondaryModuleViewProps> = ({
  menuItem,
  sectionTitle,
  onReturnToOmni,
}) => {
  const preset = MODULE_ROWS[menuItem.id] || {
    kpis: [
      { label: 'Bản ghi đang hoạt động', value: '128', note: 'Đồng bộ thời gian thực' },
      { label: 'Tỷ lệ hoàn thành SLA', value: '94.6%', note: 'Đạt chuẩn vận hành tháng 11' },
      { label: 'Nhân sự phụ trách', value: '14 Agent', note: 'Đang trực ca sáng' },
      { label: 'Cập nhật gần nhất', value: 'Vừa xong', note: 'Hệ thống UniSpace-CX' },
    ],
    columns: ['Mã mục', 'Nội dung quản lý', 'Phân hệ', 'Phụ trách', 'Trạng thái'],
    rows: [
      ['OCX-01', `${menuItem.label} — Cấu hình chuẩn Ca 1`, sectionTitle, 'Trần Thu Hà', 'Đang áp dụng'],
      ['OCX-02', `${menuItem.label} — Nhóm khách hàng VIP`, sectionTitle, 'Lê Minh Anh', 'Đang áp dụng'],
      ['OCX-03', `${menuItem.label} — Quy trình tự động hóa`, sectionTitle, 'Nguyễn Thùy Trang', 'Đang áp dụng'],
    ],
  };

  return (
    <div className="rounded-xl bg-white border border-[#E5E9F2] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E9F2] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11.5px] font-semibold text-[#3B49DF]">
            {sectionTitle} · Phân hệ demo UniSpace-CX
          </div>
          <h1 className="text-[20px] font-extrabold text-slate-900 mt-0.5">
            {menuItem.label}
          </h1>
          {menuItem.description && (
            <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">
              {menuItem.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onReturnToOmni}
          className="h-[36px] px-4 rounded-lg bg-[#F05A28] hover:bg-[#D94A1A] text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <LineChart size={15} />
          <span>Mở Omni Dashboard</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-6 bg-[#FAFBFD] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {preset.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[#E5E9F2] bg-white px-4 py-4"
            >
              <div className="text-[12px] font-medium text-slate-500">{kpi.label}</div>
              <div className="mt-1.5 text-[22px] font-bold text-slate-900 tabular-nums">
                {kpi.value}
              </div>
              <div className="mt-1 text-[11.5px] text-slate-500">{kpi.note}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-slate-800">
              Dữ liệu mẫu phục vụ trình diễn — {menuItem.label}
            </h2>
            <button
              type="button"
              onClick={onReturnToOmni}
              className="text-[12.5px] font-semibold text-[#3B49DF] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Quay lại Centralized Dashboard
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 bg-[#FAFBFD] text-[11.5px] font-semibold text-slate-500">
                  {preset.columns.map((col) => (
                    <th key={col} className="py-3 px-5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {preset.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F8FAFC]">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-5 ${
                          cIdx === 0
                            ? 'font-semibold text-slate-900'
                            : cIdx === row.length - 1
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        {cIdx === row.length - 1 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
