import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cycleDiagnosticOrder,
  getSceneTitle,
  shiftLoadSeries,
  toggleBreakerState,
} from './substationState';
import type { BreakerTelemetry } from '../types/substation';

test('shiftLoadSeries shifts out oldest and appends clamped newest values', () => {
  const initial = {
    labels: ['01', '02', '03', '04'],
    current: [40, 50, 10, 20],
    predicted: [10, 30, 22, 40],
  };
  const next = shiftLoadSeries(initial, 85.44, 120);
  assert.deepEqual(next.current, [50, 10, 20, 85.4]);
  assert.deepEqual(next.predicted, [30, 22, 40, 100]);
  assert.deepEqual(initial.current, [40, 50, 10, 20]);
});

test('cycleDiagnosticOrder moves clicked card to slot 0 and shifts prior slots', () => {
  const order: [number, number, number, number] = [0, 1, 2, 3];
  assert.deepEqual(cycleDiagnosticOrder(order, 0), [0, 1, 2, 3]);
  assert.deepEqual(cycleDiagnosticOrder(order, 2), [2, 0, 1, 3]);
  assert.deepEqual(cycleDiagnosticOrder([2, 0, 1, 3], 3), [3, 2, 0, 1]);
});

test('toggleBreakerState updates target breaker and recalculates closed count', () => {
  const breakers: Record<string, BreakerTelemetry> = {
    '233': {
      id: '233',
      name: '233断路器',
      yxName: '遥信名称',
      code: '0000000',
      yxValue: '0',
      isOpen: false,
    },
    '3001': {
      id: '3001',
      name: '3001断路器',
      yxName: '遥信名称',
      code: '0000001',
      yxValue: '1',
      isOpen: true,
    },
  };
  const res = toggleBreakerState(breakers, '233', true);
  assert.equal(res.breakers['233'].isOpen, true);
  assert.equal(res.breakers['233'].yxValue, '1');
  assert.equal(res.closedCount, 0);
});

test('getSceneTitle returns expected Chinese room titles', () => {
  assert.equal(getSceneTitle('index'), '电力牵引站');
  assert.equal(getSceneTitle('zks'), '01 主控室');
  assert.equal(getSceneTitle('gys'), '02 高压室');
});
