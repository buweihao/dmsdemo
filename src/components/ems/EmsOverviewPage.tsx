import React from 'react';
import {
  CHART_SETS,
  EMS_ICONS,
  OVERVIEW_DEVICE_ITEMS,
  OVERVIEW_REVENUE_ITEMS,
} from '../../data/emsData';
import type { RevenueStatItem } from '../../types/ems';
import { EmsChart } from './EmsChart';

const getTileIconClasses = (colorClass: RevenueStatItem['colorClass']): string => {
  switch (colorClass) {
    case 'gold':
      return 'text-[#ffd17a] bg-[#ffd17a]/15 border-[#ffd17a]/35';
    case 'greenish':
      return 'text-[#71e3ad] bg-[#71e3ad]/15 border-[#71e3ad]/35';
    case 'violet':
      return 'text-[#e2a5ee] bg-[#e2a5ee]/15 border-[#e2a5ee]/35';
  }
};

export const EmsOverviewPage: React.FC = () => {
  return (
    <div className="overview-grid">
      <section className="panel revenue-panel">
        <div className="panel-head">
          <strong>收益与电量统计</strong>
          <span className="minor">日统计</span>
        </div>
        <div className="revenue-grid">
          {OVERVIEW_REVENUE_ITEMS.map((item) => (
            <div key={item.id} className="revenue-tile">
              <div className={`revenue-icon ${getTileIconClasses(item.colorClass)}`}>
                {EMS_ICONS[item.iconKey]}
              </div>
              <div className="revenue-copy">
                <strong>{item.label}</strong>
                <b>
                  {item.value}
                  <span>{item.unit}</span>
                </b>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel flow-panel">
        <div className="panel-head">
          <strong>储能系统运行拓扑</strong>
          <span className="minor green">● 实时监测</span>
        </div>
        <div className="panel-body">
          <div className="flow-stage">
            <div className="flow-node">
              <div className="node-icon">
                <span className="node-symbol">{EMS_ICONS.grid}</span>
              </div>
              <strong>电网调度</strong>
              <div>
                <span className="node-value">125.8</span>
                <span className="node-unit">kW</span>
              </div>
              <small>负荷频率 50.02 Hz</small>
            </div>

            <div className="flow-line" />

            <div className="flow-node">
              <div className="node-icon">
                <span className="node-symbol">{EMS_ICONS.pcs}</span>
              </div>
              <strong>储能变流器 PCS</strong>
              <div>
                <span className="node-value">125.8</span>
                <span className="node-unit">kW</span>
              </div>
              <small>并网运行 · PF 0.99</small>
            </div>

            <div className="flow-line reverse" />

            <div className="flow-node">
              <div className="node-icon battery-node">
                <span className="node-symbol">{EMS_ICONS.battery}</span>
              </div>
              <strong>电池组 BMS</strong>
              <div>
                <span className="node-value">76.4</span>
                <span className="node-unit">% SOC</span>
              </div>
              <small>SOH 98.6%</small>
            </div>
          </div>

          <div className="flow-stats">
            <div className="flow-stat">
              <span>直流电压</span>
              <b>712.6 V</b>
            </div>
            <div className="flow-stat">
              <span>直流电流</span>
              <b>-22.6 A</b>
            </div>
            <div className="flow-stat">
              <span>环境温度</span>
              <b>28.6 °C</b>
            </div>
          </div>
        </div>
      </section>

      <section className="panel device-panel">
        <div className="panel-head">
          <strong>设备运行状态</strong>
          <span className="minor">6项设备正常</span>
        </div>
        <div className="device-status-grid">
          {OVERVIEW_DEVICE_ITEMS.map((item) => (
            <div key={item.id} className="device-status">
              <div className="device-orbit" aria-hidden="true">
                {EMS_ICONS[item.iconKey]}
              </div>
              <div className="device-copy">
                <small>{item.name}</small>
                <b className={item.isNumeric ? 'numeric' : 'green'}>{item.status}</b>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel chart-panel home-chart-1">
        <div className="panel-head">
          <strong>PCS有功功率</strong>
          <span className="chart-legend">
            <i className="legend-dot" /> 功率 kW
          </span>
        </div>
        <div className="panel-body">
          <div className="chart-wrap">
            <EmsChart values={CHART_SETS.power} min={0} max={240} unit="kW" fill showPoint />
          </div>
        </div>
      </section>

      <section className="panel chart-panel home-chart-2">
        <div className="panel-head">
          <strong>储能系统功率趋势</strong>
          <span className="chart-legend">
            <i className="legend-dot" /> 有功 kW &nbsp; <i className="legend-dot green-dot" /> 充电 kW
          </span>
        </div>
        <div className="panel-body">
          <div className="chart-wrap">
            <EmsChart
              values={CHART_SETS.energy}
              min={0}
              max={1500}
              unit="kW"
              fill
              secondary={CHART_SETS.grid}
              showPoint
            />
          </div>
        </div>
      </section>

      <section className="panel chart-panel home-chart-3">
        <div className="panel-head">
          <strong>电池SOC曲线</strong>
          <span className="chart-legend">
            <i className="legend-dot" /> SOC %
          </span>
        </div>
        <div className="panel-body">
          <div className="chart-wrap">
            <EmsChart values={CHART_SETS.soc} min={0} max={100} unit="%" fill showPoint />
          </div>
        </div>
      </section>
    </div>
  );
};
