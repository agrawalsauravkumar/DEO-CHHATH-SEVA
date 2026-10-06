export type POICategory =
  | 'RELIGIOUS'
  | 'PARKING'
  | 'SHUTTLE'
  | 'MEDICAL'
  | 'TOILET'
  | 'WATER'
  | 'HELP';

export interface POIItem {
  id: string;
  name: string;
  nameEn: string;
  category: POICategory;
  latitude: number;
  longitude: number;
  description: string;
  landmark: string;
  status: 'सक्रिय' | 'स्थान सीमित' | 'भीड़' | 'खुला है' | 'सेवा जारी';
  isDemo: boolean;
  distanceApprox?: string;
  isWheelchairAccessible?: boolean;
}

// Configurable Default Center for Deo, Aurangabad, Bihar, India
export const DEO_DEFAULT_CENTER = {
  latitude: 24.6542,
  longitude: 84.4371,
  zoom: 15,
  name: 'देव सूर्य मंदिर तीर्थ क्षेत्र',
  district: 'औरंगाबाद, बिहार',
};

// Reusable Demo POI dataset for Deo mela (Clearly marked as demo data)
export const DEMO_POIS: POIItem[] = [
  {
    id: 'deo-surya-mandir',
    name: 'देव सूर्य मंदिर (मुख्य गर्भगृह)',
    nameEn: 'Deo Sun Temple (Main Sanctum)',
    category: 'RELIGIOUS',
    latitude: 24.6542,
    longitude: 84.4371,
    description: 'त्रेतायुगीन पश्चिमाभिमुख सूर्य मंदिर गर्भगृह। छठ महापर्व का मुख्य दर्शन केंद्र। (नमूना/डेमो डेटा)',
    landmark: 'सूर्य मंदिर चौक, देव',
    status: 'खुला है',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'surya-kund-ghat',
    name: 'सूर्य कुंड (छठ मुख्य अर्घ्य घाट)',
    nameEn: 'Surya Kund Chhath Arghya Ghat',
    category: 'RELIGIOUS',
    latitude: 24.6538,
    longitude: 84.4378,
    description: 'पवित्र सूर्य कुंड सरोवर जहां लाखों व्रती अस्ताचलगामी और उदीयमान सूर्य को अर्घ्य देते हैं।',
    landmark: 'सूर्य मंदिर के ठीक सामने',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'rudra-kund-ghat',
    name: 'रुद्र कुंड घाट (द्वितीय अर्घ्य सरोवर)',
    nameEn: 'Rudra Kund Ghat',
    category: 'RELIGIOUS',
    latitude: 24.6525,
    longitude: 84.4358,
    description: 'रुद्र कुंड घाट जहां अतिरिक्त व्रतियों हेतु सुरक्षित बैरिकेडिंग युक्त अर्घ्य घाट बनाए गए हैं।',
    landmark: 'रुद्र कुंड मार्ग, देव',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: false,
  },
  {
    id: 'parking-1-highschool',
    name: 'पार्किंग 1 - राजा जगन्नाथ उच्च विद्यालय मैदान',
    nameEn: 'Parking 1 - Raja Jagannath School',
    category: 'PARKING',
    latitude: 24.6508,
    longitude: 84.4325,
    description: 'चार पहिया एवं दो पहिया वाहनों का विशाल अधिकृत पार्किंग मैदान। (क्षमता: ~800 वाहन)',
    landmark: 'हाई स्कूल रोड, देव',
    status: 'स्थान सीमित',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'parking-2-college',
    name: 'पार्किंग 2 - देव डिग्री कॉलेज मैदान',
    nameEn: 'Parking 2 - Deo Degree College',
    category: 'PARKING',
    latitude: 24.6568,
    longitude: 84.4285,
    description: 'बड़ी बसें व दूर-दराज से आने वाले चार पहिया वाहनों का मुख्य पड़ाव। यहाँ से मुफ्त शटल उपलब्ध है।',
    landmark: 'अंबा-देव बाईपास मार्ग',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'parking-3-amba-mor',
    name: 'पार्किंग 3 - अंबा मोड़ स्वागत द्वार पार्किंग',
    nameEn: 'Parking 3 - Amba Mor Gate',
    category: 'PARKING',
    latitude: 24.6618,
    longitude: 84.4242,
    description: 'औरंगाबाद-देव मुख्य प्रवेश द्वार के पास विशाल वाहन पड़ाव। (क्षमता: ~1500 वाहन)',
    landmark: 'अंबा चेक पोस्ट तिराहा',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'shuttle-stand-1',
    name: 'अंबा मोड़ ई-रिक्शा शटल स्टैंड (रूट 1)',
    nameEn: 'Amba Mor E-Rickshaw Shuttle Point',
    category: 'SHUTTLE',
    latitude: 24.6612,
    longitude: 84.4248,
    description: 'पार्किंग P3 से मंदिर तोरण द्वार तक बुजुर्गों, दिव्यांगों व महिलाओं हेतु निःशुल्क ई-रिक्शा सेवा।',
    landmark: 'अंबा स्वागत द्वार पड़ाव',
    status: 'सेवा जारी',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'shuttle-stand-2',
    name: 'कॉलेज मैदान शटल प्वाइंट (रूट 2)',
    nameEn: 'Deo College Shuttle Point',
    category: 'SHUTTLE',
    latitude: 24.6565,
    longitude: 84.4292,
    description: 'कॉलेज पार्किंग से सीधे सूर्य कुंड घाट गेट 3 तक अनवरत शटल फेरे।',
    landmark: 'देव कॉलेज मुख्य गेट',
    status: 'सेवा जारी',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'chc-deo-hospital',
    name: 'देव सामुदायिक स्वास्थ्य केंद्र (अस्पताल)',
    nameEn: 'CHC Deo Hospital (24x7 Emergency)',
    category: 'MEDICAL',
    latitude: 24.6575,
    longitude: 84.4342,
    description: '24 घंटे आपातकालीन ट्रॉमा सेंटर, 10 बेड आईसीयू, ऑक्सीजन व 108 एम्बुलेंस बेस कैंप।',
    landmark: 'अंबा-देव मुख्य मार्ग, देव',
    status: 'खुला है',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'medical-camp-surya-kund',
    name: 'सूर्य कुंड प्राथमिक चिकित्सा शिविर (रेड क्रॉस)',
    nameEn: 'Surya Kund Red Cross First Aid Camp',
    category: 'MEDICAL',
    latitude: 24.6536,
    longitude: 84.4382,
    description: 'निःशुल्क ओआरएस, ग्लूकोज, प्राथमिक ड्रेसिंग, ब्लड प्रेशर जांच व स्ट्रेचर सहायता।',
    landmark: 'सूर्य कुंड घाट 2 के सामने',
    status: 'सेवा जारी',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'toilet-surya-kund',
    name: 'सूर्य कुंड चलंत बायो-टॉयलेट परिसर',
    nameEn: 'Surya Kund Mobile Bio Toilet Complex',
    category: 'TOILET',
    latitude: 24.6532,
    longitude: 84.4372,
    description: 'महिला एवं पुरुष चलंत बायो-टॉयलेट, व्रती महिला चेंजिंग रूम व दिव्यांग रैंप सुविधा।',
    landmark: 'सूर्य कुंड दक्षिण तट',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'toilet-bus-stand',
    name: 'सार्वजनिक शौचालय ब्लॉक - देव बस स्टैंड',
    nameEn: 'Public Toilet Block - Bus Stand',
    category: 'TOILET',
    latitude: 24.6548,
    longitude: 84.4348,
    description: 'देव पुराना बस स्टैंड मोड़ पर 24 घंटे खुला स्वच्छ शौचालय परिसर।',
    landmark: 'बस स्टैंड मोड़',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'water-amrit-jal',
    name: 'NextGen अमृत जल सेवा केंद्र (मंदिर चौक)',
    nameEn: 'NextGen Amrit Jal Seva Kiosk',
    category: 'WATER',
    latitude: 24.6546,
    longitude: 84.4375,
    description: 'NextGen देवभूमि फाउंडेशन द्वारा संचालित 24 घंटे निःशुल्क शुद्ध शीतल आरओ जल काउंटर।',
    landmark: 'सूर्य मंदिर मुख्य तोरण द्वार',
    status: 'सेवा जारी',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'water-phed-tanker',
    name: 'पीएचईडी विशाल आरओ वाटर टैंकर (सूर्य कुंड)',
    nameEn: 'PHED Mega RO Water Tanker',
    category: 'WATER',
    latitude: 24.6540,
    longitude: 84.4385,
    description: '10,000 लीटर क्षमता का 16 नलों वाला मल्टी-टैप स्वच्छ पेयजल स्टैंड।',
    landmark: 'सूर्य कुंड घाट 1 व 2 के मध्य',
    status: 'सक्रिय',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'help-control-room',
    name: 'मेला केंद्रीय सहायता व नियंत्रण कक्ष (खोया-पाया)',
    nameEn: 'Central Mela Control Room & Help Desk',
    category: 'HELP',
    latitude: 24.6552,
    longitude: 84.4362,
    description: 'प्रशासनिक व पुलिस नियंत्रण कक्ष, 24x7 लाउडस्पीकर उद्घोषणा, खोया-पाया केंद्र व सुरक्षा सहायता।',
    landmark: 'थाना मोड़, मुख्य मार्ग, देव',
    status: 'खुला है',
    isDemo: true,
    isWheelchairAccessible: true,
  },
  {
    id: 'help-foundation-camp',
    name: 'NextGen देवभूमि फाउंडेशन सेवा शिविर',
    nameEn: 'NextGen Foundation Seva Camp',
    category: 'HELP',
    latitude: 24.6547,
    longitude: 84.4380,
    description: 'स्वयंसेवक सहायता, बुजुर्गों हेतु व्हीलचेयर, विश्राम व मार्गदर्शन हेल्प डेस्क।',
    landmark: 'सूर्य मंदिर पूर्वी गेट',
    status: 'सेवा जारी',
    isDemo: true,
    isWheelchairAccessible: true,
  },
];

import { FacilityService } from './FacilityService';
import { HelpService } from './HelpService';

export const POIService = {
  getAllPOIs: (): POIItem[] => {
    const facilities = FacilityService.getFacilities();
    const facilityPOIs: POIItem[] = facilities.map((f) => ({
      id: f.id,
      name: f.name,
      nameEn: f.nameEn || f.name,
      category: f.category as POICategory,
      latitude: f.latitude,
      longitude: f.longitude,
      description: f.description,
      landmark: f.address,
      status: f.active ? 'सक्रिय' : 'सेवा जारी',
      isDemo: f.source === 'DEMO_DATA',
      isWheelchairAccessible: f.accessibility,
    }));

    const helpPoints = HelpService.getHelpPoints();
    const helpPOIs: POIItem[] = helpPoints.map((hp) => ({
      id: hp.id,
      name: hp.name,
      nameEn: hp.nameEn || hp.name,
      category: 'HELP' as POICategory,
      latitude: hp.latitude,
      longitude: hp.longitude,
      description: hp.description,
      landmark: hp.address,
      status: hp.active ? 'सक्रिय' : 'सेवा जारी',
      isDemo: hp.source === 'DEMO_DATA',
      isWheelchairAccessible: true,
    }));

    // Combine avoiding duplicate IDs
    const combined = [...DEMO_POIS];
    [...facilityPOIs, ...helpPOIs].forEach((fp) => {
      if (!combined.some((item) => item.id === fp.id)) {
        combined.push(fp);
      }
    });

    return combined;
  },

  getPOIsByCategories: (categories: Record<POICategory, boolean>): POIItem[] => {
    return POIService.getAllPOIs().filter((poi) => categories[poi.category]);
  },

  getPOIById: (id: string): POIItem | undefined => {
    return POIService.getAllPOIs().find((poi) => poi.id === id);
  },

  searchPOIs: (query: string): POIItem[] => {
    const all = POIService.getAllPOIs();
    if (!query.trim()) return all;
    const q = query.trim().toLowerCase();

    return all.filter(
      (poi) =>
        poi.name.toLowerCase().includes(q) ||
        poi.nameEn.toLowerCase().includes(q) ||
        poi.description.toLowerCase().includes(q) ||
        poi.landmark.toLowerCase().includes(q)
    );
  },

  getCategoryHindiLabel: (category: POICategory): string => {
    switch (category) {
      case 'RELIGIOUS':
        return 'धार्मिक स्थल';
      case 'PARKING':
        return 'पार्किंग';
      case 'SHUTTLE':
        return 'शटल (ई-रिक्शा)';
      case 'MEDICAL':
        return 'चिकित्सा शिविर';
      case 'TOILET':
        return 'शौचालय';
      case 'WATER':
        return 'पेयजल केंद्र';
      case 'HELP':
        return 'सहायता केंद्र';
      default:
        return 'सुविधा';
    }
  },

  getCategoryIcon: (category: POICategory): string => {
    switch (category) {
      case 'RELIGIOUS':
        return '☀️';
      case 'PARKING':
        return '🅿️';
      case 'SHUTTLE':
        return '🛺';
      case 'MEDICAL':
        return '🚑';
      case 'TOILET':
        return '🚻';
      case 'WATER':
        return '💧';
      case 'HELP':
        return '🆘';
      default:
        return '📍';
    }
  },
};
