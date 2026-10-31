/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DEO CHHATH SEVA — DESIGN TOKENS & CHHATH PUJA THEME
 * NEXTGEN DEVBHOOMI FOUNDATION
 * "रास्ता भी • सहायता भी • सेवा भी"
 *
 * Theme 3: संध्या-अर्घ्य दिव्य डार्क मोड (Divine Evening Sandhya Arghya Glow)
 * Primary Visual Inspiration:
 * - Sacred Sandhya Arghya at Surya Kund & Rudra Kund (अस्ताचलगामी सूर्य को अर्घ्य)
 * - Deep Celestial Evening Twilight Sky (गहरा शाम का आकाश: #0B132B / #070B19)
 * - Flickering Diya Gold & Deepam Flame (प्रज्वलित दीप ज्योति: #FFD54F / #FBBF24 / #F59E0B)
 * - Luminous Water Reflection (सूर्यकुंड पावन जल परावर्तन: #38BDF8 / #0284C7)
 * - Sacred Marigold & Saffron (गेंदा पुष्प व सिंदूरी केसरिया)
 * - Starlight White Text (शीतल श्वेत तारा नक्षत्र)
 * - Emergency Red reserved strictly for SOS assistance (#EF4444)
 */

export const CHHATH_THEME = {
  branding: {
    appName: 'DEO CHHATH SEVA',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    subTitleHi: 'देव छठ सेवा • NEXTGEN DEVBHOOMI FOUNDATION',
    initiativeTitleHi: 'सार्वजनिक सेवा पहल (A Public-Service Initiative)',
  },

  // Theme 3: Sandhya Arghya Divine Dark Mode Color Tokens
  tokens: {
    nightSky: '#0B132B',
    deepObsidian: '#070B19',
    surfaceNight: '#111A35',
    riverBlue: '#38BDF8',
    deepRiverBlue: '#0284C7',
    sunriseSaffron: '#FB923C',
    chhathOrange: '#F97316',
    marigoldGold: '#F59E0B',
    diyaGold: '#FFD54F',
    leafGreen: '#34D399',
    earthBrown: '#A8A29E',
    cream: '#0B132B',
    white: '#F8FAFC',
    emergencyRed: '#EF4444',
  },

  colors: {
    // Primary - Sacred River Reflection Blue & Twilight Navy
    primary: {
      DEFAULT: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
      contrast: '#070B19',
    },

    // Secondary - Sunset Saffron & Diya Flame
    secondary: {
      DEFAULT: '#FB923C',
      light: '#FDBA74',
      dark: '#EA580C',
      contrast: '#070B19',
    },

    // Accent - Radiant Diya Gold
    accent: {
      DEFAULT: '#FFD54F',
      light: '#FFE082',
      dark: '#F59E0B',
      gold: '#FBBF24',
      amber50: '#1A233D',
      amber100: '#232D4C',
      amber200: '#313E67',
      amber500: '#F59E0B',
      amber600: '#D97706',
      amber700: '#B45309',
      amber800: '#92400E',
      amber900: '#78350F',
      amber950: '#451A03',
    },

    // Surfaces & Backgrounds (Sandhya Arghya Night Sky)
    background: '#0B132B', // Deep Sacred Night Sky
    surface: '#111A35',    // Deep Obsidian Ghat Card Surface
    surfaceSubtle: '#162244',

    // Text hierarchy (Crisp Starlight on Deep Indigo)
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#070B19',
    },

    // Borders (Golden Lamp Accents)
    border: {
      DEFAULT: 'rgba(255, 213, 79, 0.28)',
      subtle: 'rgba(255, 213, 79, 0.15)',
      accent: '#FFD54F',
      strong: 'rgba(255, 213, 79, 0.55)',
    },

    // Functional State Colors
    success: {
      DEFAULT: '#34D399',
      light: '#064E3B',
      dark: '#047857',
      contrast: '#F8FAFC',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#451A03',
      dark: '#B45309',
    },
    // RED is reserved exclusively for Emergency / SOS / Critical warnings
    emergency: {
      DEFAULT: '#EF4444',
      light: '#450A0A',
      dark: '#B91C1C',
      contrast: '#FFFFFF',
    },
    offline: {
      DEFAULT: '#F59E0B',
      badge: '#451A03',
      text: '#FDE68A',
    },
    online: {
      DEFAULT: '#34D399',
      badge: '#064E3B',
      text: '#A7F3D0',
    },
    verified: {
      badge: '#064E3B',
      border: '#059669',
      text: '#6EE7B7',
      icon: '#34D399',
    },
  },
} as const;

export type ChhathThemeType = typeof CHHATH_THEME;
