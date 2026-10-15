import { Facility, FacilityCategory, ShuttlePoint, ShuttleRoute } from '../types';
import { LocationService } from './LocationService';
import { apiRequest } from './apiClient';

const STORAGE_OFFLINE_FACILITIES_KEY = 'deo_chhath_offline_facilities_v1';

// Authentic Facilities Data for Deo Chhath Seva
export const DEO_FACILITIES_DATABASE: Facility[] = [
  // ==========================================
  // 1. SHUTTLE FACILITIES
  // ==========================================
  {
    id: 'shuttle-p1-college',
    name: 'शटल पिकअप प्वाइंट 1 - देव डिग्री कॉलेज पड़ाव',
    nameEn: 'Shuttle Pickup 1 - Deo Degree College',
    category: 'SHUTTLE',
    latitude: 24.6568,
    longitude: 84.4285,
    address: 'देव डिग्री कॉलेज मैदान, अंबा-देव बाईपास मार्ग',
    description: 'बुजुर्गों, दिव्यांगजनों एवं छठव्रतियों हेतु निःशुल्क ई-रिक्शा सेवा। सूर्य कुंड तक सीधी कनेक्टिविटी।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '10 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'PICKUP',
    routeId: 'route-college-mandir',
  },
  {
    id: 'shuttle-d1-mandir-east',
    name: 'शटल ड्रॉप प्वाइंट 1 - सूर्य मंदिर पूर्वी तोरण द्वार पड़ाव',
    nameEn: 'Shuttle Drop 1 - Surya Mandir East Gate',
    category: 'SHUTTLE',
    latitude: 24.6538,
    longitude: 84.4385,
    address: 'सूर्य मंदिर पूर्वी गेट, देव',
    description: 'मंदिर के मुख्य प्रवेश द्वार के निकट शटल ड्रॉप एवं पिकअप स्थल। व्हीलचेयर सहायता उपलब्ध।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '15 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'BOTH',
    routeId: 'route-college-mandir',
  },
  {
    id: 'shuttle-p2-amba',
    name: 'शटल पिकअप प्वाइंट 2 - अंबा मोड़ स्वागत द्वार',
    nameEn: 'Shuttle Pickup 2 - Amba Mor Entry Gate',
    category: 'SHUTTLE',
    latitude: 24.6618,
    longitude: 84.4242,
    address: 'अंबा चेक पोस्ट तिराहा, देव मार्ग',
    description: 'औरंगाबाद-देव मुख्य राजमार्ग से मेला क्षेत्र में प्रवेश करने वाले वाहनों हेतु ई-रिक्शा पड़ाव।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '12 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'PICKUP',
    routeId: 'route-amba-thana',
  },
  {
    id: 'shuttle-d2-thana',
    name: 'शटल ड्रॉप प्वाइंट 2 - थाना मोड़ केंद्रीय नियंत्रण कक्ष',
    nameEn: 'Shuttle Drop 2 - Thana Mor Control Room',
    category: 'SHUTTLE',
    latitude: 24.6528,
    longitude: 84.4348,
    address: 'थाना मोड़ चौक, देव बाजार',
    description: 'केंद्रीय नियंत्रण कक्ष एवं बस स्टैंड के पास शटल आगमन व प्रस्थान केंद्र।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '20 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'BOTH',
    routeId: 'route-amba-thana',
  },
  {
    id: 'shuttle-p3-highschool',
    name: 'शटल पिकअप प्वाइंट 3 - राजा जगन्नाथ उच्च विद्यालय',
    nameEn: 'Shuttle Pickup 3 - Raja Jagannath High School',
    category: 'SHUTTLE',
    latitude: 24.6508,
    longitude: 84.4325,
    address: 'हाई स्कूल रोड, देव',
    description: 'मुख्य वाहन पार्किंग P1 से रुद्र कुंड एवं सूर्य कुंड घाटों हेतु ई-रिक्शा शटल।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '25 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'PICKUP',
    routeId: 'route-school-rudrakund',
  },
  {
    id: 'shuttle-d3-rudrakund',
    name: 'शटल ड्रॉप प्वाइंट 3 - रुद्र कुंड पश्चिमी प्रवेश द्वार',
    nameEn: 'Shuttle Drop 3 - Rudra Kund West Gate',
    category: 'SHUTTLE',
    latitude: 24.6515,
    longitude: 84.4395,
    address: 'रुद्र कुंड पश्चिमी रिंग रोड, देव',
    description: 'रुद्र कुंड अर्घ्य घाट के समीप शटल पड़ाव। केवल पैदल एवं ई-रिक्शा प्रवेश।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '18 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    shuttleType: 'BOTH',
    routeId: 'route-school-rudrakund',
  },

  // ==========================================
  // 2. MEDICAL FACILITIES
  // ==========================================
  {
    id: 'med-chc-deo',
    name: 'सामुदायिक स्वास्थ्य केंद्र (सीएचसी देव अस्पताल)',
    nameEn: 'Community Health Centre (CHC Deo Hospital)',
    category: 'MEDICAL',
    latitude: 24.6575,
    longitude: 84.4358,
    address: 'अस्पताल रोड, कस्तूरबा विद्यालय के सामने, देव',
    description: 'मुख्य सरकारी अस्पताल। 24 घंटे आपातकालीन वार्ड, डॉक्टर, जीवन रक्षक दवाएं एवं एम्बुलेंस सुविधा।',
    verified: true,
    active: true,
    phone: '06186-222102',
    accessibility: true,
    lastUpdated: '5 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
    medicalSubType: 'HOSPITAL',
  },
  {
    id: 'med-redcross-kund',
    name: 'रेड क्रॉस प्राथमिक उपचार शिविर (सूर्य कुंड तट)',
    nameEn: 'Red Cross First Aid Post (Surya Kund)',
    category: 'MEDICAL',
    latitude: 24.6548,
    longitude: 84.4380,
    address: 'सूर्य कुंड उत्तरी घाट, सूर्य मंदिर के ठीक सामने',
    description: 'सूर्य कुंड घाट पर 24 घंटे फर्स्ट एड, ओआरएस घोल, प्राथमिक पट्टी, ऑक्सीजन सपोर्ट एवं बीपी जांच।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '10 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    medicalSubType: 'FIRST_AID',
  },
  {
    id: 'med-thana-camp',
    name: 'सदर अस्पताल विशेष आपातकालीन चिकित्सा तंबू',
    nameEn: 'Emergency Medical Camp (Thana Mor)',
    category: 'MEDICAL',
    latitude: 24.6525,
    longitude: 84.4345,
    address: 'थाना मोड़ सहायता शिविर, देव',
    description: 'सदर अस्पताल औरंगाबाद द्वारा संचालित आपातकालीन तंबू। चिकित्सक एवं त्वरित राहत दल।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '8 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
    medicalSubType: 'MEDICAL_CAMP',
  },
  {
    id: 'med-ambulance-highschool',
    name: '108 आपातकालीन एम्बुलेंस स्टेशन (P1 हाई स्कूल)',
    nameEn: '108 Emergency Ambulance Post (High School)',
    category: 'MEDICAL',
    latitude: 24.6510,
    longitude: 84.4330,
    address: 'P1 पार्किंग गेट, हाई स्कूल ग्राउंड, देव',
    description: 'बिहार सरकार 108 आपातकालीन एम्बुलेंस तैनाती स्थल। गंभीर रोगियों को तुरंत सदर अस्पताल पहुंचाने हेतु।',
    verified: true,
    active: true,
    phone: '108',
    accessibility: true,
    lastUpdated: '12 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
    medicalSubType: 'AMBULANCE_POINT',
  },
  {
    id: 'med-rudrakund-firstaid',
    name: 'NextGen प्राथमिक चिकित्सा एवं व्हीलचेयर बूथ',
    nameEn: 'NextGen First Aid & Wheelchair Booth',
    category: 'MEDICAL',
    latitude: 24.6518,
    longitude: 84.4402,
    address: 'रुद्र कुंड पश्चिमी घाट, देव',
    description: 'फाउंडेशन के प्रशिक्षित प्राथमिक उपचार स्वयंसेवक, ग्लूकोज, पेन-रिलीफ एवं व्हीलचेयर सेवा।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '15 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    medicalSubType: 'FIRST_AID',
  },

  // ==========================================
  // 3. TOILET FACILITIES
  // ==========================================
  {
    id: 'toilet-highschool',
    name: 'सार्वजनिक डीलक्स शौचालय परिसर 1 (P1 हाई स्कूल)',
    nameEn: 'Public Deluxe Toilet Complex 1 (High School)',
    category: 'TOILET',
    latitude: 24.6512,
    longitude: 84.4320,
    address: 'राजा जगन्नाथ उच्च विद्यालय मैदान पार्किंग P1, देव',
    description: '20 सीटों वाला स्वच्छ शौचालय परिसर। महिला एवं पुरुषों हेतु अलग व्यवस्था। नियमित सफाई कर्मी उपस्थित।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '20 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    toiletGender: 'ALL',
  },
  {
    id: 'toilet-mandir-west',
    name: 'बायो-टॉयलेट क्लस्टर A (सूर्य मंदिर पश्चिमी मार्ग)',
    nameEn: 'Bio-Toilet Cluster A (Surya Mandir West)',
    category: 'TOILET',
    latitude: 24.6532,
    longitude: 84.4365,
    address: 'सूर्य मंदिर पश्चिमी रिंग रोड, देव',
    description: '15 पोर्टेबल बायो-टॉयलेट केबिन। पानी की निरंतर व्यवस्था। दिव्यांग एवं वृद्धजनों हेतु रैंप।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '10 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    toiletGender: 'ALL',
  },
  {
    id: 'toilet-thana-mor',
    name: 'प्रशासनिक सुलभ शौचालय परिसर (थाना मोड़ चौक)',
    nameEn: 'Sulabh Complex (Thana Mor)',
    category: 'TOILET',
    latitude: 24.6522,
    longitude: 84.4352,
    address: 'थाना मोड़ बस स्टैंड के पीछे, देव बाजार',
    description: 'स्थायी पक्का सुलभ शौचालय एवं स्नानागार। 24 घंटे खुला।',
    verified: true,
    active: true,
    accessibility: false,
    lastUpdated: '15 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
    toiletGender: 'ALL',
  },
  {
    id: 'toilet-suryakund-north',
    name: 'सूर्य कुंड उत्तरी तट सचल शौचालय क्लस्टर B',
    nameEn: 'Surya Kund North Bank Mobile Toilets',
    category: 'TOILET',
    latitude: 24.6555,
    longitude: 84.4385,
    address: 'सूर्य कुंड उत्तरी छोर, वीआईपी घाट मार्ग',
    description: 'छठव्रतियों एवं महिलाओं हेतु आरक्षित स्वच्छ सचल शौचालय।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '12 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    toiletGender: 'FEMALE',
  },
  {
    id: 'toilet-college-ground',
    name: 'देव कॉलेज ग्राउंड शौचालय परिसर (P2 पड़ाव)',
    nameEn: 'Deo College Ground Toilet Post',
    category: 'TOILET',
    latitude: 24.6565,
    longitude: 84.4290,
    address: 'देव डिग्री कॉलेज मैदान प्रवेश द्वार',
    description: 'P2 वाहन पड़ाव के पास निर्मित शौचालय सुविधा।',
    verified: true,
    active: true,
    accessibility: false,
    lastUpdated: '25 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    toiletGender: 'ALL',
  },

  // ==========================================
  // 4. WATER FACILITIES
  // ==========================================
  {
    id: 'water-nextgen-kiosk',
    name: 'NextGen अमृत जल सेवा केंद्र (मंदिर पूर्वी तोरण द्वार)',
    nameEn: 'NextGen Amrit Jal Seva Kiosk (East Gate)',
    category: 'WATER',
    latitude: 24.6540,
    longitude: 84.4382,
    address: 'सूर्य मंदिर पूर्वी मुख्य द्वार, देव',
    description: 'फाउंडेशन द्वारा संचालित आरओ शुद्ध शीतल पेयजल केंद्र। 24 घंटे नि:शुल्क स्वच्छ पेयजल एवं ग्लास सेवा।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '5 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    waterType: 'SEVA_CAMP',
  },
  {
    id: 'water-phed-tanker-kund',
    name: 'पीएचईडी विशाल पेयजल टैंकर स्टेशन 1 (सूर्य कुंड तट)',
    nameEn: 'PHED Drinking Water Tanker (Surya Kund)',
    category: 'WATER',
    latitude: 24.6546,
    longitude: 84.4375,
    address: 'सूर्य कुंड पश्चिमी तट, देव',
    description: 'जनस्वास्थ्य अभियंत्रण विभाग द्वारा स्थापित 5000 लीटर शुद्ध पेयजल टैंकर व नल श्रृंखला।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '15 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
    waterType: 'WATER_TANKER',
  },
  {
    id: 'water-thana-chowk',
    name: 'अमृत धारा शीतल जल बूथ (थाना मोड़ चौक)',
    nameEn: 'Amrit Dhara Clean Water Post (Thana Mor)',
    category: 'WATER',
    latitude: 24.6526,
    longitude: 84.4350,
    address: 'थाना मोड़ चौक नियंत्रण कक्ष, देव',
    description: 'श्रद्धालुओं एवं यात्रियों हेतु ठंडा पेयजल। स्वयंसेवकों द्वारा निरंतर वितरण।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '10 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    waterType: 'DRINKING_WATER',
  },
  {
    id: 'water-rudrakund-parikrama',
    name: 'रुद्र कुंड परिक्रमा जल सेवा केंद्र',
    nameEn: 'Rudra Kund Parikrama Jal Seva',
    category: 'WATER',
    latitude: 24.6520,
    longitude: 84.4400,
    address: 'रुद्र कुंड परिक्रमा मार्ग, देव',
    description: 'परिक्रमा कर रहे भक्तों एवं छठव्रतियों हेतु अर्घ्य जल एवं पीने का शुद्ध जल।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '20 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    waterType: 'DRINKING_WATER',
  },
  {
    id: 'water-college-shuttle',
    name: 'देव कॉलेज पड़ाव पेयजल शिविर (P2)',
    nameEn: 'Deo College Parking Water Camp (P2)',
    category: 'WATER',
    latitude: 24.6570,
    longitude: 84.4288,
    address: 'देव डिग्री कॉलेज मैदान, अंबा रोड',
    description: 'वाहन से उतरने वाले यात्रियों हेतु शीतल जल एवं ओआरएस काउंटर।',
    verified: true,
    active: true,
    accessibility: true,
    lastUpdated: '18 मिनट पहले',
    source: 'ADMIN_VERIFIED',
    waterType: 'DRINKING_WATER',
  },
];

// Authentic Shuttle Routes Data
export const DEO_SHUTTLE_ROUTES: ShuttleRoute[] = [
  {
    id: 'route-college-mandir',
    name: 'रूट 1: देव डिग्री कॉलेज ↔ सूर्य मंदिर पूर्वी तोरण द्वार',
    stops: ['P2 कॉलेज मैदान पड़ाव', 'सीएचसी अस्पताल मोड़', 'सूर्य मंदिर पूर्वी द्वार पड़ाव'],
    verified: true,
    active: true,
    schedule: 'मेला अवधि में निरंतर फेरे (बुजुर्ग व व्रती प्राथमिकता)',
    lastUpdated: '10 मिनट पहले',
  },
  {
    id: 'route-amba-thana',
    name: 'रूट 2: अंबा मोड़ स्वागत द्वार ↔ थाना मोड़ नियंत्रण कक्ष',
    stops: ['P3 अंबा चेकपोस्ट', 'बाईपास तिराहा', 'थाना मोड़ नियंत्रण कक्ष'],
    verified: true,
    active: true,
    schedule: 'प्रातः 4:00 से रात्रि 11:00 तक अनवरत',
    lastUpdated: '15 मिनट पहले',
  },
  {
    id: 'route-school-rudrakund',
    name: 'रूट 3: राजा जगन्नाथ हाई स्कूल ↔ रुद्र कुंड पश्चिमी द्वार',
    stops: ['P1 हाई स्कूल मैदान पड़ाव', 'सूर्य मंदिर पश्चिमी लिंक', 'रुद्र कुंड पश्चिमी द्वार'],
    verified: true,
    active: true,
    schedule: 'अर्घ्य काल में विशेष फेरे',
    lastUpdated: '20 मिनट पहले',
  },
];

class FacilityServiceManager {
  private facilities: Facility[] = [];
  private shuttleRoutes: ShuttleRoute[] = [];

  constructor() {
    this.initOfflineCache();
  }

  private initOfflineCache(): void {
    try {
      const cached = localStorage.getItem(STORAGE_OFFLINE_FACILITIES_KEY);
      if (cached) {
        this.facilities = (JSON.parse(cached) as Facility[]).filter(
          (facility) => facility.verified && facility.active && facility.source !== 'DEMO_DATA'
        );
      }
    } catch {
      // Ignore localStorage error
    }
  }

  private markUnverified(facilities: Facility[]): Facility[] {
    return facilities.map((facility) => ({
      ...facility,
      verified: false,
      lastUpdated: 'स्थिर डेटा; पुष्टि की तारीख उपलब्ध नहीं',
    }));
  }

  // 1. Get all facilities
  public getFacilities(): Facility[] {
    return this.facilities;
  }

  public getAllFacilities(): Facility[] {
    return this.facilities;
  }

  public async addFacility(facility: Omit<Facility, 'id'>): Promise<Facility> {
    const saved = await apiRequest<{
      id: string;
      name: string;
      nameEn?: string;
      category: FacilityCategory;
      latitude: number;
      longitude: number;
      address?: string;
      description?: string;
      phone?: string;
      isVerified: boolean;
      isActive: boolean;
      updatedAt: string;
    }>('/api/facilities', {
      method: 'POST',
      body: JSON.stringify({
        name: facility.name,
        nameEn: facility.nameEn,
        category: facility.category,
        latitude: facility.latitude,
        longitude: facility.longitude,
        address: facility.address,
        description: facility.description,
        phone: facility.phone,
      }),
    }, true);
    const created: Facility = {
      ...facility,
      id: saved.id,
      verified: saved.isVerified,
      active: saved.isActive,
      lastUpdated: new Date(saved.updatedAt).toLocaleString('hi-IN'),
      source: saved.isVerified ? 'ADMIN_VERIFIED' : 'DEMO_DATA',
    };
    this.facilities = [created, ...this.facilities.filter((item) => item.id !== created.id)];
    this.persistFacilities();
    return created;
  }

  private persistFacilities(): void {
    try {
      localStorage.setItem(STORAGE_OFFLINE_FACILITIES_KEY, JSON.stringify(this.facilities));
    } catch (error) {
      console.warn('Facility cache could not be updated; server data remains saved.', error);
    }
  }

  // 2. Get facilities filtered by category
  public getFacilitiesByCategory(category: FacilityCategory): Facility[] {
    return this.facilities.filter((f) =>
      f.category === category && f.verified && f.active && f.source !== 'DEMO_DATA'
    );
  }

  // 3. Get facilities sorted by distance to user GPS
  public getNearbyFacilities(
    category: FacilityCategory,
    userLat: number,
    userLng: number
  ): (Facility & { distanceMeters: number; distanceDisplay: string })[] {
    const list = this.getFacilitiesByCategory(category);

    const withDistances = list.map((f) => {
      const distKm = LocationService.calculateDistanceKm(
        { latitude: userLat, longitude: userLng },
        { latitude: f.latitude, longitude: f.longitude }
      );
      const meters = Math.round(distKm * 1000);
      const display =
        meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;

      return {
        ...f,
        distanceMeters: meters,
        distanceDisplay: display,
      };
    });

    return withDistances.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // 4. Get facility by ID
  public getFacilityById(id: string): Facility | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  // 5. Get verified facilities only
  public getVerifiedFacilities(): Facility[] {
    return this.facilities.filter((f) => f.verified && f.active && f.source !== 'DEMO_DATA');
  }

  // 6. Get offline facilities from local cache
  public getOfflineFacilities(): Facility[] {
    try {
      const cached = localStorage.getItem(STORAGE_OFFLINE_FACILITIES_KEY);
      return cached ? JSON.parse(cached) : this.facilities;
    } catch {
      return this.facilities;
    }
  }

  // 7. Sync facilities with server (connected to PostGIS backend)
  public async syncFacilities(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const data = await apiRequest<{
      facilities: Array<{
        id: string;
        name: string;
        nameEn?: string;
        category: FacilityCategory;
        latitude: number;
        longitude: number;
        address?: string;
        description?: string;
        phone?: string;
        isVerified: boolean;
        isActive: boolean;
        updatedAt: string;
      }>;
    }>('/api/facilities');
    this.facilities = data.facilities.filter((facility) => facility.isVerified && facility.isActive).map((facility) => ({
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn,
      category: facility.category,
      latitude: Number(facility.latitude),
      longitude: Number(facility.longitude),
      address: facility.address || '',
      description: facility.description || '',
      phone: facility.phone,
      verified: facility.isVerified,
      active: facility.isActive,
      accessibility: true,
      lastUpdated: new Date(facility.updatedAt).toLocaleString('hi-IN'),
      source: facility.isVerified ? 'ADMIN_VERIFIED' : 'DEMO_DATA',
    }));
    this.persistFacilities();
  }

  public async archiveFacility(id: string): Promise<void> {
    await apiRequest(`/api/facilities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ isArchived: true, isActive: false }),
    }, true);
    this.facilities = this.facilities.filter((facility) => facility.id !== id);
    this.persistFacilities();
  }

  // 8. Shuttle routes and points
  public getShuttleRoutes(): ShuttleRoute[] {
    return this.shuttleRoutes;
  }

  public getShuttlePoints(): ShuttlePoint[] {
    return this.facilities
      .filter((f) => f.category === 'SHUTTLE')
      .map((f) => ({
        id: f.id,
        name: f.name,
        latitude: f.latitude,
        longitude: f.longitude,
        type: f.shuttleType || 'BOTH',
        routeId: f.routeId || 'route-college-mandir',
        verified: f.verified,
        active: f.active,
        lastUpdated: f.lastUpdated || 'हाल ही में',
      }));
  }
}

export const FacilityService = new FacilityServiceManager();
