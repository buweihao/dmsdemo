import type {
  CurveModuleKey,
  CurveRangeKey,
  DeviceModuleKey,
  OverviewDeviceItem,
  ParameterTriplet,
  PcsConfigRow,
  PcsInnerKey,
  ReportDeviceKey,
  ReportRow,
  RevenueStatItem,
  ScheduleSegment,
  ScheduleSlotRow,
  SidebarMenuItem,
  StrategyModuleKey,
  TopSection,
} from '../types/ems';

export const TOP_NAV_ITEMS: Array<{ key: TopSection; label: string }> = [
  { key: 'home', label: '首页' },
  { key: 'overview', label: '总览' },
  { key: 'devices', label: '设备监控' },
  { key: 'curves', label: '曲线报表' },
  { key: 'strategy', label: '策略' },
  { key: 'twin', label: '3D监控' },
];

export const DEVICE_SIDEBAR_ITEMS: SidebarMenuItem<DeviceModuleKey>[] = [
  { label: 'PCS数据', icon: '▥' },
  { label: 'BMS数据', icon: '▦' },
  { label: '电表数据', icon: '⌁' },
  { label: '空调数据', icon: '❋' },
  { label: '消防/照明', icon: '◉' },
  { label: 'UPS数据', icon: '▣' },
];

export const CURVE_SIDEBAR_ITEMS: SidebarMenuItem<CurveModuleKey>[] = [
  { label: 'PCS曲线', icon: '⌁' },
  { label: 'SOC曲线', icon: '◒' },
  { label: '报表查询', icon: '▤' },
  { label: '历史曲线', icon: '◷' },
];

export const STRATEGY_SIDEBAR_ITEMS: SidebarMenuItem<StrategyModuleKey>[] = [
  { label: '分时计划', icon: '◷' },
  { label: '运行策略', icon: '⌁' },
  { label: '计划配置', icon: '▤' },
];

export const EMS_ICONS = {
  power: 'ϟ',
  income: '¥',
  charge: '↥',
  discharge: '↧',
  coin: '◎',
  energy: '▣',
  air: '❋',
  temp: '♨',
  fan: '◉',
  fire: '⌂',
  light: '☼',
  ups: '▣',
  grid: '⌁',
  pcs: '▤',
  battery: '▦',
  voltage: '↕',
  current: 'ϟ',
  clock: '◷',
} as const;

export const CHART_SETS = {
  power: [
    0.14, 0.12, 0.12, 0.1, 0.11, 0.14, 0.19, 0.24, 0.36, 0.57, 0.72, 0.68, 0.76,
    0.83, 0.8, 0.73, 0.64, 0.52, 0.46, 0.39, 0.32, 0.27, 0.2, 0.16, 0.12,
  ],
  soc: [
    0.74, 0.74, 0.74, 0.73, 0.73, 0.72, 0.72, 0.72, 0.71, 0.72, 0.72, 0.73, 0.74,
    0.75, 0.76, 0.77, 0.78, 0.78, 0.78, 0.77, 0.76, 0.76, 0.76, 0.76, 0.76,
  ],
  energy: [
    0.08, 0.1, 0.1, 0.1, 0.12, 0.13, 0.18, 0.27, 0.4, 0.61, 0.68, 0.7, 0.71, 0.7,
    0.68, 0.62, 0.56, 0.48, 0.39, 0.34, 0.31, 0.29, 0.24, 0.17, 0.12,
  ],
  grid: [
    0.47, 0.46, 0.45, 0.45, 0.48, 0.49, 0.5, 0.48, 0.47, 0.5, 0.51, 0.52, 0.5,
    0.47, 0.48, 0.49, 0.5, 0.51, 0.53, 0.51, 0.5, 0.49, 0.48, 0.48, 0.47,
  ],
  hvacTemp: [
    0.52, 0.51, 0.51, 0.53, 0.53, 0.54, 0.53, 0.55, 0.56, 0.55, 0.56, 0.55, 0.54,
    0.55, 0.54, 0.54, 0.55, 0.54, 0.54, 0.53, 0.53, 0.52, 0.53, 0.52, 0.52,
  ],
  hvacHumidity: [
    0.62, 0.63, 0.62, 0.62, 0.61, 0.62, 0.62, 0.63, 0.64, 0.63, 0.64, 0.63, 0.62,
    0.62, 0.62, 0.61, 0.61, 0.62, 0.62, 0.61, 0.62, 0.62, 0.62, 0.61, 0.62,
  ],
};

export const OVERVIEW_REVENUE_ITEMS: RevenueStatItem[] = [
  { id: 'rev-today', iconKey: 'income', label: '今日收益', value: '3,258.40', unit: '元', colorClass: 'gold' },
  { id: 'rev-total', iconKey: 'coin', label: '累计收益', value: '1,684,920', unit: '元', colorClass: 'gold' },
  { id: 'chg-today', iconKey: 'charge', label: '日充电量', value: '1,842.6', unit: 'kWh', colorClass: 'greenish' },
  { id: 'chg-total', iconKey: 'energy', label: '总充电量', value: '4,684,218', unit: 'kWh', colorClass: 'greenish' },
  { id: 'dis-today', iconKey: 'discharge', label: '日放电量', value: '1,706.3', unit: 'kWh', colorClass: 'violet' },
  { id: 'dis-total', iconKey: 'energy', label: '总放电量', value: '4,218,673', unit: 'kWh', colorClass: 'violet' },
];

export const OVERVIEW_DEVICE_ITEMS: OverviewDeviceItem[] = [
  { id: 'dev-air', iconKey: 'air', name: '空调', status: '运行中' },
  { id: 'dev-temp', iconKey: 'temp', name: '环境温度', status: '28.6 °C', isNumeric: true },
  { id: 'dev-fan', iconKey: 'fan', name: '风机', status: '运行中' },
  { id: 'dev-fire', iconKey: 'fire', name: '火灾报警', status: '正常' },
  { id: 'dev-light', iconKey: 'light', name: '照明', status: '运行中' },
  { id: 'dev-ups', iconKey: 'ups', name: 'UPS', status: '运行中' },
];

export const STATUS_NAMES = {
  bms: [
    '系统故障保护', '总压低压保护', '单体过压保护', '放电过流告警', '充电回路', '电池保护1', '总压反接保护',
    '单体欠压保护', '放电过压告警', '充电回路故障', '电压保护1', '单体温度保护', '充电过流告警', '绝缘检测',
    '电流保护1', '电池温度告警', '放电回路', '风扇状态', '电池告警', '通讯状态', '消防联动', '急停状态',
    '电芯温差告警', '簇间压差告警', '模块通讯', '从机状态', '充电允许', '放电允许',
  ],
  ac: [
    'AC交流欠压', 'AC模块电池接触器', 'AC直流接地故障', 'AC交流过压', 'AC电网欠频',
    'AC模块风机故障', 'AC绝缘故障', 'AC接触器故障', 'AC主接触器故障', 'AC模块过温',
    'AC交流过流', 'AC模块电压异常', 'AC模块通讯故障', 'AC急停状态', 'AC输出过流保护',
    'AC相序异常', 'AC防孤岛保护', 'AC模块风扇告警', 'AC母线过压', 'AC并网状态',
  ],
  dc: [
    'DC母线过压', 'DC输入过流', 'DCDC模块故障', 'DC电池欠压',
    'DC模块温度告警', '直流绝缘异常', 'DC接触器故障', 'DC电池温度偏高',
    '电池簇通讯异常', 'DCDC模块运行', '直流输入状态', '电池回路状态',
    'DC短路保护', '直流熔断器状态', '电池预充完成', 'GPS对时状态',
  ],
  pcs: [
    '并网运行', '交流侧接触器', '直流侧接触器', '孤岛保护',
    '有功调度', '无功调度', '防逆流保护', '电网通讯',
    '风机状态', '模块温度', '直流母线状态', '电池通讯',
    '急停状态', '系统自检', '功率模块运行', '绝缘检测',
  ],
} as const;

export const BMS_INFO_ROWS: ParameterTriplet[][] = [
  [
    { name: '电池组总电流', value: '-22.6', unit: 'A' },
    { name: '电池组总电压', value: '712.6', unit: 'V' },
    { name: '电池组最高单体电压', value: '3.362', unit: 'V' },
    { name: '最高单体温度', value: '31.0', unit: '°C' },
  ],
  [
    { name: '电池组SOC', value: '76.4', unit: '%' },
    { name: '电池组SOH', value: '98.6', unit: '%' },
    { name: '电池组最低单体电压', value: '3.345', unit: 'V' },
    { name: '最低单体温度', value: '25.8', unit: '°C' },
  ],
  [
    { name: '电池组有功功率', value: '16.1', unit: 'kW' },
    { name: '绝缘电阻', value: '2,450', unit: 'kΩ' },
    { name: '最大单体压差', value: '17', unit: 'mV' },
    { name: '可用能量', value: '3,056', unit: 'kWh' },
  ],
];

export const BATTERY_CLUSTER_ROWS: Array<{
  label: string;
  clusters: [string, string, string, string, string, string];
  unit: string;
}> = [
  { label: '电池簇总电压', clusters: ['712.6', '710.9', '714.2', '711.8', '713.1', '712.4'], unit: 'V' },
  { label: '电池簇总电流', clusters: ['-22.6', '-20.8', '-22.1', '-21.9', '-23.0', '-24.2'], unit: 'A' },
  { label: '电池簇SOC', clusters: ['76.4', '75.8', '77.1', '76.1', '76.7', '76.2'], unit: '%' },
  { label: '电池簇SOH', clusters: ['98.6', '98.5', '98.8', '98.4', '98.7', '98.6'], unit: '%' },
  { label: '最高单体电压', clusters: ['3.362', '3.359', '3.364', '3.361', '3.363', '3.360'], unit: 'V' },
  { label: '最低单体电压', clusters: ['3.345', '3.341', '3.346', '3.342', '3.347', '3.344'], unit: 'V' },
  { label: '最高单体温度', clusters: ['31.0', '30.5', '31.2', '30.8', '31.1', '30.6'], unit: '°C' },
  { label: '最低单体温度', clusters: ['25.8', '25.4', '26.0', '25.6', '25.9', '25.5'], unit: '°C' },
  { label: '电池簇绝缘电阻', clusters: ['2,450', '2,380', '2,510', '2,440', '2,490', '2,420'], unit: 'kΩ' },
  { label: '簇端接触器', clusters: ['合闸', '合闸', '合闸', '合闸', '合闸', '合闸'], unit: '' },
];

export const PCS_VALUES: Record<PcsInnerKey, ParameterTriplet[]> = {
  电网参数: [
    { name: 'AB线电压', value: '400.1', unit: 'V' },
    { name: 'BC线电压', value: '400.4', unit: 'V' },
    { name: 'CA线电压', value: '399.8', unit: 'V' },
    { name: 'A相电流', value: '182.6', unit: 'A' },
    { name: 'B相电流', value: '180.9', unit: 'A' },
    { name: 'C相电流', value: '181.2', unit: 'A' },
    { name: 'A相有功功率', value: '42.1', unit: 'kW' },
    { name: 'B相有功功率', value: '41.9', unit: 'kW' },
    { name: 'C相有功功率', value: '41.8', unit: 'kW' },
    { name: '电网频率', value: '50.02', unit: 'Hz' },
    { name: '总有功功率', value: '125.8', unit: 'kW' },
    { name: '总无功功率', value: '12.4', unit: 'kVar' },
  ],
  交流参数: [
    { name: 'A相交流电压', value: '230.1', unit: 'V' },
    { name: 'B相交流电压', value: '229.8', unit: 'V' },
    { name: 'C相交流电压', value: '230.4', unit: 'V' },
    { name: 'A相交流电流', value: '181.9', unit: 'A' },
    { name: 'B相交流电流', value: '180.5', unit: 'A' },
    { name: 'C相交流电流', value: '181.3', unit: 'A' },
    { name: 'A相有功功率', value: '41.8', unit: 'kW' },
    { name: 'B相有功功率', value: '41.7', unit: 'kW' },
    { name: 'C相有功功率', value: '42.3', unit: 'kW' },
    { name: '功率因数', value: '0.99', unit: '' },
    { name: '交流频率', value: '50.01', unit: 'Hz' },
    { name: '交流侧温度', value: '30.8', unit: '°C' },
  ],
  直流参数: [
    { name: '电池簇总电压', value: '712.6', unit: 'V' },
    { name: '电池簇总电流', value: '-22.6', unit: 'A' },
    { name: '直流侧功率', value: '16.1', unit: 'kW' },
    { name: '电池充电电量', value: '684.7', unit: 'kWh' },
    { name: '直流母线电压', value: '802.4', unit: 'V' },
    { name: '直流纹波系数', value: '0.42', unit: '%' },
    { name: 'DCDC模块温度', value: '29.8', unit: '°C' },
    { name: '绝缘电阻', value: '2,450', unit: 'kΩ' },
  ],
};

export const PCS_CONFIG_ROWS: PcsConfigRow[] = [
  { leftName: '并离网模式', leftValue: '0.0', leftRange: '0-并网，1-离网', rightName: '系统总开机', rightValue: '启用', rightRange: '', hasSwitch: true },
  { leftName: '能量调度方式', leftValue: '0.0', leftRange: '0-交流侧定功率，1-直流侧定功率', rightName: '有功功率上限', rightValue: '300.0', rightRange: '30～900 kW' },
  { leftName: '运行模式控制', leftValue: '0.0', leftRange: '0-功率控制模式，1-恒压恒频模式', rightName: '1#电池总电压', rightValue: '712.6', rightRange: '30～900 V' },
  { leftName: '功率因数', leftValue: '0.99', leftRange: '0.8～1.0', rightName: '1#电池总电流', rightValue: '-22.6', rightRange: '-300～300 A' },
  { leftName: '有功功率', leftValue: '125.8', leftRange: '正值-输出，负值-吸收', rightName: '1#充电电流上限', rightValue: '250.0', rightRange: '0～300 A' },
  { leftName: '无功功率', leftValue: '12.4', leftRange: '正值-感性，负值-容性', rightName: '1#放电电流上限', rightValue: '300.0', rightRange: '0～300 A' },
  { leftName: '电网电压变化速率', leftValue: '0.5', leftRange: '0.001～1', rightName: '1#电池充电功率', rightValue: '125.8', rightRange: '0～180 kW' },
  { leftName: '交流侧频率', leftValue: '50.02', leftRange: '45～55 Hz', rightName: '1#电池放电功率', rightValue: '150.0', rightRange: '0～180 kW' },
  { leftName: '直流母线电压', leftValue: '802.4', leftRange: '600～1000 V', rightName: '1#最大放电电流', rightValue: '206.0', rightRange: '0～300 A' },
  { leftName: '电池充电截止电压', leftValue: '3.55', leftRange: '单体电压', rightName: '1#最大充电电流', rightValue: '250.0', rightRange: '0～250 A' },
  { leftName: '电池放电截止电压', leftValue: '2.80', leftRange: '单体电压', rightName: '1#绝缘检测阈值', rightValue: '1,000', rightRange: '0～10,000 kΩ' },
  { leftName: '过压保护阈值', leftValue: '840.0', leftRange: '750～900 V', rightName: '过温保护阈值', rightValue: '55.0', rightRange: '0～80 °C' },
];

export const METER_REALTIME_METRICS: ParameterTriplet[] = [
  { name: 'A相电压', value: '230.1', unit: 'V' },
  { name: 'B相电压', value: '229.8', unit: 'V' },
  { name: 'C相电压', value: '230.4', unit: 'V' },
  { name: '总有功功率', value: '125.8', unit: 'kW' },
  { name: '电网频率', value: '50.02', unit: 'Hz' },
  { name: '功率因数', value: '0.99', unit: '' },
];

export const METER_THREE_PHASE_ROWS = [
  ['线电压', '400.1', '400.4', '399.8', 'V', '总有功功率', '125.8', 'kW'],
  ['相电压', '230.1', '229.8', '230.4', 'V', '总无功功率', '12.4', 'kVar'],
  ['相电流', '182.6', '180.9', '181.2', 'A', '总视在功率', '126.4', 'kVA'],
  ['有功功率', '42.1', '41.9', '41.8', 'kW', '功率因数', '0.99', ''],
  ['无功功率', '4.1', '4.2', '4.1', 'kVar', '电网频率', '50.02', 'Hz'],
];

export const METER_ENERGY_ROWS = [
  ['00:00–04:00', '128.4', '116.2', '0.904'],
  ['04:00–08:00', '236.8', '202.5', '0.855'],
  ['08:00–12:00', '412.6', '386.1', '0.936'],
  ['12:00–16:00', '528.1', '487.8', '0.924'],
  ['16:00–20:00', '486.5', '448.0', '0.921'],
  ['20:00–24:00', '274.2', '252.4', '0.920'],
];

export const REPORT_ROWS: Record<ReportDeviceKey, ReportRow[]> = {
  'PCS-01': [
    { time: '11-13 10:00', pcsPower: '126.2', batteryVoltage: '712.1', soc: '76.2', gridFrequency: '50.01', device: 'PCS-01' },
    { time: '11-13 09:00', pcsPower: '122.8', batteryVoltage: '711.6', soc: '75.8', gridFrequency: '50.02', device: 'PCS-01' },
    { time: '11-13 08:00', pcsPower: '118.4', batteryVoltage: '710.8', soc: '75.1', gridFrequency: '49.99', device: 'PCS-01' },
    { time: '11-13 07:00', pcsPower: '96.3', batteryVoltage: '709.6', soc: '74.6', gridFrequency: '50.00', device: 'PCS-01' },
    { time: '11-13 06:00', pcsPower: '68.5', batteryVoltage: '708.8', soc: '74.2', gridFrequency: '50.01', device: 'PCS-01' },
    { time: '11-13 05:00', pcsPower: '42.1', batteryVoltage: '708.1', soc: '73.8', gridFrequency: '49.98', device: 'PCS-01' },
  ],
  'BMS-01': [
    { time: '11-13 10:00', pcsPower: '125.8', batteryVoltage: '712.6', soc: '76.4', gridFrequency: '50.02', device: 'BMS-01' },
    { time: '11-13 09:00', pcsPower: '121.4', batteryVoltage: '711.9', soc: '75.9', gridFrequency: '50.01', device: 'BMS-01' },
    { time: '11-13 08:00', pcsPower: '116.9', batteryVoltage: '711.0', soc: '75.3', gridFrequency: '50.00', device: 'BMS-01' },
    { time: '11-13 07:00', pcsPower: '94.7', batteryVoltage: '709.8', soc: '74.8', gridFrequency: '49.99', device: 'BMS-01' },
    { time: '11-13 06:00', pcsPower: '66.2', batteryVoltage: '709.0', soc: '74.3', gridFrequency: '50.01', device: 'BMS-01' },
    { time: '11-13 05:00', pcsPower: '40.8', batteryVoltage: '708.3', soc: '73.9', gridFrequency: '49.99', device: 'BMS-01' },
  ],
};

export const INITIAL_SCHEDULE_ROWS: ScheduleSlotRow[] = [
  { id: 'slot-1', period: '谷时充电', startTime: '00:30', endTime: '06:00', mode: '充电', power: '180 kW', enabled: true },
  { id: 'slot-2', period: '平时待机', startTime: '06:00', endTime: '10:00', mode: '待机', power: '0 kW', enabled: true },
  { id: 'slot-3', period: '峰时放电', startTime: '10:00', endTime: '12:00', mode: '放电', power: '150 kW', enabled: true },
  { id: 'slot-4', period: '平时待机', startTime: '12:00', endTime: '18:00', mode: '待机', power: '0 kW', enabled: true },
  { id: 'slot-5', period: '峰时放电', startTime: '18:00', endTime: '21:00', mode: '放电', power: '150 kW', enabled: true },
  { id: 'slot-6', period: '谷时充电', startTime: '21:00', endTime: '24:00', mode: '充电', power: '120 kW', enabled: true },
];

export const STRATEGY_TIMELINE_SEGMENTS: ScheduleSegment[] = [
  { id: 'seg-1', label: '谷时充电', type: 'charge', widthClass: 'w-[23%]' },
  { id: 'seg-2', label: '待机', type: 'idle', widthClass: 'w-[17%]' },
  { id: 'seg-3', label: '峰时放电', type: 'discharge', widthClass: 'w-[9%]' },
  { id: 'seg-4', label: '待机', type: 'idle', widthClass: 'w-[25%]' },
  { id: 'seg-5', label: '峰时放电', type: 'discharge', widthClass: 'w-[13%]' },
  { id: 'seg-6', label: '谷时充电', type: 'charge', widthClass: 'w-[13%]' },
];

export const CURVE_RANGES: CurveRangeKey[] = ['1小时', '6小时', '24小时', '7天'];
