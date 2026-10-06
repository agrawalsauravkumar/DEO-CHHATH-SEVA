/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Props {
  className?: string;
  height?: number;
}

/**
 * Lightweight Chhath Puja Silhouette Backdrop
 * River ghat, ripples, rising sun aura and marigold garland trim
 */
export const ChhathSunriseBackdrop: React.FC<Props> = ({
  className = '',
  height = 140,
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 160"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skySunriseGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B2038" />
            <stop offset="35%" stopColor="#1E3A8A" />
            <stop offset="70%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <radialGradient id="sunAuraGlow" cx="50%" cy="100%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#EA580C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0B2038" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="riverWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369A1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0B2038" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Sky Base */}
        <rect width="600" height="160" fill="url(#skySunriseGlow)" />

        {/* Radiating Sun Rays in Horizon */}
        <g stroke="#FDE047" strokeWidth="1.2" opacity="0.3">
          <line x1="300" y1="120" x2="300" y2="0" />
          <line x1="300" y1="120" x2="200" y2="10" />
          <line x1="300" y1="120" x2="400" y2="10" />
          <line x1="300" y1="120" x2="100" y2="35" />
          <line x1="300" y1="120" x2="500" y2="35" />
          <line x1="300" y1="120" x2="0" y2="70" />
          <line x1="300" y1="120" x2="600" y2="70" />
        </g>

        {/* Sun Aura */}
        <circle cx="300" cy="120" r="75" fill="url(#sunAuraGlow)" />

        {/* Deo Sun Temple Distant Spire Silhouette */}
        <path
          d="M 285,120 C 290,95 295,85 298,65 L 302,65 C 305,85 310,95 315,120 Z"
          fill="#431407"
          opacity="0.8"
        />
        <polygon points="300,58 308,62 300,66" fill="#F97316" opacity="0.9" />

        {/* River Ghat & Holy Water Waves */}
        <path
          d="M 0,118 Q 150,110 300,122 Q 450,134 600,118 L 600,160 L 0,160 Z"
          fill="url(#riverWaveGrad)"
        />
        <path
          d="M 0,132 Q 140,126 290,136 Q 440,146 600,132"
          stroke="#7DD3FC"
          strokeWidth="1.5"
          opacity="0.5"
          fill="none"
        />

        {/* Subtle Ghat Steps Foreground Silhouette */}
        <path
          d="M 0,142 L 80,142 L 80,148 L 160,148 L 160,154 L 240,154 L 600,154 L 600,160 L 0,160 Z"
          fill="#06182B"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
