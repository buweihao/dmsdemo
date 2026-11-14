import React from 'react';
import {
  DEVICE_STAT_ITEMS,
  EQUIPMENT_SCALE_ITEMS,
  LEFT_MICRO_CODES,
  PERCEPTUAL_DETECTORS,
  PERCEPTUAL_GAUGES,
  RIGHT_MICRO_CODES,
} from '../data/substationData';
import type { ChartSeriesData, SceneKey } from '../types/substation';
import {
  GeneratorIcon,
  GroundTransformerIcon,
  SensorTotalIcon,
  StatIcon,
  SwitchgearIcon,
  TransformerIcon,
} from './HudIcons';
import { LoadForecastChart } from './LoadForecastChart';

interface HudOverlayProps {
  activeScene: SceneKey;
  panelsHidden: boolean;
  onTogglePanels: () => void;
  onReturnToIndex: () => void;
  loadSeries: ChartSeriesData;
  onQuickSelectEquipment?: (target: 'transformer' | 'zks' | 'gys') => void;
}

const ScaleIcon: React.FC<{ iconKey: string }> = ({ iconKey }) => {
  switch (iconKey) {
    case 'transformer':
      return <TransformerIcon className="w-8 h-8 shrink-0" />;
    case 'groundTransformer':
      return <GroundTransformerIcon className="w-8 h-8 shrink-0" />;
    case 'switchgear':
      return <SwitchgearIcon className="w-8 h-8 shrink-0" />;
    default:
      return <GeneratorIcon className="w-8 h-8 shrink-0" />;
  }
};

const PanelCardHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="relative flex items-end justify-between mb-1 px-0.5">
    <h2 className="text-[14px] font-medium tracking-wide text-white/95 leading-none">{title}</h2>
    <div className="flex items-center gap-1">
      <span className="inline-block w-1 h-1 bg-white/90" />
      <span className="inline-block w-1 h-1 bg-white/90" />
      <span className="inline-block w-1 h-1 bg-white/90" />
    </div>
    <span className="sr-only">{subtitle}</span>
  </div>
);

export const HudOverlay: React.FC<HudOverlayProps> = ({
  activeScene,
  panelsHidden,
  onTogglePanels,
  onReturnToIndex,
  loadSeries,
  onQuickSelectEquipment,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between overflow-hidden">
      {/* Top Sci-Fi HUD Header Frame */}
      <header className="relative w-full h-[54px] shrink-0">
        {/* Background HUD SVG Decoration */}
        <svg
          viewBox="0 0 1920 68"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Left decorative lines */}
          <polyline
            points="0,12 240,12 260,26 560,26 585,10 745,10 765,24"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
          />
          <polyline
            points="0,34 150,34 175,54 450,54 475,38 710,38 730,16"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
          />
          <polygon points="180,26 240,26 226,38 166,38" fill="var(--accent)" />
          <polygon points="36,16 116,16 106,24 26,24" fill="var(--accent)" />
          <polygon points="682,12 715,12 698,34 665,34" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <rect x="378" y="34" width="110" height="20" fill="rgba(160,165,175,0.22)" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
          <text x="394" y="48" fill="rgba(255,255,255,0.8)" fontSize="11" fontFamily="monospace">G-493</text>
          <rect x="502" y="34" width="136" height="20" fill="rgba(70,74,82,0.28)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <circle cx="290" cy="46" r="4" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
          <line x1="12" y1="6" x2="120" y2="6" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="128" y1="6" x2="210" y2="6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

          {/* Right mirrored decorative lines */}
          <polyline
            points="1920,12 1680,12 1660,26 1360,26 1335,10 1175,10 1155,24"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
          />
          <polyline
            points="1920,34 1770,34 1745,54 1470,54 1445,38 1210,38 1190,16"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
          />
          <polygon points="1740,26 1680,26 1694,38 1754,38" fill="var(--accent)" />
          <polygon points="1238,12 1205,12 1222,34 1255,34" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <rect x="1432" y="34" width="110" height="20" fill="rgba(160,165,175,0.22)" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
          <text x="1450" y="48" fill="rgba(255,255,255,0.8)" fontSize="11" fontFamily="monospace">G-493</text>
          <rect x="1282" y="34" width="136" height="20" fill="rgba(70,74,82,0.28)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <circle cx="1630" cy="46" r="4" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
          <line x1="1908" y1="6" x2="1800" y2="6" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="1792" y1="6" x2="1710" y2="6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </svg>

        {/* Top-Left Return Button (visible in sub-scenes 主控室 / 高压室) */}
        {activeScene !== 'index' && (
          <button
            type="button"
            onClick={onReturnToIndex}
            className="pointer-events-auto absolute left-6 top-2.5 h-[30px] px-4 bg-[var(--hud-bg)] backdrop-blur-md border border-[var(--hud-border)] text-white text-sm tracking-[0.25em] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
          >
            <span className="absolute -left-1 top-0 bottom-0 w-1 bg-[var(--accent)]" />
            <span className="absolute -right-1 top-0 bottom-0 w-1 bg-[var(--accent)]" />
            返   回
          </button>
        )}

        {/* Center Main System Title */}
        <div className="absolute inset-x-0 top-1.5 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-[19px] md:text-[21px] font-bold tracking-[0.08em] text-[var(--accent)] whitespace-nowrap hud-title-shadow">
            圆欣智能变电站数字孪生系统
          </h1>
        </div>

        {/* Top-Right Toggle 2D Panels Button */}
        <button
          type="button"
          onClick={onTogglePanels}
          aria-pressed={panelsHidden}
          className="pointer-events-auto absolute right-6 top-2 h-[30px] px-4 bg-[var(--hud-bg)] backdrop-blur-md border border-[var(--hud-border)] text-white text-[13px] tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
        >
          <span className="absolute -left-[2px] top-0.5 bottom-0.5 w-[2px] bg-[var(--accent)]" />
          <span className="absolute -right-[2px] top-0.5 bottom-0.5 w-[2px] bg-[var(--accent)]" />
          {panelsHidden ? '显示2D面板' : '隐藏2D面板'}
        </button>
      </header>

      {/* Main Middle Overlay: Left Panel + Right Panel */}
      <div className="relative flex-1 w-full flex justify-between items-stretch px-1.5 py-1 min-h-0">
        {/* LEFT PANEL */}
        {!panelsHidden && (
          <aside
            aria-label="左侧监测面板"
            className="pointer-events-auto flex items-stretch gap-1.5 h-full max-h-full overflow-y-auto overflow-x-hidden pr-1"
          >
            {/* Vertical Left Micro-Telemetry Strip */}
            <div
              aria-hidden="true"
              className="hidden sm:flex flex-col justify-start gap-4 pt-6 w-[14px] text-[8px] font-mono text-white/45 tracking-tighter leading-none select-none"
            >
              {LEFT_MICRO_CODES.map((code) => (
                <span
                  key={code}
                  className="writing-vertical-rl rotate-180 whitespace-nowrap"
                >
                  {code}
                </span>
              ))}
            </div>

            {/* 3 Left Stacked Cards */}
            <div className="w-[348px] flex flex-col gap-2.5 justify-between py-0.5">
              {/* Card 1: 设备规模 */}
              <section className="flex flex-col">
                <PanelCardHeader title="设备规模" subtitle="Equipment scale" />
                <div className="relative border border-[var(--hud-border)] bg-[var(--hud-bg)] backdrop-blur-md px-3 pt-1.5 pb-2.5">
                  {/* Corner accents */}
                  <span className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent)]" />

                  <div className="text-right text-[10px] italic text-white/60 mb-1.5 leading-none">
                    Equipment scale
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    {EQUIPMENT_SCALE_ITEMS.map((item) => {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (!onQuickSelectEquipment) return;
                            if (item.id === 'tx') onQuickSelectEquipment('transformer');
                            else if (item.id === 'sw35') onQuickSelectEquipment('gys');
                            else onQuickSelectEquipment('zks');
                          }}
                          className="flex items-center gap-2 text-left group cursor-pointer"
                          title={
                            item.id === 'tx'
                              ? '点击聚焦变压器并查看监测面板'
                              : item.id === 'sw35'
                                ? '点击进入高压室'
                                : '点击进入主控室'
                          }
                        >
                          <ScaleIcon iconKey={item.iconKey} />
                          <div className="flex-1 min-w-0">
                            <div className="bg-[var(--accent)] group-hover:brightness-110 transition-all text-[var(--hud-accent-text)] text-[11px] font-semibold px-1.5 py-[2px] text-center truncate">
                              {item.label}
                            </div>
                            <div className="bg-[var(--hud-card-bg)] border border-[var(--theme-line)] border-t-0 flex items-center justify-between px-2 py-[2px] text-[11px] text-white tabular-nums">
                              <span>{item.count}</span>
                              <span className="text-white/80">{item.unit}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Card 2: 感知设备规模 */}
              <section className="flex flex-col">
                <PanelCardHeader title="感知设备规模" subtitle="Preceptual device" />
                <div className="relative border border-[var(--hud-border)] bg-[var(--hud-bg)] backdrop-blur-md px-3 pt-1.5 pb-2.5">
                  <span className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent)]" />

                  <div className="text-right text-[10px] italic text-white/60 mb-1.5 leading-none">
                    Preceptual device
                  </div>

                  {/* Top Row: Total + 3 Circular Gauges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <SensorTotalIcon className="w-7 h-7 shrink-0" />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-white/90 whitespace-nowrap">总数</span>
                        <span className="px-2 py-0.5 border border-[var(--theme-line)] bg-[var(--hud-card-bg)] text-[12px] font-medium text-white tabular-nums">
                          72385
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {PERCEPTUAL_GAUGES.map((g) => {
                        const r = 14;
                        const c = 2 * Math.PI * r;
                        const offset = c - (g.percent / 100) * c;
                        return (
                          <div key={g.id} className="flex flex-col items-center">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                              <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r={r}
                                  fill="none"
                                  stroke="rgba(255,255,255,0.22)"
                                  strokeWidth="2.5"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r={r}
                                  fill="none"
                                  stroke={g.id === 'alarm' ? 'var(--accent)' : g.ringColor}
                                  strokeWidth="2.5"
                                  strokeDasharray={c}
                                  strokeDashoffset={offset}
                                />
                              </svg>
                              <span className="absolute text-[10px] font-semibold text-white tabular-nums">
                                {g.value}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/85 mt-0.5 leading-none">
                              {g.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom 2x3 Detector Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {PERCEPTUAL_DETECTORS.map((det) => (
                      <div key={det.id} className="flex items-stretch text-[11px]">
                        <div className="flex-1 bg-[var(--accent)] text-[var(--hud-accent-text)] font-semibold px-2 py-[2px] flex items-center justify-center truncate">
                          {det.label}
                        </div>
                        <div className="w-7 bg-[var(--hud-card-bg)] border border-[var(--theme-line)] border-l-0 text-white flex items-center justify-center tabular-nums">
                          {det.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Card 3: 负荷变化预测 */}
              <section className="flex flex-col flex-1 min-h-[195px]">
                <PanelCardHeader title="负荷变化预测" subtitle="Change for ecast" />
                <div className="relative flex-1 border border-[var(--hud-border)] bg-[var(--hud-bg)] backdrop-blur-md px-2.5 pt-1.5 pb-2 flex flex-col justify-between">
                  <span className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent)]" />

                  <div className="text-right text-[10px] italic text-white/60 leading-none">
                    Change for ecast
                  </div>
                  <LoadForecastChart data={loadSeries} />
                </div>
              </section>
            </div>
          </aside>
        )}

        {/* Spacer when left panel is hidden */}
        {panelsHidden && <div />}

        {/* RIGHT PANEL */}
        {!panelsHidden && (
          <aside
            aria-label="右侧设备统计面板"
            className="pointer-events-auto flex items-stretch gap-1.5 self-end h-[84%] max-h-[650px] pl-1"
          >
            <div className="w-[264px] flex flex-col justify-between">
              <div className="flex flex-col flex-1">
                <PanelCardHeader title="设备统计" subtitle="Equipment scale" />
                <div className="relative flex-1 border border-[var(--hud-border)] bg-[var(--hud-bg)] backdrop-blur-md px-3 pt-1.5 pb-3 flex flex-col justify-between">
                  <span className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent)]" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent)]" />

                  <div className="text-right text-[10px] italic text-white/60 mb-1.5 leading-none">
                    Equipment scale
                  </div>

                  {/* 2x5 Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 flex-1 content-start">
                    {DEVICE_STAT_ITEMS.map((item) => (
                      <div key={item.id} className="flex flex-col">
                        <div className="flex items-baseline gap-1 text-[11px] mb-1 truncate">
                          <span className="text-white/95 font-medium">{item.zh}</span>
                          <span className="text-[9px] italic text-white/55 truncate">{item.en}</span>
                        </div>
                        <div className="relative border border-[var(--theme-line)] bg-[var(--hud-card-bg)] px-2.5 py-2 flex items-center justify-between">
                          {/* Corner dots */}
                          <span className="absolute -top-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-[var(--accent)]" />
                          <span className="absolute -top-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-[var(--accent)]" />
                          <span className="absolute -bottom-[1.5px] -left-[1.5px] w-[3px] h-[3px] bg-[var(--accent)]" />
                          <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[3px] h-[3px] bg-[var(--accent)]" />
                          <StatIcon type={item.iconKey} className="w-5 h-5" />
                          <span className="text-[14px] font-medium text-white/95 tabular-nums">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom-Right Dual Circular Radar Rings */}
              <div className="flex items-center justify-around pt-3 pb-1">
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-end gap-1.5">
                    <svg viewBox="0 0 48 48" className="w-11 h-11" aria-hidden="true">
                      <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                      <circle cx="24" cy="24" r="15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                      <circle cx="24" cy="24" r="7" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
                    </svg>
                    <div className="flex items-center gap-1 pb-1">
                      <span className="w-1.5 h-1.5 border border-white/60 inline-block" />
                      <span className="w-1.5 h-1.5 border border-white/60 inline-block" />
                      <span className="w-1.5 h-1.5 border border-white/60 inline-block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Right Micro-Telemetry Strip */}
            <div
              aria-hidden="true"
              className="hidden sm:flex flex-col justify-between py-2 w-[14px] text-[7.5px] font-mono text-white/45 tracking-tighter leading-none select-none"
            >
              {RIGHT_MICRO_CODES.map((code) => (
                <span
                  key={code}
                  className="writing-vertical-rl whitespace-nowrap"
                >
                  {code}
                </span>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Sci-Fi HUD Frame */}
      <footer className="relative w-full h-[22px] shrink-0 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1920 28" preserveAspectRatio="none" className="w-full h-full">
          {/* Left rail */}
          <polyline
            points="0,8 280,8 300,20 740,20 760,10 950,10"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.2"
          />
          <polyline
            points="40,20 265,20 285,8"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          <line x1="65" y1="4" x2="115" y2="4" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="125" y1="4" x2="175" y2="4" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="590" y1="14" x2="640" y2="14" stroke="var(--accent)" strokeWidth="2" />
          <line x1="780" y1="18" x2="840" y2="18" stroke="var(--secondary-data)" strokeWidth="2" />
          <polygon points="880,14 940,14 934,20 874,20" fill="rgba(255,255,255,0.55)" />

          {/* Right mirrored rail */}
          <polyline
            points="1920,8 1640,8 1620,20 1180,20 1160,10 970,10"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.2"
          />
          <polyline
            points="1880,20 1655,20 1635,8"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          <line x1="1855" y1="4" x2="1805" y2="4" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="1795" y1="4" x2="1745" y2="4" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="1330" y1="14" x2="1280" y2="14" stroke="var(--accent)" strokeWidth="2" />
          <line x1="1140" y1="18" x2="1080" y2="18" stroke="var(--secondary-data)" strokeWidth="2" />
          <polygon points="1040,14 980,14 986,20 1046,20" fill="rgba(255,255,255,0.55)" />
        </svg>
      </footer>
    </div>
  );
};
