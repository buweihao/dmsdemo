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
  positiveLoopHex: string;
  positiveLoopNum: number;
  positiveLoopRgb: string;
  negativeLoopHex: string;
  negativeLoopNum: number;
  negativeLoopRgb: string;
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
    positiveLoopHex: '#71e3ad',
    positiveLoopNum: 0x52de97,
    positiveLoopRgb: '113, 227, 173',
    negativeLoopHex: '#65d8f4',
    negativeLoopNum: 0x45cef2,
    negativeLoopRgb: '101, 216, 244',
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
    positiveLoopHex: '#34d399',
    positiveLoopNum: 0x2dd496,
    positiveLoopRgb: '52, 211, 153',
    negativeLoopHex: '#38bdf8',
    negativeLoopNum: 0x38bdf8,
    negativeLoopRgb: '56, 189, 248',
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
    positiveLoopHex: '#5ce87d',
    positiveLoopNum: 0x4ade75,
    positiveLoopRgb: '92, 232, 125',
    negativeLoopHex: '#38d9c0',
    negativeLoopNum: 0x2dd4bf,
    negativeLoopRgb: '56, 217, 192',
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
    positiveLoopHex: '#ff7a33',
    positiveLoopNum: 0xff7024,
    positiveLoopRgb: '255, 122, 51',
    negativeLoopHex: '#4ade80',
    negativeLoopNum: 0x3fd678,
    negativeLoopRgb: '74, 222, 128',
    canvasBgNum: 0x090b10,
    groundGridRgba: 'rgba(255, 120, 30, 0.10)',
    roadHex: 0xd9862b,
    swatchClass: 'bg-[#ff5816]',
  },
];

export function getThemeConfig(key: SystemThemeKey): SystemThemeConfig {
  return SYSTEM_THEMES.find((t) => t.key === key) ?? SYSTEM_THEMES[0];
}
