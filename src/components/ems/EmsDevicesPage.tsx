import React from 'react';
import { EMS_EQUIPMENT_IMAGES } from '../../data/emsAssets';
import {
  BATTERY_CLUSTER_ROWS,
  BMS_INFO_ROWS,
  CHART_SETS,
  METER_ENERGY_ROWS,
  METER_REALTIME_METRICS,
  METER_THREE_PHASE_ROWS,
  PCS_CONFIG_ROWS,
  PCS_VALUES,
  STATUS_NAMES,
} from '../../data/emsData';
import type {
  BmsTabKey,
  DeviceModuleKey,
  MeterTabKey,
  PcsInnerKey,
  PcsTabKey,
} from '../../types/ems';
import { EmsChart } from './EmsChart';
import { StatusMatrix } from './StatusMatrix';

interface EmsDevicesPageProps {
  activeDevice: DeviceModuleKey;
  pcsTab: PcsTabKey;
  pcsInner: PcsInnerKey;
  bmsTab: BmsTabKey;
  meterTab: MeterTabKey;
  systemPowerOn: boolean;
  onSelectPcsTab: (tab: PcsTabKey) => void;
  onSelectPcsInner: (tab: PcsInnerKey) => void;
  onSelectBmsTab: (tab: BmsTabKey) => void;
  onSelectMeterTab: (tab: MeterTabKey) => void;
  onToggleSystemPower: () => void;
  onToast: (message: string) => void;
}

const PCS_TABS: PcsTabKey[] = ['PCS参数设置', 'PCS数据', 'PCS状态'];
const PCS_INNERS: PcsInnerKey[] = ['电网参数', '交流参数', '直流参数'];
const BMS_TABS: BmsTabKey[] = ['BMS参数', '电池参数'];
const METER_TABS: MeterTabKey[] = ['实时数据', '电能统计'];

export const EmsDevicesPage: React.FC<EmsDevicesPageProps> = ({
  activeDevice,
  pcsTab,
  pcsInner,
  bmsTab,
  meterTab,
  systemPowerOn,
  onSelectPcsTab,
  onSelectPcsInner,
  onSelectBmsTab,
  onSelectMeterTab,
  onToggleSystemPower,
  onToast,
}) => {
  if (activeDevice === 'PCS数据') {
    return (
      <div>
        <div className="module-tabs" role="tablist" aria-label="PCS子页签">
          {PCS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={pcsTab === tab}
              className={`module-tab${pcsTab === tab ? ' active' : ''}`}
              onClick={() => onSelectPcsTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {pcsTab === 'PCS参数设置' && (
          <>
            <div className="table-toolbar">
              <span className="table-caption">PCS 运行定值与系统开机控制</span>
              <button
                type="button"
                className="small-action"
                onClick={() => onToast('参数定值已保存')}
              >
                保存设置
              </button>
            </div>
            <div className="panel panel-body table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>参数名称</th>
                    <th>数值</th>
                    <th>说明</th>
                    <th>参数名称</th>
                    <th>数值</th>
                    <th>范围</th>
                  </tr>
                </thead>
                <tbody>
                  {PCS_CONFIG_ROWS.map((row) => (
                    <tr key={row.leftName}>
                      <td>{row.leftName}</td>
                      <td className="value">{row.leftValue}</td>
                      <td>{row.leftRange}</td>
                      <td>{row.rightName}</td>
                      <td className={row.hasSwitch ? 'value-good' : 'value'}>
                        {row.hasSwitch ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={systemPowerOn}
                            aria-label="系统总开机开关"
                            className={`config-switch${systemPowerOn ? ' on' : ''}`}
                            onClick={onToggleSystemPower}
                          />
                        ) : (
                          row.rightValue
                        )}
                      </td>
                      <td>{row.rightRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pcsTab === 'PCS数据' && (
          <div className="split-data">
            <div className="selected-subnav">
              {PCS_INNERS.map((inner) => (
                <button
                  key={inner}
                  type="button"
                  className={`subnav-button${pcsInner === inner ? ' active' : ''}`}
                  onClick={() => onSelectPcsInner(inner)}
                >
                  {inner}
                </button>
              ))}
            </div>
            <div className="panel panel-body">
              <div className="table-toolbar">
                <span className="table-caption">{pcsInner}实时采样值</span>
                <span className="muted">采样周期 1s</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>参数名</th>
                    <th>数值</th>
                    <th>单位</th>
                  </tr>
                </thead>
                <tbody>
                  {PCS_VALUES[pcsInner].map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td className="value">{row.value}</td>
                      <td className="unit-cell">{row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pcsTab === 'PCS状态' && (
          <>
            <div className="metric-stack grid-cols-4 mb-[10px]">
              <div className="metric-card">
                <span className="metric-label">运行状态</span>
                <span className="metric-value green">并网</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">AC接触器</span>
                <span className="metric-value">闭合</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">DC接触器</span>
                <span className="metric-value">闭合</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">绝缘检测</span>
                <span className="metric-value green">正常</span>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <strong>直流与交流保护状态点位</strong>
                <span className="minor">实时通讯状态</span>
              </div>
              <div className="panel-body">
                <StatusMatrix items={[...STATUS_NAMES.dc, ...STATUS_NAMES.ac]} columns={4} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (activeDevice === 'BMS数据') {
    return (
      <div className="parameter-layout">
        <div className="module-tabs" role="tablist" aria-label="BMS子页签">
          {BMS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={bmsTab === tab}
              className={`module-tab${bmsTab === tab ? ' active' : ''}`}
              onClick={() => onSelectBmsTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {bmsTab === 'BMS参数' ? (
          <>
            <div className="parameter-info">
              <div className="panel table-scroll">
                <table className="parameter-grid">
                  <tbody>
                    {BMS_INFO_ROWS.map((row, idx) => (
                      <tr key={`bms-row-${idx}`}>
                        {row.map((cell) => (
                          <React.Fragment key={cell.name}>
                            <th>{cell.name}</th>
                            <td className="param-value">{cell.value}</td>
                            <td className="param-unit">{cell.unit}</td>
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="soc-meter">
                <div className="battery-graphic">
                  <div className="battery-fill" />
                </div>
                <b>76.4%</b>
                <small>SOC · 正常</small>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <strong>BMS 保护状态</strong>
                <span className="minor">28项点位监测中</span>
              </div>
              <div className="panel-body">
                <StatusMatrix items={STATUS_NAMES.bms} columns={4} />
              </div>
            </div>
          </>
        ) : (
          <div className="panel panel-body table-scroll">
            <div className="table-toolbar">
              <span className="table-caption">6个电池簇单体参数对比</span>
              <span className="muted">簇间最大压差 17 mV</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>参数名称</th>
                  <th>1#电池簇</th>
                  <th>2#电池簇</th>
                  <th>3#电池簇</th>
                  <th>4#电池簇</th>
                  <th>5#电池簇</th>
                  <th>6#电池簇</th>
                  <th>单位</th>
                </tr>
              </thead>
              <tbody>
                {BATTERY_CLUSTER_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {row.clusters.map((val, idx) => (
                      <td
                        key={`${row.label}-c-${idx}`}
                        className={val === '合闸' ? 'value-good' : 'value'}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="unit-cell">{row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (activeDevice === '电表数据') {
    return (
      <div>
        <div className="module-tabs" role="tablist" aria-label="电表子页签">
          {METER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={meterTab === tab}
              className={`module-tab${meterTab === tab ? ' active' : ''}`}
              onClick={() => onSelectMeterTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {meterTab === '实时数据' ? (
          <>
            <div className="metric-stack grid-cols-6 max-lg:grid-cols-3 max-md:grid-cols-2 mb-[10px]">
              {METER_REALTIME_METRICS.map((item) => (
                <div key={item.name} className="metric-card">
                  <span className="metric-label">{item.name}</span>
                  <span className="metric-value">
                    {item.value}
                    {item.unit && <small>{item.unit}</small>}
                  </span>
                </div>
              ))}
            </div>
            <div className="panel panel-body table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>参量</th>
                    <th>A相</th>
                    <th>B相</th>
                    <th>C相</th>
                    <th>单位</th>
                    <th>总参量</th>
                    <th>数值</th>
                    <th>单位</th>
                  </tr>
                </thead>
                <tbody>
                  {METER_THREE_PHASE_ROWS.map((row, idx) => (
                    <tr key={`meter-rt-${idx}`}>
                      <td>{row[0]}</td>
                      <td className="value">{row[1]}</td>
                      <td className="value">{row[2]}</td>
                      <td className="value">{row[3]}</td>
                      <td className="unit-cell">{row[4]}</td>
                      <td>{row[5]}</td>
                      <td className="value">{row[6]}</td>
                      <td className="unit-cell">{row[7]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="split-data">
            <div className="metric-stack">
              <div className="metric-card">
                <span className="metric-label">当日正向有功</span>
                <span className="metric-value">
                  1,842.6<small>kWh</small>
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">当日反向有功</span>
                <span className="metric-value">
                  1,706.3<small>kWh</small>
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">当日转换效率</span>
                <span className="metric-value green">92.6%</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">累计总有功</span>
                <span className="metric-value">
                  8,902.9<small>MWh</small>
                </span>
              </div>
            </div>
            <div className="panel panel-body table-scroll">
              <div className="table-caption mb-[7px]">分时段电量与功率因数记录</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>时段</th>
                    <th>正向有功(kWh)</th>
                    <th>反向有功(kWh)</th>
                    <th>功率因数</th>
                  </tr>
                </thead>
                <tbody>
                  {METER_ENERGY_ROWS.map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td className="value">{row[1]}</td>
                      <td className="value">{row[2]}</td>
                      <td className="value-good">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeDevice === '空调数据') {
    return (
      <div className="split-data">
        <div className="panel equipment-card">
          <div className="equipment-art">
            <img
              className="hvac-image"
              src={EMS_EQUIPMENT_IMAGES.hvac}
              alt="集装箱环境温度监控空调机组"
            />
          </div>
          <div className="equipment-info">
            <div>
              <div className="equipment-name">
                <span className="status-lamp" /> 储能温控系统
              </div>
              <div className="equipment-meta">制冷模式 · 设定温度 26.0 °C · 风量 自动</div>
            </div>
            <span className="run-pill">
              <span className="status-lamp" /> 运行正常
            </span>
          </div>
        </div>

        <div className="panel large-chart">
          <div className="panel-head">
            <strong>集装箱温湿度实时监测曲线</strong>
            <span className="chart-legend">
              <i className="legend-dot" /> 温度 °C &nbsp; <i className="legend-dot green-dot" /> 湿度 %RH
            </span>
          </div>
          <div className="panel-body">
            <div className="chart-wrap">
              <EmsChart
                values={CHART_SETS.hvacTemp}
                min={0}
                max={50}
                unit="°C"
                secondary={CHART_SETS.hvacHumidity}
                showPoint
              />
            </div>
            <div className="device-detail-row">
              <div className="mini-readout">
                <span>柜内温度</span>
                <b>28.6 °C</b>
              </div>
              <div className="mini-readout">
                <span>相对湿度</span>
                <b>51.2 %</b>
              </div>
              <div className="mini-readout">
                <span>压缩机状态</span>
                <b className="green">运行中</b>
              </div>
              <div className="mini-readout">
                <span>通讯状态</span>
                <b className="green">正常</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeDevice === '消防/照明') {
    return (
      <div className="flex flex-col flex-1 min-h-0 gap-[10px]">
        <div className="equipment-grid min-h-0">
          <div className="panel equipment-card">
            <div className="equipment-art">
              <img
                className="fire-image"
                src={EMS_EQUIPMENT_IMAGES.fire}
                alt="消防状态监测控制器"
              />
            </div>
            <div className="equipment-info">
              <div>
                <div className="equipment-name">
                  <span className="status-lamp" /> 气体消防系统
                </div>
                <div className="equipment-meta">烟感、温感与可燃气体探测器在线</div>
              </div>
              <span className="run-pill">
                <span className="status-lamp" /> 运行正常
              </span>
            </div>
          </div>

          <div className="panel equipment-card">
            <div className="equipment-art">
              <img
                className="light-image"
                src={EMS_EQUIPMENT_IMAGES.light}
                alt="储能站智能照明灯具"
              />
            </div>
            <div className="equipment-info">
              <div>
                <div className="equipment-name">
                  <span className="status-lamp" /> 站区照明系统
                </div>
                <div className="equipment-meta">应急照明与走廊照明回路正常供电</div>
              </div>
              <span className="run-pill">
                <span className="status-lamp" /> 运行正常
              </span>
            </div>
          </div>
        </div>

        <div className="device-detail-row mt-0 shrink-0">
          <div className="mini-readout">
            <span>烟雾探测</span>
            <b className="green">无告警</b>
          </div>
          <div className="mini-readout">
            <span>气体释放阀</span>
            <b className="green">锁定正常</b>
          </div>
          <div className="mini-readout">
            <span>通道照明</span>
            <b className="green">已开启</b>
          </div>
          <div className="mini-readout">
            <span>应急供电</span>
            <b className="green">正常</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="split-data">
      <div className="panel equipment-card">
        <div className="equipment-art">
          <img
            className="ups-image"
            src={EMS_EQUIPMENT_IMAGES.ups}
            alt="UPS 不间断电源装置"
          />
        </div>
        <div className="equipment-info">
          <div>
            <div className="equipment-name">
              <span className="status-lamp" /> UPS 不间断电源
            </div>
            <div className="equipment-meta">监控主机与二次控制屏后备供电</div>
          </div>
          <span className="run-pill">
            <span className="status-lamp" /> 运行正常
          </span>
        </div>
      </div>

      <div className="panel panel-body">
        <div className="metric-stack">
          <div className="metric-card">
            <span className="metric-label">输入电压</span>
            <span className="metric-value">
              228.4<small>V</small>
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">输出电压</span>
            <span className="metric-value">
              220.0<small>V</small>
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">电池后备电量</span>
            <span className="metric-value green">100%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">负载率</span>
            <span className="metric-value">
              28.5<small>%</small>
            </span>
          </div>
        </div>
        <div className="table-caption mt-[18px]">当前状态 · 市电逆变在线供电，电池处于浮充状态</div>
        <div className="device-detail-row grid-cols-2">
          <div className="mini-readout">
            <span>旁路状态</span>
            <b className="green">正常备援</b>
          </div>
          <div className="mini-readout">
            <span>预计后备时长</span>
            <b>120 min</b>
          </div>
        </div>
      </div>
    </div>
  );
};
