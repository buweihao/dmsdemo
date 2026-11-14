import React from 'react';
import {
  CURVE_SIDEBAR_ITEMS,
  DEVICE_SIDEBAR_ITEMS,
  STRATEGY_SIDEBAR_ITEMS,
} from '../../data/emsData';
import type {
  CurveModuleKey,
  DeviceModuleKey,
  StrategyModuleKey,
  TopSection,
} from '../../types/ems';

interface EmsSidebarProps {
  section: TopSection;
  activeDevice: DeviceModuleKey;
  activeCurve: CurveModuleKey;
  activeStrategy: StrategyModuleKey;
  onSelectDevice: (key: DeviceModuleKey) => void;
  onSelectCurve: (key: CurveModuleKey) => void;
  onSelectStrategy: (key: StrategyModuleKey) => void;
}

export const EmsSidebar: React.FC<EmsSidebarProps> = ({
  section,
  activeDevice,
  activeCurve,
  activeStrategy,
  onSelectDevice,
  onSelectCurve,
  onSelectStrategy,
}) => {
  if (section !== 'devices' && section !== 'curves' && section !== 'strategy') {
    return null;
  }

  let caption = '';
  let items: Array<{ label: string; icon: string; active: boolean; onClick: () => void }> = [];

  if (section === 'devices') {
    caption = '设备列表';
    items = DEVICE_SIDEBAR_ITEMS.map((item) => ({
      label: item.label,
      icon: item.icon,
      active: activeDevice === item.label,
      onClick: () => onSelectDevice(item.label),
    }));
  } else if (section === 'curves') {
    caption = '曲线与报表';
    items = CURVE_SIDEBAR_ITEMS.map((item) => ({
      label: item.label,
      icon: item.icon,
      active: activeCurve === item.label,
      onClick: () => onSelectCurve(item.label),
    }));
  } else {
    caption = '策略管理';
    items = STRATEGY_SIDEBAR_ITEMS.map((item) => ({
      label: item.label,
      icon: item.icon,
      active: activeStrategy === item.label,
      onClick: () => onSelectStrategy(item.label),
    }));
  }

  return (
    <aside className="sidebar" aria-label={caption}>
      <div className="side-caption">{caption}</div>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`side-link${item.active ? ' active' : ''}`}
          aria-current={item.active ? 'page' : undefined}
          onClick={item.onClick}
        >
          <span className="side-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="side-label">{item.label}</span>
        </button>
      ))}
      <div className="side-foot">
        <div>
          站点状态 <span className="green">●</span> <b>正常运行</b>
        </div>
        <div>
          在线设备 <b>18 / 18</b>
        </div>
      </div>
    </aside>
  );
};
