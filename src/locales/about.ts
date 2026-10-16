import type { LanguageCode } from '../types';

export interface AboutTranslations {
  title: string;
  organization: string;
  tagline: string;
  location: string;
  appName: string;
  serviceInitiative: string;
  serviceTagline: string;
  appPurposeTitle: string;
  appPurpose: string;
  appPurposeAttribution: string;
  servicesTitle: string;
  services: readonly string[];
  serviceDataNotice: string;
  pillarsTitle: string;
  pillars: readonly { title: string; description: string }[];
  descriptionTitle: string;
  description: string;
  missionTitle: string;
  mission: string;
  visionTitle: string;
  vision: string;
  focusTitle: string;
  focusAreas: readonly string[];
  team: string;
  volunteer: string;
  website: string;
  emailLabel: string;
  linkedinLabel: string;
  verificationNote: string;
  sourceTitle: string;
  sourceDescription: string;
  sourceWorkAreas: string;
  sourceMission: string;
  sourceVision: string;
  logoAlt: string;
  heroImageAlt: string;
  joinSection: string;
  openLink: string;
  home: string;
  footerServiceDescription: string;
}

const aboutTranslations: Record<'hi' | 'en', AboutTranslations> = {
  hi: {
    title: 'हमारे बारे में',
    organization: 'NextGen DevBhoomi Foundation',
    tagline: 'एक नई सोच, सशक्त समुदाय और सभी के लिए बेहतर भविष्य।',
    location: 'देव, औरंगाबाद, बिहार',
    appName: 'DEO CHHATH SEVA',
    serviceInitiative: 'एक सार्वजनिक सेवा पहल',
    serviceTagline: 'रास्ता भी • सहायता भी • सेवा भी',
    appPurposeTitle: 'हमारा सेवा संकल्प',
    appPurpose:
      'देव आने वाले श्रद्धालुओं को सरल नेविगेशन, आवश्यक सुविधाओं की जानकारी और सहायता विकल्प उपलब्ध कराने के उद्देश्य से यह सेवा पहल विकसित की गई है।',
    appPurposeAttribution: '— NEXTGEN DEVBHOOMI FOUNDATION',
    servicesTitle: 'ऐप में सेवा स्क्रीन',
    services: [
      'मार्ग एवं नेविगेशन',
      'पार्किंग',
      'शटल सेवा',
      'चिकित्सा सहायता',
      'शौचालय',
      'पेयजल',
      'सहायता केंद्र',
      'परिवार सुरक्षा',
      'खोया-पाया',
      'स्वयंसेवक',
    ],
    serviceDataNotice:
      'सुविधा और संचालन संबंधी जानकारी केवल अधिकृत, सत्यापित स्रोत उपलब्ध होने पर दिखाई जाती है। कुछ सेवाएँ या लाइव डेटा इस बिल्ड में उपलब्ध नहीं हैं।',
    pillarsTitle: 'सेवा के 3 मुख्य स्तंभ',
    pillars: [
      {
        title: 'रास्ता भी (Navigation)',
        description:
          'सत्यापित स्थान दिखाए जा सकते हैं; रास्ते के लिए इंटरनेट, उपलब्ध स्थान डेटा और GPS की आवश्यकता हो सकती है।',
      },
      {
        title: 'सहायता भी (Assistance)',
        description:
          'ऐप सहायता विकल्प और आपातकालीन नंबर दिखाता है; बाहरी सेवाओं की उपलब्धता ऐप द्वारा सुनिश्चित नहीं की जाती।',
      },
      {
        title: 'सेवा भी (Public Service)',
        description:
          'सुविधाओं और स्वयंसेवक सेवाओं की जानकारी केवल अधिकृत डेटा उपलब्ध होने पर दिखाई जाती है।',
      },
    ],
    descriptionTitle: 'संस्था परिचय',
    description:
      'NextGen DevBhoomi Foundation बिहार के देव, औरंगाबाद से जुड़ी एक गैर-लाभकारी संस्था है, जिसका उद्देश्य शिक्षा, स्वास्थ्य, महिला सशक्तिकरण, युवा विकास और सतत सामुदायिक विकास के माध्यम से समाज को सशक्त बनाने में योगदान देना है।',
    missionTitle: 'हमारा मिशन',
    mission:
      'शिक्षा, स्वास्थ्य, पर्यावरणीय स्थिरता और सामाजिक कल्याण से जुड़ी पहलों के माध्यम से व्यक्तियों और समुदायों को सशक्त बनाना।',
    visionTitle: 'हमारी दृष्टि',
    vision:
      'एक समावेशी, सशक्त और टिकाऊ समाज का निर्माण, जहाँ प्रत्येक व्यक्ति को आगे बढ़ने और समाज के विकास में योगदान देने का अवसर मिले।',
    focusTitle: 'हमारे कार्यक्षेत्र',
    focusAreas: [
      'शिक्षा एवं डिजिटल साक्षरता',
      'स्वास्थ्य जागरूकता एवं कल्याण',
      'महिला सशक्तिकरण',
      'युवा विकास एवं कौशल प्रशिक्षण',
      'पर्यावरण संरक्षण',
      'ग्रामीण विकास एवं सामुदायिक कल्याण',
    ],
    team: 'हमारी टीम देखें',
    volunteer: 'स्वयंसेवक सेवा से जुड़ें',
    website: 'आधिकारिक वेबसाइट खोलें',
    emailLabel: 'ईमेल से संपर्क करें',
    linkedinLabel: 'LinkedIn कंपनी प्रोफ़ाइल',
    verificationNote:
      'इस समीक्षा में आधिकारिक वेबसाइट उपलब्ध नहीं हुई। पंजीकरण, उपलब्धियाँ और LinkedIn प्रोफ़ाइल से बाहर के कार्यक्रम स्वतंत्र रूप से सत्यापित नहीं हैं; यह परिचय संस्था की अंतिम पुष्टि के अधीन है।',
    sourceTitle: 'संस्था की प्रकाशित जानकारी',
    sourceDescription:
      'नीचे दिया गया संस्था-सार NextGen DevBhoomi Foundation की LinkedIn कंपनी प्रोफ़ाइल पर प्रकाशित जानकारी पर आधारित है।',
    sourceWorkAreas: 'प्रोफ़ाइल में बताए गए कार्यक्षेत्र:',
    sourceMission: 'प्रोफ़ाइल में प्रकाशित मिशन:',
    sourceVision: 'प्रोफ़ाइल में प्रकाशित दृष्टि:',
    logoAlt: 'DEO CHHATH SEVA और NextGen DevBhoomi Foundation का संयुक्त लोगो',
    heroImageAlt: 'छठ से प्रेरित सूर्योदय, नदी और घाट का स्थानीय चित्रण',
    joinSection: 'संस्था से जुड़ें',
    openLink: 'नई विंडो में खुलेगा',
    home: 'होम स्क्रीन पर वापस जाएं',
    footerServiceDescription: 'देव सूर्य मंदिर व सूर्य कुंड महापर्व सेवा • निःशुल्क जनसेवा',
  },
  en: {
    title: 'About Us',
    organization: 'NextGen DevBhoomi Foundation',
    tagline: 'A new perspective, empowered communities, and a better future for all.',
    location: 'Deo, Aurangabad, Bihar',
    appName: 'DEO CHHATH SEVA',
    serviceInitiative: 'A public-service initiative',
    serviceTagline: 'Navigation • Assistance • Service',
    appPurposeTitle: 'Our Service Commitment',
    appPurpose:
      'This service initiative was developed to help pilgrims visiting Deo with simple navigation, information about essential facilities, and available assistance options.',
    appPurposeAttribution: '— NEXTGEN DEVBHOOMI FOUNDATION',
    servicesTitle: 'Service screens in the app',
    services: [
      'Routes and navigation',
      'Parking',
      'Shuttle service',
      'Medical assistance',
      'Toilets',
      'Drinking water',
      'Help centers',
      'Family safety',
      'Lost and found',
      'Volunteers',
    ],
    serviceDataNotice:
      'Facility and operational information is shown only when an authorized, verified source is available. Some services or live data are not available in this build.',
    pillarsTitle: 'Three service pillars',
    pillars: [
      {
        title: 'Navigation',
        description:
          'Verified places may be shown; directions may require internet access, available place data, and GPS.',
      },
      {
        title: 'Assistance',
        description:
          'The app provides assistance options and emergency numbers; availability of external services is not guaranteed by the app.',
      },
      {
        title: 'Public Service',
        description:
          'Facility and volunteer service information is shown only when authorized data is available.',
      },
    ],
    descriptionTitle: 'About the Foundation',
    description:
      'NextGen DevBhoomi Foundation is a non-profit organization based in Deo, Aurangabad, Bihar, committed to contributing to social development through education, healthcare, women empowerment, youth development, and sustainable community initiatives.',
    missionTitle: 'Our Mission',
    mission:
      'To empower individuals and communities through initiatives focused on education, healthcare, environmental sustainability, and social welfare.',
    visionTitle: 'Our Vision',
    vision:
      'To contribute to a resilient, inclusive, and sustainable society where everyone has the opportunity to thrive and contribute to community development.',
    focusTitle: 'Our Focus Areas',
    focusAreas: [
      'Education and Digital Literacy',
      'Healthcare Awareness and Well-being',
      'Women Empowerment',
      'Youth Development and Skill Building',
      'Environmental Conservation',
      'Rural Development and Community Welfare',
    ],
    team: 'Meet Our Team',
    volunteer: 'Join Volunteer Service',
    website: 'Visit the Official Website',
    emailLabel: 'Contact by email',
    linkedinLabel: 'LinkedIn company profile',
    verificationNote:
      'The official website was unavailable during this review. Registration, achievements, and programs beyond the LinkedIn profile have not been independently verified; this profile remains subject to final organizational verification.',
    sourceTitle: 'Published organization information',
    sourceDescription:
      'The organization summary below is based on information published on the NextGen DevBhoomi Foundation LinkedIn company profile.',
    sourceWorkAreas: 'Focus areas listed on the profile:',
    sourceMission: 'Mission published on the profile:',
    sourceVision: 'Vision published on the profile:',
    logoAlt: 'Combined DEO CHHATH SEVA and NextGen DevBhoomi Foundation logo',
    heroImageAlt: 'Local Chhath-inspired illustration of sunrise, river, and ghat',
    joinSection: 'Connect with the Foundation',
    openLink: 'Opens in a new window',
    home: 'Return to the home screen',
    footerServiceDescription: 'Deo Surya Mandir and Surya Kund festival service • Free public service',
  },
};

export const getAboutTranslations = (language: LanguageCode): AboutTranslations =>
  aboutTranslations[language === 'en' ? 'en' : 'hi'];
