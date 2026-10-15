/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { randomInt, randomUUID } from 'node:crypto';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { repository } from '../db/repository';
import { DbLostFoundStatus, DbLostFoundType } from '../db/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const lostFoundRouter = Router();

function isLostFoundStatus(value: unknown): value is DbLostFoundStatus {
  return value === 'SUBMITTED' ||
    value === 'UNDER_REVIEW' ||
    value === 'MATCH_FOUND' ||
    value === 'VERIFICATION_REQUIRED' ||
    value === 'TRANSFERRED_TO_HELP_POINT' ||
    value === 'RESOLVED' ||
    value === 'CLOSED' ||
    value === 'CANCELLED';
}

function isLostFoundType(value: unknown): value is DbLostFoundType {
  return value === 'LOST_PERSON' ||
    value === 'FOUND_PERSON' ||
    value === 'LOST_ITEM' ||
    value === 'FOUND_ITEM';
}

// 1. Get All Reports (Optional filter by type)
lostFoundRouter.get('/', asyncHandler(async (req, res) => {
  const type = req.query.type as string | undefined;
  if (type && !isLostFoundType(type)) {
    return res.status(400).json({ error: 'Valid lost-and-found report type required' });
  }
  const reports = (await repository.getLostFoundReports(type)).filter((report) =>
    report.status === 'MATCH_FOUND' || report.status === 'TRANSFERRED_TO_HELP_POINT'
  );
  return res.json({
    total: reports.length,
    reports: reports.map((report) => ({
      reportId: report.reportId,
      type: report.type,
      category: report.category,
      status: report.status,
      createdAt: report.createdAt,
    })),
  });
}));

// 2. Submit New Report
lostFoundRouter.post('/', requirePersistentDatabase, asyncHandler(async (req, res) => {
  const body = req.body as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Valid report details required' });
  }
  const {
    type,
    category,
    title,
    description,
    locationName,
    latitude,
    longitude,
    contactName,
    contactPhone,
    identifyingFeatures,
  } = body;
  const hasValidCoordinates =
    (latitude === undefined && longitude === undefined) ||
    (typeof latitude === 'number' &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      typeof longitude === 'number' &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180);
  if (
    !isLostFoundType(type) ||
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 200 ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.length > 2000 ||
    typeof locationName !== 'string' ||
    !locationName.trim() ||
    locationName.length > 200 ||
    typeof contactName !== 'string' ||
    !contactName.trim() ||
    contactName.length > 120 ||
    (category !== undefined && (typeof category !== 'string' || category.length > 100)) ||
    (contactPhone !== undefined &&
      (typeof contactPhone !== 'string' || !/^\+?[\d\s()-]{7,20}$/.test(contactPhone))) ||
    (identifyingFeatures !== undefined &&
      (typeof identifyingFeatures !== 'string' || identifyingFeatures.length > 1000)) ||
    !hasValidCoordinates
  ) {
    return res.status(400).json({ error: 'Valid report details and contact name required' });
  }

  const reportId = `LF-${new Date().getUTCFullYear()}-${randomInt(100000, 1000000)}`;
  const reportCoordinates =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? { latitude, longitude }
      : {};
  const newReport = await repository.createLostFoundReport({
    id: randomUUID(),
    reportId,
    type,
    category: category || 'सामान्य',
    title,
    description,
    locationName: locationName || 'देव मेला क्षेत्र',
    ...reportCoordinates,
    contactName,
    contactPhone: contactPhone || '',
    identifyingFeatures,
    status: 'SUBMITTED',
    isFlaggedMisuse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: 'रिपोर्ट सुरक्षित रूप से दर्ज हुई है। सहायता की पुष्टि के लिए कृपया सहायता केंद्र से संपर्क करें।',
    report: {
      id: newReport.id,
      reportId: newReport.reportId,
      type: newReport.type,
      category: newReport.category,
      title: newReport.title,
      description: newReport.description,
      locationName: newReport.locationName,
      status: newReport.status,
      createdAt: newReport.createdAt,
      updatedAt: newReport.updatedAt,
    },
  });
}));

// 3. Update Report Status (Help Desk / Admin)
lostFoundRouter.patch('/:id/status', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN'), requirePersistentDatabase, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  if (!isLostFoundStatus(status)) {
    return res.status(400).json({ error: 'Valid lost-and-found status required' });
  }

  const updated = await repository.updateLostFoundStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'LOST_FOUND_STATUS_UPDATE',
    entity: 'LostFoundReport',
    entityId: updated.id,
    newValueSummary: `Status set to ${status}`,
    ipAddress: req.ip,
  });

  return res.json(updated);
}));
