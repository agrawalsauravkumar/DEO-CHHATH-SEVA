import { HelpPoint, HelpRequest, VolunteerProfile } from '../types';
import { LocationService } from './LocationService';
import { apiRequest } from './apiClient';

const STORAGE_HELP_REQUESTS_KEY = 'deo_chhath_user_help_requests_v1';

// Verified Help Points in Deo
export const DEO_HELP_POINTS: HelpPoint[] = [
  {
    id: 'help-central-control',
    name: 'मेला केंद्रीय नियंत्रण कक्ष (थाना मोड़ चौक)',
    nameEn: 'Central Mela Control Room (Thana Mor)',
    category: 'CONTROL_ROOM',
    latitude: 24.6528,
    longitude: 84.4348,
    address: 'थाना मोड़, मुख्य प्रशासनिक शिविर, देव',
    phone: '06186-222120',
    description: 'जिला प्रशासन एवं पुलिस का मुख्य 24x7 कमांड सेंटर। खोया-पाया उद्घोषणा एवं सीसीटीवी मॉनिटरिंग।',
    verified: true,
    active: true,
    lastUpdated: '10 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'help-nextgen-camp',
    name: 'NextGen सेवा सहायता शिविर (सूर्य मंदिर पूर्वी तोरण द्वार)',
    nameEn: 'NextGen Seva Help Camp (East Gate)',
    category: 'VOLUNTEER_DESK',
    latitude: 24.6540,
    longitude: 84.4385,
    address: 'सूर्य मंदिर पूर्वी मुख्य द्वार, देव',
    phone: '06186-222115',
    description: 'फाउंडेशन का मुख्य सेवा केंद्र। व्हीलचेयर, खोया-पाया सहायता, प्राथमिक उपचार एवं स्वयंसेवक समन्वय।',
    verified: true,
    active: true,
    lastUpdated: '5 मिनट पहले',
    source: 'ADMIN_VERIFIED',
  },
  {
    id: 'help-police-suryakund',
    name: 'सूर्य कुंड उत्तरी घाट पुलिस सहायता केंद्र',
    nameEn: 'Surya Kund Police Post',
    category: 'POLICE',
    latitude: 24.6548,
    longitude: 84.4378,
    address: 'सूर्य कुंड उत्तरी छोर, देव',
    phone: '112',
    description: 'घाट सुरक्षा, एनडीआरएफ/एसडीआरएफ गोताखोर टीम एवं भीड़ नियंत्रण सहायता चौकी।',
    verified: true,
    active: true,
    lastUpdated: '12 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'help-deo-thana',
    name: 'देव थाना (Deo Police Station)',
    nameEn: 'Deo Police Station',
    category: 'POLICE',
    latitude: 24.6530,
    longitude: 84.4335,
    address: 'थाना रोड, देव',
    phone: '06186-222100',
    description: 'स्थानीय पुलिस थाना। एफआईआर, सुरक्षा गश्ती एवं विधि-व्यवस्था।',
    verified: true,
    active: true,
    lastUpdated: '15 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'help-women-desk',
    name: 'महिला एवं बाल सुरक्षा सहायता डेस्क',
    nameEn: 'Women & Child Safety Desk',
    category: 'WOMEN_HELP',
    latitude: 24.6535,
    longitude: 84.4368,
    address: 'सूर्य मंदिर पश्चिमी मार्ग, देव',
    phone: '181',
    description: 'महिला पुलिस अधिकारियों द्वारा संचालित विशेष सहायता डेस्क। खोए बच्चों की तुरंत सुपुर्दगी।',
    verified: true,
    active: true,
    lastUpdated: '20 मिनट पहले',
    source: 'DISTRICT_ADMINISTRATION',
  },
  {
    id: 'help-senior-divyang',
    name: 'वरिष्ठ नागरिक एवं दिव्यांग सहायता केंद्र (P2 कॉलेज पड़ाव)',
    nameEn: 'Senior & Divyang Assistance (College Ground)',
    category: 'SENIOR_HELP',
    latitude: 24.6568,
    longitude: 84.4285,
    address: 'देव डिग्री कॉलेज मैदान प्रवेश द्वार',
    description: 'बुजुर्गों व दिव्यांगों हेतु व्हीलचेयर, ई-रिक्शा शटल एवं स्वयंसेवक सारथी सेवा।',
    verified: true,
    active: true,
    lastUpdated: '8 मिनट पहले',
    source: 'ADMIN_VERIFIED',
  },
];

// Verified Volunteer Team (Privacy compliant: No private phone numbers exposed publicly)
export const DEO_VERIFIED_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: 'vol-01',
    name: 'राहुल कुमार (सेवा दल प्रमुख)',
    volunteerId: 'NXG-DEO-2026-01',
    serviceArea: 'सूर्य मंदिर पूर्वी द्वार एवं गर्भगृह कतार',
    verified: true,
    active: true,
    latitude: 24.6540,
    longitude: 84.4385,
    badge: 'फर्स्ट एड व व्हीलचेयर',
  },
  {
    id: 'vol-02',
    name: 'अमित कुमार सिंह',
    volunteerId: 'NXG-DEO-2026-08',
    serviceArea: 'सूर्य कुंड घाट 1 एवं 2',
    verified: true,
    active: true,
    latitude: 24.6546,
    longitude: 84.4376,
    badge: 'घाट सुरक्षा व जल सेवा',
  },
  {
    id: 'vol-03',
    name: 'पूजा कुमारी',
    volunteerId: 'NXG-DEO-2026-14',
    serviceArea: 'महिला सहायता व खोया-पाया केंद्र',
    verified: true,
    active: true,
    latitude: 24.6535,
    longitude: 84.4368,
    badge: 'महिला समन्वय',
  },
  {
    id: 'vol-04',
    name: 'विकास रंजन',
    volunteerId: 'NXG-DEO-2026-22',
    serviceArea: 'P2 कॉलेज शटल पड़ाव',
    verified: true,
    active: true,
    latitude: 24.6568,
    longitude: 84.4285,
    badge: 'ई-रिक्शा शटल सारथी',
  },
];

class HelpServiceManager {
  private requests: HelpRequest[] = [];
  private helpPoints: HelpPoint[] = [];
  private volunteers: VolunteerProfile[] = [];

  // 1. Get all help points
  public getHelpPoints(): HelpPoint[] {
    return this.helpPoints;
  }

  // 2. Get nearby help points sorted by real GPS distance
  public getNearbyHelpPoints(
    userLat: number,
    userLng: number
  ): (HelpPoint & { distanceMeters: number; distanceDisplay: string })[] {
    const withDistance = this.helpPoints.map((hp) => {
      const distKm = LocationService.calculateDistanceKm(
        { latitude: userLat, longitude: userLng },
        { latitude: hp.latitude, longitude: hp.longitude }
      );
      const meters = Math.round(distKm * 1000);
      const display =
        meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
      return {
        ...hp,
        distanceMeters: meters,
        distanceDisplay: display,
      };
    });

    return withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // 3. Get help point by ID
  public getHelpPointById(id: string): HelpPoint | undefined {
    return this.helpPoints.find((hp) => hp.id === id);
  }

  // 4. Get verified help points only
  public getVerifiedHelpPoints(): HelpPoint[] {
    return this.helpPoints.filter((hp) => hp.verified);
  }

  // 5. Help Request System (Persisted locally, ready for API sync)
  public getHelpRequests(): HelpRequest[] {
    if (this.requests.length) return [...this.requests];
    try {
      const raw = localStorage.getItem(STORAGE_HELP_REQUESTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async syncHelpRequests(sessionType: 'admin' | 'user' = 'admin'): Promise<void> {
    const data = await apiRequest<{
      requests: Array<{
        id: string;
        type: string;
        description: string;
        userName?: string;
        userPhone?: string;
        latitude?: number;
        longitude?: number;
        status: string;
        assignedVolunteerId?: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>('/api/help/requests', {}, true, sessionType);
    this.requests = data.requests.map((request) => ({
      id: request.id,
      type: request.type,
      description: request.description,
      userName: request.userName,
      userPhone: request.userPhone,
      latitude: request.latitude,
      longitude: request.longitude,
      status: this.toLocalStatus(request.status),
      assignedVolunteerId: request.assignedVolunteerId,
      createdAt: new Date(request.createdAt).toLocaleString('hi-IN'),
      updatedAt: new Date(request.updatedAt).toLocaleString('hi-IN'),
    }));
    this.persistRequests();
  }

  private toLocalStatus(status: string): HelpRequest['status'] {
    switch (status) {
      case 'ASSIGNED': return 'स्वयंसेवक assigned';
      case 'IN_PROGRESS': return 'सहायता जारी';
      case 'RESOLVED': return 'समाधान किया गया';
      case 'CANCELLED': return 'रद्द किया गया';
      case 'ESCALATED': return 'ESCALATED';
      default: return 'प्राप्त';
    }
  }

  private persistRequests(): void {
    try {
      localStorage.setItem(STORAGE_HELP_REQUESTS_KEY, JSON.stringify(this.requests));
    } catch (error) {
      console.warn('Help request cache could not be updated; server data remains saved.', error);
    }
  }

  public async updateHelpRequestStatus(
    id: string,
    status: HelpRequest['status'],
    resolutionNotes?: string,
    sessionType: 'admin' | 'user' = 'admin'
  ): Promise<void> {
    const serverStatus = {
      'प्राप्त': 'RECEIVED',
      'देखा गया': 'RECEIVED',
      'स्वयंसेवक assigned': 'ASSIGNED',
      'सहायता जारी': 'IN_PROGRESS',
      'समाधान किया गया': 'RESOLVED',
      'ESCALATED': 'ESCALATED',
      'रद्द किया गया': 'CANCELLED',
    }[status];
    const updated = await apiRequest<{
      id: string;
      status: string;
      assignedVolunteerId?: string;
    }>(`/api/help/requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: serverStatus, resolutionNotes }),
    }, true, sessionType);
    const local = this.requests.find((request) => request.id === id);
    if (local) {
      local.status = this.toLocalStatus(updated.status);
      local.assignedVolunteerId = updated.assignedVolunteerId;
      local.updatedAt = new Date().toLocaleString('hi-IN');
      this.persistRequests();
    } else {
      await this.syncHelpRequests();
    }
  }

  public createHelpRequest(
    data: Omit<HelpRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): HelpRequest {
    const current = this.getHelpRequests();
    const newRequest: HelpRequest = {
      id: `req-${Date.now()}`,
      ...data,
      status: 'प्राप्त',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedVolunteerId: undefined,
    };
    this.requests = [newRequest, ...current];
    this.persistRequests();
    return newRequest;
  }

  public getHelpRequestStatus(id: string): HelpRequest | undefined {
    const list = this.getHelpRequests();
    return list.find((req) => req.id === id);
  }

  public cancelHelpRequest(id: string): boolean {
    const list = this.getHelpRequests();
    const filtered = list.filter((req) => req.id !== id);
    try {
      localStorage.setItem(STORAGE_HELP_REQUESTS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // 6. Volunteers (Privacy protected: no phone numbers displayed publicly)
  public getVerifiedVolunteers(
    userLat?: number,
    userLng?: number
  ): (VolunteerProfile & { distanceMeters?: number; distanceDisplay?: string })[] {
    return this.volunteers.filter((vol) => vol.verified && vol.active).map((vol) => {
      if (userLat !== undefined && userLng !== undefined && vol.latitude && vol.longitude) {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: userLat, longitude: userLng },
          { latitude: vol.latitude, longitude: vol.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...vol,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      }
      return {
        ...vol,
        distanceDisplay: 'स्थान उपलब्ध',
      };
    });
  }
}

export const HelpService = new HelpServiceManager();
