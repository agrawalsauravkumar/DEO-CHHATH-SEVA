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
    this.currentUserId = '';
    this.currentUserName = '';
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
    return null;
  }

  public createFamilyGroup(groupName?: string): FamilyGroup {
    void groupName;
    throw new Error('परिवार समूह सेवा सर्वर से जुड़ी नहीं है; समूह नहीं बनाया गया।');
  }

  public joinFamilyGroup(
    inviteCode: string,
    memberName: string
  ): { success: boolean; message: string; group?: FamilyGroup } {
    void inviteCode;
    void memberName;
    return {
      success: false,
      message: 'परिवार समूह सेवा सर्वर से जुड़ी नहीं है; समूह से जुड़ना उपलब्ध नहीं है।',
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
    return [];
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
    void durationMinutes;
    void lat;
    void lng;
    void accuracy;
    return false;
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
    return false;
  }

  public getSharingRemainingMinutes(): number {
    return 0;
  }

  public getSharingExpiresTimeString(): string {
    return '';
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
    return [];
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
    void message;
    void type;
    void lat;
    void lng;
    return false;
  }

  public getFamilyAlerts(): FamilyAlertItem[] {
    return [];
  }

  private formatDuration(minutes: number): string {
    if (minutes === 15) return '15 मिनट';
    if (minutes === 60) return '1 घंटा';
    if (minutes === 240) return '4 घंटे';
    return 'आज तक';
  }
}

export const FamilyService = new FamilyServiceManager();
