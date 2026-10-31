export type ScreenId =
  | 'splash'
  | 'language'
  | 'location-permission'
  | 'offline-map'
  | 'home'
  | 'search'
  | 'map'
  | 'navigation-preview'
  | 'navigation'
  | 'parking'
  | 'save-parking'
  | 'my-parking'
  | 'shuttle'
  | 'medical'
  | 'toilet'
  | 'water'
  | 'help'
  | 'emergency'
  | 'family'
  | 'lost-found'
  | 'volunteer'
  | 'volunteer-register'
  | 'volunteer-mode'
  | 'volunteer-request'
  | 'senior-mode'
  | 'announcements'
  | 'about'
  | 'team'
  | 'settings'
  | 'more'
  | 'login'
  | 'profile'
  | 'session-expired'
  | 'offline'
  | 'error'
  | 'chhath-katha'
  | 'prasad-camps'
  | 'admin-login'
  | 'admin-dashboard';

export type LanguageCode = 'hi' | 'bho' | 'mag' | 'en';

export type LocationCategory =
  | 'temple'
  | 'kund'
  | 'parking'
  | 'medical'
  | 'toilet'
  | 'water'
  | 'help'
  | 'shuttle'
  | 'other';

export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'permission-denied'
  | 'unavailable'
  | 'timeout'
  | 'low-accuracy';

export type TravelMode = 'WALKING' | 'DRIVING';

export interface RouteStep {
  id: string;
  instruction: string;
  originalInstruction?: string;
  maneuverType: string;
  modifier?: string;
  distanceMeters: number;
  durationSeconds: number;
  location: [number, number]; // [lat, lng]
}

export interface RouteResult {
  id: string;
  start: [number, number];
  destination: [number, number];
  destinationName: string;
  distanceMeters: number;
  distanceDisplay: string;
  durationSeconds: number;
  durationDisplay: string;
  geometry: [number, number][]; // [lat, lng]
  steps: RouteStep[];
  travelMode: TravelMode;
  provider: string;
  calculatedAt: number;
  warning?: string;
}

export interface NavigationState {
  active: boolean;
  route: RouteResult | null;
  currentStepIndex: number;
  remainingDistanceMeters: number;
  remainingDurationSeconds: number;
  isOffRoute: boolean;
  isDestinationReached: boolean;
  isMuted: boolean;
  isPaused: boolean;
  lastRecalculatedAt?: number;
}

export interface LocationItem {
  id: string;
  name: string;
  nameEn: string;
  category: LocationCategory;
  distance: string;
  walkingTime: string;
  crowdLevel?: 'कम' | 'मध्यम' | 'अधिक';
  description: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  status?: 'सक्रिय' | 'स्थान सीमित' | 'भीड़' | 'खुला है' | 'सेवा जारी';
  isDemo?: boolean;
  x: number; // percentage coordinates for vector map canvas (0-100)
  y: number; // percentage coordinates for vector map canvas (0-100)
  isWheelchairAccessible?: boolean;
}

export type ParkingStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED' | 'UNKNOWN';

export interface ParkingLocation {
  id: string;
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  description: string;
  capacity?: string;
  status: ParkingStatus;
  isDemo: boolean;
  updatedAt: string;
  isActive: boolean;
  landmark: string;
  vehicleTypes: ('twoWheeler' | 'fourWheeler' | 'bus')[];
}

export interface SavedParking {
  parkingId: string;
  parkingName: string;
  latitude: number;
  longitude: number;
  savedAt: string;
  note?: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  nameHi: string;
  location: string;
  distance: string;
  walkingTime: string;
  vehicleTypes: ('twoWheeler' | 'fourWheeler' | 'bus')[];
  statusDemo: 'स्थान उपलब्ध' | 'लगभग भरा हुआ' | 'स्थान सीमित';
  capacityDemo: string;
  landmark: string;
  x: number;
  y: number;
}

export interface SavedParkingData {
  parkingId: string;
  parkingName: string;
  pillarOrSlot: string;
  vehicleNumber: string;
  notes: string;
  savedAt: string;
}

export type FacilityCategory =
  | 'SHUTTLE'
  | 'MEDICAL'
  | 'TOILET'
  | 'WATER'
  | 'PARKING'
  | 'HELP'
  | 'RELIGIOUS'
  | 'POLICE'
  | 'ENTRY_GATE'
  | 'EXIT_GATE'
  | 'PEDESTRIAN'
  | 'VEHICLE'
  | 'RESTRICTED'
  | 'EMERGENCY'
  | 'LOST_FOUND';

export type FacilitySource = 'ADMIN_VERIFIED' | 'DISTRICT_ADMINISTRATION' | 'DEMO_DATA';

export interface Facility {
  id: string;
  name: string;
  nameEn?: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  verified: boolean;
  active: boolean;
  phone?: string;
  accessibility?: boolean;
  lastUpdated?: string;
  source: FacilitySource;
  // Specific attributes per facility category
  shuttleType?: 'PICKUP' | 'DROP' | 'BOTH';
  routeId?: string;
  medicalSubType?: 'FIRST_AID' | 'HOSPITAL' | 'AMBULANCE_POINT' | 'MEDICAL_CAMP';
  toiletGender?: 'MALE' | 'FEMALE' | 'ALL' | 'ACCESSIBLE';
  waterType?: 'DRINKING_WATER' | 'WATER_TANKER' | 'SEVA_CAMP';
}

export interface MapFacility {
  id: string;
  name: string;
  nameEn?: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  description: string;
  landmark?: string;
  accessibilityInfo?: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'DEMO';
  lastUpdated: string;
  source: string;
}

export interface ShuttlePoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'PICKUP' | 'DROP' | 'BOTH';
  routeId: string;
  verified: boolean;
  active: boolean;
  lastUpdated: string;
  routeName?: string;
  from?: string;
  to?: string;
  stops?: string[];
  frequency?: string;
  timing?: string;
  fare?: string;
  priorityNote?: string;
  contactNumber?: string;
}

export interface ShuttleRoute {
  id: string;
  name: string;
  stops: string[];
  verified: boolean;
  active: boolean;
  schedule?: string;
  lastUpdated: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  type: 'medical' | 'toilet' | 'water';
  distance: string;
  locationDescription: string;
  openHours: string;
  features: string[];
  isEmergencyReady?: boolean;
  contact?: string;
  x: number;
  y: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  age: string;
  lastKnownLocation?: string;
  notes?: string;
}

export interface LostPersonReport {
  id: string;
  name: string;
  age: string;
  gender: string;
  clothesDescription: string;
  lastSeenTime: string;
  lastSeenLocation: string;
  guardianName: string;
  contactPhone: string;
  status: 'खोज जारी' | 'मिल गए हैं';
  dateReported: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'अर्घ्य समय' | 'सुरक्षा' | 'यातायात' | 'सेवा';
  isImportant: boolean;
  content: string;
  source: string;
}

export interface VolunteerRequest {
  id: string;
  requesterName: string;
  phone: string;
  serviceNeeded: 'wheelchair' | 'elderly-assist' | 'lost-help' | 'stretcher' | 'general';
  location: string;
  status: 'स्वीकृत' | 'सहायक रवाना' | 'पूर्ण';
  timestamp: string;
}

export type HelpPointCategory =
  | 'POLICE'
  | 'MEDICAL'
  | 'WOMEN_HELP'
  | 'SENIOR_HELP'
  | 'CONTROL_ROOM'
  | 'VOLUNTEER_DESK';

export interface HelpPoint {
  id: string;
  name: string;
  nameEn?: string;
  category: HelpPointCategory;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  description: string;
  verified: boolean;
  active: boolean;
  lastUpdated: string;
  source: 'DISTRICT_ADMINISTRATION' | 'ADMIN_VERIFIED' | 'DEMO_DATA';
}

export type HelpRequestStatus =
  | 'प्राप्त'
  | 'देखा गया'
  | 'स्वयंसेवक assigned'
  | 'सहायता जारी'
  | 'समाधान किया गया'
  | 'ESCALATED'
  | 'रद्द किया गया';

export interface HelpRequest {
  id: string;
  type: string;
  description: string;
  latitude?: number;
  longitude?: number;
  userName?: string;
  userPhone?: string;
  status: HelpRequestStatus;
  createdAt: string;
  updatedAt: string;
  assignedVolunteerId?: string;
  volunteerName?: string;
}

export interface VolunteerProfile {
  id: string;
  name: string;
  volunteerId: string;
  serviceArea: string;
  verified: boolean;
  active: boolean;
  latitude?: number;
  longitude?: number;
  badge?: string;
  phone?: string;
}

export type UserRole = 'USER' | 'VOLUNTEER' | 'ADMIN';

export type VolunteerVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type VolunteerAvailability = 'AVAILABLE' | 'UNAVAILABLE';

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  serviceArea: string;
  services: string[];
  languages: string[];
  availabilityTime?: string;
  verificationStatus: VolunteerVerificationStatus;
  availability: VolunteerAvailability;
  locationSharingEnabled: boolean;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerAssignment {
  id: string;
  requestId: string;
  volunteerId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  updatedAt: string;
  notes?: string;
}

// ==========================================
// STEP 13: FAMILY LOCATION SHARING MODELS
// ==========================================
export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
}

export interface FamilyGroupMember {
  id: string;
  familyGroupId: string;
  userId: string;
  name: string;
  relationship?: string;
  phone?: string;
  role: 'OWNER' | 'MEMBER';
  locationSharingEnabled: boolean;
  sharingExpiresAt?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdatedAt?: string;
  joinedAt: string;
  isDemo?: boolean;
}

export interface FamilyLocationShare {
  id: string;
  familyGroupId: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  createdAt: string;
  expiresAt: string;
}

export interface FamilyAlertItem {
  id: string;
  familyGroupId: string;
  userId?: string;
  senderName: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY' | 'SHARING_CHANGE';
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

// ==========================================
// STEP 14: LOST & FOUND MODELS
// ==========================================
export type LostFoundType = 'LOST_PERSON' | 'FOUND_PERSON' | 'LOST_ITEM' | 'FOUND_ITEM';

export type LostFoundStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MATCH_FOUND'
  | 'VERIFICATION_REQUIRED'
  | 'TRANSFERRED_TO_HELP_POINT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export interface LostFoundReport {
  id: string;
  reportId: string;
  type: LostFoundType;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  createdBy: string;
  contactName?: string;
  contactPhone?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: LostFoundStatus;
  assignedVolunteerId?: string;
  assignedHelpPointId?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  identifyingFeatures?: string;
  isOfflinePending?: boolean;
}

export interface LostFoundMatch {
  id: string;
  reportId: string;
  possibleMatchId: string;
  matchReason: string;
  confidence: number;
  reviewStatus: 'PENDING' | 'APPROVED' | 'DISMISSED';
  reviewedBy?: string;
  createdAt: string;
}

export interface LostFoundHandover {
  id: string;
  reportId: string;
  helpPointId: string;
  helpPointName: string;
  volunteerId?: string;
  volunteerName?: string;
  handoverType: 'PERSON_SAFE_AT_BOOTH' | 'ITEM_DEPOSITED' | 'CLAIMANT_HANDOVER';
  timestamp: string;
  notes: string;
  verifiedBy: string;
}

// ==========================================
// STEP 15: ACCESSIBILITY & VOICE PREFERENCES
// ==========================================
export type FontSizePreference = 'SMALL' | 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
export type VoiceSpeedPreference = 'SLOW' | 'NORMAL' | 'FAST';

export interface AccessibilityPreferences {
  seniorMode: boolean;
  fontSize: FontSizePreference;
  highContrast: boolean;
  voiceAssistance: boolean;
  voiceSpeed: VoiceSpeedPreference;
  largeButtons: boolean;
  reducedAnimation: boolean;
  updatedAt: string;
}

// ==========================================
// STEP 16: OFFICIAL ANNOUNCEMENTS & ROUTE ALERTS
// ==========================================
export type AnnouncementCategory =
  | 'EMERGENCY'     // 🚨 Emergency
  | 'ROUTE'         // 🛣️ Route
  | 'PARKING'       // 🅿️ Parking
  | 'SHUTTLE'       // 🛺 Shuttle
  | 'MEDICAL'       // 🚑 Medical
  | 'HELP'          // 🆘 Help
  | 'GENERAL'       // 📢 General
  | 'CHHATH_INFO'   // 🙏 Chhath Information
  | 'SAFETY';       // ⚠️ Safety

export type AnnouncementPriority =
  | 'NORMAL'
  | 'IMPORTANT'
  | 'URGENT'
  | 'EMERGENCY';

export type RouteAlertType =
  | 'ROUTE_ALERT'   // ⚠️ Route Alert
  | 'ROAD_CLOSURE'  // 🚧 Road Closure
  | 'DIVERSION';    // ↪️ Diversion

export interface RouteAlert {
  id: string;
  announcementId?: string;
  type: RouteAlertType;
  title: string;
  roadName: string;
  reason: string;
  affectedArea: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  startTime: string;
  endTime?: string;
  isVerified: boolean;
  isActive: boolean;
  alternativeRouteAvailable: boolean;
  alternativeRouteAdvice?: string;
  alternativeRouteDestinationId?: string;
  lastUpdated: string;
}

export interface OfficialAnnouncement {
  id: string;
  title: string;
  shortDescription: string;
  details?: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  isVerifiedOfficial: boolean; // Only admin-approved official content
  publishedTime: string;
  lastUpdatedTime: string;
  expiresAt?: string;
  source: string;              // e.g. "जिला प्रशासन औरंगाबाद / मेला नियंत्रण कक्ष"
  badgeText?: string;
  routeAlert?: RouteAlert;     // Attached route closure / diversion info
  facilityImpact?: {
    facilityType?: 'PARKING' | 'SHUTTLE' | 'MEDICAL' | 'HELP';
    facilityId?: string;
    facilityName?: string;
    statusChange?: string;
  };
  isActive: boolean;
}

// ==========================================
// STEP 17: ADMIN DASHBOARD & BACKEND ARCHITECTURE
// ==========================================
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_ADMIN'
  | 'FACILITY_ADMIN'
  | 'HELP_ADMIN';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: string[];
  lastLoginAt?: string;
  token?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  verifiedVolunteers: number;
  activeHelpRequests: number;
  activeLostFound: number;
  parkingLocations: number;
  shuttlePoints: number;
  medicalFacilities: number;
  toilets: number;
  waterPoints: number;
  activeAnnouncements: number;
  isDemoData: boolean;
  lastUpdated: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  oldValueSummary?: string;
  newValueSummary?: string;
  ipAddress?: string;
}

export interface AdminNotification {
  id: string;
  type: 'VOLUNTEER' | 'HELP_REQUEST' | 'LOST_FOUND' | 'FACILITY' | 'SYSTEM';
  title: string;
  message: string;
  entityId?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  timestamp: string;
  isRead: boolean;
}

export type TimeFilterPeriod = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'FESTIVAL_PERIOD' | 'CUSTOM';

// ==========================================
// STEP 18: AUTHENTICATION, SECURITY & USER PROFILE
// ==========================================
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DELETED';

export type AppUserRole =
  | 'USER'
  | 'VOLUNTEER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'CONTENT_ADMIN'
  | 'VOLUNTEER_ADMIN'
  | 'FACILITY_ADMIN'
  | 'HELP_ADMIN';

export interface AppUserProfile {
  id: string;
  mobileNumber: string;
  email?: string;
  fullName: string;
  preferredLanguage: LanguageCode;
  profilePhoto?: string;
  role: AppUserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  token?: string;
  sessionExpiresAt?: number;
}

export interface OtpChallenge {
  mobileNumber: string;
  maskedMobile: string;
  canResendAt: number; // timestamp ms
  expiresAt: number;   // timestamp ms
  remainingAttempts: number;
  isDevelopmentMode: boolean;
  devOtpHint?: string; // Displayed ONLY in development mode with clear banner
}

export interface SecurityEvent {
  id: string;
  userId?: string;
  mobileNumber?: string;
  event: string;
  ip?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details?: string;
}
