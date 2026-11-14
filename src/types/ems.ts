export type TopSection = 'twin' | 'overview' | 'devices' | 'curves' | 'strategy';

export type SystemThemeKey = 'aurora-cyan' | 'tech-blue' | 'emerald-grid' | 'amber-scifi';

export type DeviceModuleKey =
  | 'PCS数据'
  | 'BMS数据'
  | '电表数据'
  | '空调数据'
  | '消防/照明'
  | 'UPS数据';

export type CurveModuleKey = 'PCS曲线' | 'SOC曲线' | '报表查询' | '历史曲线';

export type StrategyModuleKey = '分时计划' | '运行策略' | '计划配置';

export type PcsTabKey = 'PCS参数设置' | 'PCS数据' | 'PCS状态';
export type PcsInnerKey = '电网参数' | '交流参数' | '直流参数';
export type BmsTabKey = 'BMS参数' | '电池参数';
export type MeterTabKey = '实时数据' | '电能统计';
export type CurveRangeKey = '1小时' | '6小时' | '24小时' | '7天';
export type ReportDeviceKey = 'PCS-01' | 'BMS-01';

export interface SidebarMenuItem<T extends string = string> {
  label: T;
  icon: string;
}

export interface RevenueStatItem {
  id: string;
  iconKey: 'income' | 'coin' | 'charge' | 'discharge' | 'energy';
  label: string;
  value: string;
  unit: string;
  colorClass: 'gold' | 'greenish' | 'violet';
}

export interface OverviewDeviceItem {
  id: string;
  iconKey: 'air' | 'temp' | 'fan' | 'fire' | 'light' | 'ups';
  name: string;
  status: string;
  isNumeric?: boolean;
}

export interface ParameterTriplet {
  name: string;
  value: string;
  unit: string;
}

export interface PcsConfigRow {
  leftName: string;
  leftValue: string;
  leftRange: string;
  rightName: string;
  rightValue: string;
  rightRange: string;
  hasSwitch?: boolean;
}

export interface ScheduleSlotRow {
  id: string;
  period: string;
  startTime: string;
  endTime: string;
  mode: '充电' | '待机' | '放电';
  power: string;
  enabled: boolean;
}

export interface ScheduleSegment {
  id: string;
  label: string;
  type: 'charge' | 'idle' | 'discharge';
  widthClass: string;
}

export interface ReportRow {
  time: string;
  pcsPower: string;
  batteryVoltage: string;
  soc: string;
  gridFrequency: string;
  device: ReportDeviceKey;
}
