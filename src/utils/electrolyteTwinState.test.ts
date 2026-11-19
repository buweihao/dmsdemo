import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildElectrolytePipeRuns,
  ELECTROLYTE_CAMERAS,
  ELECTROLYTE_CAMERA_LIST,
  ELECTROLYTE_UNITS,
  getElectrolyteUnit,
  getStackCoordinates,
  samplePolylineAtDistance,
  toggleHomeViewMode,
} from './electrolyteTwinState.ts';

describe('electrolyteTwinState', () => {
  it('generates 12 parallel battery stack coordinates in a symmetric 2x6 layout', () => {
    const coords = getStackCoordinates();
    assert.equal(coords.length, 12);
    assert.equal(coords[0].id, 'stack_01');
    assert.equal(coords[11].id, 'stack_12');

    const backRow = coords.filter((c) => c.row === 0);
    const frontRow = coords.filter((c) => c.row === 1);
    assert.equal(backRow.length, 6);
    assert.equal(frontRow.length, 6);
    assert.ok(backRow[0].z < frontRow[0].z);
    // Symmetric around x = 0
    assert.equal(backRow[0].x, -backRow[5].x);
  });

  it('registers telemetry for both tanks, both circulation pumps, and all 12 stacks', () => {
    assert.equal(Object.keys(ELECTROLYTE_UNITS).length, 16);
    assert.equal(getElectrolyteUnit('pos_tank')?.name, '正极电解液储罐');
    assert.equal(getElectrolyteUnit('neg_tank')?.name, '负极电解液储罐');
    assert.equal(getElectrolyteUnit('pos_pump')?.name, '正极主循环泵');
    assert.equal(getElectrolyteUnit('neg_pump')?.name, '负极主循环泵');
    assert.equal(getElectrolyteUnit('stack_06')?.code, 'S06');
    assert.equal(getElectrolyteUnit('stack_12')?.code, 'S12');
    assert.equal(getElectrolyteUnit('unknown_id'), null);
    assert.equal(getElectrolyteUnit(null), null);
  });

  it('toggles cleanly between 3d and 2d home view modes', () => {
    assert.equal(toggleHomeViewMode('3d'), '2d');
    assert.equal(toggleHomeViewMode('2d'), '3d');
  });

  it('provides complete camera preset configurations for overview and equipment inspection', () => {
    assert.equal(ELECTROLYTE_CAMERA_LIST.length, 5);
    assert.equal(ELECTROLYTE_CAMERAS.overview.label, '全景视图');
    assert.ok(ELECTROLYTE_CAMERAS.overview.eye[1] > 100);
  });

  it('registers all 58 positive and negative pipe runs with valid lengths and directional pulse sampling', () => {
    const runs = buildElectrolytePipeRuns();
    assert.equal(runs.length, 58);

    const posRuns = runs.filter((r) => r.loop === 'positive');
    const negRuns = runs.filter((r) => r.loop === 'negative');
    assert.equal(posRuns.length, 29);
    assert.equal(negRuns.length, 29);

    runs.forEach((run) => {
      assert.ok(run.totalLength > 0, `pipe ${run.id} should have positive length`);
      const sampleStart = samplePolylineAtDistance(run, 0);
      const sampleMid = samplePolylineAtDistance(run, run.totalLength * 0.5);
      const dirMag = Math.hypot(...sampleMid.direction);
      assert.ok(Math.abs(dirMag - 1) < 1e-6, `pipe ${run.id} direction should be unit length`);
      assert.deepEqual(sampleStart.position, run.points[0]);
    });
  });
});
