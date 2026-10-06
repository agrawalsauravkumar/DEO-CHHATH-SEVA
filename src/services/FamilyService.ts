/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FamilyGroup,
  FamilyGroupMember,
  FamilyLocationShare,
  FamilyAlertItem,
} from '../types';

const STORAGE_KEYS = {
  GROUP: 'deo_family_group',
  MEMBERS: 'deo_family_members',
  CURRENT_USER_ID: 'deo_family_user_id',
  CURRENT_USER_NAME: 'deo_family_user_name',
  SHARING_STATE: 'deo_family_sharing_state',
  ALERTS: 'deo_family_alerts',
};

class FamilyServiceManager {
  private currentUserId: string;
  private currentUserName: string;

  constructor() {
    this.currentUserId = this.initUserId();
    this.currentUserName = this.initUserName();
    this.cleanExpiredSharing();
  }

  private initUserId(): string {
    const existing = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (existing) return existing;
    const newId = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newId);
    return newId;
  }

  private initUserName(): string {
    const existing = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_NAME);
    if (existing) return existing;
    const defaultName = 'आप (You)';
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, defaultName);
    return defaultName;
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  public getCurrentUserName(): string {
    return this.currentUserName;
  }

  public setCurrentUserName(name: string): void {
    this.currentUserName = name.trim() || 'आप (You)';
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, this.currentUserName);

    // Also update current user record in member list if present
    const members = this.getFamilyMembers();
    const updated = members.map((m) =>
      m.userId === this.currentUserId ? { ...m, name: this.currentUserName } : m
    );
    this.saveMembers(updated);
  }

  // ============================================================
  // FAMILY GROUP MANAGEMENT
  // ============================================================
  public getFamilyGroup(): FamilyGroup | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUP);
      if (!data) return null;
      return JSON.parse(data) as FamilyGroup;
    } catch {
      return null;
    }
  }

  public createFamilyGroup(groupName?: string): FamilyGroup {
    const now = new Date();
    // Unique 6-character code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const inviteCode = `DEO-${randomCode.substring(0, 4)}`;

    const newGroup: FamilyGroup = {
      id: 'grp_' + Date.now(),
      name: groupName?.trim() || 'हमारा Chhath परिवार',
      ownerId: this.currentUserId,
      inviteCode,
      createdAt: now.toISOString(),
      status: 'ACTIVE',
    };

    localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(newGroup));

    // Add creator as owner member
    const ownerMember: FamilyGroupMember = {
      id: 'mem_' + Date.now(),
      familyGroupId: newGroup.id,
      userId: this.currentUserId,
      name: this.currentUserName,
      role: 'OWNER',
      locationSharingEnabled: false,
      joinedAt: now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    this.saveMembers([ownerMember]);

    this.sendFamilyAlert(
      `Family group "${newGroup.name}" बनाया गया। Invite Code: ${newGroup.inviteCode}`,
      'INFO'
    );

    return newGroup;
  }

  public joinFamilyGroup(
    inviteCode: string,
    memberName: string
  ): { success: boolean; message: string; group?: FamilyGroup } {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'कृपया वैध Family Code दर्ज करें।' };
    }

    const name = memberName.trim() || 'परिवार सदस्य';
    this.setCurrentUserName(name);

    // If joining by code, simulate group join or match existing
    const existingGroup = this.getFamilyGroup();
    let groupToJoin: FamilyGroup;

    if (existingGroup && existingGroup.inviteCode.toUpperCase() === cleanCode) {
      groupToJoin = existingGroup;
    } else {
      // Connect to a new family group with this code
      groupToJoin = {
        id: 'grp_' + cleanCode.replace(/[^A-Z0-9]/g, ''),
        name: 'Chhath परिवार (' + cleanCode + ')',
        ownerId: 'owner_ref',
        inviteCode: cleanCode,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      };
      localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(groupToJoin));
    }

    const members = this.getFamilyMembers();
    const alreadyMember = members.some((m) => m.userId === this.currentUserId);

    if (!alreadyMember) {
      const newMember: FamilyGroupMember = {
        id: 'mem_' + Date.now(),
        familyGroupId: groupToJoin.id,
        userId: this.currentUserId,
        name,
        role: 'MEMBER',
        locationSharingEnabled: false,
        joinedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      members.push(newMember);
      this.saveMembers(members);
    }

    this.sendFamilyAlert(`${name} परिवार समूह में शामिल हुए।`, 'INFO');

    return {
      success: true,
      message: 'आप सफलतापूर्वक परिवार समूह में शामिल हो गए हैं।',
      group: groupToJoin,
    };
  }

  public leaveFamilyGroup(): boolean {
    const group = this.getFamilyGroup();
    if (!group) return false;

    this.sendFamilyAlert(`${this.currentUserName} ने family group छोड़ दिया है।`, 'WARNING');

    // Remove group and members
    localStorage.removeItem(STORAGE_KEYS.GROUP);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.SHARING_STATE);
    return true;
  }

  public removeFamilyMember(memberId: string): boolean {
    const members = this.getFamilyMembers();
    const target = members.find((m) => m.id === memberId);
    if (!target) return false;

    const filtered = members.filter((m) => m.id !== memberId);
    this.saveMembers(filtered);

    this.sendFamilyAlert(`${target.name} को family group से हटाया गया।`, 'WARNING');
    return true;
  }

  // ============================================================
  // MEMBERS LIST & LOCATION
  // ============================================================
  public getFamilyMembers(): FamilyGroupMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as FamilyGroupMember[];
    } catch {
      return [];
    }
  }

  private saveMembers(members: FamilyGroupMember[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  // ============================================================
  // LOCATION SHARING CONTROL (Consent & Expiry)
  // ============================================================
  public updateLocationSharing(
    durationMinutes: number,
    lat?: number,
    lng?: number,
    accuracy?: number
  ): boolean {
    const group = this.getFamilyGroup();
    if (!group) return false;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const members = this.getFamilyMembers();
    const myIndex = members.findIndex((m) => m.userId === this.currentUserId);

    const updatedMember: FamilyGroupMember = {
      id: myIndex >= 0 ? members[myIndex].id : 'mem_' + Date.now(),
      familyGroupId: group.id,
      userId: this.currentUserId,
      name: this.currentUserName,
      role: myIndex >= 0 ? members[myIndex].role : 'MEMBER',
      locationSharingEnabled: true,
      sharingExpiresAt: expiresAt.toISOString(),
      lastLatitude: lat,
      lastLongitude: lng,
      lastLocationUpdatedAt: now.toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      joinedAt: myIndex >= 0 ? members[myIndex].joinedAt : 'आज',
    };

    if (myIndex >= 0) {
      members[myIndex] = updatedMember;
    } else {
      members.push(updatedMember);
    }
    this.saveMembers(members);

    // Save active sharing state
    const shareState: FamilyLocationShare = {
      id: 'share_' + Date.now(),
      familyGroupId: group.id,
      userId: this.currentUserId,
      latitude: lat || 0,
      longitude: lng || 0,
      accuracy: accuracy || 10,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SHARING_STATE, JSON.stringify(shareState));

    this.sendFamilyAlert(
      `${this.currentUserName} ने Location Sharing शुरू की (${this.formatDuration(durationMinutes)})।`,
      'SHARING_CHANGE',
      lat,
      lng
    );

    return true;
  }

  public stopLocationSharing(): boolean {
    const members = this.getFamilyMembers();
    const updated = members.map((m) => {
      if (m.userId === this.currentUserId) {
        return {
          ...m,
          locationSharingEnabled: false,
          sharingExpiresAt: undefined,
        };
      }
      return m;
    });
    this.saveMembers(updated);
    localStorage.removeItem(STORAGE_KEYS.SHARING_STATE);

    this.sendFamilyAlert(`${this.currentUserName} ने location sharing बंद कर दी।`, 'SHARING_CHANGE');
    return true;
  }

  public isSharingActive(): boolean {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.SHARING_STATE);
      if (!state) return false;
      const parsed = JSON.parse(state) as FamilyLocationShare;
      const expiry = new Date(parsed.expiresAt).getTime();
      if (Date.now() > expiry) {
        this.stopLocationSharing();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public getSharingRemainingMinutes(): number {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.SHARING_STATE);
      if (!state) return 0;
      const parsed = JSON.parse(state) as FamilyLocationShare;
      const diffMs = new Date(parsed.expiresAt).getTime() - Date.now();
      return Math.max(0, Math.round(diffMs / (60 * 1000)));
    } catch {
      return 0;
    }
  }

  public getSharingExpiresTimeString(): string {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.SHARING_STATE);
      if (!state) return '';
      const parsed = JSON.parse(state) as FamilyLocationShare;
      return new Date(parsed.expiresAt).toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }

  public cleanExpiredSharing(): void {
    const members = this.getFamilyMembers();
    let hasChanges = false;
    const now = Date.now();

    const updated = members.map((m) => {
      if (m.locationSharingEnabled && m.sharingExpiresAt) {
        const expiry = new Date(m.sharingExpiresAt).getTime();
        if (now > expiry) {
          hasChanges = true;
          return {
            ...m,
            locationSharingEnabled: false,
            sharingExpiresAt: undefined,
          };
        }
      }
      return m;
    });

    if (hasChanges) {
      this.saveMembers(updated);
    }
  }

  // ============================================================
  // FAMILY MAP & FRESHNESS (Only approved members with recent data)
  // ============================================================
  public getLatestFamilyLocations(): FamilyGroupMember[] {
    this.cleanExpiredSharing();
    const members = this.getFamilyMembers();
    // Return only members with enabled sharing and valid coordinates
    return members.filter(
      (m) =>
        m.locationSharingEnabled &&
        typeof m.lastLatitude === 'number' &&
        typeof m.lastLongitude === 'number' &&
        m.lastLatitude !== 0 &&
        m.lastLongitude !== 0
    );
  }

  // ============================================================
  // FAMILY ALERTS
  // ============================================================
  public sendFamilyAlert(
    message: string,
    type: 'INFO' | 'WARNING' | 'EMERGENCY' | 'SHARING_CHANGE' = 'INFO',
    lat?: number,
    lng?: number
  ): boolean {
    const group = this.getFamilyGroup();
    if (!group) return false;

    const alertItem: FamilyAlertItem = {
      id: 'alert_' + Date.now(),
      familyGroupId: group.id,
      userId: this.currentUserId,
      senderName: this.currentUserName,
      message,
      type,
      latitude: lat,
      longitude: lng,
      createdAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const alerts = this.getFamilyAlerts();
    alerts.unshift(alertItem);
    // Keep max 20 alerts
    if (alerts.length > 20) alerts.pop();
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return true;
  }

  public getFamilyAlerts(): FamilyAlertItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (!data) return [];
      return JSON.parse(data) as FamilyAlertItem[];
    } catch {
      return [];
    }
  }

  private formatDuration(minutes: number): string {
    if (minutes === 15) return '15 मिनट';
    if (minutes === 60) return '1 घंटा';
    if (minutes === 240) return '4 घंटे';
    return 'आज तक';
  }
}

export const FamilyService = new FamilyServiceManager();
