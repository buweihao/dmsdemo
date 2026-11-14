import React from 'react';
import { TRANSFORMER_DIAGNOSTIC_CARDS } from '../data/substationData';
import type {
  AcTelemetry,
  BreakerTelemetry,
  CabinetTelemetry,
  InspectionKind,
} from '../types/substation';

interface InspectorPopupsProps {
  inspection: InspectionKind | null;
  cabinets: Record<string, CabinetTelemetry>;
  acs: Record<string, AcTelemetry>;
  breakers: Record<string, BreakerTelemetry>;
  onCycleDiagnosticSlot: (positionIdx: number) => void;
  onToggleBreaker: (breakerId: string, nextIsOpen: boolean) => void;
  onAdjustAcTemp: (acId: string, delta: number) => void;
  onToggleAcPower: (acId: string) => void;
  onCloseInspection: () => void;
}

export const InspectorPopups: React.FC<InspectorPopupsProps> = ({
  inspection,
  cabinets,
  acs,
  breakers,
  onCycleDiagnosticSlot,
  onToggleBreaker,
  onAdjustAcTemp,
  onToggleAcPower,
  onCloseInspection,
}) => {
  if (!inspection) return null;

  if (inspection.type === 'transformer') {
    const primaryCard = TRANSFORMER_DIAGNOSTIC_CARDS[inspection.order[0]];
    const secondaryIndices = [1, 2, 3] as const;

    return (
      <div
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4"
        aria-label="变压器在线监测面板"
      >
        <div className="pointer-events-auto relative flex flex-col gap-3 max-w-[820px] w-full">
          {/* Top bar with Reset / Close */}
          <div className="flex items-center justify-between">
            <div className="bg-[var(--hud-popup-bg)] backdrop-blur-md border border-[var(--accent)]/80 px-3 py-1.5 text-xs text-white flex items-center gap-4">
              <span className="font-semibold text-[var(--accent)]">变压器状态评估</span>
              <span className="tabular-nums">
                维修分值：<strong className="text-[var(--warning)]">66分</strong>
              </span>
              <span>
                状态评估：<strong className="text-[var(--warning)]">注意状态</strong>
              </span>
              <span className="text-white/75 hidden sm:inline">
                检修建议：关注避雷器阻性电流及局部放电幅值趋势
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseInspection}
              className="px-3 py-1.5 bg-[var(--hud-bg)] backdrop-blur-md border border-white/60 text-xs text-white hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
            >
              返回全景 (双击背景)
            </button>
          </div>

          {/* Primary + 3 Queued Diagnostic Cards (matching panel1..panel4) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-stretch">
            {/* Primary Front Card */}
            <div className="md:col-span-2 bg-[var(--hud-popup-bg)] backdrop-blur-md border border-[var(--accent)] p-3.5 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between border-b border-white/20 pb-2 mb-2.5">
                  <div>
                    <h3 className="text-[15px] font-bold text-[var(--accent)]">{primaryCard.title}</h3>
                    <div className="text-[10px] italic text-white/60">{primaryCard.subtitle}</div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-[var(--accent)]/20 border border-[var(--accent)] text-white">
                    {primaryCard.location}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2.5">
                  <div>
                    <span className="text-white/60">运行状态：</span>
                    <span className={primaryCard.status === '告警' ? 'text-[var(--accent)] font-bold' : 'text-emerald-400'}>
                      {primaryCard.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">生产厂家：</span>
                    <span>{primaryCard.manufacturer}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/60">投运时间：</span>
                    <span className="tabular-nums">{primaryCard.commissionDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {primaryCard.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="border border-white/20 bg-white/5 px-2 py-1 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-white/75">{m.label}</span>
                      <span className="font-semibold text-[var(--warning)] tabular-nums">
                        {m.value} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/15 pt-2 space-y-1">
                {primaryCard.alerts.map((al, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className={al.level === 'warn' ? 'text-[var(--accent)]' : 'text-emerald-400'}>
                      {al.text}
                    </span>
                    <span className="text-white/50 tabular-nums">{al.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Clickable Queued Cards (click to rotate to primary slot) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {secondaryIndices.map((posIdx) => {
                const card = TRANSFORMER_DIAGNOSTIC_CARDS[inspection.order[posIdx]];
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onCycleDiagnosticSlot(posIdx)}
                    className="text-left bg-[var(--hud-bg)] backdrop-blur-md border border-white/40 hover:border-[var(--accent)] p-2.5 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-white truncate">
                        {card.title}
                      </div>
                      <div className="text-[10px] italic text-white/55 truncate">
                        {card.subtitle}
                      </div>
                      <div className="text-[10px] text-white/70 mt-1">
                        {card.location} · 状态：
                        <span className={card.status === '告警' ? 'text-[var(--accent)] font-semibold' : 'text-emerald-400'}>
                          {card.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--accent)] border border-[var(--accent)]/60 px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                      切换置顶
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (inspection.type === 'cabinet') {
    const cab = cabinets[inspection.id] ?? Object.values(cabinets)[0];
    return (
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-4">
        <div className="pointer-events-auto w-[420px] bg-[var(--hud-popup-bg)] backdrop-blur-md border border-[var(--accent)] p-4 text-white">
          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
            <div>
              <h3 className="text-[15px] font-bold text-[var(--accent)]">{cab.name}</h3>
              <p className="text-[11px] text-white/60">主控室保护测控机柜实时遥测</p>
            </div>
            <button
              type="button"
              onClick={onCloseInspection}
              className="px-2.5 py-1 border border-white/50 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            >
              关闭
            </button>
          </div>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 border border-white/15">
              <span className="text-white/80">{cab.busVoltage23BLabel}</span>
              <span className="font-mono text-[var(--warning)] tabular-nums">{cab.busVoltage23B}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 border border-white/15">
              <span className="text-white/80">{cab.current23BLabel}</span>
              <span className="font-mono text-[var(--warning)] tabular-nums">{cab.current23B}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 border border-white/15">
              <span className="text-white/80">{cab.busVoltage215Label}</span>
              <span className="font-mono text-[var(--warning)] tabular-nums">{cab.busVoltage215}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 border border-white/15">
              <span className="text-white/80">{cab.current215Label}</span>
              <span className="font-mono text-[var(--warning)] tabular-nums">{cab.current215}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (inspection.type === 'ac') {
    const ac = acs[inspection.id] ?? Object.values(acs)[0];
    return (
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-4">
        <div className="pointer-events-auto w-[340px] bg-[var(--hud-popup-bg)] backdrop-blur-md border border-[var(--accent)] p-4 text-white">
          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
            <h3 className="text-[15px] font-bold text-[var(--accent)]">{ac.name}</h3>
            <button
              type="button"
              onClick={onCloseInspection}
              className="px-2.5 py-1 border border-white/50 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            >
              关闭
            </button>
          </div>
          <div className="space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 border border-white/15">
              <span className="text-white/80">设定温度:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustAcTemp(ac.id, -1)}
                  aria-label="降低设定温度"
                  className="w-6 h-6 border border-white/40 hover:border-[var(--accent)] text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-[var(--warning)] tabular-nums">{ac.targetTemp}℃</span>
                <button
                  type="button"
                  onClick={() => onAdjustAcTemp(ac.id, 1)}
                  aria-label="升高设定温度"
                  className="w-6 h-6 border border-white/40 hover:border-[var(--accent)] text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 border border-white/15">
              <span className="text-white/80">室内温度:</span>
              <span className="font-mono text-white tabular-nums">{ac.roomTemp}℃</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 border border-white/15">
              <span className="text-white/80">空调状态:</span>
              <button
                type="button"
                onClick={() => onToggleAcPower(ac.id)}
                className={`px-3 py-0.5 text-xs border cursor-pointer ${
                  ac.isOn
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--hud-accent-text)] font-semibold'
                    : 'bg-white/10 border-white/40 text-white/70'
                }`}
              >
                {ac.isOn ? '开' : '关'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Breaker panel (断路器标签)
  const brk = breakers[inspection.id] ?? Object.values(breakers)[0];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-[380px] bg-[var(--hud-popup-bg)] backdrop-blur-md border border-[var(--accent)] p-4 text-white">
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
          <h3 className="text-[15px] font-bold text-[var(--accent)]">{brk.name}</h3>
          <button
            type="button"
            onClick={onCloseInspection}
            className="px-2.5 py-1 border border-white/50 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
          >
            关闭
          </button>
        </div>

        <div className="space-y-2 text-[12px] mb-3.5">
          <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 border border-white/15">
            <span className="text-white/75">设备编码</span>
            <span className="font-mono tabular-nums text-white">{brk.code}</span>
          </div>
          <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 border border-white/15">
            <span className="text-white/75">{brk.yxName}</span>
            <span className="font-mono tabular-nums text-[var(--warning)]">
              {brk.yxValue} ({brk.isOpen ? '分闸' : '合闸'})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onToggleBreaker(brk.id, true)}
            className={`py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              brk.isOpen
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--hud-accent-text)] font-semibold'
                : 'bg-white/5 border-white/40 text-white/85 hover:border-[var(--accent)]'
            }`}
          >
            打开
          </button>
          <button
            type="button"
            onClick={() => onToggleBreaker(brk.id, false)}
            className={`py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              !brk.isOpen
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--hud-accent-text)] font-semibold'
                : 'bg-white/5 border-white/40 text-white/85 hover:border-[var(--accent)]'
            }`}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
