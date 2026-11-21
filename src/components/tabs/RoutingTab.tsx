import React from 'react';
import { GitFork, ShieldAlert } from 'lucide-react';
import { RoutingRule, formatDuration } from '../../data/mockDashboardData';

interface RoutingTabProps {
  rules: RoutingRule[];
  onToggleRuleFlag: (
    ruleId: string,
    field: 'vipPriority' | 'overflowEnabled'
  ) => void;
  onChangeStrategy: (
    ruleId: string,
    strategy: RoutingRule['strategy']
  ) => void;
}

export const RoutingTab: React.FC<RoutingTabProps> = ({
  rules,
  onToggleRuleFlag,
  onChangeStrategy,
}) => {
  const activeOverflowCount = rules.filter((r) => r.overflowEnabled).length;
  const activeVipCount = rules.filter((r) => r.vipPriority).length;

  return (
    <div className="space-y-6">
      {/* Routing Summary Strip */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-[14.5px] font-bold text-[#1E293B]">
              1. Cấu hình Định tuyến Đa kênh (ACD Routing Engine)
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Điều chỉnh nhanh thuật toán phân phối, ưu tiên VIP và quy tắc tràn tuyến khi lưu lượng tăng đột biến
            </p>
          </div>
          <div className="flex items-center gap-4 text-[12.5px] text-slate-600 tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <GitFork size={14} className="text-[#3B49DF]" />
              Tràn tuyến đang bật: <strong>{activeOverflowCount}/{rules.length}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#F05A28]" />
              Ưu tiên VIP: <strong>{activeVipCount}/{rules.length}</strong>
            </span>
          </div>
        </div>

        {/* High-level Routing Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 pt-4">
          <div className="sm:pr-5 py-2 sm:py-0">
            <div className="text-[12px] text-slate-500">Chiến lược mặc định</div>
            <div className="mt-1 text-[18px] font-bold text-slate-900">
              Skill-Based Routing
            </div>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              Ghép kỹ năng ngôn ngữ · Nghiệp vụ thẻ · Phân khúc VIP
            </div>
          </div>

          <div className="sm:px-5 py-2 sm:py-0">
            <div className="text-[12px] text-slate-500">Tỷ lệ phân phối thành công</div>
            <div className="mt-1 text-[18px] font-bold text-emerald-700 tabular-nums">
              98.6%
            </div>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              Thời gian định tuyến trung bình 0.4 giây
            </div>
          </div>

          <div className="sm:pl-5 py-2 sm:py-0">
            <div className="text-[12px] text-slate-500">Số lượt tràn tuyến trong ca</div>
            <div className="mt-1 text-[18px] font-bold text-[#F05A28] tabular-nums">
              19 lượt
            </div>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              Giảm 34% nguy cơ rớt cuộc gọi vào khung giờ cao điểm
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Routing Rules Table */}
      <section className="rounded-xl border border-[#E5E9F2] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14.5px] font-bold text-[#1E293B]">
            2. Danh sách luật định tuyến & Ngưỡng tràn hàng đợi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAFBFD] text-[11.5px] font-semibold text-slate-500">
                <th className="py-3 px-5">Hàng đợi / Kênh</th>
                <th className="py-3 px-4">Thuật toán phân phối</th>
                <th className="py-3 px-4">Tải hiện tại</th>
                <th className="py-3 px-4">Ngưỡng & Tuyến tràn</th>
                <th className="py-3 px-4 text-center">Ưu tiên VIP</th>
                <th className="py-3 px-5 text-center">Tự động tràn tuyến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">{rule.queueName}</div>
                    <div className="text-[11.5px] text-slate-500">Kênh {rule.channel}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      aria-label={`Thuật toán phân phối cho ${rule.queueName}`}
                      value={rule.strategy}
                      onChange={(e) =>
                        onChangeStrategy(
                          rule.id,
                          e.target.value as RoutingRule['strategy']
                        )
                      }
                      className="h-8 px-2.5 text-[12.5px] border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:border-[#F05A28]"
                    >
                      <option value="Skill-Based">Skill-Based</option>
                      <option value="Least Occupied">Least Occupied</option>
                      <option value="Round Robin">Round Robin</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex items-center justify-between text-[12px] tabular-nums mb-1">
                      <span className="font-mono font-semibold text-slate-800">
                        {rule.activeCallsOrSessions}/{rule.capacity}
                      </span>
                      <span
                        className={`font-semibold ${
                          rule.utilization >= 80
                            ? 'text-red-600'
                            : rule.utilization >= 65
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {rule.utilization}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rule.utilization >= 80
                            ? 'bg-red-500'
                            : rule.utilization >= 65
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${rule.utilization}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[12.5px] text-slate-800">
                      Sau <strong className="font-mono">{formatDuration(rule.maxWaitSec)}</strong>
                    </div>
                    <div className="text-[11.5px] text-slate-500 truncate max-w-[210px]">
                      → {rule.overflowTarget}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rule.vipPriority}
                      aria-label={`Bật tắt ưu tiên VIP cho ${rule.queueName}`}
                      onClick={() => onToggleRuleFlag(rule.id, 'vipPriority')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                        rule.vipPriority ? 'bg-[#F05A28]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          rule.vipPriority ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rule.overflowEnabled}
                      aria-label={`Bật tắt tràn tuyến cho ${rule.queueName}`}
                      onClick={() => onToggleRuleFlag(rule.id, 'overflowEnabled')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                        rule.overflowEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          rule.overflowEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
