import React from 'react';
import { Clock } from 'lucide-react';

export interface HalfHourRange {
  /** Start slot index in [0..47], where 0 = 00:00, 1 = 00:30, ..., 47 = 23:30 */
  startSlot: number;
  /** End slot index (exclusive) in [1..48], where 48 = 24:00 */
  endSlot: number;
}

export const HALF_HOUR_LABELS: string[] = Array.from({ length: 49 }, (_, i) => {
  if (i === 48) return '24:00';
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// Anchor window end at 18:00 (slot 36) with 30-minute intervals
const RANGE_OPTIONS: {
  key: '6h' | '3h' | '1h' | '30m';
  label: string;
  range: HalfHourRange;
}[] = [
  { key: '6h', label: 'Last 6 hours', range: { startSlot: 24, endSlot: 36 } }, // 12:00 - 18:00 (12 x 30m)
  { key: '3h', label: 'Last 3 hours', range: { startSlot: 30, endSlot: 36 } }, // 15:00 - 18:00 (6 x 30m)
  { key: '1h', label: 'Last 1 hour', range: { startSlot: 34, endSlot: 36 } }, // 17:00 - 18:00 (2 x 30m)
  { key: '30m', label: 'Last 30 minutes', range: { startSlot: 35, endSlot: 36 } }, // 17:30 - 18:00 (1 x 30m)
];

export const DEFAULT_HALF_HOUR_RANGE: HalfHourRange = RANGE_OPTIONS[0].range;

export function formatSlotRange(range: HalfHourRange): string {
  const matched = RANGE_OPTIONS.find(
    (o) =>
      o.range.startSlot === range.startSlot &&
      o.range.endSlot === range.endSlot
  );
  const span = `${HALF_HOUR_LABELS[range.startSlot]} – ${HALF_HOUR_LABELS[range.endSlot]}`;
  return matched ? `${matched.label} (${span})` : span;
}

/** Deterministic intraday traffic curve (48 half-hour slots from 00:00 to 23:30) */
export function getHalfHourWeight(slotIndex: number): number {
  const hour = slotIndex / 2;
  if (hour < 6) return 0.12 + (slotIndex % 3) * 0.02;
  if (hour < 8) return 0.35 + (hour - 6) * 0.25;
  if (hour < 11.5) return 0.85 + Math.sin((hour - 8) * 0.9) * 0.35;
  if (hour < 13.5) return 0.72 + (slotIndex % 2) * 0.08;
  if (hour < 17) return 0.95 + Math.sin((hour - 13.5) * 0.85) * 0.32;
  if (hour < 20) return 0.62 - (hour - 17) * 0.1;
  return 0.24 - Math.min(0.14, (hour - 20) * 0.03);
}

interface HalfHourFilterBarProps {
  value: HalfHourRange;
  onChange: (next: HalfHourRange) => void;
  channelName: string;
}

export const HalfHourFilterBar: React.FC<HalfHourFilterBarProps> = ({
  value,
  onChange,
  channelName,
}) => {
  const selectedKey =
    RANGE_OPTIONS.find(
      (o) =>
        o.range.startSlot === value.startSlot &&
        o.range.endSlot === value.endSlot
    )?.key ?? '6h';

  const handleSelectChange = (key: string) => {
    const matched = RANGE_OPTIONS.find((opt) => opt.key === key);
    if (matched) {
      onChange(matched.range);
    }
  };

  return (
    <div className="flex items-center justify-end">
      <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#DCE3EE] bg-[#F8FAFC] text-[12.5px] font-medium text-slate-700">
        <Clock size={13} className="text-slate-400" />
        <select
          aria-label={`Khung thời gian ${channelName}`}
          value={selectedKey}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
