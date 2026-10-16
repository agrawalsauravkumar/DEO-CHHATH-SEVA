/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DEO CHHATH SEVA — DESIGN TOKENS & CHHATH PUJA THEME
 * NEXTGEN DEVBHOOMI FOUNDATION
 * "रास्ता भी • सहायता भी • सेवा भी"
 *
 * Primary Visual Inspiration:
 * - Chhath Puja Sunrise (सूर्योदय)
 * - Surya Kund & River Ghats (पवित्र घाट व अर्घ्य)
 * - Deep River Blue / Navy Blue (पवित्र जल)
 * - Sunrise Orange / Saffron (केसरिया व सिंदूर)
 * - Marigold & Golden (गेंदा पुष्प व धूप)
 * - Natural Green (केला, गन्ना व प्रकृति)
 * - Cream / Ivory (स्वच्छता व सात्विकता)
 * - Red reserved strictly for Emergency & Critical SOS
 */

export const CHHATH_THEME = {
  branding: {
    appName: 'DEO CHHATH SEVA',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    subTitleHi: 'देव छठ सेवा • NEXTGEN DEVBHOOMI FOUNDATION',
    initiativeTitleHi: 'सार्वजनिक सेवा पहल (A Public-Service Initiative)',
  },

  // Part 10 Official Color Tokens
  tokens: {
    riverBlue: '#075985',
    deepRiverBlue: '#063B5C',
    sunriseSaffron: '#F47B20',
    chhathOrange: '#F57C00',
    marigoldGold: '#FFB52E',
    leafGreen: '#2E7D32',
    earthBrown: '#8D6E63',
    cream: '#FFF7E5',
    white: '#FFFFFF',
    emergencyRed: '#A61B29',
  },

  colors: {
    // Primary - Deep River Blue & Navy
    primary: {
      DEFAULT: '#075985',
      light: '#063B5C',
      dark: '#041E2F',
      contrast: '#FFFFFF',
    },

    // Secondary - Sunrise Orange / Saffron
    secondary: {
      DEFAULT: '#F57C00',
      light: '#F47B20',
      dark: '#C2410C',
      contrast: '#FFFFFF',
    },

    // Accent - Golden / Marigold
    accent: {
      DEFAULT: '#FFB52E',
      light: '#FBBF24',
      dark: '#D97706',
      gold: '#EAB308',
      amber50: '#FFF7E5',
      amber100: '#FEF3C7',
      amber200: '#FDE68A',
      amber500: '#F59E0B',
      amber600: '#D97706',
      amber700: '#B45309',
      amber800: '#92400E',
      amber900: '#78350F',
      amber950: '#451A03',
    },

    // Surfaces & Backgrounds (Ivory / Warm Stone)
    background: '#FFF7E5', // Warm Ivory / Cream Chhath Paper Tone
    surface: '#FFFFFF',
    surfaceSubtle: '#FAF8F5',

    // Text hierarchy
    text: {
      primary: '#1C1917',
      secondary: '#44403C',
      muted: '#78716C',
      inverse: '#FFFFFF',
    },

    // Borders
    border: {
      DEFAULT: '#E7E5E4',
      subtle: '#F5F2EB',
      accent: '#FDE68A',
      strong: '#D6D3D1',
    },

    // Functional State Colors
    success: {
      DEFAULT: '#2E7D32',
      light: '#DCFCE7',
      dark: '#14532D',
      contrast: '#FFFFFF',
    },
    warning: {
      DEFAULT: '#D97706',
      light: '#FEF3C7',
      dark: '#78350F',
    },
    // RED is reserved exclusively for Emergency / SOS / Critical warnings
    emergency: {
      DEFAULT: '#A61B29',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrast: '#FFFFFF',
    },
    offline: {
      DEFAULT: '#D97706',
      badge: '#FEF3C7',
      text: '#92400E',
    },
    online: {
      DEFAULT: '#16A34A',
      badge: '#DCFCE7',
      text: '#14532D',
    },
    verified: {
      badge: '#DCFCE7',
      border: '#86EFAC',
      text: '#15803D',
      icon: '#16A34A',
    },
  },
} as const;

export type ChhathThemeType = typeof CHHATH_THEME;
