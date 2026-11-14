import React, { useMemo } from 'react';
import type { ChartSeriesData } from '../types/substation';

interface LoadForecastChartProps {
  data: ChartSeriesData;
}

export const LoadForecastChart: React.FC<LoadForecastChartProps> = ({ data }) => {
  const width = 336;
  const height = 240;
  const pad = { top: 14, right: 10, bottom: 22, left: 26 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const { currentPoints, predictedPoints, currentArea, xCoords, yTicks } = useMemo(() => {
    const n = data.labels.length;
    const xs = data.labels.map((_, idx) => pad.left + (idx / Math.max(1, n - 1)) * plotW);
    const toY = (val: number) => pad.top + plotH - (Math.max(0, Math.min(100, val)) / 100) * plotH;

    const cPts = data.current.map((v, i) => `${xs[i].toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const pPts = data.predicted.map((v, i) => `${xs[i].toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const area = `${pad.left},${pad.top + plotH} ${cPts} ${xs[n - 1].toFixed(1)},${pad.top + plotH}`;

    return {
      currentPoints: cPts,
      predictedPoints: pPts,
      currentArea: area,
      xCoords: xs,
      yTicks: [0, 20, 40, 60, 80, 100],
    };
  }, [data, plotH, plotW]);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Legend matching legend.json */}
      <div className="flex items-center justify-end gap-4 text-[11px] mb-1 pr-1 shrink-0">
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="inline-block w-3 h-0.5 bg-[var(--accent)]" />
          <span>当前</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="inline-block w-3 h-0.5 bg-[var(--secondary-data)]" />
          <span>预测</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full flex-1 min-h-[190px] overflow-visible"
        role="img"
        aria-label="负荷变化预测折线图"
      >
        <defs>
          <linearGradient id="loadCurrentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal & vertical split grid lines */}
        {yTicks.map((tick) => {
          const y = pad.top + plotH - (tick / 100) * plotH;
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                y1={y}
                x2={pad.left + plotW}
                y2={y}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="0.75"
              />
              <text
                x={pad.left - 5}
                y={y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.85)"
                fontSize="9"
                className="tabular-nums"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {xCoords.map((x, idx) => (
          <g key={data.labels[idx]}>
            <line
              x1={x}
              y1={pad.top}
              x2={x}
              y2={pad.top + plotH}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.75"
            />
            <text
              x={x}
              y={pad.top + plotH + 13}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="9"
              className="tabular-nums"
            >
              {data.labels[idx]}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + plotH}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1"
        />
        <line
          x1={pad.left}
          y1={pad.top + plotH}
          x2={pad.left + plotW}
          y2={pad.top + plotH}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1"
        />

        {/* Current area + line */}
        <polygon points={currentArea} fill="url(#loadCurrentGrad)" />
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          points={currentPoints}
        />

        {/* Predicted line */}
        <polyline
          fill="none"
          stroke="var(--secondary-data)"
          strokeWidth="1.6"
          points={predictedPoints}
        />

        {/* Data point markers */}
        {data.current.map((v, i) => {
          const y = pad.top + plotH - (v / 100) * plotH;
          return (
            <circle
              key={`c-${i}`}
              cx={xCoords[i]}
              cy={y}
              r="1.8"
              fill="#ffffff"
              stroke="var(--accent)"
              strokeWidth="0.8"
            />
          );
        })}
        {data.predicted.map((v, i) => {
          const y = pad.top + plotH - (v / 100) * plotH;
          return (
            <circle
              key={`p-${i}`}
              cx={xCoords[i]}
              cy={y}
              r="1.8"
              fill="#ffffff"
              stroke="var(--secondary-data)"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
    </div>
  );
};
