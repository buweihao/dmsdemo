import React from 'react';
import { STRATEGY_TIMELINE_SEGMENTS } from '../../data/emsData';
import type { ScheduleSlotRow, StrategyModuleKey } from '../../types/ems';

interface EmsStrategyPageProps {
  activeStrategy: StrategyModuleKey;
  scheduleRows: ScheduleSlotRow[];
  onSelectStrategy: (key: StrategyModuleKey) => void;
  onToggleSlotEnabled: (slotId: string) => void;
  onToast: (message: string) => void;
}

const AXIS_LABELS = ['00:00', '06:00', '10:00', '12:00', '18:00', '21:00', '24:00'];

export const EmsStrategyPage: React.FC<EmsStrategyPageProps> = ({
  activeStrategy,
  scheduleRows,
  onSelectStrategy,
  onToggleSlotEnabled,
  onToast,
}) => {
  if (activeStrategy === '计划配置') {
    return (
      <div className="panel panel-body table-scroll">
        <div className="table-toolbar">
          <span className="table-caption">全天充放电时段计划参数配置</span>
          <button
            type="button"
            className="small-action"
            onClick={() => onToast('运行计划已保存')}
          >
            保存计划
          </button>
        </div>
        <table className="data-table schedule-table">
          <thead>
            <tr>
              <th>时段</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>运行模式</th>
              <th>计划功率</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {scheduleRows.map((row) => (
              <tr key={row.id}>
                <td>{row.period}</td>
                <td className="tabular-nums">{row.startTime}</td>
                <td className="tabular-nums">{row.endTime}</td>
                <td>{row.mode}</td>
                <td className="value">{row.power}</td>
                <td>
                  <button
                    type="button"
                    aria-pressed={row.enabled}
                    className={`config-switch${row.enabled ? ' on' : ''}`}
                    title={row.enabled ? '点击停用此时段' : '点击启用此时段'}
                    aria-label={`${row.period} ${row.startTime}-${row.endTime} ${row.enabled ? '已启用' : '已停用'}`}
                    onClick={() => onToggleSlotEnabled(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="strategy-layout">
      <div className="panel panel-body">
        <div className="table-toolbar">
          <span className="table-caption">峰谷套利 · 工作日策略</span>
          <span className="run-pill">
            <span className="status-lamp" /> 已执行
          </span>
        </div>

        <div className="schedule-track">
          {STRATEGY_TIMELINE_SEGMENTS.map((seg) => (
            <div key={seg.id} className={`schedule-segment ${seg.type} ${seg.widthClass}`}>
              {seg.label}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[#7187b4] text-[9px] mt-[5px] mb-[14px]">
          {AXIS_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="device-detail-row">
          <div className="mini-readout">
            <span>谷时充电总限额</span>
            <b>180 kW</b>
          </div>
          <div className="mini-readout">
            <span>峰时放电目标</span>
            <b>150 kW</b>
          </div>
          <div className="mini-readout">
            <span>SOC 安全下限</span>
            <b>15%</b>
          </div>
          <div className="mini-readout">
            <span>SOC 安全上限</span>
            <b>95%</b>
          </div>
        </div>
      </div>

      <div className="panel panel-body strategy-summary">
        <div className="table-caption">策略运行摘要</div>
        <div className="strategy-kpi">
          <span>当前执行模式</span>
          <b className="green">削峰填谷 · 自动</b>
        </div>
        <div className="strategy-kpi">
          <span>今日策略预期收益</span>
          <b>
            ¥3,258.40<small>元</small>
          </b>
        </div>
        <div className="strategy-kpi">
          <span>当前控制功率指令</span>
          <b>
            150.0<small>kW</small>
          </b>
        </div>
        <button
          type="button"
          className="small-action mt-auto self-end"
          onClick={() => onSelectStrategy('计划配置')}
        >
          查看计划配置
        </button>
      </div>
    </div>
  );
};
