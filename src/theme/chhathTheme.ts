/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DEO CHHATH SEVA — OFFICIAL DESIGN SYSTEM & CHHATH PUJA PALETTE
 * NEXTGEN DEVBHOOMI FOUNDATION
 * "रास्ता भी • सहायता भी • सेवा भी"
 *
 * OFFICIAL COLOR PALETTE:
 * - Royal Blue:      #073B78 (मुख्य नेविगेशन, टॉप बार व हेडर बार)
 * - River Blue:      #0B5E8E (पवित्र सूर्य कुंड, पुनपुन नदी का गहरा पावन जल, मैप्स)
 * - Sunrise Saffron: #FF8C00 (प्रातःकालीन सूर्योदय, प्रमुख एक्शन बटन, एक्टिव बॉर्डर्स)
 * - Deep Saffron:    #FF6B00 (सायंकालीन अस्ताचलगामी अर्घ्य सिंदूर, बटन ग्रेडिएंट शेड)
 * - Golden Yellow:   #FFD54F (प्रज्वलित दीप ज्योति, गेंदा पुष्प माला, हाइलाइट्स)
 * - Cream:           #FFF8E1 (सात्विक ठेकुआ, शुद्ध कच्चा दूध, मुख्य पृष्ठ पृष्ठभूमि)
 * - Deep Red:        #C62828 (आपातकालीन SOS, एम्बुलेंस 108, पुलिस 112)
 * - Leaf Green:      #2E7D32 (पवित्र ईख, केला का पत्ता, बांस का सूप/दउरा, ऑनलाइन बैज)
 * - White:           #FFFFFF (स्वच्छ कार्ड सरफेस, पठन पठनीयता)
 *
 * TYPOGRAPHY:
 * - Hindi Font: Noto Sans Devanagari
 * - English Font: Inter
 */

export const CHHATH_THEME = {
  branding: {
    appName: 'DEO CHHATH SEVA',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    subTitleHi: 'देव छठ सेवा • NEXTGEN DEVBHOOMI FOUNDATION',
    initiativeTitleHi: 'सार्वजनिक सेवा पहल (A Public-Service Initiative)',
    locationHi: 'देव • औरंगाबाद • बिहार',
  },

  tokens: {
    royalBlue: '#073B78',
    riverBlue: '#0B5E8E',
    sunriseSaffron: '#FF8C00',
    deepSaffron: '#FF6B00',
    goldenYellow: '#FFD54F',
    cream: '#FFF8E1',
    deepRed: '#C62828',
    leafGreen: '#2E7D32',
    white: '#FFFFFF',

    // Supporting neutral surfaces
    softIvory: '#FFFDF7',
    charcoal: '#1C1917',
    slateMuted: '#44403C',
    stoneSubtle: '#78716C',
    borderGold: 'rgba(255, 213, 79, 0.7)',
    borderBlue: 'rgba(11, 94, 142, 0.25)',
  },

  typography: {
    hindiFont: "'Noto Sans Devanagari', sans-serif",
    englishFont: "'Inter', sans-serif",
    fontFamily: "'Noto Sans Devanagari', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  colors: {
    // Navigation & Primary Structure - Royal Blue & River Blue
    primary: {
      DEFAULT: '#073B78',
      river: '#0B5E8E',
      light: '#1260A3',
      dark: '#04244D',
      contrast: '#FFFFFF',
    },

    // Interactive Actions - Sunrise Saffron & Deep Saffron
    secondary: {
      DEFAULT: '#FF8C00',
      deep: '#FF6B00',
      light: '#FFA633',
      dark: '#D95700',
      contrast: '#FFFFFF',
    },

    // Highlights & Badges - Golden Yellow
    accent: {
      DEFAULT: '#FFD54F',
      light: '#FFE082',
      dark: '#F59E0B',
      contrast: '#073B78',
    },

    // Nature & Verification - Leaf Green
    green: {
      DEFAULT: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrast: '#FFFFFF',
    },

    // Background - Cream & White
    background: {
      DEFAULT: '#FFF8E1',
      soft: '#FFFDF7',
      card: '#FFFFFF',
    },

    // Emergency - Deep Red strictly for SOS
    emergency: {
      DEFAULT: '#C62828',
      light: '#E53935',
      dark: '#8E0000',
      contrast: '#FFFFFF',
    },

    // Status Colors
    success: {
      DEFAULT: '#2E7D32',
      badge: '#E8F5E9',
      border: '#81C784',
      text: '#1B5E20',
    },
    warning: {
      DEFAULT: '#F59E0B',
      badge: '#FFFBEB',
      border: '#FCD34D',
      text: '#92400E',
    },
    offline: {
      DEFAULT: '#78716C',
      badge: '#F5F5F4',
      border: '#D6D3D1',
      text: '#44403C',
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
      text: '#073B78',
      icon: '#0B5E8E',
    },
  },
} as const;

export type ChhathThemeType = typeof CHHATH_THEME;
