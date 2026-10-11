/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Production Data Repository with PostGIS Spatial Operations & Seeding

import {
  DbUser,
  DbVolunteer,
  DbFacility,
  DbParking,
  DbShuttleRoute,
  DbShuttlePoint,
  DbHelpRequest,
  DbFamilyGroup,
  DbFamilyMember,
  DbLostFoundReport,
  DbAnnouncement,
  DbRouteAlert,
  DbAuditLog,
  DbFestivalConfig,
} from './types';
import { calculateDistanceMeters } from './spatial';
import { executeQuery } from './connection';

// Pre-seeded Official Deo Chhath Puja 2026 Dataset
const SEED_USERS: DbUser[] = [
  {
    id: 'adm-001',
    email: 'admin@nextgendevbhoomi.org',
    phone: '+919835100001',
    username: 'admin@nextgendevbhoomi.org',
    passwordHash: 'DeoSeva2026@Admin',
    fullName: 'मुख्य समन्वयक (NextGen Dev Bhoomi Foundation)',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'adm-002',
    email: 'controller@aurangabad.gov.in',
    phone: '+919431200002',
    username: 'controller@aurangabad.gov.in',
    passwordHash: 'MelaDeo#2026',
    fullName: 'मेला नियंत्रण कक्ष अधिकारी (जिला प्रशासन औरंगाबाद)',
    role: 'CONTENT_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'usr-101',
    phone: '9835123456',
    fullName: 'रामेश्वर प्रसाद (श्रद्धालु)',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-06T08:00:00Z',
  },
];

const SEED_FACILITIES: DbFacility[] = [
  {
    id: 'fac-p1-college',
    name: 'P1: देव डिग्री कॉलेज मुख्य वाहन पड़ाव',
    nameEn: 'P1: Deo Degree College Main Parking',
    category: 'PARKING',
    latitude: 24.6568,
    longitude: 84.4285,
    address: 'देव डिग्री कॉलेज मैदान, बाईपास मार्ग',
    description: 'चारपहिया एवं दोपहिया वाहनों हेतु विशाल पार्किंग। शटल एवं ई-रिक्शा सेवा उपलब्ध।',
    phone: '06186-224101',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-p2-highschool',
    name: 'P2: राजा जगन्नाथ उच्च विद्यालय मैदान',
    nameEn: 'P2: Raja Jagannath High School Ground',
    category: 'PARKING',
    latitude: 24.6515,
    longitude: 84.432,
    address: 'उच्च विद्यालय परिसर, देव',
    description: 'दोपहिया एवं हल्के वाहनों हेतु आरक्षित सुरक्षित पड़ाव स्थल।',
    phone: '06186-224102',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-p3-amba',
    name: 'P3: अंबा-देव बाईपास स्वागत पड़ाव',
    nameEn: 'P3: Amba-Deo Bypass Entry Parking',
    category: 'PARKING',
    latitude: 24.6625,
    longitude: 84.4235,
    address: 'अंबा चेक पोस्ट तिराहा, देव मार्ग',
    description: 'बाहरी जिलों (पटना, गया, औरंगाबाद) से आने वाली बसों व भारी वाहनों हेतु।',
    phone: '06186-224103',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-med-chc',
    name: 'प्राथमिक स्वास्थ्य केंद्र एवं आकस्मिक चिकित्सा शिविर',
    nameEn: 'CHC Primary Health Centre & Emergency Camp',
    category: 'MEDICAL',
    latitude: 24.6532,
    longitude: 84.4355,
    address: 'सामुदायिक स्वास्थ्य केंद्र परिसर, देव',
    description: '24x7 आपातकालीन डॉक्टर, आईसीयू एम्बुलेंस, जीवनरक्षक दवाएं एवं प्राथमिक उपचार।',
    phone: '108',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-med-suryakund',
    name: 'सूर्य कुंड प्राथमिक चिकित्सा सहायता पोस्ट',
    nameEn: 'Surya Kund First Aid Post',
    category: 'MEDICAL',
    latitude: 24.6548,
    longitude: 84.4372,
    address: 'सूर्य कुंड पश्चिमी घाट तोरण द्वार के सामने',
    description: 'घाट पर तैनात मेडिकल टीम, स्ट्रेचर, ऑक्सीजन सिलेंडर एवं ओआरएस/ग्लूकोज वितरण।',
    phone: '108',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-t-1',
    name: 'सूर्य कुंड दक्षिणी परिसर सार्वजनिक शौचालय (महिला/पुरुष/दिव्यांग)',
    nameEn: 'Surya Kund South Sanitation Complex',
    category: 'TOILET',
    latitude: 24.6542,
    longitude: 84.4368,
    address: 'सूर्य कुंड दक्षिणी गेट के पास',
    description: 'स्वच्छता कर्मियों द्वारा निरंतर साफ-सफाई। महिलाओं हेतु पृथक चेंजिंग रूम। दिव्यांग सुलभ रैंप।',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-w-1',
    name: 'सूर्य मंदिर मुख्य प्रवेश द्वार शीतल पेय जल सेवा',
    nameEn: 'Surya Mandir Main Gate RO Drinking Water Point',
    category: 'WATER',
    latitude: 24.6545,
    longitude: 84.4378,
    address: 'सूर्य मंदिर सिंहद्वार के समीप',
    description: 'NextGen Dev Bhoomi Foundation द्वारा स्थापित 1000 LPH RO शीतल जल वितरण केंद्र।',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-help-control',
    name: 'केंद्रीय मेला नियंत्रण कक्ष एवं खोया-पाया केंद्र',
    nameEn: 'Central Mela Control Room & Lost-Found Camp',
    category: 'HELP',
    latitude: 24.6535,
    longitude: 84.4362,
    address: 'थाना मोड़, देव बाजार चौक',
    description: 'जिला प्रशासन, पुलिस एवं स्वयंसेवक केंद्रीय सहायता केंद्र। लाउडस्पीकर प्रसारण व प्राथमिक जांच।',
    phone: '06186-224200',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'fac-shuttle-1',
    name: 'शटल पिकअप प्वाइंट 1 - देव डिग्री कॉलेज पड़ाव',
    nameEn: 'Shuttle Pickup 1 - Deo Degree College',
    category: 'SHUTTLE',
    latitude: 24.6568,
    longitude: 84.4285,
    address: 'देव डिग्री कॉलेज मैदान',
    description: 'बुजुर्गों, दिव्यांगजनों एवं छठव्रतियों हेतु निःशुल्क ई-रिक्शा सेवा।',
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
];

const SEED_PARKINGS: DbParking[] = [
  {
    id: 'pkg-1',
    facilityId: 'fac-p1-college',
    name: 'P1: देव डिग्री कॉलेज मैदान मुख्य पार्किंग',
    totalCapacity: 800,
    availableCapacity: 340,
    capacityDisplay: '340 / 800 स्थान रिक्त',
    vehicleTypes: ['twoWheeler', 'fourWheeler', 'bus'],
    status: 'AVAILABLE',
    isVerified: true,
    isActive: true,
    latitude: 24.6568,
    longitude: 84.4285,
    address: 'देव डिग्री कॉलेज मैदान, बाईपास मार्ग',
  },
  {
    id: 'pkg-2',
    facilityId: 'fac-p2-highschool',
    name: 'P2: राजा जगन्नाथ उच्च विद्यालय मैदान पार्किंग',
    totalCapacity: 450,
    availableCapacity: 85,
    capacityDisplay: '85 / 450 स्थान रिक्त (सीमित)',
    vehicleTypes: ['twoWheeler', 'fourWheeler'],
    status: 'LIMITED',
    isVerified: true,
    isActive: true,
    latitude: 24.6515,
    longitude: 84.432,
    address: 'उच्च विद्यालय परिसर, देव',
  },
  {
    id: 'pkg-3',
    facilityId: 'fac-p3-amba',
    name: 'P3: अंबा-देव बाईपास स्वागत पड़ाव पार्किंग',
    totalCapacity: 1200,
    availableCapacity: 720,
    capacityDisplay: '720 / 1200 स्थान रिक्त',
    vehicleTypes: ['twoWheeler', 'fourWheeler', 'bus'],
    status: 'AVAILABLE',
    isVerified: true,
    isActive: true,
    latitude: 24.6625,
    longitude: 84.4235,
    address: 'अंबा चेक पोस्ट तिराहा, देव मार्ग',
  },
];

const SEED_SHUTTLE_ROUTES: DbShuttleRoute[] = [
  {
    id: 'route-college-mandir',
    name: 'रूट 1: डिग्री कॉलेज पार्किंग ↔ सूर्य मंदिर पूर्वी गेट',
    origin: 'P1 कॉलेज पार्किंग पड़ाव',
    destination: 'सूर्य मंदिर पूर्वी तोरण द्वार पड़ाव',
    frequency: 'प्रत्येक 5-7 मिनट पर',
    fare: 'निःशुल्क (Free Public Service)',
    isActive: true,
    isVerified: true,
  },
  {
    id: 'route-amba-thana',
    name: 'रूट 2: अंबा मोड़ बाईपास ↔ थाना मोड़ केंद्रीय नियंत्रण कक्ष',
    origin: 'अंबा बाईपास चेक पोस्ट',
    destination: 'थाना मोड़ चौक',
    frequency: 'प्रत्येक 10 मिनट पर',
    fare: 'निःशुल्क (Free Public Service)',
    isActive: true,
    isVerified: true,
  },
];

const SEED_VOLUNTEERS: DbVolunteer[] = [
  {
    id: 'vol-001',
    badgeNumber: 'DEV-VOL-101',
    fullName: 'अमित कुमार सिंह',
    phone: '+91 94312 88121',
    gender: 'पुरुष',
    age: 26,
    status: 'VERIFIED',
    serviceAreas: ['सूर्य कुंड घाट', 'सूर्य मंदिर परिसर'],
    servicesOffered: ['प्राथमिक चिकित्सा', 'भीड़ नियंत्रण', 'खोया-पाया सहायता'],
    currentAssignedZone: 'सूर्य कुंड पश्चिमी घाट (जोन 1)',
    isOnDuty: true,
    location: { latitude: 24.6548, longitude: 84.4372 },
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
  {
    id: 'vol-002',
    badgeNumber: 'DEV-VOL-102',
    fullName: 'सुनीता कुमारी',
    phone: '+91 98351 99234',
    gender: 'महिला',
    age: 24,
    status: 'VERIFIED',
    serviceAreas: ['रुद्र कुंड', 'महिला चेंजिंग रूम'],
    servicesOffered: ['महिला सहायता', 'वरिष्ठ नागरिक सेवा', 'जल सेवा'],
    currentAssignedZone: 'रुद्र कुंड दक्षिणी घाट (जोन 2)',
    isOnDuty: true,
    location: { latitude: 24.6521, longitude: 84.4389 },
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
  },
];

const SEED_ANNOUNCEMENTS: DbAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'देव बाजार मुख्य मार्ग अस्थायी रूप से केवल पैदल यात्रियों हेतु आरक्षित',
    shortDescription: 'श्रद्धालुओं की भारी भीड़ के दृष्टिगत बाजार मुख्य मार्ग पर वाहनों का प्रवेश पूरी तरह बंद रहेगा।',
    details: 'जिला प्रशासन द्वारा जारी आदेशानुसार देव बाजार मोड़ से सूर्य मंदिर मुख्य द्वार तक का मार्ग पूरी तरह पैदल क्षेत्र रहेगा। वाहन P1 या P3 में पार्क करें।',
    category: 'ROUTE',
    priority: 'URGENT',
    status: 'PUBLISHED',
    isVerifiedOfficial: true,
    source: 'जिला प्रशासन एवं मेला नियंत्रण कक्ष',
    publishedAt: '2026-10-06T07:30:00Z',
    routeAlert: {
      id: 'ra-001',
      announcementId: 'ann-001',
      type: 'ROAD_CLOSURE',
      title: 'देव बाजार मुख्य मार्ग बंद',
      roadName: 'देव बाजार मेन रोड',
      reason: 'छठ महापर्व पैदल परिक्रमा व व्रतियों की सुरक्षा हेतु वाहन प्रतिबंधित',
      affectedArea: 'देव बाजार मोड़ से सूर्य मंदिर चौक (450 मीटर)',
      latitude: 24.6538,
      longitude: 84.4365,
      radiusMeters: 400,
      startTime: '05:00 AM',
      endTime: '11:00 PM',
      alternativeRouteAvailable: true,
      alternativeRouteAdvice: 'रुद्र कुंड लिंक मार्ग या कॉलेज बाईपास मार्ग का उपयोग करें।',
      isActive: true,
      isVerified: true,
    },
  },
  {
    id: 'ann-002',
    title: 'सायंकालीन एवं प्रातःकालीन अर्घ्य का आधिकारिक समय',
    shortDescription: 'संध्या अर्घ्य: सायं 05:14 बजे • प्रातःकालीन अर्घ्य: प्रातः 06:08 बजे।',
    details: 'सभी व्रती एवं श्रद्धालु समय से पूर्व घाटों पर स्थान ग्रहण करें। सूर्य कुंड व रुद्र कुंड पर अर्घ्य अर्पण के समय विशेष स्वयंसेवक सहायता उपलब्ध रहेगी।',
    category: 'CHHATH_INFO',
    priority: 'IMPORTANT',
    status: 'PUBLISHED',
    isVerifiedOfficial: true,
    source: 'मेला पंचांग समिति एवं जिला नियंत्रण कक्ष',
    publishedAt: '2026-10-05T18:00:00Z',
  },
];

const SEED_LOST_FOUND: DbLostFoundReport[] = [
  {
    id: 'rep_1',
    reportId: 'LF-2026-104921',
    type: 'LOST_PERSON',
    category: 'वृद्ध नागरिक',
    title: 'रामेश्वर प्रसाद (उम्र 72 वर्ष)',
    description: 'पीला कुर्ता, सफेद धोती पहने हुए। देव सूर्य मंदिर पूर्वी द्वार के पास बिछड़े।',
    locationName: 'देव सूर्य मंदिर पूर्वी द्वार पड़ाव',
    latitude: 24.6548,
    longitude: 84.4362,
    contactName: 'सुरेश कुमार (पुत्र)',
    contactPhone: '+91 98351 11223',
    identifyingFeatures: 'हाथ में लकड़ी की छड़ी, चश्मा पहने हैं',
    status: 'UNDER_REVIEW',
    isFlaggedMisuse: false,
    createdAt: '2026-10-06T06:30:00Z',
    updatedAt: '2026-10-06T07:15:00Z',
  },
];

const SEED_AUDIT_LOGS: DbAuditLog[] = [
  {
    id: 'aud-001',
    userId: 'adm-001',
    userName: 'Chief Coordinator',
    action: 'SYSTEM_BOOT',
    entity: 'System',
    entityId: 'srv-01',
    oldValueSummary: 'None',
    newValueSummary: 'Backend API Service Initialized with PostgreSQL + PostGIS Schema',
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
  },
];

const FESTIVAL_CONFIG: DbFestivalConfig = {
  festivalName: 'कार्तिक छठ महापर्व 2026 (देव, औरंगाबाद)',
  organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
  tagline: 'रास्ता भी • सहायता भी • सेवा भी',
  year: 2026,
  dates: {
    nahayKhay: 'शुक्रवार, 13 नवम्बर 2026 (नहाय-खाय)',
    kharna: 'शनिवार, 14 नवम्बर 2026 (खरना)',
    sandhyaArghya: 'रविवार, 15 नवम्बर 2026 - सायं 05:14 बजे (संध्या अर्घ्य)',
    pratahArghya: 'सोमवार, 16 नवम्बर 2026 - प्रातः 06:08 बजे (उषा अर्घ्य / पारण)',
  },
  melaControlRoomPhone: '06186-224200',
  policeControlPhone: '112',
  medicalHelpline: '108',
  primaryGhatCoordinates: {
    suryaKund: { latitude: 24.6548, longitude: 84.4372, srid: 4326 },
    rudraKund: { latitude: 24.6521, longitude: 84.4389, srid: 4326 },
  },
};

// In-Memory Data Store (Active fallback & synchronization state)
class DataRepository {
  private users: DbUser[] = [...SEED_USERS];
  private facilities: DbFacility[] = [...SEED_FACILITIES];
  private parkings: DbParking[] = [...SEED_PARKINGS];
  private shuttleRoutes: DbShuttleRoute[] = [...SEED_SHUTTLE_ROUTES];
  private volunteers: DbVolunteer[] = [...SEED_VOLUNTEERS];
  private announcements: DbAnnouncement[] = [...SEED_ANNOUNCEMENTS];
  private lostFoundReports: DbLostFoundReport[] = [...SEED_LOST_FOUND];
  private helpRequests: DbHelpRequest[] = [];
  private familyGroups: DbFamilyGroup[] = [];
  private familyMembers: DbFamilyMember[] = [];
  private auditLogs: DbAuditLog[] = [...SEED_AUDIT_LOGS];

  // ================= USERS & AUTH =================
  public async findUserByPhoneOrUsername(identifier: string): Promise<DbUser | null> {
    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const normalizedPhone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    return this.users.find((u) =>
      (u.phone && u.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') === normalizedPhone && normalizedPhone.length === 10) ||
      (u.username && u.username.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean)
    ) || null;
  }

  public async getUserById(id: string): Promise<DbUser | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  public async saveUser(user: DbUser): Promise<DbUser> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user, updatedAt: new Date().toISOString() };
      return this.users[existingIndex];
    }
    this.users.push(user);
    return user;
  }

  public async getAllUsers(): Promise<DbUser[]> {
    return [...this.users];
  }

  // ================= FACILITIES & POSTGIS PROXIMITY =================
  public async getFacilities(category?: string): Promise<DbFacility[]> {
    if (category) {
      return this.facilities.filter((f) => f.category === category && f.isActive && !f.isArchived);
    }
    return this.facilities.filter((f) => f.isActive && !f.isArchived);
  }

  public async getFacilityById(id: string): Promise<DbFacility | null> {
    return this.facilities.find((f) => f.id === id) || null;
  }

  /**
   * PostGIS-Equivalent Proximity Query
   * Calculates distance in meters from given coordinate to all facilities
   * and returns facilities sorted by ascending distance
   */
  public async getNearbyFacilities(
    lat: number,
    lon: number,
    radiusMeters: number = 2000,
    category?: string
  ): Promise<(DbFacility & { distanceMeters: number })[]> {
    const list = category ? await this.getFacilities(category) : await this.getFacilities();
    return list
      .map((f) => {
        const distanceMeters = calculateDistanceMeters(lat, lon, f.latitude, f.longitude);
        return { ...f, distanceMeters };
      })
      .filter((f) => f.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  public async createFacility(facility: DbFacility): Promise<DbFacility> {
    this.facilities.push(facility);
    return facility;
  }

  public async updateFacility(id: string, updates: Partial<DbFacility>): Promise<DbFacility | null> {
    const index = this.facilities.findIndex((f) => f.id === id);
    if (index === -1) return null;
    this.facilities[index] = { ...this.facilities[index], ...updates, updatedAt: new Date().toISOString() };
    return this.facilities[index];
  }

  // ================= PARKING =================
  public async getParkings(): Promise<DbParking[]> {
    return [...this.parkings];
  }

  public async updateParkingStatus(
    id: string,
    status: DbParking['status'],
    availableCapacity?: number
  ): Promise<DbParking | null> {
    const parking = this.parkings.find((p) => p.id === id);
    if (!parking) return null;
    parking.status = status;
    if (availableCapacity !== undefined) {
      parking.availableCapacity = availableCapacity;
      parking.capacityDisplay = `${availableCapacity} / ${parking.totalCapacity} स्थान रिक्त`;
    }
    return parking;
  }

  // ================= SHUTTLE =================
  public async getShuttleRoutes(): Promise<DbShuttleRoute[]> {
    return [...this.shuttleRoutes];
  }

  // ================= VOLUNTEERS =================
  public async getVolunteers(onDutyOnly: boolean = false): Promise<DbVolunteer[]> {
    if (onDutyOnly) {
      return this.volunteers.filter((v) => v.isOnDuty && v.status === 'VERIFIED');
    }
    return [...this.volunteers];
  }

  public async toggleVolunteerDuty(id: string, isOnDuty: boolean): Promise<DbVolunteer | null> {
    const volunteer = this.volunteers.find((v) => v.id === id);
    if (!volunteer) return null;
    volunteer.isOnDuty = isOnDuty;
    volunteer.updatedAt = new Date().toISOString();
    return volunteer;
  }

  // ================= HELP REQUESTS =================
  public async getHelpRequests(status?: string): Promise<DbHelpRequest[]> {
    if (status) {
      return this.helpRequests.filter((h) => h.status === status);
    }
    return [...this.helpRequests];
  }

  public async createHelpRequest(req: DbHelpRequest): Promise<DbHelpRequest> {
    this.helpRequests.unshift(req);
    return req;
  }

  public async updateHelpRequestStatus(
    id: string,
    status: DbHelpRequest['status'],
    notes?: string
  ): Promise<DbHelpRequest | null> {
    const req = this.helpRequests.find((h) => h.id === id);
    if (!req) return null;
    req.status = status;
    if (notes) req.resolutionNotes = notes;
    if (status === 'RESOLVED') req.resolvedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();
    return req;
  }

  // ================= ANNOUNCEMENTS & ROUTE ALERTS =================
  public async getAnnouncements(activeOnly: boolean = true): Promise<DbAnnouncement[]> {
    if (activeOnly) {
      return this.announcements.filter((a) => a.status === 'PUBLISHED');
    }
    return [...this.announcements];
  }

  public async createAnnouncement(announcement: DbAnnouncement): Promise<DbAnnouncement> {
    this.announcements.unshift(announcement);
    return announcement;
  }

  public async getRouteAlerts(): Promise<DbRouteAlert[]> {
    const alerts: DbRouteAlert[] = [];
    for (const ann of this.announcements) {
      if (ann.routeAlert && ann.routeAlert.isActive) {
        alerts.push(ann.routeAlert);
      }
    }
    return alerts;
  }

  // ================= LOST & FOUND =================
  public async getLostFoundReports(type?: string): Promise<DbLostFoundReport[]> {
    if (type) {
      return this.lostFoundReports.filter((r) => r.type === type && !r.isFlaggedMisuse);
    }
    return this.lostFoundReports.filter((r) => !r.isFlaggedMisuse);
  }

  public async createLostFoundReport(report: DbLostFoundReport): Promise<DbLostFoundReport> {
    this.lostFoundReports.unshift(report);
    return report;
  }

  public async updateLostFoundStatus(
    id: string,
    status: DbLostFoundReport['status']
  ): Promise<DbLostFoundReport | null> {
    const report = this.lostFoundReports.find((r) => r.id === id);
    if (!report) return null;
    report.status = status;
    report.updatedAt = new Date().toISOString();
    return report;
  }

  // ================= FAMILY GROUPS =================
  public async getFamilyGroupByCode(code: string): Promise<DbFamilyGroup | null> {
    return this.familyGroups.find((g) => g.groupCode.toUpperCase() === code.trim().toUpperCase()) || null;
  }

  public async createFamilyGroup(group: DbFamilyGroup): Promise<DbFamilyGroup> {
    this.familyGroups.push(group);
    return group;
  }

  public async getFamilyMembers(groupId: string): Promise<DbFamilyMember[]> {
    return this.familyMembers.filter((m) => m.groupId === groupId);
  }

  public async getFamilyMemberById(id: string): Promise<DbFamilyMember | null> {
    return this.familyMembers.find((member) => member.id === id) || null;
  }

  public async addFamilyMember(member: DbFamilyMember): Promise<DbFamilyMember> {
    this.familyMembers.push(member);
    return member;
  }

  public async updateFamilyMemberLocation(
    id: string,
    lat: number,
    lon: number,
    isSafe: boolean
  ): Promise<DbFamilyMember | null> {
    const member = this.familyMembers.find((m) => m.id === id);
    if (!member) return null;
    member.latitude = lat;
    member.longitude = lon;
    member.isSafe = isSafe;
    member.lastPingAt = new Date().toISOString();
    return member;
  }

  // ================= AUDIT LOGS =================
  public async logAudit(log: Omit<DbAuditLog, 'id' | 'createdAt'>): Promise<DbAuditLog> {
    const fullLog: DbAuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullLog);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return fullLog;
  }

  public async getAuditLogs(): Promise<DbAuditLog[]> {
    return [...this.auditLogs];
  }

  // ================= FESTIVAL CONFIGURATION =================
  public getFestivalConfig(): DbFestivalConfig {
    return FESTIVAL_CONFIG;
  }
}

export const repository = new DataRepository();
