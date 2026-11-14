import React, { useId } from 'react';

interface EmsChartProps {
  values: number[];
  min: number;
  max: number;
  unit?: string;
  hours?: number;
  fill?: boolean;
  secondary?: number[];
  showPoint?: boolean;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 210;
const PAD = { left: 48, right: 16, top: 18, bottom: 26 };

export const EmsChart: React.FC<EmsChartProps> = ({
  values,
  min,
  max,
  unit = '',
  hours = 24,
  fill = false,
  secondary,
  showPoint = false,
}) => {
  const rawId = useId();
  const gradientId = `ems-chart-fill-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const toPoints = (series: number[]) =>
    series.map((v, idx) => {
      const denom = Math.max(1, series.length - 1);
      const x = PAD.left + (plotW * idx) / denom;
      const y = PAD.top + plotH * (1 - v);
      return [Number(x.toFixed(1)), Number(y.toFixed(1))] as const;
    });

  const mainPoints = toPoints(values);
  const secondaryPoints = secondary ? toPoints(secondary) : null;
  const lineStr = mainPoints.map((p) => `${p[0]},${p[1]}`).join(' ');
  const lastPoint = mainPoints[mainPoints.length - 1];
  const areaPoints =
    fill && mainPoints.length > 0
      ? `${PAD.left},${PAD.top + plotH} ${lineStr} ${lastPoint[0]},${PAD.top + plotH}`
      : '';

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`趋势曲线 (${hours}h)`}
    >
      {fill && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.65" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}

      {[0, 1, 2, 3, 4].map((i) => {
        const y = PAD.top + (plotH * i) / 4;
        const val = Math.round(min + ((max - min) * (4 - i)) / 4);
        const label = i === 0 && unit ? `${val} ${unit}` : `${val}`;
        return (
          <g key={`h-${i}`}>
            <line
              className="chart-gridline"
              x1={PAD.left}
              y1={y}
              x2={PAD.left + plotW}
              y2={y}
            />
            <text className="chart-axis-text" x={6} y={y + 4}>
              {label}
            </text>
          </g>
        );
      })}

      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = PAD.left + (plotW * i) / 6;
        const hourMark = Math.round((hours * i) / 6);
        return (
          <g key={`v-${i}`}>
            <line
              className="chart-vline"
              x1={x}
              y1={PAD.top}
              x2={x}
              y2={PAD.top + plotH}
            />
            <text
              className="chart-axis-text"
              x={x - 10}
              y={PAD.top + plotH + 17}
            >
              {hourMark}h
            </text>
          </g>
        );
      })}

      {fill && areaPoints && (
        <polygon className="chart-area" points={areaPoints} fill={`url(#${gradientId})`} />
      )}

      <polyline className="chart-line" points={lineStr} />

      {secondaryPoints && (
        <polyline
          className="chart-line secondary"
          points={secondaryPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
        />
      )}

      {showPoint && lastPoint && (
        <circle className="chart-point" cx={lastPoint[0]} cy={lastPoint[1]} r={3.5} />
      )}
    </svg>
  );
};
