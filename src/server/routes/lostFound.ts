/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const lostFoundRouter = Router();

// 1. Get All Reports (Optional filter by type)
lostFoundRouter.get('/', async (req, res) => {
  const type = req.query.type as string | undefined;
  const reports = await repository.getLostFoundReports(type);
  return res.json({
    total: reports.length,
    reports,
  });
});

// 2. Submit New Report
lostFoundRouter.post('/', async (req, res) => {
  const { type, category, title, description, locationName, latitude, longitude, contactName, contactPhone, identifyingFeatures } = req.body;
  if (!type || !title || !description || !contactName) {
    return res.status(400).json({ error: 'Type, title, description and contactName required' });
  }

  const reportId = `LF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const newReport = await repository.createLostFoundReport({
    id: `rep_${Date.now()}`,
    reportId,
    type,
    category: category || 'सामान्य',
    title,
    description,
    locationName: locationName || 'देव मेला क्षेत्र',
    latitude,
    longitude,
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
    message: 'रिपोर्ट सफलतापूर्वक दर्ज की गई। नियंत्रण कक्ष द्वारा सत्यापन जारी है।',
    report: newReport,
  });
});

// 3. Update Report Status (Help Desk / Admin)
lostFoundRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  const updated = await repository.updateLostFoundStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }

  return res.json(updated);
});
