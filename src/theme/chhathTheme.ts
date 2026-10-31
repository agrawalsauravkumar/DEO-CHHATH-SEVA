/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DEO CHHATH SEVA — OFFICIAL DESIGN TOKENS & CHHATH PUJA PALETTE
 * NEXTGEN DEVBHOOMI FOUNDATION
 * "रास्ता भी • सहायता भी • सेवा भी"
 *
 * Official Palette:
 * - River Blue: #0B5E8E (पवित्र सूर्य कुंड व पुनपुन नदी का शांत गहरा जल)
 * - Sunrise Saffron: #FF8C42 (प्रातःकालीन अस्ताचलगामी व उदयगामी भगवान सूर्य का सिंदूरी केसरिया)
 * - Marigold Gold: #FFD54F (छठ घाट दीप ज्योति व गेंदा पुष्प)
 * - Leaf Green: #2E7D32 (प्राकृतिक ईख, केला व बांस का दाउरा / सूप)
 * - Earth Brown: #8D6E63 (मिट्टी का चूल्हा, घाट की पाषाण वेदी)
 * - Cream: #FFF8E1 (सात्विक ठेकुआ, शुद्ध कच्चा दूध व पवित्र अर्घ्य प्रसाद)
 * - Emergency Red: #E53935 (आपातकालीन SOS व जीवन रक्षक सहायता)
 *
 * Typography:
 * - Noto Sans Devanagari (हिन्दी)
 * - Inter (English)
 */

export const CHHATH_THEME = {
  branding: {
    appName: 'DEO CHHATH SEVA',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    subTitleHi: 'देव छठ सेवा • NEXTGEN DEVBHOOMI FOUNDATION',
    initiativeTitleHi: 'सार्वजनिक सेवा पहल (A Public-Service Initiative)',
  },

  // 7 Official Design Tokens
  tokens: {
    riverBlue: '#0B5E8E',
    sunriseSaffron: '#FF8C42',
    marigoldGold: '#FFD54F',
    leafGreen: '#2E7D32',
    earthBrown: '#8D6E63',
    cream: '#FFF8E1',
    emergencyRed: '#E53935',

    // Extended Functional Variants
    deepNavy: '#041E2F',
    nightSky: '#0B132B',
    softIvory: '#FFFDF7',
    charcoal: '#1C1917',
    slateMuted: '#57534E',
    borderGold: 'rgba(255, 213, 79, 0.45)',
    borderBlue: 'rgba(11, 94, 142, 0.35)',
  },

  typography: {
    hindiFont: "'Noto Sans Devanagari', sans-serif",
    englishFont: "'Inter', sans-serif",
    fontFamily: "'Noto Sans Devanagari', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  colors: {
    // Primary - River Blue
    primary: {
      DEFAULT: '#0B5E8E',
      light: '#1582C0',
      dark: '#073B5A',
      contrast: '#FFFFFF',
    },

    // Secondary - Sunrise Saffron
    secondary: {
      DEFAULT: '#FF8C42',
      light: '#FFA66B',
      dark: '#E65100',
      contrast: '#FFFFFF',
    },

    // Accent - Marigold Gold
    accent: {
      DEFAULT: '#FFD54F',
      light: '#FFE082',
      dark: '#F59E0B',
      contrast: '#041E2F',
    },

    // Nature / Prasad - Leaf Green
    green: {
      DEFAULT: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrast: '#FFFFFF',
    },

    // Earth - Ghat Earth Brown
    earth: {
      DEFAULT: '#8D6E63',
      light: '#A1887F',
      dark: '#5D4037',
      contrast: '#FFFFFF',
    },

    // Background - Sacred Cream
    cream: {
      DEFAULT: '#FFF8E1',
      soft: '#FFFDF7',
      card: '#FFFFFF',
    },

    // Emergency - Strictly SOS
    emergency: {
      DEFAULT: '#E53935',
      light: '#FF5252',
      dark: '#C62828',
      contrast: '#FFFFFF',
    },

    // Functional State Colors
    success: {
      DEFAULT: '#2E7D32',
      light: '#E8F5E9',
      border: '#81C784',
      text: '#1B5E20',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FFFBEB',
      border: '#FCD34D',
      text: '#92400E',
    },
    offline: {
      DEFAULT: '#8D6E63',
      badge: '#EFEBE9',
      border: '#BCAAA4',
      text: '#4E342E',
    },
    online: {
      DEFAULT: '#2E7D32',
      badge: '#E8F5E9',
      border: '#A5D6A7',
      text: '#1B5E20',
    },
    verified: {
      badge: '#E0F2FE',
      border: '#0B5E8E',
      text: '#073B5A',
      icon: '#0B5E8E',
    },
  },
} as const;

export type ChhathThemeType = typeof CHHATH_THEME;
