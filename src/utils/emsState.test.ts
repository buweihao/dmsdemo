import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { INITIAL_SCHEDULE_ROWS, STATUS_NAMES, TOP_NAV_ITEMS } from '../data/emsData.ts';
import { DEFAULT_THEME_KEY, getThemeConfig, SYSTEM_THEMES } from '../data/themes.ts';
import {
  buildStatusMatrixRows,
  formatReportCsv,
  getHoursForCurveRange,
  getReportRowsForDevice,
  resolvePageTitle,
  toggleScheduleSlotEnabled,
} from './emsState.ts';

describe('emsState pure domain helpers', () => {
  it('places 3D Digital Twin first as 首页 and original overview second as 总览', () => {
    assert.deepEqual(
      TOP_NAV_ITEMS.map((item) => [item.key, item.label]),
      [
        ['twin', '首页'],
        ['overview', '总览'],
        ['devices', '设备监控'],
        ['curves', '曲线报表'],
        ['strategy', '策略'],
      ],
    );
  });

  it('resolves toolbar titles across all sections', () => {
    assert.equal(
      resolvePageTitle({ section: 'twin', deviceModule: 'PCS数据', curveModule: 'SOC曲线', strategyModule: '分时计划' }),
      '首页',
    );
    assert.equal(
      resolvePageTitle({ section: 'overview', deviceModule: 'PCS数据', curveModule: 'SOC曲线', strategyModule: '分时计划' }),
      '总览',
    );
    assert.equal(
      resolvePageTitle({ section: 'devices', deviceModule: '消防/照明', curveModule: 'SOC曲线', strategyModule: '分时计划' }),
      '消防 / 照明',
    );
  });

  it('provides multiple cohesive system themes with valid default lookup', () => {
    assert.ok(SYSTEM_THEMES.length >= 4);
    const defaultTheme = getThemeConfig(DEFAULT_THEME_KEY);
    assert.equal(defaultTheme.key, 'aurora-cyan');
    assert.equal(getThemeConfig('emerald-grid').label, '智慧绿能绿');
  });

  it('maps curve ranges to expected hour spans', () => {
    assert.equal(getHoursForCurveRange('1小时'), 1);
    assert.equal(getHoursForCurveRange('6小时'), 6);
    assert.equal(getHoursForCurveRange('24小时'), 24);
    assert.equal(getHoursForCurveRange('7天'), 168);
  });

  it('builds balanced 4-column BMS status matrix with deterministic warn flags', () => {
    const matrix = buildStatusMatrixRows(STATUS_NAMES.bms, 4);
    assert.equal(matrix.length, 7);
    assert.equal(matrix[0].length, 4);
    const flatWarnCount = matrix.flat().filter((cell) => cell?.isWarn).length;
    assert.ok(flatWarnCount > 0);
  });

  it('filters report rows by device and formats CSV output', () => {
    const rows = getReportRowsForDevice('BMS-01', '2026-11-15');
    assert.equal(rows.length, 6);
    assert.ok(rows[0].time.startsWith('11-15 '));
    const csv = formatReportCsv(rows, 'BMS-01');
    const lines = csv.split('\n');
    assert.equal(lines.length, 7);
    assert.match(lines[1], /^BMS-01,11-15 10:00,/);
  });

  it('toggles schedule slot enabled flag immutably', () => {
    const updated = toggleScheduleSlotEnabled(INITIAL_SCHEDULE_ROWS, 'slot-3');
    assert.equal(updated[2].enabled, false);
    assert.equal(INITIAL_SCHEDULE_ROWS[2].enabled, true);
  });
});
