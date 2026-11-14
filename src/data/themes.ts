import type { SystemThemeKey } from '../types/ems';

export interface SystemThemeConfig {
  key: SystemThemeKey;
  label: string;
  accentHex: string;
  accentNum: number;
  accentRgb: string;
  secondaryHex: string;
  warningHex: string;
  successHex: string;
  canvasBgNum: number;
  groundGridRgba: string;
  roadHex: number;
  swatchClass: string;
}

export const DEFAULT_THEME_KEY: SystemThemeKey = 'aurora-cyan';

export const SYSTEM_THEMES: SystemThemeConfig[] = [
  {
    key: 'aurora-cyan',
    label: '极光青蓝',
    accentHex: '#65d8f4',
    accentNum: 0x65d8f4,
    accentRgb: '101, 216, 244',
    secondaryHex: '#e2a5ee',
    warningHex: '#ffd17a',
    successHex: '#71e3ad',
    canvasBgNum: 0x0a1024,
    groundGridRgba: 'rgba(101, 216, 244, 0.14)',
    roadHex: 0x4b9bc9,
    swatchClass: 'bg-[#65d8f4]',
  },
  {
    key: 'tech-blue',
    label: '深空科技蓝',
    accentHex: '#38bdf8',
    accentNum: 0x38bdf8,
    accentRgb: '56, 189, 248',
    secondaryHex: '#818cf8',
    warningHex: '#fbbf24',
    successHex: '#34d399',
    canvasBgNum: 0x061026,
    groundGridRgba: 'rgba(56, 189, 248, 0.14)',
    roadHex: 0x3b82f6,
    swatchClass: 'bg-[#38bdf8]',
  },
  {
    key: 'emerald-grid',
    label: '智慧绿能绿',
    accentHex: '#34d399',
    accentNum: 0x34d399,
    accentRgb: '52, 211, 153',
    secondaryHex: '#38bdf8',
    warningHex: '#fbbf24',
    successHex: '#6ee7b7',
    canvasBgNum: 0x061515,
    groundGridRgba: 'rgba(52, 211, 153, 0.14)',
    roadHex: 0x10b981,
    swatchClass: 'bg-[#34d399]',
  },
  {
    key: 'amber-scifi',
    label: '炫彩琥珀橙',
    accentHex: '#ff5816',
    accentNum: 0xff5816,
    accentRgb: '255, 88, 22',
    secondaryHex: '#ffb84d',
    warningHex: '#ffd166',
    successHex: '#4ade80',
    canvasBgNum: 0x090b10,
    groundGridRgba: 'rgba(255, 120, 30, 0.10)',
    roadHex: 0xd9862b,
    swatchClass: 'bg-[#ff5816]',
  },
];

export function getThemeConfig(key: SystemThemeKey): SystemThemeConfig {
  return SYSTEM_THEMES.find((t) => t.key === key) ?? SYSTEM_THEMES[0];
}
