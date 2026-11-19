import React from 'react';
import { EMS_BRAND_LOGO } from '../../data/emsAssets';
import { TOP_NAV_ITEMS } from '../../data/emsData';
import { getThemeConfig, SYSTEM_THEMES } from '../../data/themes';
import type { SystemThemeKey, TopSection } from '../../types/ems';

interface EmsHeaderProps {
  activeSection: TopSection;
  activeTheme: SystemThemeKey;
  clockTime: string;
  onSelectSection: (section: TopSection) => void;
  onSelectTheme: (theme: SystemThemeKey) => void;
  onToast: (message: string) => void;
}

export const EmsHeader: React.FC<EmsHeaderProps> = ({
  activeSection,
  activeTheme,
  clockTime,
  onSelectSection,
  onSelectTheme,
  onToast,
}) => {
  const currentTheme = getThemeConfig(activeTheme);

  return (
    <>
      <svg className="svg-filters" aria-hidden="true">
        <defs>
          <filter id="remove-white-outline" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 -1 -1 -1 3 0"
            />
          </filter>
        </defs>
      </svg>

      <div className="system-strip">
        <div className="strip-left">
          <span className="signal-pip" />
          <span>储能站在线</span>
          <span className="strip-divider" />
          <span>通讯正常</span>
        </div>
        <div className="strip-right">
          <span>正牧储能管理系统</span>
          <span className="strip-divider" />
          <span className="tabular-nums">{clockTime}</span>
          <button
            type="button"
            className="user-button"
            onClick={() => onToast('当前用户：系统管理员')}
          >
            <span className="user-avatar">周</span>
            <span>管理员</span>
            <span className="tiny-caret">▾</span>
          </button>
        </div>
      </div>

      <header className="topbar">
        <button
          type="button"
          className="brand"
          aria-label="返回正牧储能管理系统首页"
          onClick={() => onSelectSection('home')}
        >
          <img
            src={EMS_BRAND_LOGO}
            alt="Acrel 正牧储能管理系统"
            className="brand-logo"
          />
        </button>

        <nav className="top-nav" aria-label="主导航">
          {TOP_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`top-nav-item${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectSection(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <label className="theme-switcher">
          <span>色系</span>
          <span className={`theme-swatch ${currentTheme.swatchClass}`} aria-hidden="true" />
          <select
            className="theme-select"
            aria-label="系统色系"
            value={activeTheme}
            onChange={(e) => onSelectTheme(e.target.value as SystemThemeKey)}
          >
            {SYSTEM_THEMES.map((theme) => (
              <option key={theme.key} value={theme.key}>
                {theme.label}
              </option>
            ))}
          </select>
        </label>

        <div className="header-summary">
          <div>
            <span>今日告警</span>
            <b className="alarm-count">02</b>
          </div>
          <div>
            <span>设备在线</span>
            <b>18 / 18</b>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot" />
          <span>系统运行中</span>
          <span className="header-divider" />
          <span className="header-site">储能站一号</span>
        </div>
      </header>
    </>
  );
};
