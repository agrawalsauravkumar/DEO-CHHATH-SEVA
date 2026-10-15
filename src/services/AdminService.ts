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
import { apiUrl } from './apiUrl';
import { apiRequest } from './apiClient';

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
  role: 'USER' | 'VOLUNTEER' | AdminRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joinedAt: string;
  lastActive: string;
  familyGroupCount: number; // Count only - NEVER exposing GPS coordinates
}

class AdminServiceManager {
  private currentAdmin: AdminUser | null = null;
  private users: ManagedUser[] = [];
  private auditLogs: AuditLogItem[] = [];
  private notifications: AdminNotification[] = [];
  private dashboardStats: AdminDashboardStats = {
    totalUsers: 0,
    verifiedVolunteers: 0,
    activeHelpRequests: 0,
    activeLostFound: 0,
    parkingLocations: 0,
    shuttlePoints: 0,
    medicalFacilities: 0,
    toilets: 0,
    waterPoints: 0,
    activeAnnouncements: 0,
    isDemoData: false,
    lastUpdated: '',
  };

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const sess =
        localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) ||
        sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (sess) {
        this.currentAdmin = JSON.parse(sess);
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS_LIST);
      this.users = storedUsers ? JSON.parse(storedUsers) : [];

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.auditLogs = [];
      }

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = [];
      }
    } catch {
      this.users = [];
      this.auditLogs = [];
      this.notifications = [];
    }
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
    if (typeof window === 'undefined' || !navigator.onLine) {
      throw new Error('अधिकृत लॉगिन के लिए सुरक्षित प्रशासन सर्वर से इंटरनेट द्वारा जुड़ें।');
    }

    let response: Response;
    try {
      response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail.trim(), password: passwordPlain }),
      });
    } catch {
      throw new Error('प्रशासन सर्वर से संपर्क नहीं हो सका। डेमो लॉगिन की अनुमति नहीं है।');
    }

    const data = await response.json().catch(() => null) as {
      error?: string;
      user?: {
        id: string;
        username?: string;
        email?: string;
        fullName: string;
        role: AdminRole;
        permissions?: string[];
        lastLoginAt?: string;
        token?: string;
      };
      token?: string;
    } | null;

    if (!response.ok || !data?.user || !data.token || data.user.token !== data.token) {
      throw new Error(data?.error || 'लॉगिन असफल। कृपया अधिकृत क्रेडेंशियल जांचें।');
    }

    const adminRoles: AdminRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'CONTENT_ADMIN',
      'FACILITY_ADMIN',
      'HELP_ADMIN',
    ];
    if (!adminRoles.includes(data.user.role)) {
      throw new Error('यह खाता प्रशासनिक लॉगिन के लिए अधिकृत नहीं है।');
    }

    const adminUser: AdminUser = {
      id: data.user.id,
      username: data.user.username || data.user.email || usernameOrEmail.trim(),
      email: data.user.email || '',
      fullName: data.user.fullName,
      role: data.user.role,
      permissions: data.user.permissions || [],
      lastLoginAt: data.user.lastLoginAt || new Date().toISOString(),
      token: data.token,
    };

    this.currentAdmin = adminUser;
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));

    return adminUser;
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
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }

  public getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin;
  }

  public isAuthenticated(): boolean {
    return !!this.currentAdmin;
  }

  public async validateCurrentSession(): Promise<boolean> {
    const admin = this.currentAdmin;
    if (!admin?.token) return false;

    const response = await fetch(apiUrl('/api/auth/session'), {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    if (!response.ok) {
      this.logout();
      return false;
    }

    const data = await response.json() as {
      authenticated?: boolean;
      user?: { id?: string; role?: AdminRole; status?: string };
    };
    const isValid = Boolean(
      data.authenticated &&
      data.user?.id === admin.id &&
      data.user.role === admin.role &&
      data.user.status === 'ACTIVE'
    );
    if (!isValid) this.logout();
    return isValid;
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentAdmin) return false;
    if (this.currentAdmin.role === 'SUPER_ADMIN') return true;
    return this.currentAdmin.permissions.includes(permission) || this.currentAdmin.permissions.includes('ALL');
  }

  public async syncDashboardData(): Promise<void> {
    const canManageUsers = this.currentAdmin?.role === 'SUPER_ADMIN' || this.currentAdmin?.role === 'ADMIN';
    const [stats, userResult, serverLogs] = await Promise.all([
      apiRequest<AdminDashboardStats>('/api/admin/stats', {}, true),
      canManageUsers ? apiRequest<{
        users: Array<{
          id: string;
          fullName: string;
          phone?: string;
          email?: string;
          role: ManagedUser['role'];
          status: ManagedUser['status'];
          createdAt: string;
          lastLoginAt?: string;
        }>;
      }>('/api/admin/users', {}, true) : Promise.resolve(null),
      canManageUsers ? apiRequest<Array<{
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
      }>>('/api/audit', {}, true) : Promise.resolve(null),
    ]);
    this.dashboardStats = stats;
    this.users = userResult?.users.map((user) => ({
      id: user.id,
      name: user.fullName,
      phone: user.phone || '',
      email: user.email,
      role: user.role,
      status: user.status,
      joinedAt: new Date(user.createdAt).toLocaleDateString('hi-IN'),
      lastActive: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleString('hi-IN')
        : 'अभी तक लॉगिन नहीं',
      familyGroupCount: 0,
    })) || [];
    this.auditLogs = serverLogs?.map((log) => ({
      id: log.id,
      userId: log.userId || '',
      userName: log.userName || 'सिस्टम',
      action: log.action,
      entity: log.entity,
      entityId: log.entityId || '',
      oldValueSummary: log.oldValueSummary,
      newValueSummary: log.newValueSummary,
      timestamp: new Date(log.createdAt).toLocaleString('hi-IN'),
      ipAddress: log.ipAddress,
    })) || [];
  }

  // ============================================================
  // 2. DASHBOARD SUMMARY STATS (DEMO DATA LABELLED)
  // ============================================================
  public getDashboardStats(period: TimeFilterPeriod = 'TODAY'): AdminDashboardStats {
    void period;
    return { ...this.dashboardStats };
  }

  // ============================================================
  // 3. USER MANAGEMENT (Protecting Sensitive Family GPS)
  // ============================================================
  public getUsers(): ManagedUser[] {
    return [...this.users];
  }

  public async updateUserStatus(userId: string, newStatus: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    const target = this.users.find((u) => u.id === userId);
    if (!target) throw new Error('उपयोगकर्ता सूची सर्वर से लोड नहीं हुई है।');

    await apiRequest(`/api/users/${encodeURIComponent(userId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    }, true);
    target.status = newStatus;
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
