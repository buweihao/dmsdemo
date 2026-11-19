export type HomeViewMode = '3d' | '2d';

export type ElectrolyteCameraPreset =
  | 'overview'
  | 'pos_tank'
  | 'neg_tank'
  | 'stacks'
  | 'pumps';

export type ElectrolyteUnitCategory = 'tank' | 'pump' | 'stack';

export interface ElectrolyteUnitMetric {
  label: string;
  value: string;
}

export interface ElectrolyteUnitTelemetry {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: ElectrolyteUnitCategory;
  loop: 'positive' | 'negative' | 'dual';
  status: string;
  cameraPreset: ElectrolyteCameraPreset;
  focusEye: [number, number, number];
  focusTarget: [number, number, number];
  metrics: ElectrolyteUnitMetric[];
}

export interface ElectrolyteCameraConfig {
  id: ElectrolyteCameraPreset;
  label: string;
  eye: [number, number, number];
  target: [number, number, number];
}

export interface StackGridCoord {
  id: string;
  index: number;
  row: 0 | 1;
  col: number;
  x: number;
  z: number;
}

export const STACK_COLS = 6;
export const STACK_ROW_Z: readonly [number, number] = [-46, 46];
export const STACK_COL_SPACING = 38;

export function getStackCoordinates(): StackGridCoord[] {
  const coords: StackGridCoord[] = [];
  const startX = -((STACK_COLS - 1) * STACK_COL_SPACING) / 2;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < STACK_COLS; col++) {
      const index = row * STACK_COLS + col + 1;
      const numStr = String(index).padStart(2, '0');
      coords.push({
        id: `stack_${numStr}`,
        index,
        row: row as 0 | 1,
        col,
        x: startX + col * STACK_COL_SPACING,
        z: STACK_ROW_Z[row],
      });
    }
  }
  return coords;
}

export const ELECTROLYTE_CAMERAS: Record<ElectrolyteCameraPreset, ElectrolyteCameraConfig> = {
  overview: {
    id: 'overview',
    label: '全景视图',
    eye: [0, 212, 435],
    target: [0, 44, 2],
  },
  pos_tank: {
    id: 'pos_tank',
    label: '正极储罐',
    eye: [-290, 138, 225],
    target: [-178, 52, 0],
  },
  stacks: {
    id: 'stacks',
    label: '电堆阵列',
    eye: [24, 165, 250],
    target: [0, 38, 0],
  },
  neg_tank: {
    id: 'neg_tank',
    label: '负极储罐',
    eye: [290, 138, 225],
    target: [178, 52, 0],
  },
  pumps: {
    id: 'pumps',
    label: '循环泵组',
    eye: [0, 96, 285],
    target: [0, 18, 92],
  },
};

export const ELECTROLYTE_CAMERA_LIST: ElectrolyteCameraConfig[] = [
  ELECTROLYTE_CAMERAS.overview,
  ELECTROLYTE_CAMERAS.pos_tank,
  ELECTROLYTE_CAMERAS.stacks,
  ELECTROLYTE_CAMERAS.neg_tank,
  ELECTROLYTE_CAMERAS.pumps,
];

function buildStackUnits(): ElectrolyteUnitTelemetry[] {
  return getStackCoordinates().map((coord) => {
    const numStr = String(coord.index).padStart(2, '0');
    const rowLabel = coord.row === 0 ? '上排电堆' : '下排电堆';
    const power = (10.3 + ((coord.index * 7) % 5) * 0.12).toFixed(2);
    const voltage = (59.2 + ((coord.index * 3) % 4) * 0.15).toFixed(1);
    const temp = (27.8 + ((coord.index * 5) % 6) * 0.1).toFixed(1);
    const flow = (7.0 + ((coord.index * 2) % 3) * 0.08).toFixed(2);

    return {
      id: coord.id,
      code: `S${numStr}`,
      name: `全钒液流电堆 #${numStr}`,
      subtitle: `${rowLabel} · 第 ${coord.col + 1} 列并联模块`,
      category: 'stack',
      loop: 'dual',
      status: '并网正常',
      cameraPreset: 'stacks',
      focusEye: [coord.x + 56, 98, coord.z + 118],
      focusTarget: [coord.x, 34, coord.z],
      metrics: [
        { label: '单体功率', value: `${power} kW` },
        { label: '电堆端压', value: `${voltage} V` },
        { label: '支路流量', value: `${flow} L/min` },
        { label: '堆芯温度', value: `${temp} °C` },
      ],
    };
  });
}

const BASE_ELECTROLYTE_UNITS: ElectrolyteUnitTelemetry[] = [
  {
    id: 'pos_tank',
    code: 'TK-01',
    name: '正极电解液储罐',
    subtitle: '正极液 V4+ / V5+ 主储存容器',
    category: 'tank',
    loop: 'positive',
    status: '液位正常',
    cameraPreset: 'pos_tank',
    focusEye: ELECTROLYTE_CAMERAS.pos_tank.eye,
    focusTarget: ELECTROLYTE_CAMERAS.pos_tank.target,
    metrics: [
      { label: '储罐液位', value: '78.4 %' },
      { label: '电解液温度', value: '28.2 °C' },
      { label: '出口压力', value: '0.18 MPa' },
      { label: '循环流量', value: '42.5 L/min' },
    ],
  },
  {
    id: 'neg_tank',
    code: 'TK-02',
    name: '负极电解液储罐',
    subtitle: '负极液 V2+ / V3+ 主储存容器',
    category: 'tank',
    loop: 'negative',
    status: '液位正常',
    cameraPreset: 'neg_tank',
    focusEye: ELECTROLYTE_CAMERAS.neg_tank.eye,
    focusTarget: ELECTROLYTE_CAMERAS.neg_tank.target,
    metrics: [
      { label: '储罐液位', value: '76.8 %' },
      { label: '电解液温度', value: '27.9 °C' },
      { label: '出口压力', value: '0.17 MPa' },
      { label: '循环流量', value: '42.1 L/min' },
    ],
  },
  {
    id: 'pos_pump',
    code: 'PM-01',
    name: '正极主循环泵',
    subtitle: '变频耐腐蚀磁力离心泵',
    category: 'pump',
    loop: 'positive',
    status: '运行正常',
    cameraPreset: 'pumps',
    focusEye: [-130, 68, 192],
    focusTarget: [-138, 14, 96],
    metrics: [
      { label: '运行转速', value: '1480 RPM' },
      { label: '出口流量', value: '42.5 L/min' },
      { label: '出口扬压', value: '0.18 MPa' },
      { label: '轴功率', value: '2.42 kW' },
    ],
  },
  {
    id: 'neg_pump',
    code: 'PM-02',
    name: '负极主循环泵',
    subtitle: '变频耐腐蚀磁力离心泵',
    category: 'pump',
    loop: 'negative',
    status: '运行正常',
    cameraPreset: 'pumps',
    focusEye: [130, 68, 192],
    focusTarget: [138, 14, 96],
    metrics: [
      { label: '运行转速', value: '1465 RPM' },
      { label: '出口流量', value: '42.1 L/min' },
      { label: '出口扬压', value: '0.17 MPa' },
      { label: '轴功率', value: '2.36 kW' },
    ],
  },
  ...buildStackUnits(),
];

export const ELECTROLYTE_UNITS: Record<string, ElectrolyteUnitTelemetry> = Object.fromEntries(
  BASE_ELECTROLYTE_UNITS.map((unit) => [unit.id, unit]),
);

export function getElectrolyteUnit(unitId: string | null): ElectrolyteUnitTelemetry | null {
  if (!unitId) return null;
  return ELECTROLYTE_UNITS[unitId] ?? null;
}

export function toggleHomeViewMode(current: HomeViewMode): HomeViewMode {
  return current === '3d' ? '2d' : '3d';
}
