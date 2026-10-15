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
} from './types';
import { randomUUID } from 'node:crypto';
import { calculateDistanceMeters } from './spatial';
import { executeQuery } from './connection';

interface UserRow {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  password_hash: string | null;
  full_name: string;
  role: DbUser['role'];
  status: DbUser['status'];
  avatar_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  last_login_at: Date | string | null;
}

interface FacilityRow {
  id: string;
  name: string;
  name_en: string | null;
  category: DbFacility['category'];
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_archived: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface ParkingRow {
  id: string;
  facility_id: string;
  name: string;
  total_capacity: number | null;
  available_capacity: number | null;
  capacity_display: string | null;
  vehicle_types: string[] | null;
  status: DbParking['status'];
  is_verified: boolean;
  is_active: boolean;
  latitude: number;
  longitude: number;
  address: string | null;
  updated_at: Date | string;
}

interface LostFoundRow {
  id: string;
  report_id: string;
  type: DbLostFoundReport['type'];
  category: string;
  title: string;
  description: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  identifying_features: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  status: DbLostFoundReport['status'];
  is_flagged_misuse: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface VolunteerRow {
  id: string;
  user_id: string | null;
  badge_number: string;
  full_name: string;
  phone: string;
  gender: string | null;
  age: number | null;
  status: DbVolunteer['status'];
  service_areas: string[] | null;
  services_offered: string[] | null;
  languages: string[] | null;
  availability_time: string | null;
  current_assigned_zone: string | null;
  is_on_duty: boolean;
  verified_by: string | null;
  verified_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface HelpRequestRow {
  id: string;
  request_number: string;
  type: string;
  description: string;
  user_name: string | null;
  user_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: DbHelpRequest['status'];
  priority: DbHelpRequest['priority'];
  assigned_volunteer_id: string | null;
  assigned_at: Date | string | null;
  resolved_at: Date | string | null;
  resolution_notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface AnnouncementRow {
  id: string;
  title: string;
  short_description: string;
  details: string | null;
  category: DbAnnouncement['category'];
  priority: DbAnnouncement['priority'];
  status: DbAnnouncement['status'];
  is_verified_official: boolean;
  source: string;
  published_at: Date | string;
  expires_at: Date | string | null;
  created_by: string | null;
  route_alert: DbRouteAlert | null;
}

const mapFacilityRow = (row: FacilityRow): DbFacility => ({
  id: row.id,
  name: row.name,
  nameEn: row.name_en || undefined,
  category: row.category,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  address: row.address || undefined,
  description: row.description || undefined,
  phone: row.phone || undefined,
  isVerified: row.is_verified,
  isActive: row.is_active,
  isArchived: row.is_archived,
  metadata: row.metadata || undefined,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

const mapVolunteerRow = (row: VolunteerRow): DbVolunteer => ({
  id: row.id,
  userId: row.user_id || undefined,
  badgeNumber: row.badge_number,
  fullName: row.full_name,
  phone: row.phone,
  gender: row.gender || undefined,
  age: row.age ?? undefined,
  status: row.status,
  serviceAreas: row.service_areas || [],
  servicesOffered: row.services_offered || [],
  languages: row.languages || [],
  availabilityTime: row.availability_time || undefined,
  currentAssignedZone: row.current_assigned_zone || '',
  isOnDuty: row.is_on_duty,
  verifiedBy: row.verified_by || undefined,
  verifiedAt: row.verified_at ? new Date(row.verified_at).toISOString() : undefined,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

const mapHelpRequestRow = (row: HelpRequestRow): DbHelpRequest => ({
  id: row.id,
  requestNumber: row.request_number,
  type: row.type,
  description: row.description,
  userName: row.user_name || undefined,
  userPhone: row.user_phone || undefined,
  latitude: row.latitude === null ? undefined : Number(row.latitude),
  longitude: row.longitude === null ? undefined : Number(row.longitude),
  status: row.status,
  priority: row.priority,
  assignedVolunteerId: row.assigned_volunteer_id || undefined,
  assignedAt: row.assigned_at ? new Date(row.assigned_at).toISOString() : undefined,
  resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : undefined,
  resolutionNotes: row.resolution_notes || undefined,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

const mapAnnouncementRow = (row: AnnouncementRow): DbAnnouncement => ({
  id: row.id,
  title: row.title,
  shortDescription: row.short_description,
  details: row.details || undefined,
  category: row.category,
  priority: row.priority,
  status: row.status,
  isVerifiedOfficial: row.is_verified_official,
  source: row.source,
  publishedAt: new Date(row.published_at).toISOString(),
  expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
  createdBy: row.created_by || undefined,
  routeAlert: row.route_alert || undefined,
});

const mapUserRow = (row: UserRow): DbUser => ({
  id: row.id,
  email: row.email || undefined,
  phone: row.phone || undefined,
  username: row.username || undefined,
  passwordHash: row.password_hash || undefined,
  fullName: row.full_name,
  role: row.role,
  status: row.status,
  avatarUrl: row.avatar_url || undefined,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
  lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : undefined,
});

// Pre-seeded Official Deo Chhath Puja 2026 Dataset
const SEED_USERS: DbUser[] = [
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
    languages: ['हिन्दी', 'मगही'],
    availabilityTime: '24 घंटे',
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
    languages: ['हिन्दी', 'भोजपुरी'],
    availabilityTime: 'अर्घ्य समय',
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

// In-Memory Data Store (Active fallback & synchronization state)
class DataRepository {
  private users: DbUser[] = [...SEED_USERS];
  private facilities: DbFacility[] = [...SEED_FACILITIES];
  private parkings: DbParking[] = [...SEED_PARKINGS];
  private shuttleRoutes: DbShuttleRoute[] = [...SEED_SHUTTLE_ROUTES];
  private volunteers: DbVolunteer[] = [...SEED_VOLUNTEERS];
  private announcements: DbAnnouncement[] = [...SEED_ANNOUNCEMENTS];
  private lostFoundReports: DbLostFoundReport[] = [];
  private helpRequests: DbHelpRequest[] = [];
  private familyGroups: DbFamilyGroup[] = [];
  private familyMembers: DbFamilyMember[] = [];
  private auditLogs: DbAuditLog[] = [];

  // ================= USERS & AUTH =================
  public async findUserByPhoneOrUsername(identifier: string): Promise<DbUser | null> {
    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const normalizedPhone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    const databaseUsers = await executeQuery<UserRow>(
      `SELECT id, email, phone, username, password_hash, full_name, role, status,
              avatar_url, created_at, updated_at, last_login_at
       FROM users
       WHERE lower(username) = $1 OR lower(email) = $1
          OR regexp_replace(phone, '[^0-9]', '', 'g') = $2
          OR regexp_replace(phone, '[^0-9]', '', 'g') = $3
       LIMIT 1`,
      [clean, normalizedPhone, `91${normalizedPhone}`]
    );
    if (databaseUsers !== null) {
      return databaseUsers[0] ? mapUserRow(databaseUsers[0]) : null;
    }

    return this.users.find((u) =>
      (u.phone && u.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') === normalizedPhone && normalizedPhone.length === 10) ||
      (u.username && u.username.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean)
    ) || null;
  }

  public async getUserById(id: string): Promise<DbUser | null> {
    const databaseUsers = await executeQuery<UserRow>(
      `SELECT id, email, phone, username, password_hash, full_name, role, status,
              avatar_url, created_at, updated_at, last_login_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (databaseUsers !== null) {
      return databaseUsers[0] ? mapUserRow(databaseUsers[0]) : null;
    }

    return this.users.find((u) => u.id === id) || null;
  }

  public async saveUser(user: DbUser): Promise<DbUser> {
    const databaseUsers = await executeQuery<UserRow>(
      `INSERT INTO users (
         id, email, phone, username, password_hash, full_name, role, status,
         avatar_url, created_at, updated_at, last_login_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         status = EXCLUDED.status,
         avatar_url = EXCLUDED.avatar_url,
         updated_at = EXCLUDED.updated_at,
         last_login_at = EXCLUDED.last_login_at
       RETURNING id, email, phone, username, password_hash, full_name, role, status,
                 avatar_url, created_at, updated_at, last_login_at`,
      [
        user.id,
        user.email || null,
        user.phone || null,
        user.username || null,
        user.passwordHash || null,
        user.fullName,
        user.role,
        user.status,
        user.avatarUrl || null,
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt || null,
      ]
    );
    if (databaseUsers !== null) {
      if (!databaseUsers[0]) throw new Error('Database did not return the saved user.');
      return mapUserRow(databaseUsers[0]);
    }

    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user, updatedAt: new Date().toISOString() };
      return this.users[existingIndex];
    }
    this.users.push(user);
    return user;
  }

  public async getAllUsers(): Promise<DbUser[]> {
    const databaseUsers = await executeQuery<UserRow>(
      `SELECT id, email, phone, username, password_hash, full_name, role, status,
              avatar_url, created_at, updated_at, last_login_at
       FROM users ORDER BY created_at DESC`
    );
    return databaseUsers === null ? [...this.users] : databaseUsers.map(mapUserRow);
  }

  public async updateUserStatus(id: string, status: DbUser['status']): Promise<DbUser | null> {
    const databaseUsers = await executeQuery<UserRow>(
      `UPDATE users SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, phone, username, password_hash, full_name, role, status,
                 avatar_url, created_at, updated_at, last_login_at`,
      [id, status]
    );
    if (databaseUsers !== null) {
      return databaseUsers[0] ? mapUserRow(databaseUsers[0]) : null;
    }
    const user = this.users.find((item) => item.id === id);
    if (!user) return null;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  // ================= FACILITIES & POSTGIS PROXIMITY =================
  public async getFacilities(category?: string): Promise<DbFacility[]> {
    const databaseFacilities = await executeQuery<FacilityRow>(
      `SELECT id, name, name_en, category, latitude, longitude, address, description, phone,
              is_verified, is_active, is_archived, metadata, created_at, updated_at
       FROM facilities
       WHERE is_active = true AND is_archived = false AND is_verified = true
         AND ($1::facility_category IS NULL OR category = $1::facility_category)
       ORDER BY name`,
      [category || null]
    );
    if (databaseFacilities !== null) {
      return databaseFacilities.map(mapFacilityRow);
    }
    return [];
  }

  public async getFacilityById(id: string): Promise<DbFacility | null> {
    const databaseFacilities = await executeQuery<FacilityRow>(
      `SELECT id, name, name_en, category, latitude, longitude, address, description, phone,
              is_verified, is_active, is_archived, metadata, created_at, updated_at
       FROM facilities WHERE id = $1 AND is_active = true AND is_archived = false AND is_verified = true`,
      [id]
    );
    if (databaseFacilities !== null) {
      return databaseFacilities[0] ? mapFacilityRow(databaseFacilities[0]) : null;
    }
    return null;
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
    const databaseFacilities = await executeQuery<FacilityRow & { distance_meters: number }>(
      `SELECT id, name, name_en, category, latitude, longitude, address, description, phone,
              is_verified, is_active, is_archived, metadata, created_at, updated_at,
              ST_Distance(
                location::geography,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
              ) AS distance_meters
       FROM facilities
       WHERE is_active = true AND is_archived = false AND is_verified = true
         AND ($4::facility_category IS NULL OR category = $4::facility_category)
         AND ST_DWithin(
               location::geography,
               ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
               $3
             )
       ORDER BY distance_meters`,
      [lat, lon, radiusMeters, category || null]
    );
    if (databaseFacilities !== null) {
      return databaseFacilities.map((row) => ({
        ...mapFacilityRow(row),
        distanceMeters: Number(row.distance_meters),
      }));
    }
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
    const databaseFacilities = await executeQuery<FacilityRow>(
      `INSERT INTO facilities (
         id, name, name_en, category, latitude, longitude, location, address, description,
         phone, is_verified, is_active, is_archived, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($6, $5), 4326),
         $7, $8, $9, $10, $11, $12, $13, $14, $15
       )
       RETURNING id, name, name_en, category, latitude, longitude, address, description, phone,
                 is_verified, is_active, is_archived, metadata, created_at, updated_at`,
      [
        facility.id, facility.name, facility.nameEn || null, facility.category,
        facility.latitude, facility.longitude, facility.address || null,
        facility.description || null, facility.phone || null, facility.isVerified,
        facility.isActive, facility.isArchived, facility.metadata || {},
        facility.createdAt, facility.updatedAt,
      ]
    );
    if (databaseFacilities !== null) {
      if (!databaseFacilities[0]) throw new Error('Database did not return the created facility.');
      return mapFacilityRow(databaseFacilities[0]);
    }
    this.facilities.push(facility);
    return facility;
  }

  public async updateFacility(id: string, updates: Partial<DbFacility>): Promise<DbFacility | null> {
    const columns: Partial<Record<keyof DbFacility, string>> = {
      name: 'name',
      nameEn: 'name_en',
      category: 'category',
      latitude: 'latitude',
      longitude: 'longitude',
      address: 'address',
      description: 'description',
      phone: 'phone',
      isVerified: 'is_verified',
      isActive: 'is_active',
      isArchived: 'is_archived',
      metadata: 'metadata',
    };
    const values: unknown[] = [id];
    const assignments: string[] = [];
    for (const [key, column] of Object.entries(columns) as [keyof DbFacility, string][]) {
      const value = updates[key];
      if (value === undefined) continue;
      values.push(key === 'metadata' ? JSON.stringify(value) : value);
      assignments.push(`${column} = $${values.length}${key === 'metadata' ? '::jsonb' : ''}`);
    }
    if (updates.latitude !== undefined || updates.longitude !== undefined) {
      values.push(updates.longitude ?? null, updates.latitude ?? null);
      const longitudeIndex = values.length - 1;
      const latitudeIndex = values.length;
      assignments.push(
        `location = ST_SetSRID(ST_MakePoint(COALESCE($${longitudeIndex}, longitude), COALESCE($${latitudeIndex}, latitude)), 4326)`
      );
    }
    if (assignments.length > 0) {
      assignments.push('updated_at = NOW()');
      const databaseFacilities = await executeQuery<FacilityRow>(
        `UPDATE facilities SET ${assignments.join(', ')} WHERE id = $1
         RETURNING id, name, name_en, category, latitude, longitude, address, description,
                   phone, is_verified, is_active, is_archived, metadata, created_at, updated_at`,
        values
      );
      if (databaseFacilities !== null) {
        return databaseFacilities[0] ? mapFacilityRow(databaseFacilities[0]) : null;
      }
    }
    const index = this.facilities.findIndex((f) => f.id === id);
    if (index === -1) return null;
    this.facilities[index] = { ...this.facilities[index], ...updates, updatedAt: new Date().toISOString() };
    return this.facilities[index];
  }

  // ================= PARKING =================
  public async getParkings(): Promise<DbParking[]> {
    const rows = await executeQuery<ParkingRow>(
      `SELECT p.id, p.facility_id, p.name, p.total_capacity, p.available_capacity,
              p.capacity_display, p.vehicle_types, p.status, p.is_verified, p.is_active,
              f.latitude, f.longitude, f.address, p.updated_at
       FROM parkings p
       JOIN facilities f ON f.id = p.facility_id
       WHERE p.is_active = true AND p.is_verified = true
         AND f.is_active = true AND f.is_archived = false AND f.is_verified = true
       ORDER BY p.name`
    );
    return rows === null ? [] : rows.map((row) => ({
      id: row.id,
      facilityId: row.facility_id,
      name: row.name,
      totalCapacity: row.total_capacity === null ? undefined : Number(row.total_capacity),
      availableCapacity: row.available_capacity === null ? undefined : Number(row.available_capacity),
      capacityDisplay: row.capacity_display || undefined,
      vehicleTypes: row.vehicle_types || [],
      status: row.status,
      isVerified: row.is_verified,
      isActive: row.is_active,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      address: row.address || undefined,
      updatedAt: new Date(row.updated_at).toISOString(),
    }));
  }

  public async updateParkingStatus(
    id: string,
    status: DbParking['status'],
    availableCapacity?: number
  ): Promise<DbParking | null> {
    const rows = await executeQuery<ParkingRow>(
      `UPDATE parkings p SET status = $2,
          available_capacity = COALESCE($3, p.available_capacity),
          capacity_display = CASE WHEN $3 IS NULL THEN p.capacity_display
            ELSE $3::text || ' / ' || COALESCE(p.total_capacity::text, '?') || ' स्थान रिक्त' END,
          updated_at = NOW()
       FROM facilities f
       WHERE p.id = $1 AND p.facility_id = f.id
       RETURNING p.id, p.facility_id, p.name, p.total_capacity, p.available_capacity,
                 p.capacity_display, p.vehicle_types, p.status, p.is_verified, p.is_active,
                 f.latitude, f.longitude, f.address, p.updated_at`,
      [id, status, availableCapacity ?? null]
    );
    const row = rows?.[0];
    if (!row) return null;
    return {
      id: row.id,
      facilityId: row.facility_id,
      name: row.name,
      totalCapacity: row.total_capacity === null ? undefined : Number(row.total_capacity),
      availableCapacity: row.available_capacity === null ? undefined : Number(row.available_capacity),
      capacityDisplay: row.capacity_display || undefined,
      vehicleTypes: row.vehicle_types || [],
      status: row.status,
      isVerified: row.is_verified,
      isActive: row.is_active,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      address: row.address || undefined,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  // ================= SHUTTLE =================
  public async getShuttleRoutes(): Promise<DbShuttleRoute[]> {
    return [];
  }

  // ================= VOLUNTEERS =================
  public async getVolunteers(
    onDutyOnly: boolean = false,
    verifiedOnly: boolean = false
  ): Promise<DbVolunteer[]> {
    const databaseVolunteers = await executeQuery<VolunteerRow>(
      `SELECT id, user_id, badge_number, full_name, phone, gender, age, status,
              service_areas, services_offered, languages, availability_time,
              current_assigned_zone, is_on_duty,
              verified_by, verified_at, created_at, updated_at
       FROM volunteers
       WHERE ($1::boolean = false OR (is_on_duty = true AND status = 'VERIFIED'))
         AND ($2::boolean = false OR status = 'VERIFIED')
       ORDER BY created_at DESC`,
      [onDutyOnly, verifiedOnly]
    );
    if (databaseVolunteers !== null) {
      return databaseVolunteers.map(mapVolunteerRow);
    }
    return [];
  }

  public async createVolunteer(volunteer: DbVolunteer): Promise<DbVolunteer> {
    const databaseVolunteers = await executeQuery<VolunteerRow>(
      `INSERT INTO volunteers (
         id, user_id, badge_number, full_name, phone, gender, age, status, service_areas,
         services_offered, languages, availability_time, current_assigned_zone, is_on_duty,
         verified_by, verified_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id, user_id, badge_number, full_name, phone, gender, age, status,
         service_areas, services_offered, languages, availability_time, current_assigned_zone,
         is_on_duty, verified_by, verified_at, created_at, updated_at`,
      [
        volunteer.id, volunteer.userId || null, volunteer.badgeNumber, volunteer.fullName,
        volunteer.phone, volunteer.gender || null, volunteer.age ?? null, volunteer.status,
        volunteer.serviceAreas, volunteer.servicesOffered, volunteer.languages,
        volunteer.availabilityTime || null, volunteer.currentAssignedZone, volunteer.isOnDuty,
        volunteer.verifiedBy || null, volunteer.verifiedAt || null, volunteer.createdAt,
        volunteer.updatedAt,
      ]
    );
    if (databaseVolunteers !== null) {
      if (!databaseVolunteers[0]) throw new Error('Database did not return the created volunteer.');
      return mapVolunteerRow(databaseVolunteers[0]);
    }
    this.volunteers.unshift(volunteer);
    return volunteer;
  }

  public async updateVolunteerStatus(
    id: string,
    status: DbVolunteer['status'],
    verifiedBy?: string
  ): Promise<DbVolunteer | null> {
    const databaseVolunteers = await executeQuery<VolunteerRow>(
      `UPDATE volunteers
       SET status = $2, verified_by = $3,
           verified_at = CASE WHEN $2 = 'VERIFIED' THEN NOW() ELSE NULL END,
           is_on_duty = CASE WHEN $2 = 'VERIFIED' THEN is_on_duty ELSE false END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id, badge_number, full_name, phone, gender, age, status,
         service_areas, services_offered, languages, availability_time, current_assigned_zone,
         is_on_duty, verified_by, verified_at, created_at, updated_at`,
      [id, status, verifiedBy || null]
    );
    if (databaseVolunteers !== null) {
      return databaseVolunteers[0] ? mapVolunteerRow(databaseVolunteers[0]) : null;
    }
    const volunteer = this.volunteers.find((item) => item.id === id);
    if (!volunteer) return null;
    volunteer.status = status;
    volunteer.verifiedBy = verifiedBy;
    volunteer.verifiedAt = status === 'VERIFIED' ? new Date().toISOString() : undefined;
    if (status !== 'VERIFIED') volunteer.isOnDuty = false;
    volunteer.updatedAt = new Date().toISOString();
    return volunteer;
  }

  public async toggleVolunteerDuty(id: string, isOnDuty: boolean): Promise<DbVolunteer | null> {
    const databaseVolunteers = await executeQuery<VolunteerRow>(
      `UPDATE volunteers SET is_on_duty = $2, updated_at = NOW()
       WHERE id = $1 RETURNING id, user_id, badge_number, full_name, phone, gender, age,
         status, service_areas, services_offered, languages, availability_time,
         current_assigned_zone, is_on_duty, verified_by, verified_at, created_at, updated_at`,
      [id, isOnDuty]
    );
    if (databaseVolunteers !== null) {
      return databaseVolunteers[0] ? mapVolunteerRow(databaseVolunteers[0]) : null;
    }
    const volunteer = this.volunteers.find((v) => v.id === id);
    if (!volunteer) return null;
    volunteer.isOnDuty = isOnDuty;
    volunteer.updatedAt = new Date().toISOString();
    return volunteer;
  }

  // ================= HELP REQUESTS =================
  public async getHelpRequests(status?: string): Promise<DbHelpRequest[]> {
    const databaseRequests = await executeQuery<HelpRequestRow>(
      `SELECT id, request_number, type, description, user_name, user_phone, latitude, longitude,
              status, priority, assigned_volunteer_id, assigned_at, resolved_at, resolution_notes,
              created_at, updated_at
       FROM help_requests
       WHERE ($1::help_request_status IS NULL OR status = $1::help_request_status)
       ORDER BY created_at DESC`,
      [status || null]
    );
    if (databaseRequests !== null) {
      return databaseRequests.map(mapHelpRequestRow);
    }
    if (status) {
      return this.helpRequests.filter((h) => h.status === status);
    }
    return [...this.helpRequests];
  }

  public async createHelpRequest(req: DbHelpRequest): Promise<DbHelpRequest> {
    const databaseRequests = await executeQuery<HelpRequestRow>(
      `INSERT INTO help_requests (
         id, request_number, type, description, user_name, user_phone, latitude, longitude, location,
         status, priority, assigned_volunteer_id, assigned_at, resolved_at, resolution_notes,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8,
         CASE WHEN $7 IS NULL OR $8 IS NULL THEN NULL
              ELSE ST_SetSRID(ST_MakePoint($8, $7), 4326) END,
         $9, $10, $11, $12, $13, $14, $15, $16
       )
       RETURNING id, request_number, type, description, user_name, user_phone, latitude, longitude,
         status, priority, assigned_volunteer_id, assigned_at, resolved_at, resolution_notes,
         created_at, updated_at`,
      [
        req.id, req.requestNumber, req.type, req.description, req.userName || null,
        req.userPhone || null, req.latitude ?? null, req.longitude ?? null, req.status,
        req.priority, req.assignedVolunteerId || null, req.assignedAt || null,
        req.resolvedAt || null, req.resolutionNotes || null, req.createdAt, req.updatedAt,
      ]
    );
    if (databaseRequests !== null) {
      if (!databaseRequests[0]) throw new Error('Database did not return the created help request.');
      return mapHelpRequestRow(databaseRequests[0]);
    }
    this.helpRequests.unshift(req);
    return req;
  }

  public async updateHelpRequestStatus(
    id: string,
    status: DbHelpRequest['status'],
    notes?: string,
    assignedVolunteerId?: string
  ): Promise<DbHelpRequest | null> {
    const databaseRequests = await executeQuery<HelpRequestRow>(
      `UPDATE help_requests
       SET status = $2, resolution_notes = COALESCE($3, resolution_notes),
           assigned_volunteer_id = COALESCE($4, assigned_volunteer_id),
           assigned_at = CASE WHEN $2 = 'ASSIGNED' AND $4 IS NOT NULL THEN NOW() ELSE assigned_at END,
           resolved_at = CASE WHEN $2 = 'RESOLVED' THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $1
         AND ($2::help_request_status <> 'ASSIGNED'
              OR assigned_volunteer_id IS NULL
              OR assigned_volunteer_id = $4)
       RETURNING id, request_number, type, description, user_name, user_phone, latitude, longitude,
         status, priority, assigned_volunteer_id, assigned_at, resolved_at, resolution_notes,
         created_at, updated_at`,
      [id, status, notes || null, assignedVolunteerId || null]
    );
    if (databaseRequests !== null) {
      return databaseRequests[0] ? mapHelpRequestRow(databaseRequests[0]) : null;
    }
    const req = this.helpRequests.find((h) => h.id === id);
    if (!req) return null;
    req.status = status;
    if (notes) req.resolutionNotes = notes;
    if (assignedVolunteerId) {
      req.assignedVolunteerId = assignedVolunteerId;
      req.assignedAt = new Date().toISOString();
    }
    if (status === 'RESOLVED') req.resolvedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();
    return req;
  }

  public async releaseHelpRequest(id: string, volunteerId: string): Promise<DbHelpRequest | null> {
    const databaseRequests = await executeQuery<HelpRequestRow>(
      `UPDATE help_requests
       SET status = 'RECEIVED', assigned_volunteer_id = NULL, assigned_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND assigned_volunteer_id = $2
       RETURNING id, request_number, type, description, user_name, user_phone, latitude, longitude,
         status, priority, assigned_volunteer_id, assigned_at, resolved_at, resolution_notes,
         created_at, updated_at`,
      [id, volunteerId]
    );
    if (databaseRequests !== null) {
      return databaseRequests[0] ? mapHelpRequestRow(databaseRequests[0]) : null;
    }
    const request = this.helpRequests.find(
      (item) => item.id === id && item.assignedVolunteerId === volunteerId
    );
    if (!request) return null;
    request.status = 'RECEIVED';
    request.assignedVolunteerId = undefined;
    request.assignedAt = undefined;
    request.updatedAt = new Date().toISOString();
    return request;
  }

  // ================= ANNOUNCEMENTS & ROUTE ALERTS =================
  public async getAnnouncements(activeOnly: boolean = true): Promise<DbAnnouncement[]> {
    const databaseAnnouncements = await executeQuery<AnnouncementRow>(
      `SELECT a.id, a.title, a.short_description, a.details, a.category, a.priority, a.status,
              a.is_verified_official, a.source, a.published_at, a.expires_at, a.created_by,
              CASE WHEN r.id IS NULL THEN NULL ELSE json_build_object(
                'id', r.id, 'announcementId', r.announcement_id, 'type', r.type, 'title', r.title,
                'roadName', r.road_name, 'reason', r.reason, 'affectedArea', r.affected_area,
                'latitude', r.latitude, 'longitude', r.longitude, 'radiusMeters', r.radius_meters,
                'startTime', r.start_time, 'endTime', r.end_time,
                'alternativeRouteAvailable', r.alternative_route_available,
                'alternativeRouteAdvice', r.alternative_route_advice,
                'isActive', r.is_active, 'isVerified', r.is_verified
              ) END AS route_alert
       FROM announcements a
       LEFT JOIN route_alerts r ON r.announcement_id = a.id
       WHERE ($1::boolean = false OR (a.status = 'PUBLISHED' AND a.is_verified_official = true
         AND a.source <> '' AND a.source NOT ILIKE '%demo%' AND a.source NOT ILIKE '%sample%'
         AND a.source NOT ILIKE '%test%' AND a.published_at <= NOW()
         AND a.expires_at IS NOT NULL AND a.expires_at > NOW()))
       ORDER BY a.published_at DESC`,
      [activeOnly]
    );
    if (databaseAnnouncements !== null) {
      return databaseAnnouncements.map(mapAnnouncementRow);
    }
    if (activeOnly) {
      return [];
    }
    return [];
  }

  public async createAnnouncement(announcement: DbAnnouncement): Promise<DbAnnouncement> {
    const databaseAnnouncements = await executeQuery<AnnouncementRow>(
      `INSERT INTO announcements (
         id, title, short_description, details, category, priority, status,
         is_verified_official, source, published_at, expires_at, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, title, short_description, details, category, priority, status,
         is_verified_official, source, published_at, expires_at, created_by, NULL::json AS route_alert`,
      [
        announcement.id, announcement.title, announcement.shortDescription,
        announcement.details || null, announcement.category, announcement.priority,
        announcement.status, announcement.isVerifiedOfficial, announcement.source,
        announcement.publishedAt, announcement.expiresAt || null, announcement.createdBy || null,
      ]
    );
    if (databaseAnnouncements !== null) {
      if (!databaseAnnouncements[0]) throw new Error('Database did not return the created announcement.');
      return mapAnnouncementRow(databaseAnnouncements[0]);
    }
    this.announcements.unshift(announcement);
    return announcement;
  }

  public async updateAnnouncementStatus(
    id: string,
    status: DbAnnouncement['status']
  ): Promise<DbAnnouncement | null> {
    const databaseAnnouncements = await executeQuery<AnnouncementRow>(
      `UPDATE announcements SET status = $2, updated_at = NOW(),
         published_at = CASE WHEN $2 = 'PUBLISHED' THEN NOW() ELSE published_at END
       WHERE id = $1
       RETURNING id, title, short_description, details, category, priority, status,
         is_verified_official, source, published_at, expires_at, created_by, NULL::json AS route_alert`,
      [id, status]
    );
    if (databaseAnnouncements !== null) {
      return databaseAnnouncements[0] ? mapAnnouncementRow(databaseAnnouncements[0]) : null;
    }
    const announcement = this.announcements.find((item) => item.id === id);
    if (!announcement) return null;
    announcement.status = status;
    if (status === 'PUBLISHED') announcement.publishedAt = new Date().toISOString();
    return announcement;
  }

  public async toggleRouteAlert(id: string, isActive: boolean): Promise<DbRouteAlert | null> {
    const databaseAlerts = await executeQuery<DbRouteAlert>(
      `UPDATE route_alerts SET is_active = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, announcement_id AS "announcementId", type, title,
         road_name AS "roadName", reason, affected_area AS "affectedArea",
         latitude, longitude, radius_meters AS "radiusMeters", start_time AS "startTime",
         end_time AS "endTime", alternative_route_available AS "alternativeRouteAvailable",
         alternative_route_advice AS "alternativeRouteAdvice", is_active AS "isActive",
         is_verified AS "isVerified"`,
      [id, isActive]
    );
    if (databaseAlerts !== null) {
      return databaseAlerts[0] || null;
    }
    for (const announcement of this.announcements) {
      if (announcement.routeAlert?.id === id) {
        announcement.routeAlert.isActive = isActive;
        return announcement.routeAlert;
      }
    }
    return null;
  }

  public async getRouteAlerts(): Promise<DbRouteAlert[]> {
    const databaseAlerts = await executeQuery<DbRouteAlert>(
      `SELECT r.id, r.announcement_id AS "announcementId", r.type, r.title,
              r.road_name AS "roadName", r.reason, r.affected_area AS "affectedArea",
              r.latitude, r.longitude, r.radius_meters AS "radiusMeters",
              r.start_time AS "startTime", r.end_time AS "endTime",
              r.alternative_route_available AS "alternativeRouteAvailable",
              r.alternative_route_advice AS "alternativeRouteAdvice",
              r.is_active AS "isActive", r.is_verified AS "isVerified"
       FROM route_alerts r
       JOIN announcements a ON a.id = r.announcement_id
       WHERE r.is_active = true AND r.is_verified = true
         AND a.status = 'PUBLISHED' AND a.is_verified_official = true
         AND a.source <> '' AND a.source NOT ILIKE '%demo%' AND a.source NOT ILIKE '%sample%'
         AND a.source NOT ILIKE '%test%'
         AND a.published_at <= NOW() AND a.expires_at IS NOT NULL AND a.expires_at > NOW()
       ORDER BY r.created_at DESC`
    );
    if (databaseAlerts !== null) {
      return databaseAlerts;
    }
    return [];
  }

  // ================= LOST & FOUND =================
  public async getLostFoundReports(type?: string): Promise<DbLostFoundReport[]> {
    const rows = await executeQuery<LostFoundRow>(
      `SELECT id, report_id, type, category, title, description, location_name,
              latitude, longitude, identifying_features, contact_name, contact_phone,
              photo_url, status, is_flagged_misuse, created_at, updated_at
       FROM lost_found_reports
       WHERE is_flagged_misuse = false AND ($1::lost_found_type IS NULL OR type = $1)
       ORDER BY created_at DESC`,
      [type || null]
    );
    if (!rows) return [];
    return rows.map((row) => ({
      id: row.id,
      reportId: row.report_id,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      locationName: row.location_name || '',
      latitude: row.latitude === null ? undefined : Number(row.latitude),
      longitude: row.longitude === null ? undefined : Number(row.longitude),
      identifyingFeatures: row.identifying_features || undefined,
      contactName: row.contact_name || '',
      contactPhone: row.contact_phone || '',
      photoUrl: row.photo_url || undefined,
      status: row.status,
      isFlaggedMisuse: row.is_flagged_misuse,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }));
  }

  public async createLostFoundReport(report: DbLostFoundReport): Promise<DbLostFoundReport> {
    const rows = await executeQuery<LostFoundRow>(
      `INSERT INTO lost_found_reports (
         id, report_id, type, category, title, description, location_name,
         latitude, longitude, location, identifying_features, contact_name,
         contact_phone, photo_url, status, is_flagged_misuse, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         CASE WHEN $8::double precision IS NULL OR $9::double precision IS NULL
           THEN NULL ELSE ST_SetSRID(ST_MakePoint($9, $8), 4326) END,
         $10, $11, $12, $13, $14, $15, $16, $17
       )
       RETURNING id, report_id, type, category, title, description, location_name,
         latitude, longitude, identifying_features, contact_name, contact_phone,
         photo_url, status, is_flagged_misuse, created_at, updated_at`,
      [
        report.id, report.reportId, report.type, report.category, report.title,
        report.description, report.locationName, report.latitude ?? null, report.longitude ?? null,
        report.identifyingFeatures || null, report.contactName, report.contactPhone || null,
        report.photoUrl || null, report.status, report.isFlaggedMisuse, report.createdAt, report.updatedAt,
      ]
    );
    const row = rows?.[0];
    if (!row) throw new Error('Database did not return the created lost-and-found report.');
    return {
      id: row.id,
      reportId: row.report_id,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      locationName: row.location_name || '',
      latitude: row.latitude === null ? undefined : Number(row.latitude),
      longitude: row.longitude === null ? undefined : Number(row.longitude),
      identifyingFeatures: row.identifying_features || undefined,
      contactName: row.contact_name || '',
      contactPhone: row.contact_phone || '',
      photoUrl: row.photo_url || undefined,
      status: row.status,
      isFlaggedMisuse: row.is_flagged_misuse,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  public async updateLostFoundStatus(
    id: string,
    status: DbLostFoundReport['status']
  ): Promise<DbLostFoundReport | null> {
    const rows = await executeQuery<LostFoundRow>(
      `UPDATE lost_found_reports SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, report_id, type, category, title, description, location_name,
         latitude, longitude, identifying_features, contact_name, contact_phone,
         photo_url, status, is_flagged_misuse, created_at, updated_at`,
      [id, status]
    );
    const row = rows?.[0];
    if (!row) return null;
    return {
      id: row.id,
      reportId: row.report_id,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      locationName: row.location_name || '',
      latitude: row.latitude === null ? undefined : Number(row.latitude),
      longitude: row.longitude === null ? undefined : Number(row.longitude),
      identifyingFeatures: row.identifying_features || undefined,
      contactName: row.contact_name || '',
      contactPhone: row.contact_phone || '',
      photoUrl: row.photo_url || undefined,
      status: row.status,
      isFlaggedMisuse: row.is_flagged_misuse,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
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
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const databaseLogs = await executeQuery(
      `INSERT INTO audit_logs (id, user_id, user_name, action, entity, entity_id,
         old_value_summary, new_value_summary, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        fullLog.id, fullLog.userId || null, fullLog.userName || null, fullLog.action,
        fullLog.entity, fullLog.entityId || null, fullLog.oldValueSummary || null,
        fullLog.newValueSummary || null, fullLog.ipAddress || null, fullLog.createdAt,
      ]
    );
    if (databaseLogs !== null) return fullLog;
    this.auditLogs.unshift(fullLog);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return fullLog;
  }

  public async getAuditLogs(): Promise<DbAuditLog[]> {
    const databaseLogs = await executeQuery<{
      id: string;
      user_id: string | null;
      user_name: string | null;
      action: string;
      entity: string;
      entity_id: string | null;
      old_value_summary: string | null;
      new_value_summary: string | null;
      ip_address: string | null;
      created_at: Date | string;
    }>(
      `SELECT id, user_id, user_name, action, entity, entity_id, old_value_summary,
              new_value_summary, ip_address, created_at
       FROM audit_logs ORDER BY created_at DESC LIMIT 500`
    );
    if (databaseLogs !== null) {
      return databaseLogs.map((row) => ({
        id: row.id,
        userId: row.user_id || undefined,
        userName: row.user_name || undefined,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id || undefined,
        oldValueSummary: row.old_value_summary || undefined,
        newValueSummary: row.new_value_summary || undefined,
        ipAddress: row.ip_address || undefined,
        createdAt: new Date(row.created_at).toISOString(),
      }));
    }
    return [...this.auditLogs];
  }

  // ================= FESTIVAL CONFIGURATION =================
}

export const repository = new DataRepository();
