/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// PostgreSQL + PostGIS Database Entities for DEO CHHATH SEVA

export type DbUserRole =
  | 'USER'
  | 'VOLUNTEER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'CONTENT_ADMIN'
  | 'FACILITY_ADMIN'
  | 'HELP_ADMIN';

export type DbUserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type DbVolunteerStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type DbHelpRequestStatus = 'RECEIVED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CANCELLED';
export type DbLostFoundType = 'LOST_PERSON' | 'FOUND_PERSON' | 'LOST_ITEM' | 'FOUND_ITEM';
export type DbLostFoundStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MATCH_FOUND'
  | 'VERIFICATION_REQUIRED'
  | 'TRANSFERRED_TO_HELP_POINT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';
export type DbFacilityCategory =
  | 'PARKING'
  | 'SHUTTLE'
  | 'MEDICAL'
  | 'TOILET'
  | 'WATER'
  | 'HELP'
  | 'RELIGIOUS';
export type DbParkingStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED' | 'UNKNOWN';
export type DbAnnouncementCategory =
  | 'EMERGENCY'
  | 'ROUTE'
  | 'PARKING'
  | 'SHUTTLE'
  | 'MEDICAL'
  | 'HELP'
  | 'GENERAL'
  | 'CHHATH_INFO'
  | 'SAFETY';
export type DbAnnouncementPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'EMERGENCY';
export type DbAnnouncementStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'EXPIRED';
export type DbRouteAlertType = 'ROUTE_ALERT' | 'ROAD_CLOSURE' | 'DIVERSION';

export interface DbGeoPoint {
  latitude: number;
  longitude: number;
  srid?: number; // 4326 for WGS 84
}

export interface DbUser {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  passwordHash?: string;
  fullName: string;
  role: DbUserRole;
  status: DbUserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface DbVolunteer {
  id: string;
  userId?: string;
  badgeNumber: string;
  fullName: string;
  phone: string;
  gender?: string;
  age?: number;
  status: DbVolunteerStatus;
  serviceAreas: string[];
  servicesOffered: string[];
  languages: string[];
  availabilityTime?: string;
  currentAssignedZone: string;
  isOnDuty: boolean;
  location?: DbGeoPoint;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbFacility {
  id: string;
  name: string;
  nameEn?: string;
  category: DbFacilityCategory;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DbParking {
  id: string;
  facilityId: string;
  name: string;
  totalCapacity?: number;
  availableCapacity?: number;
  capacityDisplay?: string;
  vehicleTypes: string[];
  status: DbParkingStatus;
  isVerified: boolean;
  isActive: boolean;
  latitude: number;
  longitude: number;
  address?: string;
  updatedAt?: string;
}

export interface DbShuttleRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  frequency: string;
  fare: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface DbShuttlePoint {
  id: string;
  facilityId: string;
  routeId?: string;
  name: string;
  pointType: 'PICKUP' | 'DROP' | 'BOTH';
  latitude: number;
  longitude: number;
  address?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface DbHelpRequest {
  id: string;
  requestNumber: string;
  type: string;
  description: string;
  userName?: string;
  userPhone?: string;
  latitude?: number;
  longitude?: number;
  status: DbHelpRequestStatus;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  assignedVolunteerId?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbFamilyGroup {
  id: string;
  groupCode: string;
  groupName: string;
  leaderId: string;
  leaderName: string;
  leaderPhone: string;
  createdAt: string;
  meetingPointName?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
}

export interface DbFamilyMember {
  id: string;
  groupId: string;
  userId?: string;
  name: string;
  phone?: string;
  relation: string;
  isElderly: boolean;
  latitude?: number;
  longitude?: number;
  lastPingAt: string;
  isSafe: boolean;
}

export interface DbLostFoundReport {
  id: string;
  reportId: string;
  type: DbLostFoundType;
  category: string;
  title: string;
  description: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  identifyingFeatures?: string;
  contactName: string;
  contactPhone: string;
  photoUrl?: string;
  status: DbLostFoundStatus;
  isFlaggedMisuse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbAnnouncement {
  id: string;
  title: string;
  shortDescription: string;
  details?: string;
  category: DbAnnouncementCategory;
  priority: DbAnnouncementPriority;
  status: DbAnnouncementStatus;
  isVerifiedOfficial: boolean;
  source: string;
  publishedAt: string;
  expiresAt?: string;
  createdBy?: string;
  routeAlert?: DbRouteAlert;
}

export interface DbRouteAlert {
  id: string;
  announcementId?: string;
  type: DbRouteAlertType;
  title: string;
  roadName: string;
  reason: string;
  affectedArea: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startTime: string;
  endTime: string;
  alternativeRouteAvailable: boolean;
  alternativeRouteAdvice?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface DbAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValueSummary?: string;
  newValueSummary?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DbTeamMember {
  id: string;
  fullName: string;
  designation: string;
  biography?: string;
  photoPath?: string;
  photoPermissionConfirmed: boolean;
  isDemo: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbFestivalConfig {
  festivalName: string;
  organization: string;
  tagline: string;
  year: number;
  dates: {
    nahayKhay: string;
    kharna: string;
    sandhyaArghya: string;
    pratahArghya: string;
  };
  melaControlRoomPhone: string;
  policeControlPhone: string;
  medicalHelpline: string;
  primaryGhatCoordinates: {
    suryaKund: DbGeoPoint;
    rudraKund: DbGeoPoint;
  };
}
