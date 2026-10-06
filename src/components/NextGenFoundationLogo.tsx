import React from 'react';

interface Props {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const NextGenFoundationLogo: React.FC<Props> = ({
  size = 56,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
      aria-label="NextGen Devbhoomi Foundation Logo"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="sunGlow" cx="50%" cy="38%" r="45%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="35%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>

        <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="25%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="navyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2038" />
          <stop offset="50%" stopColor="#123052" />
          <stop offset="100%" stopColor="#08182B" />
        </linearGradient>

        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="35%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <linearGradient id="templeSandstone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="40%" stopColor="#C2410C" />
          <stop offset="80%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>

        <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* Text Paths */}
        <path
          id="upperTextArc"
          d="M 52,200 A 148,148 0 1,1 348,200"
          fill="none"
        />
        <path
          id="lowerTextArc"
          d="M 348,200 A 148,148 0 0,1 52,200"
          fill="none"
        />
      </defs>

      {/* 1. Outer Golden Trim */}
      <circle cx="200" cy="200" r="195" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <circle cx="200" cy="200" r="192" fill="#FEF3C7" />
      <circle cx="200" cy="200" r="188" fill="url(#navyRingGrad)" stroke="#D97706" strokeWidth="3" />

      {/* Decorative inner golden border of navy ring */}
      <circle cx="200" cy="200" r="150" fill="#FFFBEB" stroke="#D97706" strokeWidth="3.5" />
      <circle cx="200" cy="200" r="147" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 2" />

      {/* 2. NGO Name Text Along Circular Arc */}
      <text fill="#FFFFFF" fontSize="21" fontWeight="900" letterSpacing="2.8" fontFamily="'Mukta', sans-serif">
        <textPath href="#upperTextArc" startOffset="50%" textAnchor="middle">
          NEXTGEN DEVBHOOMI FOUNDATION
        </textPath>
      </text>

      {/* Lower Tagline Text */}
      <text fill="#FDE68A" fontSize="15" fontWeight="800" letterSpacing="3.5" fontFamily="'Mukta', sans-serif">
        <textPath href="#lowerTextArc" startOffset="50%" textAnchor="middle">
          BUILDING A RESILIENT FUTURE
        </textPath>
      </text>

      {/* Flanking Golden Temple Icons on Bottom Ring */}
      <g transform="translate(68, 252) scale(0.65)" fill="#FBBF24">
        <polygon points="12,2 2,18 22,18" />
        <rect x="5" y="18" width="14" height="10" />
      </g>
      <g transform="translate(318, 252) scale(0.65)" fill="#FBBF24">
        <polygon points="12,2 2,18 22,18" />
        <rect x="5" y="18" width="14" height="10" />
      </g>

      {/* 3. Inner Artwork Clip Container */}
      <g clipPath="url(#innerCircleClip)">
        <clipPath id="innerCircleClip">
          <circle cx="200" cy="200" r="145" />
        </clipPath>

        {/* Sky Background */}
        <rect x="55" y="55" width="290" height="290" fill="#FEF3C7" />

        {/* Radiating Golden Sun Rays */}
        <g stroke="#F59E0B" strokeWidth="3" opacity="0.85">
          <line x1="200" y1="140" x2="200" y2="60" />
          <line x1="200" y1="140" x2="255" y2="70" />
          <line x1="200" y1="140" x2="145" y2="70" />
          <line x1="200" y1="140" x2="295" y2="105" />
          <line x1="200" y1="140" x2="105" y2="105" />
          <line x1="200" y1="140" x2="310" y2="155" />
          <line x1="200" y1="140" x2="90" y2="155" />
        </g>

        {/* Sun Disk */}
        <circle cx="200" cy="140" r="44" fill="url(#sunGlow)" />
        <circle cx="200" cy="140" r="32" fill="#FEF08A" opacity="0.7" />

        {/* Majestic Himalayan Mountain Peaks */}
        <polygon points="120,200 175,125 220,185" fill="url(#mountainGrad)" stroke="#94A3B8" strokeWidth="1" />
        <polygon points="175,125 185,145 175,150 165,140" fill="#FFFFFF" />
        
        <polygon points="170,205 215,130 260,200" fill="url(#mountainGrad)" stroke="#64748B" strokeWidth="1" />
        <polygon points="215,130 225,148 215,155 205,145" fill="#FFFFFF" />

        {/* Rolling Green Hills & Valley */}
        <path d="M 55,230 Q 120,175 210,215 Q 280,240 345,195 L 345,345 L 55,345 Z" fill="url(#hillsGrad)" />
        <path d="M 55,255 Q 140,210 240,240 Q 300,250 345,230 L 345,345 L 55,345 Z" fill="#166534" opacity="0.65" />

        {/* Sacred Blue River / Kund Stream */}
        <path
          d="M 205,190 C 190,215 160,230 170,255 C 180,285 130,310 110,345 L 155,345 C 185,315 215,285 200,255 C 185,230 220,205 205,190 Z"
          fill="url(#riverGrad)"
        />
        <path
          d="M 185,225 Q 170,245 178,270"
          stroke="#E0F2FE"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />

        {/* DEO SURYA MANDIR (Prominently rendered in authentic red sandstone architecture) */}
        <g id="deoSuryaMandirIcon" transform="translate(232, 110)">
          {/* Main Sanctum Platform */}
          <rect x="0" y="70" width="70" height="28" rx="2" fill="#7C2D12" stroke="#431407" strokeWidth="1.5" />
          <rect x="4" y="73" width="62" height="6" fill="#EA580C" />
          <rect x="4" y="82" width="62" height="4" fill="#C2410C" />
          <rect x="4" y="89" width="62" height="6" fill="#EA580C" />

          {/* Arched Temple Sanctum Entrance */}
          <rect x="25" y="75" width="20" height="23" rx="4" fill="#3B1207" />
          <path d="M 27,82 Q 35,76 43,82 L 43,98 L 27,98 Z" fill="#1C0A04" />
          <rect x="34" y="87" width="2" height="11" fill="#D97706" />

          {/* Towering Curved Shikhara of Deo Sun Temple */}
          <path
            d="M 12,70 C 12,45 20,22 35,6 C 50,22 58,45 58,70 Z"
            fill="url(#templeSandstone)"
            stroke="#5A1A08"
            strokeWidth="1.5"
          />

          {/* Architectural Horizontal Ridges (Bhumi Amalas) */}
          <path d="M 16,55 Q 35,51 54,55" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
          <path d="M 20,42 Q 35,39 50,42" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
          <path d="M 25,28 Q 35,26 45,28" stroke="#FDBA74" strokeWidth="1.5" fill="none" />
          <path d="M 29,16 Q 35,14 41,16" stroke="#FDBA74" strokeWidth="1.5" fill="none" />

          {/* Vertical Shikhara Grooves */}
          <path d="M 35,6 L 35,70" stroke="#7C2D12" strokeWidth="1.5" opacity="0.6" />
          <path d="M 27,18 C 24,35 22,50 20,70" stroke="#7C2D12" strokeWidth="1" opacity="0.5" />
          <path d="M 43,18 C 46,35 48,50 50,70" stroke="#7C2D12" strokeWidth="1" opacity="0.5" />

          {/* Golden Amlaka & Kalash on Top */}
          <ellipse cx="35" cy="6" rx="6" ry="3" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <circle cx="35" cy="1" r="3" fill="#F59E0B" />
          
          {/* Saffron Sacred Flag (Dhwaja) */}
          <path d="M 35,-4 L 35,2" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="35,-4 49,-1 35,3" fill="#EA580C" stroke="#C2410C" strokeWidth="0.8" />

          {/* Temple Label Plaque */}
          <rect x="2" y="61" width="66" height="11" rx="2" fill="#FFFBEB" stroke="#9A3412" strokeWidth="1" />
          <text
            x="35"
            y="69.5"
            fill="#7C2D12"
            fontSize="7"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="'Mukta', sans-serif"
          >
            देव सूर्य मंदिर
          </text>
        </g>

        {/* Sacred Banyan Tree with Sprawling Branches and Roots (Bottom Center) */}
        <g id="sacredBanyanTree" transform="translate(145, 235)">
          {/* Lush Canopy Foliage */}
          <path
            d="M 55,20 C 35,5 20,20 15,35 C 5,45 10,65 25,70 C 35,75 75,75 85,70 C 100,65 105,45 95,35 C 90,20 75,5 55,20 Z"
            fill="url(#treeGrad)"
            stroke="#14532D"
            strokeWidth="1.5"
          />
          {/* Inner Foliage Texture */}
          <ellipse cx="55" cy="40" rx="30" ry="18" fill="#4ADE80" opacity="0.4" />
          <ellipse cx="35" cy="48" rx="14" ry="10" fill="#22C55E" opacity="0.6" />
          <ellipse cx="75" cy="48" rx="14" ry="10" fill="#22C55E" opacity="0.6" />

          {/* Trunk & Massive Aerial Roots */}
          <path
            d="M 50,60 L 48,82 C 45,95 28,105 18,110 L 22,112 C 34,106 48,96 52,82 L 54,60 Z"
            fill="#166534"
          />
          <path
            d="M 60,60 L 62,82 C 65,95 82,105 92,110 L 88,112 C 76,106 62,96 58,82 L 56,60 Z"
            fill="#166534"
          />
          <path d="M 55,58 L 55,90 C 55,100 50,110 42,115" stroke="#14532D" strokeWidth="2.5" fill="none" />
          <path d="M 55,85 C 57,98 62,110 68,115" stroke="#14532D" strokeWidth="2.5" fill="none" />
          
          {/* Intricate Deep Roots spreading into Earth */}
          <path d="M 28,102 C 20,108 8,112 0,115" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 82,102 C 90,108 102,112 110,115" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 45,96 C 35,106 25,116 12,120" stroke="#14532D" strokeWidth="1.8" fill="none" />
          <path d="M 65,96 C 75,106 85,116 98,120" stroke="#14532D" strokeWidth="1.8" fill="none" />
          <path d="M 55,98 L 55,120" stroke="#14532D" strokeWidth="2" fill="none" />
        </g>
      </g>

      {/* Inner Decorative Golden Ring Bezel */}
      <circle cx="200" cy="200" r="145" fill="none" stroke="url(#goldRingGrad)" strokeWidth="4" />
    </svg>
  );
};
