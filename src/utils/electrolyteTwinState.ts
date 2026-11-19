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

export type Vec3Tuple = [number, number, number];

export interface ElectrolytePipeRun {
  id: string;
  loop: 'positive' | 'negative';
  kind: 'main' | 'branch';
  outerRadius: number;
  innerRadius: number;
  points: Vec3Tuple[];
  segmentLengths: number[];
  totalLength: number;
}

export interface PolylineSample {
  position: Vec3Tuple;
  direction: Vec3Tuple;
}

function createPipeRun(
  id: string,
  loop: 'positive' | 'negative',
  kind: 'main' | 'branch',
  outerRadius: number,
  innerRadius: number,
  points: Vec3Tuple[],
): ElectrolytePipeRun {
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    const dz = points[i + 1][2] - points[i][2];
    const len = Math.hypot(dx, dy, dz);
    segmentLengths.push(len);
    totalLength += len;
  }
  return {
    id,
    loop,
    kind,
    outerRadius,
    innerRadius,
    points,
    segmentLengths,
    totalLength,
  };
}

/**
 * Generates every pipe run in the positive & negative electrolyte circulation system
 * ordered strictly in physical flow direction:
 * Tank bottom -> Pump -> Supply Spine & Headers -> Stack bottom inlets ->
 * Stack top outlets -> Upper Return Collectors -> Tank top inlet.
 */
export function buildElectrolytePipeRuns(): ElectrolytePipeRun[] {
  const runs: ElectrolytePipeRun[] = [];
  const stackCoords = getStackCoordinates();

  // --- POSITIVE CIRCUIT ---
  runs.push(
    createPipeRun('pos_tank_to_pump', 'positive', 'main', 2.6, 1.65, [
      [-192, 19, 32],
      [-192, 19, 96],
      [-150, 19, 96],
    ]),
  );
  runs.push(
    createPipeRun('pos_pump_front_supply', 'positive', 'main', 2.45, 1.55, [
      [-126, 19, 96],
      [-126, 13, 96],
      [-126, 13, 72],
      [89, 13, 72],
    ]),
  );
  runs.push(
    createPipeRun('pos_spine_back_supply', 'positive', 'main', 2.4, 1.5, [
      [-126, 13, 72],
      [-126, 13, -72],
      [89, 13, -72],
    ]),
  );
  runs.push(
    createPipeRun('pos_return_front', 'positive', 'main', 2.4, 1.55, [
      [89, 66, 46],
      [-134, 66, 46],
      [-134, 84, 0],
      [-161, 84, 0],
    ]),
  );
  runs.push(
    createPipeRun('pos_return_back', 'positive', 'main', 2.4, 1.55, [
      [89, 66, -46],
      [-134, 66, -46],
      [-134, 84, 0],
      [-161, 84, 0],
    ]),
  );

  // --- NEGATIVE CIRCUIT ---
  runs.push(
    createPipeRun('neg_tank_to_pump', 'negative', 'main', 2.6, 1.65, [
      [192, 19, 32],
      [192, 19, 96],
      [150, 19, 96],
    ]),
  );
  runs.push(
    createPipeRun('neg_pump_front_supply', 'negative', 'main', 2.45, 1.55, [
      [126, 19, 96],
      [126, 10.5, 96],
      [126, 10.5, 79],
      [-89, 10.5, 79],
    ]),
  );
  runs.push(
    createPipeRun('neg_spine_back_supply', 'negative', 'main', 2.4, 1.5, [
      [126, 10.5, 79],
      [126, 10.5, -79],
      [-89, 10.5, -79],
    ]),
  );
  runs.push(
    createPipeRun('neg_return_front', 'negative', 'main', 2.4, 1.55, [
      [-89, 74, 46],
      [134, 74, 46],
      [134, 84, 0],
      [161, 84, 0],
    ]),
  );
  runs.push(
    createPipeRun('neg_return_back', 'negative', 'main', 2.4, 1.55, [
      [-89, 74, -46],
      [134, 74, -46],
      [134, 84, 0],
      [161, 84, 0],
    ]),
  );

  // --- PER-STACK SUPPLY & RETURN RISERS (ALL 12 STACKS x 4 PORTS = 48 BRANCHES) ---
  stackCoords.forEach((coord) => {
    const posHeaderZ = coord.row === 0 ? -72 : 72;
    const negHeaderZ = coord.row === 0 ? -79 : 79;

    runs.push(
      createPipeRun(`${coord.id}_pos_in`, 'positive', 'branch', 1.55, 1.0, [
        [coord.x - 6, 13, posHeaderZ],
        [coord.x - 6, 13, coord.z],
        [coord.x - 6, 17, coord.z],
      ]),
    );
    runs.push(
      createPipeRun(`${coord.id}_pos_out`, 'positive', 'branch', 1.55, 1.0, [
        [coord.x - 6, 54, coord.z],
        [coord.x - 6, 66, coord.z],
      ]),
    );
    runs.push(
      createPipeRun(`${coord.id}_neg_in`, 'negative', 'branch', 1.55, 1.0, [
        [coord.x + 6, 10.5, negHeaderZ],
        [coord.x + 6, 10.5, coord.z],
        [coord.x + 6, 17, coord.z],
      ]),
    );
    runs.push(
      createPipeRun(`${coord.id}_neg_out`, 'negative', 'branch', 1.55, 1.0, [
        [coord.x + 6, 54, coord.z],
        [coord.x + 6, 74, coord.z],
      ]),
    );
  });

  return runs;
}

export function samplePolylineAtDistance(
  run: ElectrolytePipeRun,
  distance: number,
): PolylineSample {
  if (run.totalLength <= 0 || run.points.length < 2) {
    return { position: run.points[0] ?? [0, 0, 0], direction: [0, 1, 0] };
  }

  let d = ((distance % run.totalLength) + run.totalLength) % run.totalLength;
  for (let i = 0; i < run.segmentLengths.length; i++) {
    const segLen = run.segmentLengths[i];
    if (d <= segLen || i === run.segmentLengths.length - 1) {
      const a = run.points[i];
      const b = run.points[i + 1];
      const t = segLen > 0 ? Math.min(1, Math.max(0, d / segLen)) : 0;
      const invLen = segLen > 0 ? 1 / segLen : 1;
      return {
        position: [
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
          a[2] + (b[2] - a[2]) * t,
        ],
        direction: [
          (b[0] - a[0]) * invLen,
          (b[1] - a[1]) * invLen,
          (b[2] - a[2]) * invLen,
        ],
      };
    }
    d -= segLen;
  }

  const last = run.points[run.points.length - 1];
  return { position: last, direction: [0, 1, 0] };
}

