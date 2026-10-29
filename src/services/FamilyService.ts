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

const getStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage as Storage;
  }
  return null;
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
    const storage = getStorage();
    if (!storage) return 'user_offline';
    const existing = storage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (existing) return existing;
    const newId = 'user_' + Math.random().toString(36).substring(2, 9);
    storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newId);
    return newId;
  }

  private initUserName(): string {
    const storage = getStorage();
    if (!storage) return 'आप (You)';
    const existing = storage.getItem(STORAGE_KEYS.CURRENT_USER_NAME);
    if (existing) return existing;
    const defaultName = 'आप (You)';
    storage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, defaultName);
    return defaultName;
  }

  public getCurrentUserId(): string {
    if (!this.currentUserId) this.currentUserId = this.initUserId();
    return this.currentUserId;
  }

  public getCurrentUserName(): string {
    if (!this.currentUserName) this.currentUserName = this.initUserName();
    return this.currentUserName;
  }

  public setCurrentUserName(name: string): void {
    this.currentUserName = name.trim() || 'आप (You)';
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, this.currentUserName);
    }

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
    const storage = getStorage();
    if (!storage) return null;
    try {
      const data = storage.getItem(STORAGE_KEYS.GROUP);
      if (!data) return null;
      return JSON.parse(data) as FamilyGroup;
    } catch {
      return null;
    }
  }

  public createFamilyGroup(groupName?: string): FamilyGroup {
    const now = new Date();
    // Unique 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const inviteCode = `DEO-${randomCode}`;

    const newGroup: FamilyGroup = {
      id: 'grp_' + Date.now(),
      name: groupName?.trim() || 'हमारा Chhath परिवार',
      ownerId: this.getCurrentUserId(),
      inviteCode,
      createdAt: now.toISOString(),
      status: 'ACTIVE',
    };

    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(newGroup));
    }

    // Add creator as owner member
    const ownerMember: FamilyGroupMember = {
      id: 'mem_' + Date.now(),
      familyGroupId: newGroup.id,
      userId: this.getCurrentUserId(),
      name: this.getCurrentUserName(),
      role: 'OWNER',
      locationSharingEnabled: false,
      joinedAt: now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    this.saveMembers([ownerMember]);

    this.sendFamilyAlert(
      `Family group "${newGroup.name}" बनाया गया। कोड: ${newGroup.inviteCode}`,
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
      const storage = getStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(groupToJoin));
      }
    }

    const members = this.getFamilyMembers();
    const alreadyMember = members.some((m) => m.userId === this.getCurrentUserId());

    if (!alreadyMember) {
      const newMember: FamilyGroupMember = {
        id: 'mem_' + Date.now(),
        familyGroupId: groupToJoin.id,
        userId: this.getCurrentUserId(),
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

    this.sendFamilyAlert(`${this.getCurrentUserName()} ने family group छोड़ दिया है।`, 'WARNING');

    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEYS.GROUP);
      storage.removeItem(STORAGE_KEYS.MEMBERS);
      storage.removeItem(STORAGE_KEYS.SHARING_STATE);
    }
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
    const storage = getStorage();
    if (!storage) return [];
    try {
      const data = storage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) return [];
      return JSON.parse(data) as FamilyGroupMember[];
    } catch {
      return [];
    }
  }

  private saveMembers(members: FamilyGroupMember[]): void {
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    }
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
    const myIndex = members.findIndex((m) => m.userId === this.getCurrentUserId());

    if (myIndex !== -1) {
      members[myIndex] = {
        ...members[myIndex],
        locationSharingEnabled: true,
        lastLatitude: lat || 24.6548,
        lastLongitude: lng || 84.4362,
        lastAccuracy: accuracy || 10,
        lastUpdatedTime: now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        sharingExpiresAt: expiresAt.toISOString(),
      };
    } else {
      members.push({
        id: 'mem_' + Date.now(),
        familyGroupId: group.id,
        userId: this.getCurrentUserId(),
        name: this.getCurrentUserName(),
        role: 'MEMBER',
        locationSharingEnabled: true,
        lastLatitude: lat || 24.6548,
        lastLongitude: lng || 84.4362,
        lastAccuracy: accuracy || 10,
        lastUpdatedTime: now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        sharingExpiresAt: expiresAt.toISOString(),
      });
    }

    this.saveMembers(members);

    const shareState: FamilyLocationShare = {
      id: 'share_' + Date.now(),
      familyGroupId: group.id,
      userId: this.getCurrentUserId(),
      latitude: lat || 0,
      longitude: lng || 0,
      accuracy: accuracy || 10,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.SHARING_STATE, JSON.stringify(shareState));
    }

    this.sendFamilyAlert(
      `${this.getCurrentUserName()} ने Location Sharing शुरू की (${this.formatDuration(durationMinutes)})।`,
      'SHARING_CHANGE',
      lat,
      lng
    );

    return true;
  }

  public stopLocationSharing(): boolean {
    const members = this.getFamilyMembers();
    const updated = members.map((m) => {
      if (m.userId === this.getCurrentUserId()) {
        return {
          ...m,
          locationSharingEnabled: false,
          sharingExpiresAt: undefined,
        };
      }
      return m;
    });
    this.saveMembers(updated);
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEYS.SHARING_STATE);
    }

    this.sendFamilyAlert(`${this.getCurrentUserName()} ने location sharing बंद कर दी।`, 'SHARING_CHANGE');
    return true;
  }

  public isSharingActive(): boolean {
    const storage = getStorage();
    if (!storage) return false;
    try {
      const state = storage.getItem(STORAGE_KEYS.SHARING_STATE);
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
    const storage = getStorage();
    if (!storage) return 0;
    try {
      const state = storage.getItem(STORAGE_KEYS.SHARING_STATE);
      if (!state) return 0;
      const parsed = JSON.parse(state) as FamilyLocationShare;
      const diffMs = new Date(parsed.expiresAt).getTime() - Date.now();
      return Math.max(0, Math.round(diffMs / (60 * 1000)));
    } catch {
      return 0;
    }
  }

  public getSharingExpiresTimeString(): string {
    const storage = getStorage();
    if (!storage) return '';
    try {
      const state = storage.getItem(STORAGE_KEYS.SHARING_STATE);
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
      userId: this.getCurrentUserId(),
      senderName: this.getCurrentUserName(),
      message,
      type,
      latitude: lat,
      longitude: lng,
      createdAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const alerts = this.getFamilyAlerts();
    alerts.unshift(alertItem);
    if (alerts.length > 20) alerts.pop();
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
    return true;
  }

  public getFamilyAlerts(): FamilyAlertItem[] {
    const storage = getStorage();
    if (!storage) return [];
    try {
      const data = storage.getItem(STORAGE_KEYS.ALERTS);
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
