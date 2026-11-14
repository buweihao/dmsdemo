export type SceneKey = 'index' | 'zks' | 'gys';

export type InspectionKind =
  | { type: 'transformer'; activeSlot: number; order: [number, number, number, number] }
  | { type: 'cabinet'; id: string; name: string }
  | { type: 'ac'; id: string; name: string }
  | { type: 'breaker'; id: string; name: string };

export interface ChartSeriesData {
  labels: string[];
  current: number[];
  predicted: number[];
}

export interface DiagnosticCardData {
  id: number;
  title: string;
  subtitle: string;
  location: string;
  status: '正常' | '告警';
  manufacturer: string;
  commissionDate: string;
  metrics: { label: string; value: string; unit: string }[];
  alerts: { text: string; date: string; level: 'warn' | 'ok' }[];
  codes: string[];
}

export interface CabinetTelemetry {
  id: string;
  name: string;
  busVoltage23BLabel: string;
  busVoltage23B: string;
  current23BLabel: string;
  current23B: string;
  busVoltage215Label: string;
  busVoltage215: string;
  current215Label: string;
  current215: string;
}

export interface AcTelemetry {
  id: string;
  name: string;
  targetTemp: number;
  roomTemp: number;
  isOn: boolean;
}

export interface BreakerTelemetry {
  id: string;
  name: string;
  yxName: string;
  code: string;
  yxValue: string;
  isOpen: boolean;
}
