import type { BreakerTelemetry, ChartSeriesData } from '../types/substation';

/**
 * Advances the 12-point load forecast series by one tick, matching the
 * reference HT loopAnimate behavior (shift oldest, push newest).
 */
export function shiftLoadSeries(
  series: ChartSeriesData,
  nextCurrent: number,
  nextPredicted: number,
): ChartSeriesData {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 10) / 10));
  return {
    labels: [...series.labels],
    current: [...series.current.slice(1), clamp(nextCurrent)],
    predicted: [...series.predicted.slice(1), clamp(nextPredicted)],
  };
}

/**
 * Rotates the 4 transformer diagnostic panel slots so that whichever card
 * is currently at `clickedSlotIndex` moves into primary slot 0, and panels
 * previously ahead of it advance sequentially (matching index.js logic).
 */
export function cycleDiagnosticOrder(
  currentOrder: [number, number, number, number],
  clickedPositionIndex: number,
): [number, number, number, number] {
  if (clickedPositionIndex <= 0 || clickedPositionIndex > 3) {
    return currentOrder;
  }
  const next: [number, number, number, number] = [...currentOrder] as [
    number,
    number,
    number,
    number,
  ];
  const clickedCardId = currentOrder[clickedPositionIndex];
  for (let pos = clickedPositionIndex; pos > 0; pos--) {
    next[pos] = currentOrder[pos - 1];
  }
  next[0] = clickedCardId;
  return next;
}

/**
 * Updates a high-voltage circuit breaker's open/closed state and returns
 * the updated breaker map and active closed count.
 */
export function toggleBreakerState(
  breakers: Record<string, BreakerTelemetry>,
  breakerId: string,
  nextIsOpen: boolean,
): { breakers: Record<string, BreakerTelemetry>; closedCount: number } {
  const target = breakers[breakerId];
  if (!target) {
    const closedCount = Object.values(breakers).filter((b) => !b.isOpen).length;
    return { breakers, closedCount };
  }
  const updated: Record<string, BreakerTelemetry> = {
    ...breakers,
    [breakerId]: {
      ...target,
      isOpen: nextIsOpen,
      yxValue: nextIsOpen ? '1' : '0',
    },
  };
  const closedCount = Object.values(updated).filter((b) => !b.isOpen).length;
  return { breakers: updated, closedCount };
}

export function getSceneTitle(scene: 'index' | 'zks' | 'gys'): string {
  switch (scene) {
    case 'zks':
      return '01 主控室';
    case 'gys':
      return '02 高压室';
    default:
      return '电力牵引站';
  }
}
