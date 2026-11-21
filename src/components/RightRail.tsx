import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Code2,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessageCircleMore,
  Send,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import { SlaAlert } from '../data/mockDashboardData';
import { DashboardTabId } from '../data/menuConfig';

export type RightDrawerMode = null | 'sla' | 'notifications' | 'broadcast' | 'apps';

interface RightRailProps {
  slaAlerts: SlaAlert[];
  onDismissAlert: (id: string) => void;
  onJumpToTab: (tab: DashboardTabId) => void;
  onSendBroadcast: (message: string) => void;
  onOpenSettingsNote: () => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  slaAlerts,
  onDismissAlert,
  onJumpToTab,
  onSendBroadcast,
  onOpenSettingsNote,
}) => {
  const [drawer, setDrawer] = useState<RightDrawerMode>(null);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState<
    { id: string; time: string; text: string }[]
  >([
    {
      id: 'b-1',
      time: '11:05',
      text: 'Nhóm Inbound Voice hỗ trợ thêm nhánh Hotline 1900 6868 trong khung cao điểm 11:00–12:00.',
    },
  ]);

  const toggleDrawer = (mode: Exclude<RightDrawerMode, null>) => {
    setDrawer((prev) => (prev === mode ? null : mode));
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = broadcastInput.trim();
    if (!trimmed) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setBroadcastHistory((prev) => [
      { id: `b-${Date.now()}`, time: timeStr, text: trimmed },
      ...prev,
    ]);
    onSendBroadcast(trimmed);
    setBroadcastInput('');
  };

  return (
    <>
      <aside
        className="w-[58px] bg-white border-l border-[#E6EAF2] flex flex-col items-center justify-between py-3 shrink-0 select-none relative z-30"
        aria-label="Thanh tiện ích nhanh"
      >
        {/* Top Utility Icons */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* User Avatar */}
          <button
            type="button"
            onClick={() => toggleDrawer('apps')}
            className="flex flex-col items-center gap-1 group focus-visible:outline-none"
            title="Tài khoản giám sát: ba.tuann"
          >
            <div className="w-9 h-9 rounded-full bg-slate-400/80 text-white flex items-center justify-center ring-2 ring-transparent group-hover:ring-orange-300 transition-all">
              <User size={20} strokeWidth={1.8} />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 leading-none">
              ba.tuann
            </span>
          </button>

          {/* Apps Grid */}
          <button
            type="button"
            onClick={() => toggleDrawer('apps')}
            className={`w-10 h-9 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              drawer === 'apps'
                ? 'bg-orange-50 text-[#F05A28]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Chuyển nhanh kênh giám sát"
          >
            <LayoutGrid size={18} strokeWidth={1.8} />
          </button>

          {/* SLA Alert Counter */}
          <button
            type="button"
            onClick={() => toggleDrawer('sla')}
            className={`relative w-11 h-10 rounded-lg flex flex-col items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              drawer === 'sla'
                ? 'bg-red-50 text-red-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Cảnh báo ngưỡng SLA"
          >
            <span className="text-[11px] font-bold tracking-tight">SLA</span>
            {slaAlerts.length > 0 && (
              <span className="absolute -top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {slaAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => toggleDrawer('notifications')}
            className={`w-10 h-9 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              drawer === 'notifications'
                ? 'bg-orange-50 text-[#F05A28]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Thông báo vận hành"
          >
            <Bell size={18} strokeWidth={1.8} />
          </button>

          {/* Quick Chat */}
          <button
            type="button"
            onClick={() => onJumpToTab('chat')}
            className="w-10 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-[#F05A28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Mở tab Giám sát Chat"
          >
            <MessageCircle size={18} strokeWidth={1.8} />
          </button>

          {/* Quick Email */}
          <button
            type="button"
            onClick={() => onJumpToTab('email')}
            className="w-10 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-[#F05A28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Mở tab Giám sát Email"
          >
            <Mail size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Bottom Utility Icons + Floating Chat FAB */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            type="button"
            onClick={onOpenSettingsNote}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Chế độ hiển thị sáng (Enterprise Light)"
          >
            <Sun size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => onJumpToTab('ticket')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Mở tab Giám sát Ticket"
          >
            <Code2 size={16} strokeWidth={1.8} />
          </button>

          {/* Floating Orange Support / Broadcast Button matching screenshot */}
          <button
            type="button"
            onClick={() => toggleDrawer('broadcast')}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F9B233] to-[#F07A28] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Gửi thông báo điều phối nhanh đến Agent"
            aria-label="Gửi thông báo điều phối nhanh"
          >
            <MessageCircleMore size={20} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={onOpenSettingsNote}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Cài đặt bảng điều khiển"
          >
            <Settings size={16} strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      {/* Slide-over Context Panel */}
      {drawer && (
        <div className="fixed inset-y-0 right-[58px] w-[340px] max-w-[calc(100vw-68px)] bg-white border-l border-[#E2E8F0] shadow-xl z-40 flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-slate-900">
              {drawer === 'sla' && `Cảnh báo ngưỡng SLA (${slaAlerts.length})`}
              {drawer === 'notifications' && 'Thông báo vận hành'}
              {drawer === 'broadcast' && 'Điều phối nhanh nội bộ'}
              {drawer === 'apps' && 'Lối tắt giám sát nhanh'}
            </h3>
            <button
              type="button"
              onClick={() => setDrawer(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Đóng bảng tiện ích"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {drawer === 'sla' && (
              <div className="space-y-3">
                {slaAlerts.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-[13px] font-medium text-slate-700">
                      Tất cả hàng đợi đang đạt chuẩn SLA
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Không có cảnh báo vượt ngưỡng nào ở thời điểm hiện tại.
                    </p>
                  </div>
                ) : (
                  slaAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-[#FAFBFD] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11.5px]">
                        <span
                          className={`font-semibold flex items-center gap-1.5 ${
                            alert.severity === 'critical'
                              ? 'text-red-600'
                              : 'text-amber-700'
                          }`}
                        >
                          <AlertTriangle size={13} />
                          {alert.severity === 'critical' ? 'Vượt ngưỡng' : 'Cảnh báo sớm'}
                        </span>
                        <span className="text-slate-400">{alert.timeAgo}</span>
                      </div>
                      <div className="text-[13px] font-semibold text-slate-900">
                        {alert.queue} · {alert.channel}
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {alert.message}
                      </p>
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onJumpToTab(alert.targetTab);
                            setDrawer(null);
                          }}
                          className="text-[12px] font-semibold text-[#F05A28] hover:text-[#D94A1A] inline-flex items-center gap-1"
                        >
                          Xem chi tiết kênh
                          <ArrowRight size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDismissAlert(alert.id)}
                          className="text-[11.5px] text-slate-500 hover:text-slate-800"
                        >
                          Đã tiếp nhận
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {drawer === 'notifications' && (
              <div className="divide-y divide-slate-100">
                {[
                  {
                    title: 'Định tuyến tràn hàng đợi tự động',
                    desc: 'Đã điều chuyển 2 cuộc gọi từ Hotline 1900 sang Nhóm dự phòng Miền Nam.',
                    time: '3 phút trước',
                  },
                  {
                    title: 'Ca trực sáng đạt 95.1% SLA tổng hợp',
                    desc: 'Kênh Chat Zalo OA ghi nhận thời gian phản hồi đầu tiên trung bình 14 giây.',
                    time: '18 phút trước',
                  },
                  {
                    title: 'Đồng bộ CRM Khách hàng 360°',
                    desc: 'Hoàn tất cập nhật 142 hồ sơ VIP mới từ hệ thống Core Banking.',
                    time: '45 phút trước',
                  },
                ].map((n, idx) => (
                  <div key={idx} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px] font-semibold text-slate-900">{n.title}</p>
                      <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {drawer === 'broadcast' && (
              <div className="flex flex-col h-full">
                <p className="text-[12px] text-slate-500 mb-3">
                  Gửi chỉ thị ngắn trực tiếp tới thanh thông báo của toàn bộ điện thoại viên đang trực ca.
                </p>
                <form onSubmit={handleBroadcastSubmit} className="space-y-2.5 mb-4">
                  <textarea
                    rows={3}
                    value={broadcastInput}
                    onChange={(e) => setBroadcastInput(e.target.value)}
                    placeholder="Ví dụ: Đề nghị nhóm Chat hỗ trợ thêm hàng đợi Zalo OA trong 15 phút tới..."
                    className="w-full p-2.5 text-[12.5px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#F05A28] resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg bg-[#F05A28] hover:bg-[#D94A1A] text-white text-[12.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send size={14} />
                    Gửi thông báo tới Ca trực
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11.5px] font-semibold text-slate-500 mb-2">
                    Lịch sử điều phối ca này
                  </div>
                  <div className="space-y-2.5">
                    {broadcastHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70"
                      >
                        <div className="text-[11px] font-mono text-slate-400 mb-1">
                          {item.time} · Supervisor ba.tuann
                        </div>
                        <p className="text-[12px] text-slate-700 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {drawer === 'apps' && (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'General Dashboard', tab: 'overview' as DashboardTabId, desc: 'Tổng quan hệ thống' },
                  { label: 'Giám sát Voice', tab: 'voice' as DashboardTabId, desc: 'Cuộc gọi trực tiếp' },
                  { label: 'Giám sát Chat', tab: 'chat' as DashboardTabId, desc: 'Zalo, Web, Fanpage' },
                  { label: 'Giám sát Email', tab: 'email' as DashboardTabId, desc: 'Hàng đợi SLA thư' },
                  { label: 'Giám sát Ticket', tab: 'ticket' as DashboardTabId, desc: 'Phiếu yêu cầu' },
                  { label: 'Đội ngũ Agent', tab: 'agents' as DashboardTabId, desc: '48 nhân sự trực' },
                ].map((shortcut) => (
                  <button
                    key={shortcut.tab}
                    type="button"
                    onClick={() => {
                      onJumpToTab(shortcut.tab);
                      setDrawer(null);
                    }}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#F05A28] hover:bg-[#FFF8F5] text-left transition-colors"
                  >
                    <div className="text-[12.5px] font-semibold text-slate-900">
                      {shortcut.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{shortcut.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
