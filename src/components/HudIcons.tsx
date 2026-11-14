import React from 'react';

export const TransformerIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.5">
    <rect x="6" y="10" width="24" height="19" rx="1.5" />
    <line x1="10" y1="14" x2="10" y2="25" />
    <line x1="14" y1="14" x2="14" y2="25" />
    <line x1="18" y1="14" x2="18" y2="25" />
    <line x1="22" y1="14" x2="22" y2="25" />
    <line x1="26" y1="14" x2="26" y2="25" />
    <path d="M11 10V6M18 10V5M25 10V6" />
    <circle cx="11" cy="5.5" r="1.2" fill="var(--accent)" />
    <circle cx="18" cy="4.5" r="1.2" fill="var(--accent)" />
    <circle cx="25" cy="5.5" r="1.2" fill="var(--accent)" />
    <path d="M3 16h3M3 23h3M30 16h3M30 23h3" />
  </svg>
);

export const GroundTransformerIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.5">
    <path d="M8 14h20l-2 14H10L8 14z" />
    <path d="M6 14h24" />
    <path d="M12 14V7M18 14V6M24 14V7" />
    <path d="M10 9h4M16 8h4M22 9h4" />
    <path d="M18 18l-2.5 4h3l-1.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SwitchgearIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.5">
    <rect x="6" y="7" width="24" height="22" rx="1" />
    <line x1="14" y1="7" x2="14" y2="29" />
    <line x1="22" y1="7" x2="22" y2="29" />
    <line x1="10" y1="11" x2="10" y2="25" />
    <line x1="18" y1="11" x2="18" y2="25" />
    <line x1="26" y1="11" x2="26" y2="25" />
    <circle cx="10" cy="16" r="1.5" fill="var(--accent)" />
    <circle cx="18" cy="20" r="1.5" fill="var(--accent)" />
    <circle cx="26" cy="14" r="1.5" fill="var(--accent)" />
  </svg>
);

export const GeneratorIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.5">
    <rect x="6" y="10" width="24" height="17" rx="2" />
    <rect x="10" y="7" width="16" height="3" />
    <path d="M14 14h5v4h3v4h-8v-8z" />
    <line x1="24" y1="14" x2="27" y2="14" />
    <line x1="24" y1="18" x2="27" y2="18" />
    <line x1="24" y1="22" x2="27" y2="22" />
    <path d="M9 27v2.5M27 27v2.5" />
  </svg>
);

export const SensorTotalIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.5">
    <circle cx="18" cy="18" r="11" />
    <path d="M18 11v7l4.5 2.5" strokeLinecap="round" />
    <circle cx="18" cy="18" r="3" />
    <path d="M5 18h3M28 18h3M18 5v3M18 28v3" />
  </svg>
);

export const StatIcon: React.FC<{
  type:
    | 'video'
    | 'surroundings'
    | 'lock'
    | 'light'
    | 'ac'
    | 'fan'
    | 'door'
    | 'fire'
    | 'drain'
    | 'weather';
  className?: string;
}> = ({ type, className = 'w-5 h-5' }) => {
  switch (type) {
    case 'video':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <rect x="3" y="6" width="13" height="12" rx="1.5" />
          <path d="M16 10l5-3v10l-5-3v-4z" />
        </svg>
      );
    case 'surroundings':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <path d="M12 4v10a3 3 0 1 1-4 2.83" />
          <path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0V4z" />
          <path d="M16 8h3M16 11h2" />
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <rect x="6" y="4" width="12" height="16" rx="1.5" />
          <circle cx="12" cy="10" r="2" />
          <path d="M10 15h4" />
        </svg>
      );
    case 'light':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <path d="M9 18h6M10 21h4" />
          <path d="M8 14a5 5 0 1 1 8 0c-.8.9-1.2 1.8-1.3 3H9.3c-.1-1.2-.5-2.1-1.3-3z" />
          <path d="M12 2v2M4.5 9.5h2M17.5 9.5h2M6.5 4.5l1.4 1.4M17.5 4.5l-1.4 1.4" />
        </svg>
      );
    case 'ac':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="9" rx="1.5" />
          <line x1="6" y1="11" x2="18" y2="11" />
          <path d="M8 17c0 1.5-1 2-1 3M12 17c0 1.5-1 2-1 3M16 17c0 1.5-1 2-1 3" />
        </svg>
      );
    case 'fan':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10c0-3 3-5 4-3s-1 4-4 3z" />
          <path d="M14 12c3 0 5 3 3 4s-4-1-3-4z" />
          <path d="M10 14c0 3-3 5-4 3s1-4 4-3z" />
        </svg>
      );
    case 'door':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="8" y1="4" x2="8" y2="20" />
          <line x1="16" y1="4" x2="16" y2="20" />
        </svg>
      );
    case 'fire':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <rect x="9" y="8" width="6" height="13" rx="1" />
          <path d="M10 8V5h4v3M7 11h2M15 11h2M12 3v2" />
        </svg>
      );
    case 'drain':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <path d="M4 10c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4 0" />
          <path d="M4 14c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4 0" />
          <path d="M4 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4 0" />
        </svg>
      );
    case 'weather':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="var(--accent)" strokeWidth="1.6">
          <circle cx="9" cy="9" r="3" />
          <path d="M9 3v1.5M9 13.5V15M3 9h1.5M13.5 9H15" />
          <path d="M10 18h8a3 3 0 0 0 .3-6 4 4 0 0 0-7.7-1A2.5 2.5 0 0 0 10 18z" />
        </svg>
      );
  }
};
