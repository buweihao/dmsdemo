import type {
  AcTelemetry,
  BreakerTelemetry,
  CabinetTelemetry,
  ChartSeriesData,
  DiagnosticCardData,
} from '../types/substation';

export const LEFT_MICRO_CODES = [
  'L36',
  '0079',
  '179',
  '0508',
  '470',
  'C57',
  'W3',
  'MFJZK 06',
  '31240',
];

export const RIGHT_MICRO_CODES = [
  '19348',
  '3344519348',
  '2020',
  '72854',
  '483845',
  'HU',
  'HZI',
  '94F',
  'T6CP7',
  'CE',
  'FC',
  'X94',
  '100',
  'ZZTK7',
  'MJ6X-3',
  'WFV5I-23',
  '23UPMK7',
];

export interface EquipmentScaleItem {
  id: string;
  label: string;
  count: number;
  unit: string;
  iconKey: 'transformer' | 'groundTransformer' | 'switchgear' | 'generator';
}

export const EQUIPMENT_SCALE_ITEMS: EquipmentScaleItem[] = [
  { id: 'tx', label: '变压器', count: 20, unit: '台', iconKey: 'transformer' },
  { id: 'gtx', label: '接地变压器', count: 20, unit: '台', iconKey: 'groundTransformer' },
  { id: 'sw35', label: '35kV开关柜台数', count: 20, unit: '台', iconKey: 'switchgear' },
  { id: 'gen', label: '发电机', count: 20, unit: '台', iconKey: 'generator' },
];

export const PERCEPTUAL_GAUGES = [
  { id: 'online', label: '在线', value: 112, ringColor: '#d9d9d9', percent: 68 },
  { id: 'offline', label: '离线', value: 327, ringColor: '#d9d9d9', percent: 82 },
  { id: 'alarm', label: '告警', value: 36, ringColor: '#ff5816', percent: 42 },
];

export const PERCEPTUAL_DETECTORS = [
  { id: 'door', label: '门禁探测器', count: 8 },
  { id: 'smoke', label: '感烟探测器', count: 3 },
  { id: 'water', label: '水浸探测器', count: 5 },
  { id: 'glass', label: '玻璃破碎探测器', count: 6 },
  { id: 'temp', label: '感温探测器', count: 6 },
  { id: 'ir', label: '红外被动探测器', count: 6 },
];

export interface DeviceStatItem {
  id: string;
  zh: string;
  en: string;
  count: number;
  iconKey:
    | 'video'
    | 'surroundings'
    | 'lock'
    | 'light'
    | 'ac'
    | 'fan'
    | 'door'
    | 'fire'
    | 'drain'
    | 'weather';
}

export const DEVICE_STAT_ITEMS: DeviceStatItem[] = [
  { id: 'video', zh: '视频', en: 'Video', count: 59, iconKey: 'video' },
  { id: 'surroundings', zh: '环境', en: 'Surroundings', count: 59, iconKey: 'surroundings' },
  { id: 'lock', zh: '智能锁具', en: 'The lock', count: 59, iconKey: 'lock' },
  { id: 'light', zh: '灯光', en: 'Light', count: 59, iconKey: 'light' },
  { id: 'ac', zh: '空调', en: 'Air conditioning', count: 59, iconKey: 'ac' },
  { id: 'fan', zh: '风机', en: 'Fan', count: 59, iconKey: 'fan' },
  { id: 'door', zh: '大门', en: 'Door', count: 59, iconKey: 'door' },
  { id: 'fire', zh: '消防', en: 'Fire', count: 59, iconKey: 'fire' },
  { id: 'drain', zh: '排水', en: 'Drain', count: 59, iconKey: 'drain' },
  { id: 'weather', zh: '微气象', en: 'weather', count: 59, iconKey: 'weather' },
];

export const INITIAL_LOAD_SERIES: ChartSeriesData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
  current: [40, 50, 10, 20, 45, 67, 40, 50, 10, 20, 45, 67],
  predicted: [10, 30, 22, 40, 4, 23, 10, 30, 22, 40, 4, 23],
};

export const TRANSFORMER_DIAGNOSTIC_CARDS: DiagnosticCardData[] = [
  {
    id: 0,
    title: '局部放电监测设备',
    subtitle: 'PD Testing equipment',
    location: '人手孔检测点1',
    status: '正常',
    manufacturer: 'xxxx设备厂',
    commissionDate: '2020.01.08',
    metrics: [
      { label: '放电相位', value: '959', unit: '°' },
      { label: '放点幅值', value: '53', unit: 'mV' },
      { label: '放电次数', value: '3', unit: '次' },
      { label: '放电类型', value: '随机干扰', unit: '' },
    ],
    alerts: [
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '提示：正常', date: '2020.01.08', level: 'ok' },
    ],
    codes: ['L36', '179', '0508', '470', 'C57', 'W3', 'MFJZK 06', '31240'],
  },
  {
    id: 1,
    title: '油色谱监测设备',
    subtitle: 'OilC Testing equipment',
    location: '取油点',
    status: '正常',
    manufacturer: 'xxxx设备厂',
    commissionDate: '2020.01.08',
    metrics: [
      { label: 'H2', value: '2', unit: 'ppm' },
      { label: 'CO', value: '1', unit: 'ppm' },
      { label: 'C2H2', value: '6', unit: 'ppm' },
      { label: 'N2', value: '2', unit: 'ppm' },
      { label: 'CO2', value: '459', unit: 'ppm' },
      { label: 'C2H4', value: '6', unit: 'ppm' },
    ],
    alerts: [
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '提示：正常', date: '2020.01.08', level: 'ok' },
    ],
    codes: ['L36', '179', '0508', '470', 'C57', 'W3', 'MFJZK 06'],
  },
  {
    id: 2,
    title: '避雷器监测',
    subtitle: 'LA lightening arrester',
    location: 'CT互感器',
    status: '告警',
    manufacturer: 'xxxx设备厂',
    commissionDate: '2020.01.08',
    metrics: [
      { label: '放电相位', value: '959', unit: '°' },
      { label: '放点幅值', value: '53', unit: 'mV' },
      { label: '放电次数', value: '3', unit: '次' },
    ],
    alerts: [
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '提示：正常', date: '2020.01.08', level: 'ok' },
    ],
    codes: ['L36', '179', '0508', '470', 'C57', 'W3', 'MFJZK 06'],
  },
  {
    id: 3,
    title: '链芯接地监测设备',
    subtitle: 'Core grounding lightening arrester',
    location: 'CT互感器',
    status: '正常',
    manufacturer: 'xxxx设备厂',
    commissionDate: '2020.01.08',
    metrics: [{ label: '测量电流', value: '959', unit: 'μA' }],
    alerts: [
      { text: '警告：阻性电流超限', date: '2020.01.08', level: 'warn' },
      { text: '提示：正常', date: '2020.01.08', level: 'ok' },
    ],
    codes: ['L36', '179', '0508', '470', 'C57', 'MFJZK 06'],
  },
];

export const INITIAL_CABINETS: Record<string, CabinetTelemetry> = {
  cab1: {
    id: 'cab1',
    name: '1#进线保护',
    busVoltage23BLabel: '23B馈线保护测控母线电压实测值:',
    busVoltage23B: '0000001',
    current23BLabel: '23B馈线保护测控测量电流实测值:',
    current23B: '0000002',
    busVoltage215Label: '215馈线保护测控母线电压实测值:',
    busVoltage215: '0000003',
    current215Label: '215馈线保护测控测量电流实测值:',
    current215: '0000004',
  },
  cab2: {
    id: 'cab2',
    name: '2#主变差动保护',
    busVoltage23BLabel: '23B馈线保护测控母线电压实测值:',
    busVoltage23B: '35.12 kV',
    current23BLabel: '23B馈线保护测控测量电流实测值:',
    current23B: '418.6 A',
    busVoltage215Label: '215馈线保护测控母线电压实测值:',
    busVoltage215: '35.08 kV',
    current215Label: '215馈线保护测控测量电流实测值:',
    current215: '412.3 A',
  },
};

export const INITIAL_ACS: Record<string, AcTelemetry> = {
  ac1: { id: 'ac1', name: '1#空调', targetTemp: 25, roomTemp: 29, isOn: true },
  ac2: { id: 'ac2', name: '2#空调', targetTemp: 24, roomTemp: 27, isOn: true },
};

export const INITIAL_BREAKERS: Record<string, BreakerTelemetry> = {
  '233': {
    id: '233',
    name: '233断路器',
    yxName: '遥信名称',
    code: '0000000',
    yxValue: '0',
    isOpen: false,
  },
  '234': {
    id: '234',
    name: '234断路器',
    yxName: '遥信名称',
    code: '0000001',
    yxValue: '0',
    isOpen: false,
  },
  '235': {
    id: '235',
    name: '235断路器',
    yxName: '遥信名称',
    code: '0000002',
    yxValue: '1',
    isOpen: true,
  },
};
