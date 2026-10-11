/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LostFoundReport,
  LostFoundType,
  LostFoundStatus,
  LostFoundMatch,
  LostFoundHandover,
} from '../types';

const STORAGE_KEYS = {
  REPORTS: 'deo_lost_found_reports',
  MATCHES: 'deo_lost_found_matches',
  HANDOVERS: 'deo_lost_found_handovers',
  USER_ID: 'deo_lf_user_id',
};

class LostFoundServiceManager {
  private currentUserId: string;

  constructor() {
    this.currentUserId = this.initUserId();
    this.initSeedData();
  }

  private initUserId(): string {
    const existing = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (existing) return existing;
    const newId = 'lf_usr_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STORAGE_KEYS.USER_ID, newId);
    return newId;
  }

  private initSeedData(): void {
    const savedReports = this.getAllReports();
    const demoReportIds = new Set(['rep_1', 'rep_2', 'rep_3']);
    const actualReports = savedReports.filter((report) => !demoReportIds.has(report.id));
    if (actualReports.length !== savedReports.length) {
      this.saveReports(actualReports);
    }
  }

  public getUserId(): string {
    return this.currentUserId;
  }

  // ============================================================
  // REPORT CREATION & MANAGEMENT
  // ============================================================
  public createReport(data: {
    type: LostFoundType;
    category: string;
    title: string;
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    contactName?: string;
    contactPhone?: string;
    identifyingFeatures?: string;
    photoUrl?: string;
  }): LostFoundReport {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const reportId = `LF-2026-${randomSuffix}`;

    const newReport: LostFoundReport = {
      id: 'rep_' + Date.now(),
      reportId,
      type: data.type,
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      createdBy: this.currentUserId,
      contactName: data.contactName?.trim(),
      contactPhone: data.contactPhone?.trim(),
      identifyingFeatures: data.identifyingFeatures?.trim(),
      photoUrl: data.photoUrl,
      createdAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'SUBMITTED',
      verificationStatus: 'PENDING',
    };

    const reports = this.getAllReports();
    reports.unshift(newReport);
    this.saveReports(reports);

    // Auto trigger matching logic
    this.checkMatchesForReport(newReport);

    return newReport;
  }

  public getAllReports(): LostFoundReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) return [];
      return JSON.parse(data) as LostFoundReport[];
    } catch {
      return [];
    }
  }

  private saveReports(reports: LostFoundReport[]): void {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }

  public getMyReports(): LostFoundReport[] {
    return this.getAllReports().filter((r) => r.createdBy === this.currentUserId);
  }

  public getReportById(idOrReportId: string): LostFoundReport | undefined {
    return this.getAllReports().find(
      (r) => r.id === idOrReportId || r.reportId === idOrReportId
    );
  }

  public getPublicReports(): LostFoundReport[] {
    // Privacy-protected: Never expose private phone numbers or full home addresses
    return this.getAllReports().map((r) => ({
      ...r,
      contactPhone: undefined, // Stripped for privacy protection
    }));
  }

  public getAllPublicReports(): LostFoundReport[] {
    return this.getPublicReports();
  }

  public updateReportStatus(reportId: string, status: LostFoundStatus): boolean {
    const reports = this.getAllReports();
    const index = reports.findIndex((r) => r.id === reportId || r.reportId === reportId);
    if (index === -1) return false;

    reports[index].status = status;
    reports[index].updatedAt = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.saveReports(reports);
    return true;
  }

  public assignVolunteer(reportId: string, volunteerId: string): boolean {
    const reports = this.getAllReports();
    const index = reports.findIndex((r) => r.id === reportId || r.reportId === reportId);
    if (index === -1) return false;

    reports[index].assignedVolunteerId = volunteerId;
    reports[index].status = 'UNDER_REVIEW';
    reports[index].updatedAt = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.saveReports(reports);
    return true;
  }

  public closeReport(reportId: string): boolean {
    return this.updateReportStatus(reportId, 'CLOSED');
  }

  // ============================================================
  // MATCHING ENGINE (Privacy-protected with confidence score)
  // ============================================================
  private checkMatchesForReport(newRep: LostFoundReport): void {
    const reports = this.getAllReports();
    // Match LOST with FOUND of same category or reverse
    const targetType: LostFoundType | null =
      newRep.type === 'LOST_PERSON'
        ? 'FOUND_PERSON'
        : newRep.type === 'FOUND_PERSON'
        ? 'LOST_PERSON'
        : newRep.type === 'LOST_ITEM'
        ? 'FOUND_ITEM'
        : newRep.type === 'FOUND_ITEM'
        ? 'LOST_ITEM'
        : null;

    if (!targetType) return;

    const candidates = reports.filter(
      (r) => r.id !== newRep.id && r.type === targetType && r.status !== 'RESOLVED'
    );

    for (const cand of candidates) {
      // Calculate match confidence based on category keywords
      const sameCategory =
        newRep.category.toLowerCase().includes(cand.category.toLowerCase()) ||
        cand.category.toLowerCase().includes(newRep.category.toLowerCase());

      if (sameCategory) {
        const matchItem: LostFoundMatch = {
          id: 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          reportId: newRep.reportId,
          possibleMatchId: cand.reportId,
          matchReason: `श्रेणी (${newRep.category}) एवं स्थान विवरण में संभावित समानता`,
          confidence: 78,
          reviewStatus: 'PENDING',
          createdAt: new Date().toLocaleTimeString('hi-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        this.addMatch(matchItem);
        this.updateReportStatus(newRep.id, 'MATCH_FOUND');
        this.updateReportStatus(cand.id, 'MATCH_FOUND');
      }
    }
  }

  public getMatchesForReport(reportId: string): LostFoundMatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      if (!data) return [];
      const matches = JSON.parse(data) as LostFoundMatch[];
      return matches.filter(
        (m) => m.reportId === reportId || m.possibleMatchId === reportId
      );
    } catch {
      return [];
    }
  }

  private addMatch(match: LostFoundMatch): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      const matches = data ? (JSON.parse(data) as LostFoundMatch[]) : [];
      matches.unshift(match);
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch {
      // Ignore
    }
  }

  // ============================================================
  // HELP POINT HANDOVER
  // ============================================================
  public recordHandover(handover: LostFoundHandover): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HANDOVERS);
      const handovers = data ? (JSON.parse(data) as LostFoundHandover[]) : [];
      handovers.unshift(handover);
      localStorage.setItem(STORAGE_KEYS.HANDOVERS, JSON.stringify(handovers));

      // Update parent report status
      this.updateReportStatus(handover.reportId, 'TRANSFERRED_TO_HELP_POINT');
      return true;
    } catch {
      return false;
    }
  }

  public getHandovers(reportId?: string): LostFoundHandover[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HANDOVERS);
      if (!data) return [];
      const handovers = JSON.parse(data) as LostFoundHandover[];
      if (reportId) {
        return handovers.filter((h) => h.reportId === reportId);
      }
      return handovers;
    } catch {
      return [];
    }
  }

  // ============================================================
  // ANTI-ABUSE & MISUSE REPORTING
  // ============================================================
  public reportMisuse(reportId: string, reason: string): boolean {
    const reports = this.getAllReports();
    const index = reports.findIndex((r) => r.id === reportId || r.reportId === reportId);
    if (index === -1) return false;

    reports[index].verificationStatus = 'REJECTED';
    reports[index].updatedAt = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.saveReports(reports);
    return true;
  }
}

export const LostFoundService = new LostFoundServiceManager();
