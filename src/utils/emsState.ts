import { REPORT_ROWS } from '../data/emsData';
import type {
  CurveModuleKey,
  CurveRangeKey,
  DeviceModuleKey,
  ReportDeviceKey,
  ReportRow,
  ScheduleSlotRow,
  StrategyModuleKey,
  TopSection,
} from '../types/ems';

export interface StatusCell {
  name: string;
  isWarn: boolean;
}

export function resolvePageTitle(params: {
  section: TopSection;
  deviceModule: DeviceModuleKey;
  curveModule: CurveModuleKey;
  strategyModule: StrategyModuleKey;
}): string {
  switch (params.section) {
    case 'home':
      return '首页';
    case 'overview':
      return '总览';
    case 'devices':
      return params.deviceModule === '消防/照明' ? '消防 / 照明' : params.deviceModule;
    case 'curves':
      return params.curveModule;
    case 'strategy':
      return params.strategyModule;
    case 'twin':
      return '3D监控';
  }
}

export function getHoursForCurveRange(range: CurveRangeKey): number {
  switch (range) {
    case '1小时':
      return 1;
    case '6小时':
      return 6;
    case '7天':
      return 168;
    case '24小时':
    default:
      return 24;
  }
}

export function buildStatusMatrixRows(items: readonly string[], columns = 4): Array<Array<StatusCell | null>> {
  const groups: string[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    groups[index % columns].push(item);
  });
  const rowCount = Math.max(0, ...groups.map((g) => g.length));
  const rows: Array<Array<StatusCell | null>> = [];

  for (let row = 0; row < rowCount; row++) {
    const line: Array<StatusCell | null> = [];
    for (let col = 0; col < columns; col++) {
      const name = groups[col][row];
      if (!name) {
        line.push(null);
      } else {
        const isWarn = (name.includes('欠压') || name.includes('过流')) && ((row + col) % 3 === 0);
        line.push({ name, isWarn });
      }
    }
    rows.push(line);
  }
  return rows;
}

export function getReportRowsForDevice(device: ReportDeviceKey, date: string): ReportRow[] {
  const baseRows = REPORT_ROWS[device] ?? REPORT_ROWS['PCS-01'];
  const shortDate = date.length >= 10 ? date.slice(5) : '11-13';
  return baseRows.map((row) => ({
    ...row,
    time: `${shortDate} ${row.time.slice(6)}`,
  }));
}

export function formatReportCsv(rows: ReportRow[], device: ReportDeviceKey): string {
  const header = ['设备编号', '采集时间', 'PCS有功功率(kW)', '电池电压(V)', '电池SOC(%)', '电网频率(Hz)'].join(',');
  const lines = rows.map((row) =>
    [device, row.time, row.pcsPower, row.batteryVoltage, row.soc, row.gridFrequency].join(','),
  );
  return [header, ...lines].join('\n');
}

export function toggleScheduleSlotEnabled(
  rows: ScheduleSlotRow[],
  slotId: string,
): ScheduleSlotRow[] {
  return rows.map((row) => (row.id === slotId ? { ...row, enabled: !row.enabled } : row));
}

export function formatClockTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
