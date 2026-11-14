import { useCallback, useEffect, useRef, useState } from 'react';
import { EmsCurvesPage } from './components/ems/EmsCurvesPage';
import { EmsDevicesPage } from './components/ems/EmsDevicesPage';
import { EmsHeader } from './components/ems/EmsHeader';
import { EmsOverviewPage } from './components/ems/EmsOverviewPage';
import { EmsSidebar } from './components/ems/EmsSidebar';
import { EmsStrategyPage } from './components/ems/EmsStrategyPage';
import { HudOverlay } from './components/HudOverlay';
import { InspectorPopups } from './components/InspectorPopups';
import { SubstationCanvas } from './components/SubstationCanvas';
import { INITIAL_SCHEDULE_ROWS } from './data/emsData';
import {
  INITIAL_ACS,
  INITIAL_BREAKERS,
  INITIAL_CABINETS,
  INITIAL_LOAD_SERIES,
} from './data/substationData';
import { DEFAULT_THEME_KEY, getThemeConfig } from './data/themes';
import type {
  BmsTabKey,
  CurveModuleKey,
  CurveRangeKey,
  DeviceModuleKey,
  MeterTabKey,
  PcsInnerKey,
  PcsTabKey,
  ReportDeviceKey,
  ScheduleSlotRow,
  StrategyModuleKey,
  SystemThemeKey,
  TopSection,
} from './types/ems';
import type {
  AcTelemetry,
  BreakerTelemetry,
  CabinetTelemetry,
  ChartSeriesData,
  InspectionKind,
  SceneKey,
} from './types/substation';
import {
  formatClockTime,
  resolvePageTitle,
  toggleScheduleSlotEnabled,
} from './utils/emsState';
import {
  cycleDiagnosticOrder,
  shiftLoadSeries,
  toggleBreakerState,
} from './utils/substationState';

export default function App() {
  // Unified Navigation, Theme & EMS State (03-glassmorphism + 3D Digital Twin)
  const [activeSection, setActiveSection] = useState<TopSection>('twin');
  const [activeTheme, setActiveTheme] = useState<SystemThemeKey>(DEFAULT_THEME_KEY);
  const [activeDevice, setActiveDevice] = useState<DeviceModuleKey>('PCS数据');
  const [activeCurve, setActiveCurve] = useState<CurveModuleKey>('PCS曲线');
  const [activeStrategy, setActiveStrategy] = useState<StrategyModuleKey>('分时计划');

  const [pcsTab, setPcsTab] = useState<PcsTabKey>('PCS参数设置');
  const [pcsInner, setPcsInner] = useState<PcsInnerKey>('电网参数');
  const [bmsTab, setBmsTab] = useState<BmsTabKey>('BMS参数');
  const [meterTab, setMeterTab] = useState<MeterTabKey>('实时数据');
  const [curveRange, setCurveRange] = useState<CurveRangeKey>('24小时');
  const [reportDate, setReportDate] = useState('2025-11-13');
  const [reportDevice, setReportDevice] = useState<ReportDeviceKey>('PCS-01');
  const [systemPowerOn, setSystemPowerOn] = useState(true);
  const [scheduleRows, setScheduleRows] = useState<ScheduleSlotRow[]>(INITIAL_SCHEDULE_ROWS);

  const [clockTime, setClockTime] = useState(() => formatClockTime(new Date()));
  const [updateTime, setUpdateTime] = useState(() => formatClockTime(new Date()));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // 3D Digital Twin State
  const [activeScene, setActiveScene] = useState<SceneKey>('index');
  const [panelsHidden, setPanelsHidden] = useState(false);
  const [loadSeries, setLoadSeries] = useState<ChartSeriesData>(INITIAL_LOAD_SERIES);
  const [inspection, setInspection] = useState<InspectionKind | null>(null);
  const [cabinets] = useState<Record<string, CabinetTelemetry>>(INITIAL_CABINETS);
  const [acs, setAcs] = useState<Record<string, AcTelemetry>>(INITIAL_ACS);
  const [breakers, setBreakers] = useState<Record<string, BreakerTelemetry>>(INITIAL_BREAKERS);
  const [focusSignal, setFocusSignal] = useState<{
    seq: number;
    target: 'transformer' | 'reset';
  } | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Live clock ticker for EMS header
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTime(formatClockTime(new Date()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Live 1s chart ticker only while 3D digital twin view is mounted
  useEffect(() => {
    if (activeSection !== 'twin') return;
    const timer = window.setInterval(() => {
      setLoadSeries((prev) =>
        shiftLoadSeries(prev, 15 + Math.random() * 75, 10 + Math.random() * 65),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeSection]);

  const pageTitle = resolvePageTitle({
    section: activeSection,
    deviceModule: activeDevice,
    curveModule: activeCurve,
    strategyModule: activeStrategy,
  });

  useEffect(() => {
    document.title =
      activeSection === 'twin'
        ? '电力牵引站 - 圆欣智能变电站数字孪生系统'
        : `${pageTitle} · 正牧储能管理系统`;
  }, [activeSection, pageTitle]);

  const themeConfig = getThemeConfig(activeTheme);

  const handleSelectTheme = useCallback(
    (nextTheme: SystemThemeKey) => {
      setActiveTheme(nextTheme);
      const nextConfig = getThemeConfig(nextTheme);
      showToast(`已切换系统色系：${nextConfig.label}`);
    },
    [showToast],
  );

  const handleRefreshData = useCallback(() => {
    setUpdateTime(formatClockTime(new Date()));
    showToast('数据已刷新');
  }, [showToast]);

  const handleToggleSystemPower = useCallback(() => {
    setSystemPowerOn((prev) => {
      const next = !prev;
      showToast(next ? '系统总开机已启用' : '系统总开机已停用');
      return next;
    });
  }, [showToast]);

  const handleToggleScheduleSlot = useCallback(
    (slotId: string) => {
      setScheduleRows((prev) => {
        const nextRows = toggleScheduleSlotEnabled(prev, slotId);
        const updated = nextRows.find((r) => r.id === slotId);
        if (updated) {
          showToast(
            `${updated.period} (${updated.startTime}-${updated.endTime}) 已${updated.enabled ? '启用' : '停用'}`,
          );
        }
        return nextRows;
      });
    },
    [showToast],
  );

  // 3D Digital Twin Handlers
  const handleEnterScene = useCallback((scene: SceneKey) => {
    setInspection(null);
    setActiveScene(scene);
  }, []);

  const handleReturnToIndex = useCallback(() => {
    setInspection(null);
    setActiveScene('index');
  }, []);

  const handleQuickSelectEquipment = useCallback((target: 'transformer' | 'zks' | 'gys') => {
    if (target === 'transformer') {
      setActiveScene('index');
      setInspection({ type: 'transformer', activeSlot: 0, order: [0, 1, 2, 3] });
      setFocusSignal((prev) => ({ seq: (prev?.seq ?? 0) + 1, target: 'transformer' }));
    } else {
      setInspection(null);
      setActiveScene(target);
    }
  }, []);

  const handleCycleDiagnosticSlot = useCallback((positionIdx: number) => {
    setInspection((prev) => {
      if (!prev || prev.type !== 'transformer') return prev;
      const nextOrder = cycleDiagnosticOrder(prev.order, positionIdx);
      return { ...prev, order: nextOrder };
    });
  }, []);

  const handleToggleBreaker = useCallback((breakerId: string, nextIsOpen: boolean) => {
    setBreakers((prev) => toggleBreakerState(prev, breakerId, nextIsOpen).breakers);
  }, []);

  const handleAdjustAcTemp = useCallback((acId: string, delta: number) => {
    setAcs((prev) => {
      const cur = prev[acId];
      if (!cur) return prev;
      const nextTemp = Math.max(16, Math.min(32, cur.targetTemp + delta));
      return { ...prev, [acId]: { ...cur, targetTemp: nextTemp } };
    });
  }, []);

  const handleToggleAcPower = useCallback((acId: string) => {
    setAcs((prev) => {
      const cur = prev[acId];
      if (!cur) return prev;
      return { ...prev, [acId]: { ...cur, isOn: !cur.isOn } };
    });
  }, []);

  const handleCloseInspection = useCallback(() => {
    setInspection(null);
    setFocusSignal((prev) => ({ seq: (prev?.seq ?? 0) + 1, target: 'reset' }));
  }, []);

  return (
    <div className="app-shell" data-section={activeSection} data-theme={activeTheme}>
      <EmsHeader
        activeSection={activeSection}
        activeTheme={activeTheme}
        clockTime={clockTime}
        onSelectSection={setActiveSection}
        onSelectTheme={handleSelectTheme}
        onToast={showToast}
      />

      <div className="app-body">
        {activeSection === 'twin' ? (
          <section
            className="relative flex-1 min-h-0 w-full overflow-hidden bg-[var(--hud-popup-bg)]"
            aria-label="圆欣智能变电站3D数字孪生系统"
            data-active-scene={activeScene}
          >
            <SubstationCanvas
              activeScene={activeScene}
              inspection={inspection}
              breakers={breakers}
              focusSignal={focusSignal}
              themeConfig={themeConfig}
              onEnterScene={handleEnterScene}
              onInspect={setInspection}
            />

            <HudOverlay
              activeScene={activeScene}
              panelsHidden={panelsHidden}
              onTogglePanels={() => setPanelsHidden((v) => !v)}
              onReturnToIndex={handleReturnToIndex}
              loadSeries={loadSeries}
              onQuickSelectEquipment={handleQuickSelectEquipment}
            />

            <InspectorPopups
              inspection={inspection}
              cabinets={cabinets}
              acs={acs}
              breakers={breakers}
              onCycleDiagnosticSlot={handleCycleDiagnosticSlot}
              onToggleBreaker={handleToggleBreaker}
              onAdjustAcTemp={handleAdjustAcTemp}
              onToggleAcPower={handleToggleAcPower}
              onCloseInspection={handleCloseInspection}
            />
          </section>
        ) : (
          <>
            <EmsSidebar
              section={activeSection}
              activeDevice={activeDevice}
              activeCurve={activeCurve}
              activeStrategy={activeStrategy}
              onSelectDevice={setActiveDevice}
              onSelectCurve={setActiveCurve}
              onSelectStrategy={setActiveStrategy}
            />

            <main className="main-content">
              <div className="page-toolbar">
                <div className="breadcrumb">
                  <span>正牧储能管理系统</span>
                  <span className="crumb-sep">/</span>
                  <strong>{pageTitle}</strong>
                </div>
                <div className="toolbar-actions">
                  <span className="refresh-state">
                    <i />
                    <span>实时通讯中</span>
                  </span>
                  <span className="last-update">
                    更新 <b>{updateTime}</b>
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    title="刷新数据"
                    aria-label="刷新数据"
                    onClick={handleRefreshData}
                  >
                    ↻
                  </button>
                </div>
              </div>

              <div className="page-content">
                {activeSection !== 'overview' && (
                  <div className="section-banner">{pageTitle}</div>
                )}

                {activeSection === 'overview' && <EmsOverviewPage />}

                {activeSection === 'devices' && (
                  <EmsDevicesPage
                    activeDevice={activeDevice}
                    pcsTab={pcsTab}
                    pcsInner={pcsInner}
                    bmsTab={bmsTab}
                    meterTab={meterTab}
                    systemPowerOn={systemPowerOn}
                    onSelectPcsTab={setPcsTab}
                    onSelectPcsInner={setPcsInner}
                    onSelectBmsTab={setBmsTab}
                    onSelectMeterTab={setMeterTab}
                    onToggleSystemPower={handleToggleSystemPower}
                    onToast={showToast}
                  />
                )}

                {activeSection === 'curves' && (
                  <EmsCurvesPage
                    activeCurve={activeCurve}
                    curveRange={curveRange}
                    reportDate={reportDate}
                    reportDevice={reportDevice}
                    updateTime={updateTime}
                    onSelectRange={setCurveRange}
                    onChangeReportDate={setReportDate}
                    onChangeReportDevice={setReportDevice}
                    onToast={showToast}
                  />
                )}

                {activeSection === 'strategy' && (
                  <EmsStrategyPage
                    activeStrategy={activeStrategy}
                    scheduleRows={scheduleRows}
                    onSelectStrategy={setActiveStrategy}
                    onToggleSlotEnabled={handleToggleScheduleSlot}
                    onToast={showToast}
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>

      <div
        className={`toast${toastMessage ? ' show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage ?? ''}
      </div>
    </div>
  );
}
