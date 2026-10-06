/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CHHATH_THEME } from '../theme/chhathTheme';

interface Props {
  size?: number;
  className?: string;
  showText?: boolean;
}

/**
 * DEO CHHATH SEVA OFFICIAL LOGO
 * NEXTGEN DEV BHOOMI FOUNDATION
 * "रास्ता भी • सहायता भी • सेवा भी"
 *
 * Represents:
 * - Sunrise & Golden Rays (भगवान भास्कर)
 * - Surya Kund Holy Waters & Ghats (पवित्र घाट व अर्घ्य)
 * - Deo Sun Temple ancient Shikhara (देव सूर्य मंदिर)
 * - Traditional Chhath Soop, Diya & Twin Sugarcane (सूप, दीप व ईख)
 * - Navigation, Public Service & Seva
 */
export const DeoChhathSevaLogo: React.FC<Props> = ({
  size = 48,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
      aria-label="DEO CHHATH SEVA - NEXTGEN DEV BHOOMI FOUNDATION"
    >
      <defs>
        {/* Deep River Blue to Royal Navy Gradient */}
        <linearGradient id="logoBgRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2038" />
          <stop offset="50%" stopColor="#0F2642" />
          <stop offset="100%" stopColor="#061324" />
        </linearGradient>

        {/* Sun & Sunrise Rays Gradient */}
        <radialGradient id="logoSunSunrise" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FDE047" />
          <stop offset="65%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>

        {/* Holy River Ganga / Surya Kund Water Wave Gradient */}
        <linearGradient id="logoRiverWater" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Golden Ring Border Gradient */}
        <linearGradient id="logoGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="25%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Upper Text Path for Curved Typography */}
        <path id="logoUpperArc" d="M 64,256 A 192,192 0 1,1 448,256" />
        {/* Lower Text Path */}
        <path id="logoLowerArc" d="M 448,256 A 192,192 0 0,1 64,256" />
      </defs>

      {/* 1. Outer Golden Trim */}
      <circle cx="256" cy="256" r="250" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <circle cx="256" cy="256" r="246" fill="#FEF3C7" />
      <circle cx="256" cy="256" r="242" fill="url(#logoBgRingGrad)" stroke="#D97706" strokeWidth="3.5" />

      {/* Inner Gold Bezel Ring */}
      <circle cx="256" cy="256" r="190" fill="#FFFBEB" stroke="#D97706" strokeWidth="4" />
      <circle cx="256" cy="256" r="186" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* 2. Typography Along Circular Ring */}
      {/* Top: NEXTGEN DEV BHOOMI FOUNDATION */}
      <text fill="#FFFFFF" fontSize="23" fontWeight="900" letterSpacing="3.0" fontFamily="'Mukta', sans-serif">
        <textPath href="#logoUpperArc" startOffset="50%" textAnchor="middle">
          NEXTGEN DEV BHOOMI FOUNDATION
        </textPath>
      </text>

      {/* Bottom: DEO CHHATH SEVA • देव छठ सेवा */}
      <text fill="#FDE68A" fontSize="19" fontWeight="800" letterSpacing="3.8" fontFamily="'Mukta', sans-serif">
        <textPath href="#logoLowerArc" startOffset="50%" textAnchor="middle">
          DEO CHHATH SEVA • देव छठ सेवा
        </textPath>
      </text>

      {/* 3. Inner Artwork Clip Container */}
      <g clipPath="url(#logoInnerCircle)">
        <clipPath id="logoInnerCircle">
          <circle cx="256" cy="256" r="184" />
        </clipPath>

        {/* Sky Background with Warm Morning Aura */}
        <rect x="70" y="70" width="372" height="372" fill="#FEF3C7" />

        {/* Sunrise Sun Rays */}
        <g stroke="#F59E0B" strokeWidth="3.5" opacity="0.85">
          <line x1="256" y1="210" x2="256" y2="85" />
          <line x1="256" y1="210" x2="330" y2="98" />
          <line x1="256" y1="210" x2="182" y2="98" />
          <line x1="256" y1="210" x2="385" y2="140" />
          <line x1="256" y1="210" x2="127" y2="140" />
          <line x1="256" y1="210" x2="410" y2="200" />
          <line x1="256" y1="210" x2="102" y2="200" />
          <line x1="256" y1="210" x2="295" y2="90" strokeWidth="2" />
          <line x1="256" y1="210" x2="217" y2="90" strokeWidth="2" />
        </g>

        {/* Rising Sun Sphere */}
        <circle cx="256" cy="210" r="68" fill="url(#logoSunSunrise)" stroke="#C2410C" strokeWidth="2.5" />

        {/* Deo Sun Temple Spire */}
        <g transform="translate(148, 175)">
          <path
            d="M 38,0 C 33,25 22,50 14,80 L 62,80 C 54,50 43,25 38,0 Z"
            fill="#9A3412"
            stroke="#7C2D12"
            strokeWidth="1.5"
          />
          <ellipse cx="38" cy="0" rx="7" ry="3.5" fill="#FBBF24" />
          <circle cx="38" cy="-5" r="3" fill="#F59E0B" />
          <line x1="38" y1="-10" x2="38" y2="-4" stroke="#9A3412" strokeWidth="1.8" />
          <polygon points="38,-10 52,-7 38,-4" fill="#EA580C" />
          <path d="M 19,65 Q 38,61 57,65" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
          <path d="M 23,50 Q 38,47 53,50" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
          <path d="M 28,35 Q 38,33 48,35" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
        </g>

        {/* Sacred Holy Waters */}
        <path
          d="M 70,290 C 130,280 190,300 256,290 C 322,280 382,300 442,290 L 442,442 L 70,442 Z"
          fill="url(#logoRiverWater)"
          opacity="0.95"
        />
        <path
          d="M 70,320 C 120,312 180,326 240,316 C 300,306 370,325 442,315"
          stroke="#E0F2FE"
          strokeWidth="3"
          fill="none"
          opacity="0.75"
        />

        {/* Holy Ghat Stairs */}
        <path d="M 70,370 L 170,370 L 170,385 L 270,385 L 270,400 L 442,400 L 442,442 L 70,442 Z" fill="#0C4A6E" />

        {/* Traditional Chhath Soop & Diya Offering */}
        <g transform="translate(206, 320)">
          <path
            d="M 12,35 C 22,22 78,22 88,35 C 92,44 80,56 50,56 C 20,56 8,44 12,35 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="2"
          />
          <circle cx="50" cy="30" r="11" fill="#78350F" stroke="#451A03" strokeWidth="1.2" />
          <ellipse cx="36" cy="34" rx="7" ry="5" fill="#F59E0B" />
          <ellipse cx="64" cy="34" rx="7" ry="5" fill="#EAB308" />

          {/* Diya */}
          <path d="M 44,24 Q 50,28 56,24 Q 54,32 46,32 Z" fill="#D97706" />
          <path
            d="M 50,8 C 55,14 56,18 53,22 C 50,24 47,21 47,18 C 47,15 48,11 50,8 Z"
            fill="#FEF08A"
            stroke="#EA580C"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="18" r="3" fill="#FFFFFF" />
        </g>

        {/* Twin Sugarcane Stalks */}
        <g stroke="#15803D" strokeWidth="3" fill="none">
          <path d="M 130,420 Q 150,300 170,240 Q 155,230 140,245" />
          <path d="M 382,420 Q 362,300 342,240 Q 357,230 372,245" />
        </g>
        <path d="M 170,240 Q 185,215 175,195 Q 165,220 170,240" fill="#22C55E" />
        <path d="M 342,240 Q 327,215 337,195 Q 347,220 342,240" fill="#22C55E" />
      </g>

      {/* 4. Inner Golden Ring Bezel */}
      <circle cx="256" cy="256" r="184" fill="none" stroke="url(#logoGoldBorder)" strokeWidth="4.5" />
    </svg>
  );
};

// Backwards compatibility alias
export const NextGenFoundationLogo = DeoChhathSevaLogo;
