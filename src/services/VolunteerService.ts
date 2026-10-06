import {
  Volunteer,
  VolunteerAssignment,
  VolunteerVerificationStatus,
  VolunteerAvailability,
  UserRole,
  HelpRequest,
} from '../types';
import { HelpService } from './HelpService';

const STORAGE_VOLUNTEER_KEY = 'deo_chhath_active_volunteer_v1';
const STORAGE_ALL_VOLUNTEERS_KEY = 'deo_chhath_all_volunteers_v1';
const STORAGE_ASSIGNMENTS_KEY = 'deo_chhath_volunteer_assignments_v1';
const STORAGE_CURRENT_ROLE_KEY = 'deo_chhath_user_role_v1';

// Seed demo verified volunteer for immediate testing if desired
const DEFAULT_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-rahul-01',
    name: 'राहुल कुमार (सेवा दल प्रमुख)',
    phone: '9876543210',
    serviceArea: 'सूर्य मंदिर पूर्वी द्वार',
    services: ['🆘 सहायता', '👴 वरिष्ठ नागरिक सहायता', '🚑 मेडिकल सहायता', '🧭 रास्ता बताना'],
    languages: ['हिन्दी', 'मगही', 'भोजपुरी'],
    availabilityTime: '24 घंटे निरंतर सेवा',
    verificationStatus: 'VERIFIED',
    availability: 'AVAILABLE',
    locationSharingEnabled: true,
    lastLocation: { latitude: 24.6540, longitude: 84.4385, timestamp: Date.now() },
    badge: 'फर्स्ट एड व व्हीलचेयर सारथी',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-03T02:00:00Z',
  },
  {
    id: 'vol-amit-02',
    name: 'अमित कुमार सिंह',
    phone: '9876543211',
    serviceArea: 'सूर्य कुंड घाट 1 व 2',
    services: ['🆘 सहायता', '👨‍👩‍👧 परिवार सहायता', '🔎 Lost & Found'],
    languages: ['हिन्दी', 'भोजपुरी'],
    availabilityTime: 'प्रातः एवं सांध्य अर्घ्य समय',
    verificationStatus: 'VERIFIED',
    availability: 'AVAILABLE',
    locationSharingEnabled: true,
    lastLocation: { latitude: 24.6546, longitude: 84.4376, timestamp: Date.now() },
    badge: 'घाट सुरक्षा व जल सेवा',
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-03T02:00:00Z',
  },
];

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
        localStorage.setItem(STORAGE_ALL_VOLUNTEERS_KEY, JSON.stringify(DEFAULT_VOLUNTEERS));
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
  public registerVolunteer(data: {
    name: string;
    phone: string;
    serviceArea: string;
    services: string[];
    languages: string[];
    availabilityTime?: string;
  }): Volunteer {
    const volunteers = this.getAllVolunteers();
    const newVol: Volunteer = {
      id: `vol-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      serviceArea: data.serviceArea,
      services: data.services,
      languages: data.languages,
      availabilityTime: data.availabilityTime || '24 घंटे',
      verificationStatus: 'PENDING', // Strict specification rule: PENDING initially
      availability: 'UNAVAILABLE',
      locationSharingEnabled: false,
      badge: 'स्वयंसेवक (Verification Pending)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    volunteers.unshift(newVol);
    this.saveVolunteers(volunteers);
    this.setActiveVolunteerId(newVol.id);
    this.setCurrentUserRole('VOLUNTEER');
    return newVol;
  }

  public getAllVolunteers(): Volunteer[] {
    try {
      const raw = localStorage.getItem(STORAGE_ALL_VOLUNTEERS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_VOLUNTEERS;
    } catch {
      return DEFAULT_VOLUNTEERS;
    }
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
  public adminVerifyVolunteer(volunteerId: string, status: VolunteerVerificationStatus): boolean {
    const updated = this.updateVolunteerProfile(volunteerId, {
      verificationStatus: status,
      badge: status === 'VERIFIED' ? '✅ अधिकृत स्वयंसेवक' : undefined,
    });
    return !!updated;
  }

  // 5. Availability Control
  public setAvailability(id: string, availability: VolunteerAvailability): void {
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
  public acceptRequest(volunteerId: string, requestId: string): boolean {
    const volunteer = this.getVolunteerProfile(volunteerId);
    if (!volunteer || volunteer.verificationStatus !== 'VERIFIED') return false;

    const allRequests = HelpService.getHelpRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return false;

    // Update HelpRequest
    req.status = 'स्वयंसेवक assigned';
    req.assignedVolunteerId = volunteerId;
    req.volunteerName = volunteer.name;
    req.updatedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    // Save back to HelpService localStorage
    try {
      localStorage.setItem('deo_chhath_user_help_requests_v1', JSON.stringify(allRequests));
    } catch {
      // Ignore
    }

    // Record Assignment
    this.recordAssignment(requestId, volunteerId, 'ASSIGNED');
    return true;
  }

  // Volunteer Rejects Request
  public rejectRequest(volunteerId: string, requestId: string, reason?: string): boolean {
    const allRequests = HelpService.getHelpRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return false;

    if (req.assignedVolunteerId === volunteerId) {
      req.assignedVolunteerId = undefined;
      req.volunteerName = undefined;
      req.status = 'देखा गया';
      req.updatedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

      try {
        localStorage.setItem('deo_chhath_user_help_requests_v1', JSON.stringify(allRequests));
      } catch {
        // Ignore
      }
    }

    this.recordAssignment(requestId, volunteerId, 'REJECTED', reason);
    return true;
  }

  // Volunteer Starts Assistance
  public startRequest(volunteerId: string, requestId: string): boolean {
    const allRequests = HelpService.getHelpRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req || req.assignedVolunteerId !== volunteerId) return false;

    req.status = 'सहायता जारी';
    req.updatedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    try {
      localStorage.setItem('deo_chhath_user_help_requests_v1', JSON.stringify(allRequests));
    } catch {
      // Ignore
    }

    this.recordAssignment(requestId, volunteerId, 'IN_PROGRESS');
    return true;
  }

  // Volunteer Completes Assistance
  public completeRequest(volunteerId: string, requestId: string): boolean {
    const allRequests = HelpService.getHelpRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req || req.assignedVolunteerId !== volunteerId) return false;

    req.status = 'समाधान किया गया';
    req.updatedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    try {
      localStorage.setItem('deo_chhath_user_help_requests_v1', JSON.stringify(allRequests));
    } catch {
      // Ignore
    }

    this.recordAssignment(requestId, volunteerId, 'RESOLVED');
    return true;
  }

  // Escalate Request to Admin
  public escalateRequest(volunteerId: string, requestId: string, reason: string): boolean {
    const allRequests = HelpService.getHelpRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'ESCALATED';
    req.description = `${req.description} [एस्केलेशन कारण: ${reason}]`;
    req.updatedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    try {
      localStorage.setItem('deo_chhath_user_help_requests_v1', JSON.stringify(allRequests));
    } catch {
      // Ignore
    }

    this.recordAssignment(requestId, volunteerId, 'ESCALATED', reason);
    return true;
  }

  private recordAssignment(
    requestId: string,
    volunteerId: string,
    status: VolunteerAssignment['status'],
    notes?: string
  ) {
    try {
      const raw = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY);
      const list: VolunteerAssignment[] = raw ? JSON.parse(raw) : [];

      const newAssignment: VolunteerAssignment = {
        id: `asg-${Date.now()}`,
        requestId,
        volunteerId,
        status,
        assignedAt: new Date().toISOString(),
        acceptedAt: status === 'ASSIGNED' ? new Date().toISOString() : undefined,
        completedAt: status === 'RESOLVED' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
        notes,
      };

      list.unshift(newAssignment);
      localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }
}

export const VolunteerService = new VolunteerServiceManager();
