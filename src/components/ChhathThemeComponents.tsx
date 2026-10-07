/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CHHATH_THEME } from '../theme/chhathTheme';
import { CheckCircle2, ShieldCheck, Wifi, WifiOff, AlertOctagon } from 'lucide-react';

/**
 * REUSABLE BRANDING FOOTER (Step 20 Requirement 6 & 27)
 * EXACT SPELLING: NEXTGEN DEVBHOOMI FOUNDATION
 */
export const BrandFooter: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <footer className={`pt-6 pb-4 text-center space-y-1.5 select-none font-['Mukta',sans-serif] ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 h-px bg-amber-400/60" />
        <span className="text-xs font-black tracking-wider text-amber-900 uppercase">
          DEO CHHATH SEVA
        </span>
        <span className="w-8 h-px bg-amber-400/60" />
      </div>

      <p className="text-[12px] font-bold text-stone-700">
        “रास्ता भी • सहायता भी • सेवा भी”
      </p>

      <p className="text-[11px] font-bold text-stone-500 pt-0.5">
        A public-service initiative by
      </p>

      <p className="text-xs font-black tracking-wide text-[#0B5E8E]">
        NEXTGEN DEVBHOOMI FOUNDATION
      </p>

      <p className="text-[10px] text-stone-400 pt-0.5">
        देव सूर्य मंदिर व सूर्य कुंड महापर्व सेवा • निःशुल्क जनसेवा
      </p>
    </footer>
  );
};

/**
 * REUSABLE VERIFIED BADGE (Step 20 Requirement 23)
 * Use only for verified facilities, volunteers, and official announcements
 */
export const VerifiedBadge: React.FC<{ label?: string; className?: string }> = ({
  label = 'VERIFIED',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs select-none ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span>✓ {label}</span>
    </span>
  );
};

/**
 * REUSABLE OFFICIAL BADGE
 */
export const OfficialBadge: React.FC<{ label?: string; className?: string }> = ({
  label = 'VERIFIED OFFICIAL',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs select-none ${className}`}
    >
      <ShieldCheck className="w-3 h-3 text-amber-700" />
      <span>✓ {label}</span>
    </span>
  );
};

/**
 * REUSABLE ONLINE / OFFLINE BADGE (Step 20 Requirement 22)
 * ONLINE: 🟢 Online
 * OFFLINE: 🟠 Offline
 */
export const OnlineOfflineBadge: React.FC<{ isOnline: boolean; className?: string }> = ({
  isOnline,
  className = '',
}) => {
  if (isOnline) {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-lg select-none ${className}`}
      >
        <span>🟢</span>
        <span>Online</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg select-none ${className}`}
    >
      <span>🟠</span>
      <span>Offline</span>
    </span>
  );
};

/**
 * REUSABLE EMERGENCY SOS BUTTON
 * Red is strictly preserved for emergencies
 */
export const EmergencyActionButton: React.FC<{
  onClick: () => void;
  label?: string;
  subLabel?: string;
  className?: string;
}> = ({
  onClick,
  label = 'आपातकालीन सहायता (SOS)',
  subLabel = 'एम्बुलेंस, पुलिस व त्वरित सहायता',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-98 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 text-left transition-all border-2 border-red-500 font-['Mukta',sans-serif] ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shrink-0">
          🚨
        </div>
        <div>
          <span className="block text-base font-black text-white leading-tight">
            {label}
          </span>
          <span className="block text-xs font-semibold text-rose-100">
            {subLabel}
          </span>
        </div>
      </div>
      <span className="bg-white text-red-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-xs shrink-0">
        SOS कॉल
      </span>
    </button>
  );
};

/**
 * REUSABLE CHHATH SERVICE CARD COMPONENT (Step 20 Requirement 9)
 */
export interface ServiceCardProps {
  id: string;
  icon: string | React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'neutral' | 'emergency';
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  badge,
  onClick,
  variant = 'neutral',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-[#0B5E8E] to-[#073B5A] text-white border-[#0B5E8E] shadow-sm';
      case 'secondary':
        return 'bg-gradient-to-br from-amber-50 to-orange-50 text-stone-900 border-amber-200 hover:border-amber-400 shadow-2xs';
      case 'emergency':
        return 'bg-gradient-to-br from-rose-50 to-red-50 text-stone-900 border-rose-300 hover:border-rose-500 shadow-2xs';
      default:
        return 'bg-white text-stone-900 border-stone-200 hover:border-amber-300 shadow-2xs';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all active:scale-97 flex flex-col justify-between min-h-[96px] font-['Mukta',sans-serif] ${getVariantStyles()} ${className}`}
    >
      <div className="flex items-start justify-between w-full">
        <span className="text-2xl sm:text-3xl leading-none">{icon}</span>
        {badge && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-400/40">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2">
        <h4 className="text-sm font-black leading-tight tracking-tight">
          {title}
        </h4>
        {description && (
          <p className="text-[11px] opacity-80 mt-0.5 leading-snug line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </button>
  );
};
