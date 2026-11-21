import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Home,
  MoreVertical,
  RefreshCw,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AgentPresence } from '../data/mockDashboardData';

interface TopBarProps {
  breadcrumb: string[];
  onGoHome: () => void;
  agentStatus: AgentPresence;
  agentReason: string;
  onChangeAgentStatus: (status: AgentPresence, reason: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemoData: () => void;
}

const STATUS_OPTIONS: {
  status: AgentPresence;
  label: string;
  reason: string;
  dotColor: string;
  textColor: string;
}[] = [
  {
    status: 'ready',
    label: 'Ready',
    reason: 'Sẵn sàng tiếp nhận đa kênh',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
  {
    status: 'not-ready',
    label: 'Not ready',
    reason: 'Chưa sẵn sàng · Giám sát ca trực',
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
  },
  {
    status: 'not-ready',
    label: 'Not ready (Nghỉ giải lao)',
    reason: 'Nghỉ giải lao theo ca',
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
  },
  {
    status: 'wrap-up',
    label: 'Wrap-up',
    reason: 'Hoàn thiện phiếu sau tương tác',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700',
  },
];

export const TopBar: React.FC<TopBarProps> = ({
  breadcrumb,
  onGoHome,
  agentStatus,
  agentReason,
  onChangeAgentStatus,
  soundEnabled,
  onToggleSound,
  onResetDemoData,
}) => {
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const statusMeta = (() => {
    if (agentStatus === 'ready') {
      return {
        label: 'Ready',
        btnStyle: 'border-emerald-300 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-50',
        dot: 'bg-emerald-500',
      };
    }
    if (agentStatus === 'wrap-up') {
      return {
        label: 'Wrap-up',
        btnStyle: 'border-amber-300 bg-amber-50/70 text-amber-700 hover:bg-amber-50',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Not ready',
      btnStyle: 'border-[#DC5B53] bg-[#FEF2F2]/70 text-[#C83228] hover:bg-[#FEE2E2]/70',
      dot: 'bg-[#DC3545]',
    };
  })();

  return (
    <header className="h-[52px] bg-[#F8FAFC] border-b border-[#E5E9F2] px-5 flex items-center justify-between gap-6 shrink-0">
      {/* Left: Home + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0 text-[13px]">
        <button
          type="button"
          onClick={onGoHome}
          className="text-[#334155] hover:text-[#F05A28] transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0"
          title="Về Omni Dashboard"
          aria-label="Trang chủ Dashboard"
        >
          <Home size={15} strokeWidth={2.1} />
        </button>
        <div className="flex items-center gap-1.5 text-slate-600 truncate">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={`${crumb}-${idx}`}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              <span
                className={
                  idx === breadcrumb.length - 1
                    ? 'text-[#334155] font-medium truncate'
                    : 'text-slate-500 whitespace-nowrap'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Agent Identity + Status Selector + Quick Menu */}
      <div className="flex items-center gap-3.5 shrink-0">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-[10px] font-semibold tracking-wider text-slate-400">AGENT</div>
          <div className="text-[12.5px] font-bold text-slate-800 whitespace-nowrap">
            ba.tuann
          </div>
        </div>

        {/* Status Selector */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen((prev) => !prev)}
            className={`h-[34px] px-3 rounded-[6px] border text-[12.5px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${statusMeta.btnStyle}`}
            aria-expanded={statusOpen}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dot}`} />
            <span>{statusMeta.label}</span>
            <ChevronDown size={14} className="opacity-80" />
          </button>

          {statusOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">
                  Trạng thái trực của ba.tuann
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{agentReason}</p>
              </div>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected =
                  opt.status === agentStatus && opt.reason === agentReason;
                return (
                  <button
                    key={`${opt.status}-${opt.label}`}
                    type="button"
                    onClick={() => {
                      onChangeAgentStatus(opt.status, opt.reason);
                      setStatusOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${opt.dotColor}`}
                      />
                      <div className="min-w-0">
                        <div className={`text-[12.5px] font-medium ${opt.textColor}`}>
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {opt.reason}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#F05A28] mt-1 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Kebab Actions */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Tùy chọn hệ thống"
            title="Tùy chọn phiên demo"
          >
            <MoreVertical size={17} />
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  onToggleSound();
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{soundEnabled ? 'Tắt âm báo ngưỡng SLA' : 'Bật âm báo ngưỡng SLA'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <RefreshCw size={15} />
                <span>Khôi phục dữ liệu demo gốc</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Quyền hạn: Supervisor Ca 1</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
