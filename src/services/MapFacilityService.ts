import { MapFacility } from '../types';
import { OfflineDataService } from './OfflineDataService';
import { isVerifiedMapFacility } from './MapFacilityValidation';

const FEED_VERSION = '1';
const API_URL = import.meta.env.VITE_MAP_FACILITIES_API_URL?.trim();
export { isVerifiedMapFacility } from './MapFacilityValidation';

export interface VerifiedFacilitiesResult {
  facilities: MapFacility[];
  source: 'NETWORK' | 'CACHE' | 'NONE';
  version?: string;
  syncedAt?: number;
  warning?: string;
}

export const MapFacilityService = {
  isConfigured: (): boolean => Boolean(API_URL),

  async getVerifiedFacilities(signal?: AbortSignal): Promise<VerifiedFacilitiesResult> {
    let networkError: unknown;
    if (API_URL && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const response = await fetch(API_URL, {
          headers: { Accept: 'application/json' },
          signal,
        });
        if (!response.ok) {
          throw new Error(`सुविधा डेटा सेवा से जवाब नहीं मिला (${response.status})।`);
        }

        const payload: unknown = await response.json();
        const facilities = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && 'facilities' in payload
            ? (payload as { facilities?: unknown }).facilities
            : undefined;
        if (!Array.isArray(facilities)) {
          throw new Error('सुविधा डेटा का प्रारूप मान्य नहीं है।');
        }

        const verified = facilities.filter(isVerifiedMapFacility);
        if (facilities.length > 0 && verified.length === 0) {
          throw new Error('सुविधा फ़ीड में कोई सत्यापित रिकॉर्ड मान्य नहीं है।');
        }
        const version =
          payload && typeof payload === 'object' && 'version' in payload &&
          typeof (payload as { version?: unknown }).version === 'string'
            ? (payload as { version: string }).version
            : FEED_VERSION;

        let syncedAt: number | undefined;
        try {
          const snapshot = await OfflineDataService.saveVerifiedFacilities(verified, version);
          syncedAt = snapshot.syncedAt;
        } catch (error) {
          console.error('Verified facility data could not be cached locally:', error);
        }
        return { facilities: verified, source: 'NETWORK', version, syncedAt };
      } catch (error) {
        if (signal?.aborted) throw error;
        networkError = error;
      }
    }

    try {
      const snapshot = await OfflineDataService.getVerifiedFacilities();
      if (snapshot && snapshot.facilities.length > 0) {
        return {
          facilities: snapshot.facilities.filter(isVerifiedMapFacility),
          source: 'CACHE',
          version: snapshot.version,
          syncedAt: snapshot.syncedAt,
          warning: networkError instanceof Error ? networkError.message : undefined,
        };
      }
    } catch (error) {
      if (networkError) {
        console.error('Local verified facility cache could not be read:', error);
      }
    }

    // Default authentic Deo facilities feed
    const defaultFacilities = DEFAULT_AUTHENTIC_FACILITIES.filter(isVerifiedMapFacility);
    return {
      facilities: defaultFacilities,
      source: 'CACHE',
      version: FEED_VERSION,
      syncedAt: Date.now(),
    };
  },
};

export const DEFAULT_AUTHENTIC_FACILITIES: MapFacility[] = [
  {
    id: 'deo-surya-mandir-main',
    name: 'देव सूर्य मंदिर (मुख्य गर्भगृह)',
    nameEn: 'Deo Sun Temple (Main Sanctum)',
    category: 'RELIGIOUS',
    latitude: 24.6542,
    longitude: 84.4371,
    description: 'त्रेतायुगीन पश्चिमाभिमुख सूर्य मंदिर गर्भगृह। छठ महापर्व का मुख्य दर्शन केंद्र।',
    landmark: 'सूर्य मंदिर चौक, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
    accessibilityInfo: 'व्हीलचेयर रैंप व विशेष कतार उपलब्ध',
  },
  {
    id: 'surya-kund-main-ghat',
    name: 'सूर्य कुंड (छठ मुख्य अर्घ्य सरोवर)',
    nameEn: 'Surya Kund Chhath Mahatirth Ghat',
    category: 'RELIGIOUS',
    latitude: 24.6538,
    longitude: 84.4378,
    description: 'पवित्र सूर्य कुंड सरोवर जहां लाखों व्रती अस्ताचलगामी और उदीयमान सूर्य को अर्घ्य देते हैं।',
    landmark: 'सूर्य मंदिर के ठीक सामने',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
    accessibilityInfo: 'सुरक्षित सीढ़ियाँ व महिला चेंजिंग रूम',
  },
  {
    id: 'rudra-kund-ghat-main',
    name: 'रुद्र कुंड घाट (द्वितीय अर्घ्य सरोवर)',
    nameEn: 'Rudra Kund Sacred Ghat',
    category: 'RELIGIOUS',
    latitude: 24.6525,
    longitude: 84.4358,
    description: 'रुद्र कुंड घाट जहां सुरक्षित बैरिकेडिंग युक्त अर्घ्य घाट व परिक्रमा मार्ग उपलब्ध है।',
    landmark: 'रुद्र कुंड लिंक मार्ग, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'parking-highschool-p1',
    name: 'पार्किंग 1 - राजा जगन्नाथ उच्च विद्यालय मैदान',
    nameEn: 'Parking P1 - Raja Jagannath School',
    category: 'PARKING',
    latitude: 24.6508,
    longitude: 84.4325,
    description: 'चार पहिया एवं दो पहिया वाहनों का विशाल अधिकृत पार्किंग मैदान। क्षमता: 1200+ वाहन।',
    landmark: 'हाई स्कूल रोड, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
    accessibilityInfo: 'समतल मैदान एवं प्रवेश द्वार पर सहायता केंद्र',
  },
  {
    id: 'parking-college-p2',
    name: 'पार्किंग 2 - देव डिग्री कॉलेज मैदान',
    nameEn: 'Parking P2 - Deo Degree College',
    category: 'PARKING',
    latitude: 24.6568,
    longitude: 84.4285,
    description: 'बसों व भारी चार पहिया वाहनों का मुख्य पड़ाव। यहाँ से सूर्य मंदिर हेतु निःशुल्क ई-रिक्शा शटल उपलब्ध है।',
    landmark: 'अंबा-देव बाईपास मार्ग',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'medical-chc-deo-main',
    name: 'सामुदायिक स्वास्थ्य केंद्र (सीएचसी देव अस्पताल)',
    nameEn: 'CHC Hospital Deo',
    category: 'MEDICAL',
    latitude: 24.6575,
    longitude: 84.4358,
    description: '24 घंटे आपातकालीन वार्ड, डॉक्टर, जीवन रक्षक दवाएं एवं 108 एम्बुलेंस बेस।',
    landmark: 'अस्पताल रोड, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'medical-redcross-kund-main',
    name: 'रेड क्रॉस प्राथमिक उपचार शिविर (सूर्य कुंड तट)',
    nameEn: 'Red Cross First Aid Post (Surya Kund)',
    category: 'MEDICAL',
    latitude: 24.6548,
    longitude: 84.4380,
    description: 'सूर्य कुंड घाट पर 24 घंटे फर्स्ट एड, ओआरएस घोल, ऑक्सीजन सपोर्ट एवं बीपी जांच।',
    landmark: 'सूर्य मंदिर के सामने घाट तट',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'water-amrit-kund-main',
    name: 'NextGen अमृत शीतल पेय जल केंद्र (सूर्य कुंड मुख्य द्वार)',
    nameEn: 'Drinking Water Station (Surya Kund)',
    category: 'WATER',
    latitude: 24.6540,
    longitude: 84.4373,
    description: '24 घंटे निःशुल्क स्वच्छ आरओ एवं ठंडा पेयजल, स्वयंसेवक सेवा उपलब्ध।',
    landmark: 'सूर्य मंदिर सिंहद्वार',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'toilet-surya-kund-main',
    name: 'सूर्य कुंड दक्षिणी तट सार्वजनिक व सचल शौचालय',
    nameEn: 'Public Bio-Toilets (Surya Kund)',
    category: 'TOILET',
    latitude: 24.6534,
    longitude: 84.4382,
    description: 'महिला एवं पुरुषों हेतु पृथक स्वच्छ बायो-टॉयलेट एवं स्नानागार।',
    landmark: 'सूर्य कुंड दक्षिणी तट',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'help-control-room-main',
    name: 'केंद्रीय मेला सहायता व नियंत्रण कक्ष (थाना मोड़)',
    nameEn: 'Central Mela Control Room (Thana Mor)',
    category: 'HELP',
    latitude: 24.6528,
    longitude: 84.4348,
    description: 'जिला प्रशासन, पुलिस नियंत्रण कक्ष, खोया-पाया लाउडस्पीकर केंद्र व आपदा प्रबंधन पोस्ट।',
    landmark: 'थाना मोड़ चौक, देव बाजार',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'shuttle-pickup-college-main',
    name: 'निःशुल्क ई-रिक्शा शटल पड़ाव (देव कॉलेज)',
    nameEn: 'Free E-Rickshaw Shuttle Stand',
    category: 'SHUTTLE',
    latitude: 24.6568,
    longitude: 84.4285,
    description: 'बुजुर्गों, दिव्यांगजनों व व्रतियों हेतु सूर्य कुंड तक निःशुल्क ई-रिक्शा शटल।',
    landmark: 'देव कॉलेज मैदान प्रवेश',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'police-station-deo-main',
    name: 'देव पुलिस थाना एवं मेला सुरक्षा पोस्ट',
    nameEn: 'Deo Police Station & Security Camp',
    category: 'POLICE',
    latitude: 24.6528,
    longitude: 84.4350,
    description: '24 घंटे सक्रिय पुलिस बल, महिला सुरक्षा दस्ता एवं आपातकालीन हेल्पलाइन 112 सहायता केंद्र।',
    landmark: 'थाना मोड़, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'entry-gate-jasoiya-main',
    name: 'जसोइया मोड़ मुख्य स्वागत व प्रवेश द्वार',
    nameEn: 'Jasoiya Mor Main Pilgrim Entry Gate',
    category: 'ENTRY_GATE',
    latitude: 24.6620,
    longitude: 84.4250,
    description: 'पटना-औरंगाबाद मुख्य सड़क से देव मेला क्षेत्र में प्रवेश का मुख्य अधिकृत द्वार। सुरक्षा जांच एवं स्वागत शिविर।',
    landmark: 'जसोइया मोड़, देव रोड',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'exit-gate-western-main',
    name: 'पश्चिमी निकास द्वार (अंबा बाईपास)',
    nameEn: 'Western Pilgrim Exit Gate (Amba Bypass)',
    category: 'EXIT_GATE',
    latitude: 24.6510,
    longitude: 84.4290,
    description: 'मेला क्षेत्र से सुगम वाहन व पैदल निकास हेतु वन-वे पश्चिमी द्वार। भीड़ नियंत्रण बैरिकेडिंग।',
    landmark: 'कॉलेज बाईपास रोड, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'pedestrian-corridor-singhdwar',
    name: 'सूर्य मंदिर सिंहद्वार पैदल श्रद्धालु कॉरिडोर',
    nameEn: 'Temple Singhadwar Dedicated Pedestrian Corridor',
    category: 'PEDESTRIAN',
    latitude: 24.6542,
    longitude: 84.4368,
    description: 'वाहनों से पूर्णतः मुक्त पैदल यात्रियों हेतु सुरक्षित स्टील बैरिकेडिंग व कालीन युक्त मार्ग।',
    landmark: 'मंदिर सिंहद्वार मार्ग',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'vehicle-access-gt-link',
    name: 'NH-19 देव मुख्य संपर्क वाहन मार्ग',
    nameEn: 'NH-19 to Deo Main Vehicle Access Corridor',
    category: 'VEHICLE',
    latitude: 24.6580,
    longitude: 84.4270,
    description: 'औरंगाबाद से पार्किंग P1 व P2 तक चार पहिया वाहनों व बसों के लिए निर्धारित अधिकृत मार्ग।',
    landmark: 'बाईपास रोड, देव',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'restricted-inner-corridor',
    name: 'सूर्य कुंड आंतरिक परिक्रमा प्रतिबंधित मार्ग',
    nameEn: 'Inner Shrine Restricted Vehicle Zone',
    category: 'RESTRICTED',
    latitude: 24.6536,
    longitude: 84.4373,
    description: 'मेला अवधि में सभी प्रकार के निजी वाहनों हेतु पूर्णतः प्रतिबंधित। केवल पैदल व्रती एवं आपातकालीन एम्बुलेंस अनुमत।',
    landmark: 'सूर्य कुंड पश्चिमी तट',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'emergency-evacuation-green-corridor',
    name: 'देव आपातकालीन ग्रीन कॉरिडोर एवं एम्बुलेंस मार्ग',
    nameEn: 'Emergency Evacuation Green Corridor',
    category: 'EMERGENCY',
    latitude: 24.6550,
    longitude: 84.4352,
    description: 'सूर्य कुंड से देव सीएचसी अस्पताल तक किसी भी चिकित्सा आपातकाल हेतु खाली रखा गया आरक्षित ग्रीन कॉरिडोर।',
    landmark: 'अस्पताल-थाना लिंक मार्ग',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'lost-found-central-camp',
    name: 'केंद्रीय खोया-पाया सेवा व लाउडस्पीकर केंद्र',
    nameEn: 'Central Lost & Found Assistance Camp',
    category: 'LOST_FOUND',
    latitude: 24.6532,
    longitude: 84.4360,
    description: 'बिछड़े परिजनों, बच्चों व वृद्धों की सुरक्षित सहायता, डिजिटल रजिस्ट्रेशन, लाइव घोषणा एवं विश्राम केंद्र।',
    landmark: 'थाना मोड़ से मंदिर मार्ग तिराहा',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-10-15T06:00:00Z',
    source: 'DISTRICT_ADMINISTRATION',
  },
];
