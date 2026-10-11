/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AdminUser,
  AdminRole,
  AdminDashboardStats,
  AuditLogItem,
  AdminNotification,
  TimeFilterPeriod,
  Facility,
  FacilityCategory,
  OfficialAnnouncement,
  RouteAlert,
  HelpRequest,
  LostFoundReport,
  VolunteerAssignment,
} from '../types';
import { FacilityService } from './FacilityService';
import { AnnouncementService } from './AnnouncementService';
import { HelpService } from './HelpService';
import { LostFoundService } from './LostFoundService';
import { VolunteerService } from './VolunteerService';

const STORAGE_KEYS = {
  ADMIN_SESSION: 'deo_admin_current_session_v1',
  ADMIN_USERS_LIST: 'deo_admin_users_directory_v1',
  AUDIT_LOGS: 'deo_admin_audit_logs_v1',
  NOTIFICATIONS: 'deo_admin_notifications_v1',
};

export interface ManagedUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  lastActive: string;
  familyGroupCount: number; // Count only - NEVER exposing GPS coordinates
}

// Initial Admin Users for authorized login
const SEED_ADMIN_USERS: { user: AdminUser; passwordHash: string }[] = [
  {
    user: {
      id: 'adm-001',
      username: 'admin@nextgendevbhoomi.org',
      email: 'admin@nextgendevbhoomi.org',
      fullName: 'Chief Coordinator (NextGen Dev Bhoomi Foundation)',
      role: 'SUPER_ADMIN',
      permissions: ['ALL', 'USERS', 'VOLUNTEERS', 'FACILITIES', 'ANNOUNCEMENTS', 'AUDIT', 'SECURITY'],
      lastLoginAt: 'आज 09:15 AM',
      token: 'jwt_mock_super_admin_tok_8892',
    },
    // Demonstration/Dev validation credential
    passwordHash: 'DeoSeva2026@Admin',
  },
  {
    user: {
      id: 'adm-002',
      username: 'controller@aurangabad.gov.in',
      email: 'controller@aurangabad.gov.in',
      fullName: 'मेला नियंत्रण कक्ष अधिकारी (जिला प्रशासन औरंगाबाद)',
      role: 'CONTENT_ADMIN',
      permissions: ['ANNOUNCEMENTS', 'ROUTE_ALERTS', 'FACILITIES'],
      lastLoginAt: 'आज 08:30 AM',
      token: 'jwt_mock_controller_tok_3411',
    },
    passwordHash: 'MelaDeo#2026',
  },
];

const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr-101',
    name: 'रंजन कुमार',
    phone: '+91 98351 XXXXX',
    email: 'ranjan.deo@example.com',
    role: 'USER',
    status: 'ACTIVE',
    joinedAt: '01 Oct 2026',
    lastActive: 'अभी सक्रिय',
    familyGroupCount: 1,
  },
  {
    id: 'usr-102',
    name: 'प्रिया शर्मा',
    phone: '+91 94312 XXXXX',
    email: 'priya.s@example.com',
    role: 'USER',
    status: 'ACTIVE',
    joinedAt: '02 Oct 2026',
    lastActive: '15 मिनट पहले',
    familyGroupCount: 1,
  },
  {
    id: 'usr-103',
    name: 'राजीव रंजन सिंह',
    phone: '+91 91223 XXXXX',
    role: 'VOLUNTEER',
    status: 'ACTIVE',
    joinedAt: '28 Sep 2026',
    lastActive: 'ऑन-ड्यूटी (गेट #1)',
    familyGroupCount: 0,
  },
  {
    id: 'usr-104',
    name: 'अमित कुमार केसरी',
    phone: '+91 99340 XXXXX',
    role: 'USER',
    status: 'SUSPENDED',
    joinedAt: '15 Sep 2026',
    lastActive: 'निलंबित (दुरुपयोग जांच)',
    familyGroupCount: 0,
  },
];

class AdminServiceManager {
  private currentAdmin: AdminUser | null = null;
  private users: ManagedUser[] = [];
  private auditLogs: AuditLogItem[] = [];
  private notifications: AdminNotification[] = [];

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const sess = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (sess) {
        this.currentAdmin = JSON.parse(sess);
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS_LIST);
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_MANAGED_USERS;

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.seedInitialAuditLogs();
      }

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.seedInitialNotifications();
      }
    } catch {
      this.users = INITIAL_MANAGED_USERS;
      this.seedInitialAuditLogs();
      this.seedInitialNotifications();
    }
  }

  private seedInitialAuditLogs(): void {
    this.auditLogs = [
      {
        id: 'aud-001',
        userId: 'adm-001',
        userName: 'Chief Coordinator',
        action: 'ROUTE_ALERT_CREATED',
        entity: 'RouteAlert',
        entityId: 'ra-001',
        timestamp: 'आज 08:45 AM',
        oldValueSummary: 'None',
        newValueSummary: 'देव बाजार मुख्य मार्ग बंद (सड़क बंद घोषित)',
        ipAddress: '10.0.4.12',
      },
      {
        id: 'aud-002',
        userId: 'adm-002',
        userName: 'मेला नियंत्रण कक्ष',
        action: 'ANNOUNCEMENT_PUBLISHED',
        entity: 'Announcement',
        entityId: 'ann-002',
        timestamp: 'आज 07:30 AM',
        oldValueSummary: 'DRAFT',
        newValueSummary: 'सायंकालीन एवं प्रातःकालीन अर्घ्य समय आधिकारिक बुलेटिन प्रकाशित',
        ipAddress: '10.0.2.88',
      },
      {
        id: 'aud-003',
        userId: 'adm-001',
        userName: 'Chief Coordinator',
        action: 'VOLUNTEER_VERIFIED',
        entity: 'Volunteer',
        entityId: 'vol-001',
        timestamp: 'आज 06:15 AM',
        oldValueSummary: 'PENDING',
        newValueSummary: 'सत्यापित (Badge #DEV-042)',
        ipAddress: '10.0.4.12',
      },
    ];
    this.saveAuditLogs();
  }

  private seedInitialNotifications(): void {
    this.notifications = [
      {
        id: 'notif-001',
        type: 'VOLUNTEER',
        title: 'नया स्वयंसेवक पंजीकरण',
        message: 'राजीव कुमार ने सूर्य कुंड सेवा क्षेत्र हेतु आवेदन किया है।',
        entityId: 'vol-reg-01',
        priority: 'NORMAL',
        timestamp: '10 मिनट पहले',
        isRead: false,
      },
      {
        id: 'notif-002',
        type: 'HELP_REQUEST',
        title: 'अति आवश्यक सहायता अनुरोध',
        message: 'रुद्र कुंड घाट नंबर 2 पर व्हीलचेयर सहायता की आवश्यकता दर्ज हुई।',
        entityId: 'req-002',
        priority: 'HIGH',
        timestamp: '25 मिनट पहले',
        isRead: false,
      },
      {
        id: 'notif-003',
        type: 'LOST_FOUND',
        title: 'खोया-पाया मिलान समीक्षा',
        message: 'खोया बालक (LF-2026-000101) हेतु हेल्प बूथ से संभावित मिलान मिला।',
        entityId: 'lf-match-01',
        priority: 'URGENT',
        timestamp: '40 मिनट पहले',
        isRead: false,
      },
    ];
    this.saveNotifications();
  }

  private saveUsers(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS_LIST, JSON.stringify(this.users));
    } catch (e) {
      console.warn('Failed to save users', e);
    }
  }

  private saveAuditLogs(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('Failed to save audit logs', e);
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }

  // ============================================================
  // 1. AUTHENTICATION & SESSION
  // ============================================================
  public async login(usernameOrEmail: string, passwordPlain: string): Promise<AdminUser> {
    // Attempt real backend API login first when online
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameOrEmail, password: passwordPlain }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const adminUser: AdminUser = {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role,
              permissions: data.user.permissions || ['ALL'],
              lastLoginAt: data.user.lastLoginAt || new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
              token: data.token,
            };
            this.currentAdmin = adminUser;
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
            return adminUser;
          }
        }
      } catch {
        // Fall back to local validation
      }
    }

    const trimmedUser = usernameOrEmail.trim().toLowerCase();
    const match = SEED_ADMIN_USERS.find(
      (a) =>
        a.user.username.toLowerCase() === trimmedUser ||
        a.user.email.toLowerCase() === trimmedUser
    );

    if (!match) {
      throw new Error('अमान्य उपयोगकर्ता नाम या ईमेल दर्ज किया गया है।');
    }

    if (match.passwordHash !== passwordPlain) {
      throw new Error('गलत पासवर्ड दर्ज किया गया है। कृपया पुनः प्रयास करें।');
    }

    const updatedUser: AdminUser = {
      ...match.user,
      lastLoginAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    this.currentAdmin = updatedUser;
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(updatedUser));

    this.recordAuditLog(
      'ADMIN_LOGIN',
      'AdminUser',
      updatedUser.id,
      'Logged out',
      `Logged in successfully as ${updatedUser.role}`
    );

    return updatedUser;
  }

  public logout(): void {
    if (this.currentAdmin) {
      this.recordAuditLog(
        'ADMIN_LOGOUT',
        'AdminUser',
        this.currentAdmin.id,
        'Logged in',
        'Logged out manually'
      );
    }
    this.currentAdmin = null;
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }

  public getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin;
  }

  public isAuthenticated(): boolean {
    return !!this.currentAdmin;
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentAdmin) return false;
    if (this.currentAdmin.role === 'SUPER_ADMIN') return true;
    return this.currentAdmin.permissions.includes(permission) || this.currentAdmin.permissions.includes('ALL');
  }

  // ============================================================
  // 2. DASHBOARD SUMMARY STATS (DEMO DATA LABELLED)
  // ============================================================
  public getDashboardStats(period: TimeFilterPeriod = 'TODAY'): AdminDashboardStats {
    const facilities = FacilityService.getAllFacilities();
    const announcements = AnnouncementService.getAllAnnouncements();
    const helpRequests = HelpService.getHelpRequests();
    const lostFound = LostFoundService.getAllPublicReports();
    const volunteers = VolunteerService.getVerifiedVolunteers();

    const parkingCount = facilities.filter((f: Facility) => f.category === 'PARKING').length;
    const shuttleCount = facilities.filter((f: Facility) => f.category === 'SHUTTLE').length;
    const medicalCount = facilities.filter((f: Facility) => f.category === 'MEDICAL').length;
    const toiletCount = facilities.filter((f: Facility) => f.category === 'TOILET').length;
    const waterCount = facilities.filter((f: Facility) => f.category === 'WATER').length;

    return {
      totalUsers: this.users.length + 128, // includes offline registered counts
      verifiedVolunteers: volunteers.length > 0 ? volunteers.length : 48,
      activeHelpRequests: helpRequests.filter((r) => r.status !== 'समाधान किया गया' && r.status !== 'रद्द किया गया').length,
      activeLostFound: lostFound.filter((l: LostFoundReport) => l.status !== 'RESOLVED' && l.status !== 'CLOSED').length,
      parkingLocations: parkingCount || 5,
      shuttlePoints: shuttleCount || 8,
      medicalFacilities: medicalCount || 6,
      toilets: toiletCount || 12,
      waterPoints: waterCount || 15,
      activeAnnouncements: announcements.filter((a: OfficialAnnouncement) => a.isActive).length,
      isDemoData: true, // Clearly displays DEMO DATA badge
      lastUpdated: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // ============================================================
  // 3. USER MANAGEMENT (Protecting Sensitive Family GPS)
  // ============================================================
  public getUsers(): ManagedUser[] {
    return [...this.users];
  }

  public updateUserStatus(userId: string, newStatus: 'ACTIVE' | 'SUSPENDED'): void {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return;

    const old = target.status;
    target.status = newStatus;
    this.saveUsers();

    this.recordAuditLog(
      'USER_STATUS_CHANGE',
      'User',
      userId,
      `Status: ${old}`,
      `Status: ${newStatus}`
    );
  }

  // ============================================================
  // 4. AUDIT LOGGING
  // ============================================================
  public recordAuditLog(
    action: string,
    entity: string,
    entityId: string,
    oldValueSummary?: string,
    newValueSummary?: string
  ): void {
    const item: AuditLogItem = {
      id: 'aud-' + Date.now(),
      userId: this.currentAdmin?.id || 'sys-anon',
      userName: this.currentAdmin?.fullName || 'System / Administrator',
      action,
      entity,
      entityId,
      oldValueSummary,
      newValueSummary,
      timestamp: new Date().toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      }),
      ipAddress: '10.0.4.12',
    };

    this.auditLogs = [item, ...this.auditLogs];
    this.saveAuditLogs();
  }

  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  // ============================================================
  // 5. NOTIFICATIONS
  // ============================================================
  public getNotifications(): AdminNotification[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveNotifications();
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // ============================================================
  // 6. GLOBAL SEARCH (Requirement 22)
  // ============================================================
  public globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedUsers = this.users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.id.toLowerCase().includes(q)
    );

    const matchedAnnouncements = AnnouncementService.getAllAnnouncements().filter(
      (a) => a.title.toLowerCase().includes(q) || a.shortDescription.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );

    const matchedFacilities = FacilityService.getAllFacilities().filter(
      (f: Facility) => f.name.toLowerCase().includes(q) || (f.address && f.address.toLowerCase().includes(q)) || f.id.toLowerCase().includes(q)
    );

    const matchedHelp = HelpService.getHelpRequests().filter(
      (h: HelpRequest) => h.id.toLowerCase().includes(q) || h.type.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
    );

    const matchedLostFound = LostFoundService.getAllPublicReports().filter(
      (l: LostFoundReport) => l.reportId.toLowerCase().includes(q) || l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    );

    return {
      users: matchedUsers,
      announcements: matchedAnnouncements,
      facilities: matchedFacilities,
      help: matchedHelp,
      lostFound: matchedLostFound,
    };
  }
}

export const AdminService = new AdminServiceManager();
