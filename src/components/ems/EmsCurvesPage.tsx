import React from 'react';
import { CHART_SETS, CURVE_RANGES } from '../../data/emsData';
import type { CurveModuleKey, CurveRangeKey, ReportDeviceKey } from '../../types/ems';
import { formatReportCsv, getHoursForCurveRange, getReportRowsForDevice } from '../../utils/emsState';
import { EmsChart } from './EmsChart';

interface EmsCurvesPageProps {
  activeCurve: CurveModuleKey;
  curveRange: CurveRangeKey;
  reportDate: string;
  reportDevice: ReportDeviceKey;
  updateTime: string;
  onSelectRange: (range: CurveRangeKey) => void;
  onChangeReportDate: (date: string) => void;
  onChangeReportDevice: (device: ReportDeviceKey) => void;
  onToast: (message: string) => void;
}

const CURVE_PAGE_CONFIG: Record<
  Exclude<CurveModuleKey, '报表查询'>,
  {
    title: string;
    primaryLabel: string;
    secondaryLabel?: string;
    values: number[];
    secondary?: number[];
    min: number;
    max: number;
    unit: string;
    peak: string;
    avg: string;
    note: string;
  }
> = {
  PCS曲线: {
    title: 'PCS运行曲线分析',
    primaryLabel: 'PCS有功功率 kW',
    secondaryLabel: 'PCS输出电压 V',
    values: CHART_SETS.power,
    secondary: CHART_SETS.grid,
    min: 0,
    max: 240,
    unit: 'kW',
    peak: '182.4 kW',
    avg: '104.6 kW',
    note: '采样周期：15分钟 · 光伏逆变与电网频率同步',
  },
  SOC曲线: {
    title: '电池SOC充放电趋势',
    primaryLabel: '系统SOC %',
    secondaryLabel: '充放电功率',
    values: CHART_SETS.soc,
    secondary: CHART_SETS.power,
    min: 0,
    max: 100,
    unit: '%',
    peak: '78.2 %',
    avg: '74.5 %',
    note: '采样周期：15分钟 · 电池簇一致性良好',
  },
  历史曲线: {
    title: '历史能量走势对比',
    primaryLabel: '系统日功 kW',
    secondaryLabel: '电网频率 Hz',
    values: CHART_SETS.energy,
    secondary: CHART_SETS.grid,
    min: 0,
    max: 1500,
    unit: 'kW',
    peak: '1,065 kW',
    avg: '620 kW',
    note: '历史数据归档完整，支持按日期对比回溯',
  },
};

export const EmsCurvesPage: React.FC<EmsCurvesPageProps> = ({
  activeCurve,
  curveRange,
  reportDate,
  reportDevice,
  updateTime,
  onSelectRange,
  onChangeReportDate,
  onChangeReportDevice,
  onToast,
}) => {
  if (activeCurve === '报表查询') {
    const rows = getReportRowsForDevice(reportDevice, reportDate);

    const handleExport = () => {
      const csv = formatReportCsv(rows, reportDevice);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `acrel-ems-${reportDevice}-${reportDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onToast('报表文件已生成');
    };

    return (
      <div className="panel panel-body table-scroll">
        <div className="table-toolbar">
          <div className="curve-tools">
            <label className="calendar-row">
              <span>查询日期</span>
              <input
                className="date-control"
                type="date"
                aria-label="查询日期"
                value={reportDate}
                onChange={(e) => onChangeReportDate(e.target.value)}
              />
            </label>
            <select
              className="small-select"
              aria-label="选择设备"
              value={reportDevice}
              onChange={(e) => onChangeReportDevice(e.target.value as ReportDeviceKey)}
            >
              <option value="PCS-01">1# 储能单元 (PCS-01)</option>
              <option value="BMS-01">1# 电池柜 (BMS-01)</option>
            </select>
          </div>
          <button type="button" className="small-action" onClick={handleExport}>
            导出报表
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>设备编号</th>
              <th>采集时间</th>
              <th>PCS有功功率(kW)</th>
              <th>电池电压(V)</th>
              <th>电池SOC(%)</th>
              <th>电网频率(Hz)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.device}-${row.time}`}>
                <td>{row.device}</td>
                <td>{row.time}</td>
                <td className="value">{row.pcsPower}</td>
                <td className="value">{row.batteryVoltage}</td>
                <td className="value-good">{row.soc}</td>
                <td className="value">{row.gridFrequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const config = CURVE_PAGE_CONFIG[activeCurve];
  const hours = getHoursForCurveRange(curveRange);

  return (
    <div className="curve-layout">
      <div className="panel large-chart">
        <div className="panel-head">
          <strong>{config.title}</strong>
          <div className="curve-tools">
            <input
              className="date-control"
              type="date"
              aria-label="曲线查询日期"
              value={reportDate}
              onChange={(e) => onChangeReportDate(e.target.value)}
            />
            {CURVE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={`range-button${curveRange === range ? ' active' : ''}`}
                onClick={() => onSelectRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="chart-wrap">
            <EmsChart
              values={config.values}
              min={config.min}
              max={config.max}
              unit={config.unit}
              hours={hours}
              fill
              secondary={config.secondary}
              showPoint
            />
          </div>
          <div className="muted mt-[10px]">
            时间窗口：{curveRange} · {config.note}
          </div>
        </div>
      </div>

      <div className="curve-side">
        <div className="panel panel-body">
          <div className="table-caption">曲线图例</div>
          <div className="curve-legend-list">
            <div className="curve-legend-row">
              <span className="curve-key" /> {config.primaryLabel}
            </div>
            {config.secondaryLabel && (
              <div className="curve-legend-row">
                <span className="curve-key green-key" /> {config.secondaryLabel}
              </div>
            )}
          </div>
        </div>

        <div className="panel panel-body">
          <div className="table-caption">统计摘要</div>
          <div className="curve-summary">
            <div className="mini-readout">
              <span>峰值</span>
              <b>{config.peak}</b>
            </div>
            <div className="mini-readout">
              <span>均值</span>
              <b>{config.avg}</b>
            </div>
            <div className="mini-readout col-span-2">
              <span>最近更新时间</span>
              <b className="tabular-nums">{updateTime}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
