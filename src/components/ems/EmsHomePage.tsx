import React, { useState } from 'react';
import type { SystemThemeConfig } from '../../data/themes';
import type { TopSection } from '../../types/ems';
import {
  ELECTROLYTE_CAMERA_LIST,
  getElectrolyteUnit,
  type ElectrolyteCameraPreset,
  type HomeViewMode,
} from '../../utils/electrolyteTwinState';
import { ElectrolyteTwinCanvas } from './ElectrolyteTwinCanvas';

interface EmsHomePageProps {
  themeConfig: SystemThemeConfig;
  onSelectSection: (section: TopSection) => void;
}

const ELECTROLYTE_FLOW_SVG_SRC = '/assets/aistudio/________________b7bc7b11.svg';

export const EmsHomePage: React.FC<EmsHomePageProps> = ({
  themeConfig,
  onSelectSection,
}) => {
  const [viewMode, setViewMode] = useState<HomeViewMode>('3d');
  const [cameraPreset, setCameraPreset] = useState<ElectrolyteCameraPreset>('overview');
  const [cameraSignalSeq, setCameraSignalSeq] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const selectedUnit = getElectrolyteUnit(selectedUnitId);

  const handleSelectCameraPreset = (preset: ElectrolyteCameraPreset) => {
    setCameraPreset(preset);
    setCameraSignalSeq((s) => s + 1);
    if (preset === 'overview') {
      setSelectedUnitId(null);
    } else if (preset === 'pos_tank') {
      setSelectedUnitId('pos_tank');
    } else if (preset === 'neg_tank') {
      setSelectedUnitId('neg_tank');
    } else if (preset === 'pumps') {
      setSelectedUnitId('pos_pump');
    } else if (preset === 'stacks') {
      setSelectedUnitId('stack_01');
    }
  };

  const handleInspectFromRail = (unitId: string, preset: ElectrolyteCameraPreset) => {
    if (viewMode !== '3d') {
      setViewMode('3d');
    }
    setSelectedUnitId(unitId);
    setCameraPreset(preset);
    setCameraSignalSeq((s) => s + 1);
  };

  return (
    <div className="home-flow-layout" data-home-mode={viewMode}>
      <section className="panel flow-schematic-panel" aria-label="正负极电解液循环流动数字孪生">
        <div className="panel-head">
          <div className="flow-head-title">
            <strong>正负极电解液循环系统</strong>
            <span className="minor">
              {viewMode === '3d'
                ? '3D 数字孪生 · 12组电堆并联双回路'
                : '2D 工艺流程图 · 12组电堆并联双回路'}
            </span>
          </div>

          <div className="flow-head-legend">
            <span className="flow-legend-item">
              <i className="flow-legend-line positive" aria-hidden="true" />
              正极回路
            </span>
            <span className="flow-legend-item">
              <i className="flow-legend-line negative" aria-hidden="true" />
              负极回路
            </span>

            <div className="mode-switch-group" role="group" aria-label="视图模式切换">
              <button
                type="button"
                className={`mode-switch-btn${viewMode === '3d' ? ' active' : ''}`}
                aria-pressed={viewMode === '3d'}
                onClick={() => setViewMode('3d')}
              >
                3D 数字孪生
              </button>
              <button
                type="button"
                className={`mode-switch-btn${viewMode === '2d' ? ' active' : ''}`}
                aria-pressed={viewMode === '2d'}
                onClick={() => setViewMode('2d')}
              >
                2D 工艺图
              </button>
            </div>

            <button
              type="button"
              className="small-action"
              onClick={() => onSelectSection('twin')}
            >
              进入 3D监控
            </button>
          </div>
        </div>

        <div className="flow-schematic-body">
          <div className={`flow-schematic-stage${viewMode === '3d' ? ' is-3d' : ' is-2d'}`}>
            {viewMode === '3d' ? (
              <>
                <ElectrolyteTwinCanvas
                  themeConfig={themeConfig}
                  cameraPreset={cameraPreset}
                  cameraSignalSeq={cameraSignalSeq}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={setSelectedUnitId}
                />

                {selectedUnit && (
                  <div
                    className="twin-unit-inspector"
                    role="region"
                    aria-label={`${selectedUnit.name}实时参数`}
                  >
                    <div className="twin-inspector-head">
                      <div>
                        <span className="twin-inspector-code">{selectedUnit.code}</span>
                        <strong>{selectedUnit.name}</strong>
                      </div>
                      <button
                        type="button"
                        className="twin-inspector-close"
                        aria-label="关闭设备详情"
                        onClick={() => {
                          setSelectedUnitId(null);
                          setCameraPreset('overview');
                          setCameraSignalSeq((s) => s + 1);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="twin-inspector-sub">{selectedUnit.subtitle}</p>
                    <div className="twin-inspector-metrics">
                      {selectedUnit.metrics.map((metric) => (
                        <div key={metric.label} className="twin-inspector-cell">
                          <span>{metric.label}</span>
                          <b className="numeric">{metric.value}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="twin-stage-controls">
                  <div className="twin-camera-bar" role="group" aria-label="3D视角快捷切换">
                    {ELECTROLYTE_CAMERA_LIST.map((cam) => (
                      <button
                        key={cam.id}
                        type="button"
                        className={`twin-cam-btn${cameraPreset === cam.id ? ' active' : ''}`}
                        onClick={() => handleSelectCameraPreset(cam.id)}
                      >
                        {cam.label}
                      </button>
                    ))}
                  </div>
                  <span className="twin-orbit-hint">
                    左键旋转 · 滚轮缩放 · 点击设备查看详情
                  </span>
                </div>
              </>
            ) : (
              <img
                src={ELECTROLYTE_FLOW_SVG_SRC}
                alt="正负极电解液循环流动示意图"
                className="flow-schematic-svg"
              />
            )}
          </div>

          <div className="flow-schematic-footer">
            <div className="flow-footer-item">
              <span>正极储罐液位</span>
              <b className="numeric flow-pos-text">
                78.4<small>%</small>
              </b>
            </div>
            <div className="flow-footer-item">
              <span>负极储罐液位</span>
              <b className="numeric flow-neg-text">
                76.8<small>%</small>
              </b>
            </div>
            <div className="flow-footer-item">
              <span>循环泵总流量</span>
              <b className="numeric">
                84.6<small>L/min</small>
              </b>
            </div>
            <div className="flow-footer-item">
              <span>电堆阵列出力</span>
              <b className="numeric cyan">
                125.8<small>kW</small>
              </b>
            </div>
          </div>
        </div>
      </section>

      <aside className="flow-telemetry-rail" aria-label="电解液循环运行参数">
        <section className="panel flow-side-panel">
          <div className="panel-head">
            <strong>正极电解液回路</strong>
            <button
              type="button"
              className="flow-focus-link flow-pos-text"
              onClick={() => handleInspectFromRail('pos_tank', 'pos_tank')}
            >
              定位储罐
            </button>
          </div>
          <div className="panel-body flow-kv-grid">
            <div className="flow-kv-cell">
              <span>储罐液位</span>
              <b className="numeric flow-pos-text">78.4 %</b>
            </div>
            <div className="flow-kv-cell">
              <span>电解液温度</span>
              <b className="numeric">28.2 °C</b>
            </div>
            <div className="flow-kv-cell">
              <span>入口压力</span>
              <b className="numeric">0.18 MPa</b>
            </div>
            <div className="flow-kv-cell">
              <span>回路流量</span>
              <b className="numeric">42.5 L/min</b>
            </div>
          </div>
        </section>

        <section className="panel flow-side-panel">
          <div className="panel-head">
            <strong>负极电解液回路</strong>
            <button
              type="button"
              className="flow-focus-link flow-neg-text"
              onClick={() => handleInspectFromRail('neg_tank', 'neg_tank')}
            >
              定位储罐
            </button>
          </div>
          <div className="panel-body flow-kv-grid">
            <div className="flow-kv-cell">
              <span>储罐液位</span>
              <b className="numeric flow-neg-text">76.8 %</b>
            </div>
            <div className="flow-kv-cell">
              <span>电解液温度</span>
              <b className="numeric">27.9 °C</b>
            </div>
            <div className="flow-kv-cell">
              <span>入口压力</span>
              <b className="numeric">0.17 MPa</b>
            </div>
            <div className="flow-kv-cell">
              <span>回路流量</span>
              <b className="numeric">42.1 L/min</b>
            </div>
          </div>
        </section>

        <section className="panel flow-side-panel flow-stack-panel">
          <div className="panel-head">
            <strong>电堆群与并网状态</strong>
            <button
              type="button"
              className="flow-focus-link green"
              onClick={() => handleInspectFromRail('stack_01', 'stacks')}
            >
              12 / 12 正常
            </button>
          </div>
          <div className="panel-body flow-stack-body">
            <div className="flow-kv-grid">
              <div className="flow-kv-cell">
                <span>电池荷电 SOC</span>
                <b className="numeric cyan">76.4 %</b>
              </div>
              <div className="flow-kv-cell">
                <span>直流母线电压</span>
                <b className="numeric">712.6 V</b>
              </div>
              <div className="flow-kv-cell">
                <span>上排电堆 (6组)</span>
                <b className="green">并网运行</b>
              </div>
              <div className="flow-kv-cell">
                <span>下排电堆 (6组)</span>
                <b className="green">并网运行</b>
              </div>
            </div>

            <div className="flow-quick-actions">
              <button
                type="button"
                className="small-action"
                onClick={() => onSelectSection('overview')}
              >
                查看运行总览
              </button>
              <button
                type="button"
                className="small-action"
                onClick={() => onSelectSection('devices')}
              >
                进入设备监控
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
};
