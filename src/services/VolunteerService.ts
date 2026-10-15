import {
  Volunteer,
  VolunteerVerificationStatus,
  VolunteerAvailability,
  UserRole,
  HelpRequest,
} from '../types';
import { HelpService } from './HelpService';
import { apiRequest } from './apiClient';

const STORAGE_VOLUNTEER_KEY = 'deo_chhath_active_volunteer_v1';
const STORAGE_ALL_VOLUNTEERS_KEY = 'deo_chhath_all_volunteers_v1';
const STORAGE_CURRENT_ROLE_KEY = 'deo_chhath_user_role_v1';

const DEFAULT_VOLUNTEERS: Volunteer[] = [];

class VolunteerServiceManager {
  private activeVolunteerId: string | null = null;
  private currentRole: UserRole = 'USER';

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Role
      const savedRole = localStorage.getItem(STORAGE_CURRENT_ROLE_KEY) as UserRole;
      if (savedRole) this.currentRole = savedRole;

      // Active volunteer ID
      const savedVolId = localStorage.getItem(STORAGE_VOLUNTEER_KEY);
      if (savedVolId) this.activeVolunteerId = savedVolId;

      // Ensure volunteers seed exists
      const existing = localStorage.getItem(STORAGE_ALL_VOLUNTEERS_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_ALL_VOLUNTEERS_KEY, JSON.stringify([]));
      } else {
        const stored = JSON.parse(existing) as Volunteer[];
        const genuineProfiles = stored.filter(
          (volunteer) => volunteer.id !== 'vol-rahul-01' && volunteer.id !== 'vol-amit-02'
        );
        if (genuineProfiles.length !== stored.length) this.saveVolunteers(genuineProfiles);
      }
    } catch {
      // Ignore
    }
  }

  // Role Management
  public getCurrentUserRole(): UserRole {
    return this.currentRole;
  }

  public setCurrentUserRole(role: UserRole): void {
    this.currentRole = role;
    try {
      localStorage.setItem(STORAGE_CURRENT_ROLE_KEY, role);
    } catch {
      // Ignore
    }
  }

  public getActiveVolunteerId(): string | null {
    return this.activeVolunteerId;
  }

  public setActiveVolunteerId(id: string | null): void {
    this.activeVolunteerId = id;
    try {
      if (id) {
        localStorage.setItem(STORAGE_VOLUNTEER_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_VOLUNTEER_KEY);
      }
    } catch {
      // Ignore
    }
  }

  // 1. Volunteer Registration (Defaults strictly to PENDING)
  public async registerVolunteer(data: {
    name: string;
    phone: string;
    serviceArea: string;
    services: string[];
    languages: string[];
    availabilityTime?: string;
  }): Promise<Volunteer> {
    const result = await apiRequest<{ volunteer: {
      id: string;
      fullName: string;
      phone: string;
      badgeNumber: string;
      status: Volunteer['verificationStatus'];
      serviceAreas: string[];
      servicesOffered: string[];
      languages: string[];
      availabilityTime?: string;
      isOnDuty: boolean;
      createdAt: string;
      updatedAt: string;
    } }>('/api/volunteers', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.name.trim(),
        phone: data.phone.trim(),
        serviceAreas: [data.serviceArea],
        servicesOffered: data.services,
        languages: data.languages,
        availabilityTime: data.availabilityTime,
        currentAssignedZone: data.serviceArea,
      }),
    }, true, 'user');
    const newVol: Volunteer = {
      id: result.volunteer.id,
      name: result.volunteer.fullName,
      phone: result.volunteer.phone,
      serviceArea: result.volunteer.serviceAreas.join(', '),
      services: result.volunteer.servicesOffered,
      languages: result.volunteer.languages,
      availabilityTime: result.volunteer.availabilityTime || data.availabilityTime || '24 घंटे',
      verificationStatus: result.volunteer.status,
      availability: result.volunteer.isOnDuty ? 'AVAILABLE' : 'UNAVAILABLE',
      locationSharingEnabled: false,
      badge: result.volunteer.badgeNumber,
      createdAt: result.volunteer.createdAt,
      updatedAt: result.volunteer.updatedAt,
    };
    this.saveVolunteers([newVol, ...this.getAllVolunteers().filter((v) => v.id !== newVol.id)]);
    this.setActiveVolunteerId(newVol.id);
    this.setCurrentUserRole('VOLUNTEER');
    return newVol;
  }

  public getAllVolunteers(): Volunteer[] {
    try {
      const raw = localStorage.getItem(STORAGE_ALL_VOLUNTEERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async syncMyVolunteerProfile(): Promise<Volunteer | undefined> {
    const result = await apiRequest<{ volunteer: {
      id: string;
      fullName: string;
      phone: string;
      badgeNumber: string;
      status: VolunteerVerificationStatus;
      serviceAreas: string[];
      servicesOffered: string[];
      languages: string[];
      availabilityTime?: string;
      isOnDuty: boolean;
      createdAt: string;
      updatedAt: string;
    } | null }>('/api/volunteers/me', {}, true, 'user');
    if (!result.volunteer) {
      this.setActiveVolunteerId(null);
      return undefined;
    }
    const saved = result.volunteer;
    const profile: Volunteer = {
      id: saved.id,
      name: saved.fullName,
      phone: saved.phone,
      serviceArea: saved.serviceAreas.join(', '),
      services: saved.servicesOffered,
      languages: saved.languages,
      availabilityTime: saved.availabilityTime || '',
      verificationStatus: saved.status,
      availability: saved.isOnDuty ? 'AVAILABLE' : 'UNAVAILABLE',
      locationSharingEnabled: false,
      badge: saved.badgeNumber,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
    this.setActiveVolunteerId(profile.id);
    this.saveVolunteers([profile, ...this.getAllVolunteers().filter((item) => item.id !== profile.id)]);
    return profile;
  }

  public getVerifiedVolunteers(): Volunteer[] {
    return this.getAllVolunteers().filter((v) => v.verificationStatus === 'VERIFIED');
  }

  private saveVolunteers(volunteers: Volunteer[]) {
    try {
      localStorage.setItem(STORAGE_ALL_VOLUNTEERS_KEY, JSON.stringify(volunteers));
    } catch {
      // Ignore
    }
  }

  // 2. Get Profile
  public getVolunteerProfile(id?: string): Volunteer | undefined {
    const targetId = id || this.activeVolunteerId;
    if (!targetId) return undefined;
    const all = this.getAllVolunteers();
    return all.find((v) => v.id === targetId);
  }

  // 3. Update Profile
  public updateVolunteerProfile(id: string, updates: Partial<Volunteer>): Volunteer | undefined {
    const all = this.getAllVolunteers();
    const idx = all.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;

    const updated = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    this.saveVolunteers(all);
    return updated;
  }

  // 4. Verification Status
  public getVerificationStatus(id: string): VolunteerVerificationStatus {
    const profile = this.getVolunteerProfile(id);
    return profile ? profile.verificationStatus : 'PENDING';
  }

  // Admin Verification Toggle (Used by Admin Dashboard & Dev verification tool)
  public async syncAdminVolunteers(): Promise<void> {
    const data = await apiRequest<{ volunteers: Array<{
      id: string;
      fullName: string;
      phone: string;
      badgeNumber: string;
      status: VolunteerVerificationStatus;
      serviceAreas: string[];
      servicesOffered: string[];
      languages: string[];
      availabilityTime?: string;
      isOnDuty: boolean;
      createdAt: string;
      updatedAt: string;
    }> }>('/api/volunteers/admin', {}, true);
    this.saveVolunteers(data.volunteers.map((volunteer) => ({
      id: volunteer.id,
      name: volunteer.fullName,
      phone: volunteer.phone,
      serviceArea: volunteer.serviceAreas.join(', '),
      services: volunteer.servicesOffered,
      languages: volunteer.languages,
      availabilityTime: volunteer.availabilityTime || '',
      verificationStatus: volunteer.status,
      availability: volunteer.isOnDuty ? 'AVAILABLE' : 'UNAVAILABLE',
      locationSharingEnabled: false,
      badge: volunteer.badgeNumber,
      createdAt: volunteer.createdAt,
      updatedAt: volunteer.updatedAt,
    })));
  }

  public async adminVerifyVolunteer(volunteerId: string, status: VolunteerVerificationStatus): Promise<boolean> {
    const response = await apiRequest<{ volunteer: { id: string; status: VolunteerVerificationStatus } }>(
      `/api/volunteers/${encodeURIComponent(volunteerId)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      true
    );
    const volunteer = this.getVolunteerProfile(volunteerId);
    if (volunteer) {
      this.updateVolunteerProfile(volunteerId, {
        verificationStatus: response.volunteer.status,
        badge: response.volunteer.status === 'VERIFIED' ? '✅ अधिकृत स्वयंसेवक' : volunteer.badge,
      });
    }
    return true;
  }

  // 5. Availability Control
  public async setAvailability(id: string, availability: VolunteerAvailability): Promise<void> {
    await apiRequest(`/api/volunteers/${encodeURIComponent(id)}/duty`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnDuty: availability === 'AVAILABLE' }),
    }, true, 'user');
    this.updateVolunteerProfile(id, { availability });
  }

  // 6. Location Sharing Permission
  public updateLocationPermission(volunteerId: string, enabled: boolean): void {
    this.updateVolunteerProfile(volunteerId, { locationSharingEnabled: enabled });
  }

  // 7. Request Management
  public getOpenHelpRequests(): HelpRequest[] {
    const allRequests = HelpService.getHelpRequests();
    // Return requests that are either 'प्राप्त' or 'देखा गया' without an assigned volunteer
    return allRequests.filter(
      (r) => (r.status === 'प्राप्त' || r.status === 'देखा गया') && !r.assignedVolunteerId
    );
  }

  public getAssignedRequests(volunteerId: string): HelpRequest[] {
    const allRequests = HelpService.getHelpRequests();
    return allRequests.filter((r) => r.assignedVolunteerId === volunteerId);
  }

  // Volunteer Accepts Request
  public async acceptRequest(_volunteerId: string, requestId: string): Promise<boolean> {
    await HelpService.updateHelpRequestStatus(requestId, 'स्वयंसेवक assigned', undefined, 'user');
    return true;
  }

  // Volunteer Rejects Request
  public async rejectRequest(_volunteerId: string, requestId: string, reason?: string): Promise<boolean> {
    await HelpService.updateHelpRequestStatus(requestId, 'प्राप्त', reason, 'user');
    return true;
  }

  // Volunteer Starts Assistance
  public async startRequest(_volunteerId: string, requestId: string): Promise<boolean> {
    await HelpService.updateHelpRequestStatus(requestId, 'सहायता जारी', undefined, 'user');
    return true;
  }

  // Volunteer Completes Assistance
  public async completeRequest(_volunteerId: string, requestId: string): Promise<boolean> {
    await HelpService.updateHelpRequestStatus(requestId, 'समाधान किया गया', undefined, 'user');
    return true;
  }

  // Escalate Request to Admin
  public async escalateRequest(_volunteerId: string, requestId: string, reason: string): Promise<boolean> {
    await HelpService.updateHelpRequestStatus(requestId, 'ESCALATED', reason, 'user');
    return true;
  }
}

export const VolunteerService = new VolunteerServiceManager();
