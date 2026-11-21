export interface TrunkDirectCallPoint {
  time: string;
  connectedCall: number;
  currentCall: number;
}

export interface TrunkGroupAgentRow {
  id: string;
  auxReason: string;
  agentId: string;
  agentName: string;
  agentTimeSec: number;
  callDirection: 'IN' | 'OUT' | '';
  durationSec: number;
  extension: string;
}

export interface TrunkAgentDetailRow extends TrunkGroupAgentRow {
  vdnId: string;
  vdnName: string;
  workMode: 'AUX' | 'ACD' | 'AVAIL' | 'ACW' | 'RINGING';
  workSkillId: string;
  workSkillName: string;
}

export interface TrunkGroupTable {
  id: string;
  title: string;
  rows: TrunkGroupAgentRow[];
}

export interface TrunkKpiState {
  abandonedCalls1Day: number;
  abandonedCalls30Min: number;
  callOffer30Min: number;
  agentLogin: number;
  agentAvail: number;
  agentAux: number;
  agentRinging: number;
  agentAcd: number;
  agentDacd: number;
  agentAcw: number;
  inboundConnectedCalls: number;
  inboundQueueCalls: number;
  inboundRingCalls: number;
  inboundCurrentCall: number;
}

export const INITIAL_TRUNK_KPI: TrunkKpiState = {
  abandonedCalls1Day: 0.35,
  abandonedCalls30Min: 0.33,
  callOffer30Min: 310,
  agentLogin: 93,
  agentAvail: 11,
  agentAux: 44,
  agentRinging: 0,
  agentAcd: 32,
  agentDacd: 0,
  agentAcw: 6,
  inboundConnectedCalls: 30,
  inboundQueueCalls: 0,
  inboundRingCalls: 0,
  inboundCurrentCall: 31,
};

/**
 * Formats seconds in the CMS/Grafana Trunk Monitor notation:
 * - Under 1 hour: ":MM:SS" (e.g., ":01:14", ":55:43")
 * - 1 hour or more: "H:MM:SS" (e.g., "3:01:56", "1184:20:55")
 */
export function formatCmsTime(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hours === 0) {
    return `:${mm}:${ss}`;
  }
  return `${hours}:${mm}:${ss}`;
}

function parseCmsTime(raw: string): number {
  const trimmed = raw.trim();
  const parts = trimmed.split(':');
  if (parts.length === 3) {
    const h = parts[0] === '' ? 0 : Number(parts[0]);
    const m = Number(parts[1] || 0);
    const s = Number(parts[2] || 0);
    return h * 3600 + m * 60 + s;
  }
  return 0;
}

/**
 * High-resolution 6-hour time series (10:32 -> 16:30, every 2 minutes)
 * matching the exact Total Direct Calls shape from the reference Grafana screenshot.
 */
function buildDirectCallsSeries(): TrunkDirectCallPoint[] {
  // Anchors at every 10 minutes from 10:30 to 16:30 (37 anchors)
  const anchors: number[] = [
    39, // 10:30
    38, // 10:40
    28, // 10:50
    27, // 11:00
    28, // 11:10
    38, // 11:20
    30, // 11:30
    25, // 11:40
    21, // 11:50
    20, // 12:00
    18, // 12:10
    22, // 12:20
    19, // 12:30
    11, // 12:40
    15, // 12:50
    21, // 13:00
    22, // 13:10
    16, // 13:20
    21, // 13:30
    16, // 13:40
    29, // 13:50
    26, // 14:00
    27, // 14:10
    29, // 14:20
    27, // 14:30
    31, // 14:40
    26, // 14:50
    27, // 15:00
    37, // 15:10
    39, // 15:20
    33, // 15:30
    39, // 15:40
    25, // 15:50
    27, // 16:00
    29, // 16:10
    28, // 16:20
    26, // 16:30
  ];

  // Deterministic sharp micro-oscillations matching Grafana 2-min sampling
  const jitterPattern = [
    2, -4, 5, -2, -5, 4, 1, -3, 3, -6, 2, 4, -3, -1, 5, -4, 1, 3, -2, -5,
    4, 2, -3, 1, -4, 5, -1, 2, -6, 3, -2, 4, -3, 1, 2, -4,
  ];

  const points: TrunkDirectCallPoint[] = [];
  const startMin = 10 * 60 + 32; // 10:32
  const endMin = 16 * 60 + 30; // 16:30

  let idx = 0;
  for (let m = startMin; m <= endMin; m += 2) {
    const offsetFrom1030 = m - (10 * 60 + 30);
    const segment = Math.min(anchors.length - 2, Math.floor(offsetFrom1030 / 10));
    const frac = (offsetFrom1030 % 10) / 10;
    const base = anchors[segment] + (anchors[segment + 1] - anchors[segment]) * frac;
    const jitter = jitterPattern[idx % jitterPattern.length] * 0.85;

    // Emphasize key peaks & troughs seen in reference chart
    let peakBoost = 0;
    if (m === 10 * 60 + 40) peakBoost = 3;
    if (m === 11 * 60 + 6) peakBoost = -7;
    if (m === 11 * 60 + 20) peakBoost = 2;
    if (m === 12 * 60 + 38 || m === 12 * 60 + 46) peakBoost = -4;
    if (m === 15 * 60 + 22 || m === 15 * 60 + 42) peakBoost = 4;

    const connected = Math.max(
      9,
      Math.min(41, Math.round(base + jitter + peakBoost))
    );
    const spread = (idx % 3 === 0 ? 2 : idx % 2 === 0 ? 1 : 3);
    const current = Math.min(43, connected + spread);

    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');

    points.push({
      time: `${hh}:${mm}`,
      connectedCall: connected,
      currentCall: current,
    });
    idx += 1;
  }

  return points;
}

export const INITIAL_DIRECT_CALLS_SERIES: TrunkDirectCallPoint[] =
  buildDirectCallsSeries();

export const INITIAL_TRUNK_AGENT_GROUPS: TrunkGroupTable[] = [
  {
    id: 'pdv',
    title: 'Agent P.D.V',
    rows: [
      {
        id: 'pdv-1',
        auxReason: '',
        agentId: '5556',
        agentName: 'Nguyen Thi Van Anh',
        agentTimeSec: parseCmsTime(':01:14'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':01:19'),
        extension: '7501',
      },
      {
        id: 'pdv-2',
        auxReason: '',
        agentId: '5558',
        agentName: 'Bui Thu Giang',
        agentTimeSec: parseCmsTime(':01:51'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':01:59'),
        extension: '7302',
      },
      {
        id: 'pdv-3',
        auxReason: '',
        agentId: '7279',
        agentName: 'Nguyen Thi Thao Ly',
        agentTimeSec: parseCmsTime(':02:29'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':02:34'),
        extension: '7508',
      },
      {
        id: 'pdv-4',
        auxReason: '',
        agentId: '7713',
        agentName: 'Pham Minh Anh',
        agentTimeSec: parseCmsTime(':04:13'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':04:29'),
        extension: '5024',
      },
      {
        id: 'pdv-5',
        auxReason: '',
        agentId: '5606',
        agentName: 'Luu Ha My',
        agentTimeSec: parseCmsTime(':02:55'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':02:56'),
        extension: '7152',
      },
      {
        id: 'pdv-6',
        auxReason: '',
        agentId: '7280',
        agentName: 'Tran My Hanh',
        agentTimeSec: parseCmsTime(':00:03'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':00:05'),
        extension: '7124',
      },
      {
        id: 'pdv-7',
        auxReason: '',
        agentId: '7281',
        agentName: 'Tran Khac Viet',
        agentTimeSec: parseCmsTime(':03:14'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':03:24'),
        extension: '7625',
      },
    ],
  },
  {
    id: 'pob',
    title: 'Agent P.O/B',
    rows: [
      {
        id: 'pob-1',
        auxReason: '0',
        agentId: '6426',
        agentName: 'Le Thi Thanh Huong',
        agentTimeSec: parseCmsTime(':55:43'),
        callDirection: '',
        durationSec: parseCmsTime(':01:10'),
        extension: '7412',
      },
      {
        id: 'pob-2',
        auxReason: '0',
        agentId: '6347',
        agentName: 'Nguyen T Hong Nhung',
        agentTimeSec: parseCmsTime(':09:39'),
        callDirection: '',
        durationSec: parseCmsTime(':01:25'),
        extension: '7418',
      },
      {
        id: 'pob-3',
        auxReason: '0',
        agentId: '6299',
        agentName: 'Nguyen Ngoc Bich',
        agentTimeSec: parseCmsTime(':47:58'),
        callDirection: '',
        durationSec: parseCmsTime(':12:05'),
        extension: '7421',
      },
      {
        id: 'pob-4',
        auxReason: '0',
        agentId: '6292',
        agentName: 'Khuat Thi Thuy Nga',
        agentTimeSec: parseCmsTime(':55:41'),
        callDirection: '',
        durationSec: parseCmsTime(':05:05'),
        extension: '7409',
      },
      {
        id: 'pob-5',
        auxReason: '0',
        agentId: '7284',
        agentName: 'Luong Thi Quynh Anh',
        agentTimeSec: parseCmsTime(':46:59'),
        callDirection: '',
        durationSec: parseCmsTime(':05:03'),
        extension: '7628',
      },
      {
        id: 'pob-6',
        auxReason: '0',
        agentId: '5588',
        agentName: 'Nguyen Thi Ha',
        agentTimeSec: parseCmsTime(':17:44'),
        callDirection: '',
        durationSec: parseCmsTime(':06:22'),
        extension: '7433',
      },
      {
        id: 'pob-7',
        auxReason: '',
        agentId: '7298',
        agentName: 'Do T Thu Phuong',
        agentTimeSec: parseCmsTime(':08:38'),
        callDirection: '',
        durationSec: parseCmsTime(':08:38'),
        extension: '7440',
      },
    ],
  },
  {
    id: 'vip',
    title: 'Agent VIP',
    rows: [
      {
        id: 'vip-1',
        auxReason: '',
        agentId: '6538',
        agentName: 'Pham Tra My VP09',
        agentTimeSec: parseCmsTime(':00:13'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':00:17'),
        extension: '7304',
      },
      {
        id: 'vip-2',
        auxReason: '',
        agentId: '6540',
        agentName: 'Tran TT Huyen VP11',
        agentTimeSec: parseCmsTime(':01:17'),
        callDirection: 'IN',
        durationSec: parseCmsTime(':01:23'),
        extension: '7405',
      },
      {
        id: 'vip-3',
        auxReason: '',
        agentId: '6534',
        agentName: 'Dao Thi Le VP05',
        agentTimeSec: parseCmsTime(':00:19'),
        callDirection: '',
        durationSec: parseCmsTime(':00:19'),
        extension: '5008',
      },
      {
        id: 'vip-4',
        auxReason: '0',
        agentId: '6545',
        agentName: 'Tran Bich Huyen VP18',
        agentTimeSec: parseCmsTime(':01:45'),
        callDirection: 'OUT',
        durationSec: parseCmsTime(':01:45'),
        extension: '7135',
      },
      {
        id: 'vip-5',
        auxReason: '0',
        agentId: '6544',
        agentName: 'Vu Trung Kien VP15',
        agentTimeSec: parseCmsTime('3:01:56'),
        callDirection: '',
        durationSec: parseCmsTime('2:01:29'),
        extension: '7136',
      },
      {
        id: 'vip-6',
        auxReason: '',
        agentId: '6549',
        agentName: 'N An Khanh VIP20',
        agentTimeSec: parseCmsTime(':15:11'),
        callDirection: '',
        durationSec: parseCmsTime(':15:11'),
        extension: '7312',
      },
      {
        id: 'vip-7',
        auxReason: '',
        agentId: '6546',
        agentName: 'Trang Ng Huyen VP12',
        agentTimeSec: parseCmsTime(':01:14'),
        callDirection: '',
        durationSec: parseCmsTime(':01:14'),
        extension: '7140',
      },
    ],
  },
  {
    id: 'vcc2',
    title: 'Agent VCC2',
    rows: [
      {
        id: 'vcc2-1',
        auxReason: '',
        agentId: '7241',
        agentName: 'Le Thi Ngoc Linh',
        agentTimeSec: parseCmsTime(':00:19'),
        callDirection: '',
        durationSec: parseCmsTime(':02:40'),
        extension: '7121',
      },
      {
        id: 'vcc2-2',
        auxReason: '',
        agentId: '7257',
        agentName: 'Nguyen Thi Thuy Nga',
        agentTimeSec: parseCmsTime(':03:34'),
        callDirection: '',
        durationSec: parseCmsTime(':06:38'),
        extension: '7125',
      },
      {
        id: 'vcc2-3',
        auxReason: '0',
        agentId: '7213',
        agentName: 'Phan Nhat Linh',
        agentTimeSec: parseCmsTime('3:53:57'),
        callDirection: '',
        durationSec: parseCmsTime(':46:50'),
        extension: '7132',
      },
      {
        id: 'vcc2-4',
        auxReason: 'Restime_WC_Drink',
        agentId: '7215',
        agentName: 'Nguyen T Minh Nguyet',
        agentTimeSec: parseCmsTime(':08:11'),
        callDirection: '',
        durationSec: parseCmsTime(':08:11'),
        extension: '7133',
      },
      {
        id: 'vcc2-5',
        auxReason: 'Claim',
        agentId: '7221',
        agentName: 'Ha Thi Phuong',
        agentTimeSec: parseCmsTime(':00:50'),
        callDirection: 'OUT',
        durationSec: parseCmsTime(':00:45'),
        extension: '7621',
      },
      {
        id: 'vcc2-6',
        auxReason: '',
        agentId: '7717',
        agentName: 'Nguyen T Thuy Dung',
        agentTimeSec: parseCmsTime(':02:23'),
        callDirection: '',
        durationSec: parseCmsTime(':02:23'),
        extension: '7128',
      },
      {
        id: 'vcc2-7',
        auxReason: '',
        agentId: '7268',
        agentName: 'Nguyen Th Kim Trang',
        agentTimeSec: parseCmsTime(':00:28'),
        callDirection: '',
        durationSec: parseCmsTime(':00:28'),
        extension: '7129',
      },
    ],
  },
  {
    id: 'pbe',
    title: 'Agent P.B/E',
    rows: [
      {
        id: 'pbe-1',
        auxReason: '0',
        agentId: '5574',
        agentName: 'Dao Thanh Xuan',
        agentTimeSec: parseCmsTime('1184:20:55'),
        callDirection: '',
        durationSec: parseCmsTime('1:15:51'),
        extension: '7154',
      },
      {
        id: 'pbe-2',
        auxReason: '0',
        agentId: '6480',
        agentName: 'Nguyen T Phuong Hoa',
        agentTimeSec: parseCmsTime('8:31:52'),
        callDirection: '',
        durationSec: parseCmsTime(':00:13'),
        extension: '7504',
      },
      {
        id: 'pbe-3',
        auxReason: '0',
        agentId: '6473',
        agentName: 'Truong Nguyet Anh',
        agentTimeSec: parseCmsTime('7:38:34'),
        callDirection: '',
        durationSec: parseCmsTime('7:38:34'),
        extension: '7506',
      },
      {
        id: 'pbe-4',
        auxReason: '0',
        agentId: '6436',
        agentName: 'Dang Anh Van',
        agentTimeSec: parseCmsTime('101:17:27'),
        callDirection: '',
        durationSec: parseCmsTime(':02:05'),
        extension: '7509',
      },
    ],
  },
];

export const INITIAL_AGENT_DETAILS: TrunkAgentDetailRow[] = [
  // Page 1 (1 - 14 of 42 rows — exact rows from reference screenshot 5)
  {
    id: 'det-1',
    auxReason: '0',
    agentId: '5563',
    agentName: 'Nguyen T Thanh Thao',
    agentTimeSec: parseCmsTime(':13:38'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':00:00'),
    extension: '5012',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-2',
    auxReason: '0',
    agentId: '7928',
    agentName: 'PHAM BICH NGUYET',
    agentTimeSec: parseCmsTime(':55:02'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':01:03'),
    extension: '7622',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '79',
    workSkillName: 'CB1800',
  },
  {
    id: 'det-3',
    auxReason: '0',
    agentId: '7927',
    agentName: 'NGUYEN QUANG HA',
    agentTimeSec: parseCmsTime(':28:42'),
    callDirection: '',
    durationSec: parseCmsTime(':04:21'),
    extension: '7501',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-4',
    auxReason: '0',
    agentId: '7284',
    agentName: 'Luong Thi Quynh Anh',
    agentTimeSec: parseCmsTime(':47:10'),
    callDirection: '',
    durationSec: parseCmsTime(':05:14'),
    extension: '7628',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-5',
    auxReason: '0',
    agentId: '7254',
    agentName: 'Nguyen Thi Thu Trang',
    agentTimeSec: parseCmsTime(':52:55'),
    callDirection: '',
    durationSec: parseCmsTime(':01:58'),
    extension: '7100',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-6',
    auxReason: '0',
    agentId: '7252',
    agentName: 'Duong Thi Thanh Tam',
    agentTimeSec: parseCmsTime(':48:36'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':00:28'),
    extension: '5045',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-7',
    auxReason: '0',
    agentId: '7245',
    agentName: 'Kieu Thuy Quynh',
    agentTimeSec: parseCmsTime(':41:00'),
    callDirection: '',
    durationSec: parseCmsTime(':00:11'),
    extension: '7608',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-8',
    auxReason: '0',
    agentId: '7237',
    agentName: 'Nguyen Th Dieu Huong',
    agentTimeSec: parseCmsTime(':19:52'),
    callDirection: '',
    durationSec: parseCmsTime(':00:06'),
    extension: '7613',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-9',
    auxReason: '0',
    agentId: '7234',
    agentName: 'Duong Huyen Trang',
    agentTimeSec: parseCmsTime(':56:00'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':00:25'),
    extension: '7602',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-10',
    auxReason: '0',
    agentId: '7231',
    agentName: 'Nguyen Th Linh Nhi',
    agentTimeSec: parseCmsTime(':06:24'),
    callDirection: '',
    durationSec: parseCmsTime(':02:03'),
    extension: '7609',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-11',
    auxReason: 'Claim',
    agentId: '7221',
    agentName: 'Ha Thi Phuong',
    agentTimeSec: parseCmsTime(':00:50'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':00:45'),
    extension: '7621',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-12',
    auxReason: 'Restime_WC_Drink',
    agentId: '7215',
    agentName: 'Nguyen T Minh Nguyet',
    agentTimeSec: parseCmsTime(':08:11'),
    callDirection: '',
    durationSec: parseCmsTime(':08:11'),
    extension: '7133',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-13',
    auxReason: '0',
    agentId: '7213',
    agentName: 'Phan Nhat Linh',
    agentTimeSec: parseCmsTime('3:53:57'),
    callDirection: '',
    durationSec: parseCmsTime(':46:50'),
    extension: '7132',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-14',
    auxReason: '0',
    agentId: '6545',
    agentName: 'Tran Bich Huyen VP18',
    agentTimeSec: parseCmsTime(':01:45'),
    callDirection: 'OUT',
    durationSec: parseCmsTime(':01:45'),
    extension: '7135',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  // Page 2 (15 - 28)
  {
    id: 'det-15',
    auxReason: '',
    agentId: '5556',
    agentName: 'Nguyen Thi Van Anh',
    agentTimeSec: parseCmsTime(':01:14'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':01:19'),
    extension: '7501',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-16',
    auxReason: '',
    agentId: '5558',
    agentName: 'Bui Thu Giang',
    agentTimeSec: parseCmsTime(':01:51'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':01:59'),
    extension: '7302',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-17',
    auxReason: '',
    agentId: '7279',
    agentName: 'Nguyen Thi Thao Ly',
    agentTimeSec: parseCmsTime(':02:29'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':02:34'),
    extension: '7508',
    vdnId: '18002',
    vdnName: 'VDN_CARD_SUPPORT',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-18',
    auxReason: '',
    agentId: '7713',
    agentName: 'Pham Minh Anh',
    agentTimeSec: parseCmsTime(':04:13'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':04:29'),
    extension: '5024',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '79',
    workSkillName: 'CB1800',
  },
  {
    id: 'det-19',
    auxReason: '',
    agentId: '5606',
    agentName: 'Luu Ha My',
    agentTimeSec: parseCmsTime(':02:55'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':02:56'),
    extension: '7152',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-20',
    auxReason: '',
    agentId: '7280',
    agentName: 'Tran My Hanh',
    agentTimeSec: parseCmsTime(':00:03'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':00:05'),
    extension: '7124',
    vdnId: '18003',
    vdnName: 'VDN_EBANKING',
    workMode: 'ACD',
    workSkillId: '12',
    workSkillName: 'HN_EBANK',
  },
  {
    id: 'det-21',
    auxReason: '',
    agentId: '7281',
    agentName: 'Tran Khac Viet',
    agentTimeSec: parseCmsTime(':03:14'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':03:24'),
    extension: '7625',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-22',
    auxReason: '',
    agentId: '6538',
    agentName: 'Pham Tra My VP09',
    agentTimeSec: parseCmsTime(':00:13'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':00:17'),
    extension: '7304',
    vdnId: '18008',
    vdnName: 'VDN_VIP_PRIORITY',
    workMode: 'ACD',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-23',
    auxReason: '',
    agentId: '6540',
    agentName: 'Tran TT Huyen VP11',
    agentTimeSec: parseCmsTime(':01:17'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':01:23'),
    extension: '7405',
    vdnId: '18008',
    vdnName: 'VDN_VIP_PRIORITY',
    workMode: 'ACD',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-24',
    auxReason: '',
    agentId: '6534',
    agentName: 'Dao Thi Le VP05',
    agentTimeSec: parseCmsTime(':00:19'),
    callDirection: '',
    durationSec: parseCmsTime(':00:19'),
    extension: '5008',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-25',
    auxReason: '',
    agentId: '6549',
    agentName: 'N An Khanh VIP20',
    agentTimeSec: parseCmsTime(':15:11'),
    callDirection: '',
    durationSec: parseCmsTime(':15:11'),
    extension: '7312',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-26',
    auxReason: '',
    agentId: '6546',
    agentName: 'Trang Ng Huyen VP12',
    agentTimeSec: parseCmsTime(':01:14'),
    callDirection: '',
    durationSec: parseCmsTime(':01:14'),
    extension: '7140',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-27',
    auxReason: '',
    agentId: '7241',
    agentName: 'Le Thi Ngoc Linh',
    agentTimeSec: parseCmsTime(':00:19'),
    callDirection: '',
    durationSec: parseCmsTime(':02:40'),
    extension: '7121',
    vdnId: '',
    vdnName: '',
    workMode: 'ACW',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-28',
    auxReason: '',
    agentId: '7257',
    agentName: 'Nguyen Thi Thuy Nga',
    agentTimeSec: parseCmsTime(':03:34'),
    callDirection: '',
    durationSec: parseCmsTime(':06:38'),
    extension: '7125',
    vdnId: '',
    vdnName: '',
    workMode: 'ACW',
    workSkillId: '79',
    workSkillName: 'CB1800',
  },
  // Page 3 (29 - 42)
  {
    id: 'det-29',
    auxReason: '0',
    agentId: '6426',
    agentName: 'Le Thi Thanh Huong',
    agentTimeSec: parseCmsTime(':55:43'),
    callDirection: '',
    durationSec: parseCmsTime(':01:10'),
    extension: '7412',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-30',
    auxReason: '0',
    agentId: '6347',
    agentName: 'Nguyen T Hong Nhung',
    agentTimeSec: parseCmsTime(':09:39'),
    callDirection: '',
    durationSec: parseCmsTime(':01:25'),
    extension: '7418',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-31',
    auxReason: '0',
    agentId: '6299',
    agentName: 'Nguyen Ngoc Bich',
    agentTimeSec: parseCmsTime(':47:58'),
    callDirection: '',
    durationSec: parseCmsTime(':12:05'),
    extension: '7421',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-32',
    auxReason: '0',
    agentId: '6292',
    agentName: 'Khuat Thi Thuy Nga',
    agentTimeSec: parseCmsTime(':55:41'),
    callDirection: '',
    durationSec: parseCmsTime(':05:05'),
    extension: '7409',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '79',
    workSkillName: 'CB1800',
  },
  {
    id: 'det-33',
    auxReason: '0',
    agentId: '5588',
    agentName: 'Nguyen Thi Ha',
    agentTimeSec: parseCmsTime(':17:44'),
    callDirection: '',
    durationSec: parseCmsTime(':06:22'),
    extension: '7433',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-34',
    auxReason: '',
    agentId: '7298',
    agentName: 'Do T Thu Phuong',
    agentTimeSec: parseCmsTime(':08:38'),
    callDirection: '',
    durationSec: parseCmsTime(':08:38'),
    extension: '7440',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-35',
    auxReason: '0',
    agentId: '6544',
    agentName: 'Vu Trung Kien VP15',
    agentTimeSec: parseCmsTime('3:01:56'),
    callDirection: '',
    durationSec: parseCmsTime('2:01:29'),
    extension: '7136',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '8',
    workSkillName: 'HN_VIP',
  },
  {
    id: 'det-36',
    auxReason: '',
    agentId: '7717',
    agentName: 'Nguyen T Thuy Dung',
    agentTimeSec: parseCmsTime(':02:23'),
    callDirection: '',
    durationSec: parseCmsTime(':02:23'),
    extension: '7128',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '12',
    workSkillName: 'HN_EBANK',
  },
  {
    id: 'det-37',
    auxReason: '',
    agentId: '7268',
    agentName: 'Nguyen Th Kim Trang',
    agentTimeSec: parseCmsTime(':00:28'),
    callDirection: '',
    durationSec: parseCmsTime(':00:28'),
    extension: '7129',
    vdnId: '',
    vdnName: '',
    workMode: 'AVAIL',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
  {
    id: 'det-38',
    auxReason: '0',
    agentId: '5574',
    agentName: 'Dao Thanh Xuan',
    agentTimeSec: parseCmsTime('1184:20:55'),
    callDirection: '',
    durationSec: parseCmsTime('1:15:51'),
    extension: '7154',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-39',
    auxReason: '0',
    agentId: '6480',
    agentName: 'Nguyen T Phuong Hoa',
    agentTimeSec: parseCmsTime('8:31:52'),
    callDirection: '',
    durationSec: parseCmsTime(':00:13'),
    extension: '7504',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-40',
    auxReason: '0',
    agentId: '6473',
    agentName: 'Truong Nguyet Anh',
    agentTimeSec: parseCmsTime('7:38:34'),
    callDirection: '',
    durationSec: parseCmsTime('7:38:34'),
    extension: '7506',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-41',
    auxReason: '0',
    agentId: '6436',
    agentName: 'Dang Anh Van',
    agentTimeSec: parseCmsTime('101:17:27'),
    callDirection: '',
    durationSec: parseCmsTime(':02:05'),
    extension: '7509',
    vdnId: '',
    vdnName: '',
    workMode: 'AUX',
    workSkillId: '0',
    workSkillName: '',
  },
  {
    id: 'det-42',
    auxReason: '',
    agentId: '7290',
    agentName: 'Hoang Minh Duc',
    agentTimeSec: parseCmsTime(':01:08'),
    callDirection: 'IN',
    durationSec: parseCmsTime(':01:12'),
    extension: '7511',
    vdnId: '18001',
    vdnName: 'VDN_KHCN_MAIN',
    workMode: 'ACD',
    workSkillId: '1',
    workSkillName: 'HN_KHCN_THE',
  },
];
