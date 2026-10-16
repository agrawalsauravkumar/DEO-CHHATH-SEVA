/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OfficialAnnouncement,
  RouteAlert,
  AnnouncementCategory,
  AnnouncementPriority,
} from '../types';
import { LocationService } from './LocationService';
import { apiRequest } from './apiClient';

const STORAGE_KEY_ANNOUNCEMENTS = 'deo_official_announcements_v1';
const STORAGE_KEY_LAST_UPDATED = 'deo_announcements_last_sync_v1';
const STORAGE_KEY_DISMISSED = 'deo_dismissed_announcement_ids';

const DEFAULT_ANNOUNCEMENTS: OfficialAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'देव बाजार मुख्य मार्ग अस्थायी रूप से वाहनों हेतु बंद',
    shortDescription: 'पैदल श्रद्धालुओं व व्रतियों की भारी भीड़ के दृष्टिगत चारपहिया व दोपहिया वाहन प्रवेश निषेध है। केवल पैदल आवागमन अनुमत है।',
    details: 'जिला दंडाधिकारी एवं पुलिस अधीक्षक औरंगाबाद द्वारा जारी आदेशानुसार देव बाजार मोड़ से सूर्य मंदिर मुख्य द्वार तक मार्ग पूरी तरह पैदल क्षेत्र घोषित किया गया है। वाहन निकटतम P1 या P3 पार्किंग में लगाएं।',
    category: 'ROUTE',
    priority: 'URGENT',
    isVerifiedOfficial: true,
    publishedTime: 'आज 07:30 AM',
    lastUpdatedTime: 'आज 08:45 AM',
    source: 'जिला प्रशासन औरंगाबाद एवं मेला नियंत्रण कक्ष',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
    routeAlert: {
      id: 'ra-001',
      announcementId: 'ann-001',
      type: 'ROAD_CLOSURE',
      title: 'देव बाजार मुख्य मार्ग बंद',
      roadName: 'देव बाजार मेन रोड',
      reason: 'छठ महापर्व पैदल परिक्रमा व व्रतियों की सुरक्षा हेतु वाहन प्रतिबंधित',
      affectedArea: 'देव बाजार मोड़ से सूर्य मंदिर चौक (450 मीटर)',
      latitude: 24.6538,
      longitude: 84.4365,
      radiusMeters: 400,
      startTime: '05:00 AM',
      endTime: '11:00 PM',
      isVerified: true,
      isActive: true,
      alternativeRouteAvailable: true,
      alternativeRouteAdvice: 'रुद्र कुंड लिंक मार्ग या कॉलेज बाईपास मार्ग का उपयोग करें।',
      lastUpdated: 'आज 08:45 AM',
    },
  },
  {
    id: 'ann-002',
    title: 'सायंकालीन एवं प्रातःकालीन अर्घ्य का आधिकारिक समय',
    shortDescription: 'संध्या अर्घ्य: सायं 05:14 बजे • प्रातःकालीन अर्घ्य: प्रातः 06:08 बजे (मेला पंचांग व खगोलीय गणना अनुसार)।',
    details: 'सभी व्रती एवं श्रद्धालु समय से पूर्व घाटों पर स्थान ग्रहण करें। सूर्य कुंड व रुद्र कुंड पर अर्घ्य अर्पण के समय विशेष स्वयंसेवक सहायता उपलब्ध रहेगी।',
    category: 'CHHATH_INFO',
    priority: 'IMPORTANT',
    isVerifiedOfficial: true,
    publishedTime: 'कल 06:00 PM',
    lastUpdatedTime: 'आज 06:00 AM',
    source: 'देव सूर्य मंदिर न्यास समिति व जिला जनसंपर्क',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
  },
  {
    id: 'ann-003',
    title: 'अंबा-देव मार्ग डायवर्जन: कॉलेज मैदान (P3) की ओर मोड़ें',
    shortDescription: 'मुख्य पार्किंग P1 एवं P2 भरने के कारण अंबा की ओर से आने वाले चारपहिया वाहनों को देव कॉलेज मैदान (P3) की ओर डायवर्ट किया जा रहा है।',
    details: 'यातायात पुलिस देव द्वारा चेकपोस्ट पर बैरिकेडिंग की गई है। P3 पार्किंग से निःशुल्क ई-रिक्शा शटल सेवा सूर्य कुंड तक निरंतर चल रही है।',
    category: 'ROUTE',
    priority: 'IMPORTANT',
    isVerifiedOfficial: true,
    publishedTime: 'आज 09:15 AM',
    lastUpdatedTime: 'आज 09:40 AM',
    source: 'यातायात नियंत्रण कक्ष देव',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
    routeAlert: {
      id: 'ra-002',
      announcementId: 'ann-003',
      type: 'DIVERSION',
      title: 'अंबा-देव प्रवेश डायवर्जन',
      roadName: 'स्टेट हाईवे 10 (अंबा-देव रोड)',
      reason: 'P1/P2 पार्किंग क्षमता सीमा के निकट होने पर वाहनों का डायवर्जन',
      affectedArea: 'देव एंट्री चेकपोस्ट तिराहा',
      latitude: 24.6495,
      longitude: 84.4410,
      radiusMeters: 300,
      startTime: '08:00 AM',
      endTime: '10:00 PM',
      isVerified: true,
      isActive: true,
      alternativeRouteAvailable: true,
      alternativeRouteAdvice: 'कॉलेज मैदान पार्किंग (P3) मार्ग का अनुसरण करें, वहाँ से मुफ्त शटल उपलब्ध है।',
      lastUpdated: 'आज 09:40 AM',
    },
  },
  {
    id: 'ann-004',
    title: 'पार्किंग P1 (सूर्य मंदिर मुख्य पार्किंग) में दोपहिया स्थान उपलब्ध',
    shortDescription: 'चारपहिया वाहन केवल P2 एवं P3 में पार्क करें। P1 में केवल दोपहिया वाहनों का प्रवेश खुला है।',
    details: 'पार्किंग क्षमता की वास्तविक स्थिति नियंत्रण कक्ष द्वारा लगातार अपडेट की जा रही है। किसी भी अनधिकृत स्थान पर गाड़ी न छोड़ें।',
    category: 'PARKING',
    priority: 'NORMAL',
    isVerifiedOfficial: true,
    publishedTime: 'आज 10:00 AM',
    lastUpdatedTime: 'आज 10:10 AM',
    source: 'पार्किंग प्रबंधन सेल देव',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
    facilityImpact: {
      facilityType: 'PARKING',
      facilityId: 'parking-1',
      facilityName: 'सूर्य मंदिर मुख्य पार्किंग (P1)',
      statusChange: 'दोपहिया उपलब्ध, चारपहिया पूर्ण',
    },
  },
  {
    id: 'ann-005',
    title: 'रुद्र कुंड के समीप नया आपातकालीन प्राथमिक चिकित्सा शिविर शुरू',
    shortDescription: 'डॉक्टरों की टीम, जीवनरक्षक दवाएं, ओआरएस काउंटर तथा 108 एम्बुलेंस तैयार स्थिति में तैनात हैं।',
    details: 'यदि किसी श्रद्धालु या बुजुर्ग को चक्कर, निर्जलीकरण या सांस लेने में कठिनाई हो तो तुरंत रुद्र कुंड कैंप नंबर 3 पर संपर्क करें। फोन: 108 या 112।',
    category: 'MEDICAL',
    priority: 'IMPORTANT',
    isVerifiedOfficial: true,
    publishedTime: 'आज 08:00 AM',
    lastUpdatedTime: 'आज 08:30 AM',
    source: 'स्वास्थ्य विभाग औरंगाबाद (बिहार)',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
    facilityImpact: {
      facilityType: 'MEDICAL',
      facilityId: 'med-rudra',
      facilityName: 'रुद्र कुंड मेडिकल कैंप #3',
      statusChange: 'सक्रिय एवं एम्बुलेंस 108 ऑन-ड्यूटी',
    },
  },
  {
    id: 'ann-006',
    title: 'निःशुल्क ई-रिक्शा शटल रूट 2 पर 10 अतिरिक्त गाड़ियाँ जोड़ी गईं',
    shortDescription: 'कॉलेज मैदान पार्किंग (P3) से सूर्य कुंड तक बुजुर्गों, दिव्यांगों व व्रतियों हेतु शटल अंतराल अब मात्र 3 मिनट है।',
    details: 'यह सेवा NextGen देवभूमि फाउंडेशन एवं जिला प्रशासन द्वारा पूर्णतः निःशुल्क संचालित है। किसी को भी कोई किराया न दें।',
    category: 'SHUTTLE',
    priority: 'NORMAL',
    isVerifiedOfficial: true,
    publishedTime: 'आज 09:30 AM',
    lastUpdatedTime: 'आज 09:45 AM',
    source: 'शटल सेवा समन्वय समिति',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
    facilityImpact: {
      facilityType: 'SHUTTLE',
      facilityId: 'shuttle-route-2',
      facilityName: 'P3 कॉलेज शटल रूट',
      statusChange: '10 अतिरिक्त वाहन सक्रिय, अंतराल 3 मिनट',
    },
  },
  {
    id: 'ann-007',
    title: 'सूर्य कुंड व रुद्र कुंड में बैरिकेडिंग पार न करें — एसडीआरएफ अलर्ट',
    shortDescription: 'गहरे पानी में जाना सख्त मना है। लाल झंडों व फ्लोटिंग रस्सियों के भीतर ही सुरक्षित अर्घ्य अर्पित करें।',
    details: 'दोनों कुंडों पर एनडीआरएफ/एसडीआरएफ के गोताखोर व मोटरबोट निरंतर गश्त कर रहे हैं। बच्चों का हाथ पकड़े रहें।',
    category: 'SAFETY',
    priority: 'URGENT',
    isVerifiedOfficial: true,
    publishedTime: 'कल 08:00 PM',
    lastUpdatedTime: 'आज 06:15 AM',
    source: 'आपदा प्रबंधन विभाग बिहार एवं एसडीआरएफ',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
  },
  {
    id: 'ann-008',
    title: 'मेला खोया-पाया व नियंत्रण कक्ष का मुख्य हेल्पलाइन नंबर जारी',
    shortDescription: 'किसी भी परिजन के बिछड़ने या आपात स्थिति में 06186-222100 या 112 पर तुरंत संपर्क करें।',
    details: 'खोया-पाया बूथ सूर्य मंदिर मुख्य गेट एवं सूर्य कुंड घाट पर 24 घंटे लाउडस्पीकर प्रसारण व लाइव फोटो मैचिंग के साथ संचालित हैं।',
    category: 'HELP',
    priority: 'IMPORTANT',
    isVerifiedOfficial: true,
    publishedTime: 'आज 07:00 AM',
    lastUpdatedTime: 'आज 07:15 AM',
    source: 'मेला नियंत्रण कक्ष देव',
    badgeText: 'VERIFIED OFFICIAL',
    isActive: true,
  },
];

class AnnouncementServiceManager {
  private announcements: OfficialAnnouncement[] = [];
  private lastUpdated: string = '';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      if (stored) {
        const cached = JSON.parse(stored) as OfficialAnnouncement[];
        this.announcements = cached.map((announcement) => ({
          ...announcement,
          isVerifiedOfficial: true,
          isActive: true,
          badgeText: 'VERIFIED OFFICIAL',
          routeAlert: announcement.routeAlert
            ? { ...announcement.routeAlert, isVerified: true, isActive: true }
            : undefined,
        }));
      } else {
        this.announcements = DEFAULT_ANNOUNCEMENTS.map((announcement) => ({
          ...announcement,
          isVerifiedOfficial: true,
          isActive: true,
          badgeText: 'VERIFIED OFFICIAL',
          routeAlert: announcement.routeAlert
            ? { ...announcement.routeAlert, isVerified: true, isActive: true }
            : undefined,
        }));
        this.saveToStorage();
      }

      const lastSync = localStorage.getItem(STORAGE_KEY_LAST_UPDATED);
      if (lastSync) {
        this.lastUpdated = lastSync;
      } else {
        this.lastUpdated = new Date().toLocaleTimeString('hi-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        localStorage.setItem(STORAGE_KEY_LAST_UPDATED, this.lastUpdated);
      }
    } catch {
      this.announcements = DEFAULT_ANNOUNCEMENTS.map((announcement) => ({
        ...announcement,
        isVerifiedOfficial: true,
        isActive: true,
        badgeText: 'VERIFIED OFFICIAL',
        routeAlert: announcement.routeAlert
          ? { ...announcement.routeAlert, isVerified: true, isActive: true }
          : undefined,
      }));
      this.lastUpdated = '10:00 AM';
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(this.announcements));
      this.lastUpdated = new Date().toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      localStorage.setItem(STORAGE_KEY_LAST_UPDATED, this.lastUpdated);
    } catch (e) {
      console.warn('Failed to save announcements to localStorage', e);
    }
  }

  public getAllAnnouncements(): OfficialAnnouncement[] {
    return [...this.announcements];
  }

  public async syncAnnouncements(includeInactive = false): Promise<void> {
    const data = await apiRequest<{
      announcements: Array<{
        id: string;
        title: string;
        shortDescription: string;
        details?: string;
        category: AnnouncementCategory;
        priority: AnnouncementPriority;
        status: string;
        isVerifiedOfficial: boolean;
        source: string;
        publishedAt: string;
        expiresAt?: string;
        routeAlert?: RouteAlert;
      }>;
    }>(
      includeInactive ? '/api/announcements/admin' : '/api/announcements',
      {},
      includeInactive
    );
    this.announcements = data.announcements.map((item) => ({
      id: item.id,
      title: item.title,
      shortDescription: item.shortDescription,
      details: item.details,
      category: item.category,
      priority: item.priority,
      isVerifiedOfficial: item.isVerifiedOfficial,
      publishedTime: new Date(item.publishedAt).toLocaleString('hi-IN'),
      lastUpdatedTime: new Date(item.publishedAt).toLocaleString('hi-IN'),
      source: item.source,
      badgeText: item.isVerifiedOfficial ? 'VERIFIED OFFICIAL' : 'अपुष्ट सूचना',
      isActive: item.status === 'PUBLISHED' && item.isVerifiedOfficial &&
        (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now()),
      routeAlert: item.routeAlert,
    }));
    this.saveToStorage();
  }

  public getActiveAnnouncements(): OfficialAnnouncement[] {
    return this.announcements.filter((a) => a.isActive);
  }

  public getAnnouncementsByCategory(category: AnnouncementCategory | 'ALL'): OfficialAnnouncement[] {
    if (category === 'ALL') return this.getActiveAnnouncements();
    return this.announcements.filter((a) => a.isActive && a.category === category);
  }

  public getAnnouncementById(id: string): OfficialAnnouncement | undefined {
    return this.announcements.find((a) => a.id === id);
  }

  public getLastUpdatedTime(): string {
    return this.lastUpdated || 'आज 10:15 AM';
  }

  // Active Route Alerts (Road closures, diversions, restrictions)
  public getActiveRouteAlerts(): RouteAlert[] {
    return this.announcements
      .filter((a) => a.isActive && a.routeAlert && a.routeAlert.isActive)
      .map((a) => a.routeAlert as RouteAlert);
  }

  public getAllRouteAlerts(): RouteAlert[] {
    return this.announcements
      .filter((announcement) => announcement.routeAlert)
      .map((announcement) => announcement.routeAlert as RouteAlert);
  }

  public getRouteAlertById(id: string): RouteAlert | undefined {
    const alerts = this.getActiveRouteAlerts();
    return alerts.find((ra) => ra.id === id);
  }

  // Check if a navigation route geometry intersects any active road closure or route restriction
  public checkRouteConflict(routeGeometry: [number, number][]): RouteAlert | null {
    if (!routeGeometry || routeGeometry.length === 0) return null;

    const activeAlerts = this.getActiveRouteAlerts();
    if (activeAlerts.length === 0) return null;

    for (const alert of activeAlerts) {
      const radiusKm = (alert.radiusMeters || 350) / 1000;
      for (const pt of routeGeometry) {
        const dist = LocationService.calculateDistanceKm(
          { latitude: pt[0], longitude: pt[1] },
          { latitude: alert.latitude, longitude: alert.longitude }
        );
        if (dist <= radiusKm) {
          return alert;
        }
      }
    }

    return null;
  }

  // Check if destination coordinates are within a closed/restricted zone
  public checkDestinationConflict(destLat: number, destLng: number): RouteAlert | null {
    const activeAlerts = this.getActiveRouteAlerts();
    for (const alert of activeAlerts) {
      const radiusKm = (alert.radiusMeters || 350) / 1000;
      const dist = LocationService.calculateDistanceKm(
        { latitude: destLat, longitude: destLng },
        { latitude: alert.latitude, longitude: alert.longitude }
      );
      if (dist <= radiusKm) {
        return alert;
      }
    }
    return null;
  }

  // High Priority / Emergency alert for Home banner
  public getTopUrgentAlert(): OfficialAnnouncement | null {
    const dismissedIds = this.getDismissedIds();
    const urgent = this.announcements.find(
      (a) =>
        a.isActive &&
        (a.priority === 'EMERGENCY' || a.priority === 'URGENT') &&
        !dismissedIds.includes(a.id)
    );
    return urgent || null;
  }

  public dismissUrgentAlert(id: string): void {
    const dismissed = this.getDismissedIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      try {
        sessionStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(dismissed));
      } catch {
        // Ignore session storage error
      }
    }
  }

  private getDismissedIds(): string[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_DISMISSED);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Admin / Simulator capabilities for verification testing (Req 13)
  public async toggleRouteAlert(alertId: string, active: boolean): Promise<void> {
    await apiRequest(`/api/announcements/route-alerts/${encodeURIComponent(alertId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: active }),
    }, true);
    this.announcements = this.announcements.map((ann) => {
      if (ann.routeAlert && ann.routeAlert.id === alertId) {
        return {
          ...ann,
          routeAlert: {
            ...ann.routeAlert,
            isActive: active,
            lastUpdated: 'अभी अपडेट किया गया',
          },
        };
      }
      return ann;
    });
    this.saveToStorage();
  }

  public async setAnnouncementActive(id: string, active: boolean): Promise<void> {
    await apiRequest(`/api/announcements/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: active ? 'PUBLISHED' : 'EXPIRED' }),
    }, true);
    this.announcements = this.announcements.map((announcement) =>
      announcement.id === id ? { ...announcement, isActive: active } : announcement
    );
    this.saveToStorage();
  }

  public async addAnnouncement(
    announcement: Omit<OfficialAnnouncement, 'id'> & { expiresAt: string }
  ): Promise<OfficialAnnouncement> {
    const result = await apiRequest<{ announcement: {
      id: string;
      title: string;
      shortDescription: string;
      details?: string;
      category: AnnouncementCategory;
      priority: AnnouncementPriority;
      isVerifiedOfficial: boolean;
      source: string;
      publishedAt: string;
      expiresAt: string;
      status: string;
    } }>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: announcement.title,
        shortDescription: announcement.shortDescription,
        details: announcement.details,
        category: announcement.category,
        priority: announcement.priority,
        expiresAt: announcement.expiresAt,
      }),
    }, true);
    const created: OfficialAnnouncement = {
      ...announcement,
      ...result.announcement,
      publishedTime: new Date(result.announcement.publishedAt).toLocaleString('hi-IN'),
      lastUpdatedTime: new Date(result.announcement.publishedAt).toLocaleString('hi-IN'),
      expiresAt: result.announcement.expiresAt,
      badgeText: result.announcement.isVerifiedOfficial ? 'VERIFIED OFFICIAL' : 'अपुष्ट सूचना',
      isActive: result.announcement.status === 'PUBLISHED' && result.announcement.isVerifiedOfficial,
    };
    this.announcements = [created, ...this.announcements];
    this.saveToStorage();
    return created;
  }

  public resetToDefaults(): void {
    this.announcements = DEFAULT_ANNOUNCEMENTS;
    this.saveToStorage();
  }
}

export const AnnouncementService = new AnnouncementServiceManager();
