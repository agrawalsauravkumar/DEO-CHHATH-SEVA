/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';

export const rolesRouter = Router();

const ROLE_PERMISSIONS_MATRIX = {
  SUPER_ADMIN: {
    description: 'पूर्ण प्रशासनिक नियंत्रण (NextGen Dev Bhoomi Foundation)',
    permissions: [
      'ALL',
      'USER_MANAGEMENT',
      'VOLUNTEER_VERIFICATION',
      'FACILITY_EDIT',
      'ANNOUNCEMENT_PUBLISH',
      'EMERGENCY_BROADCAST',
      'AUDIT_LOG_VIEW',
      'SYSTEM_SETTINGS',
    ],
  },
  ADMIN: {
    description: 'सामान्य मेला प्रशासक',
    permissions: [
      'USER_MANAGEMENT',
      'VOLUNTEER_VERIFICATION',
      'FACILITY_EDIT',
      'ANNOUNCEMENT_PUBLISH',
      'AUDIT_LOG_VIEW',
    ],
  },
  CONTENT_ADMIN: {
    description: 'सूचना एवं मार्ग अलर्ट अधिकारी (जिला प्रशासन औरंगाबाद)',
    permissions: ['ANNOUNCEMENTS', 'ROUTE_ALERTS', 'NOTIFICATIONS'],
  },
  FACILITY_ADMIN: {
    description: 'पार्किंग, शटल व स्वच्छता सुविधा प्रबंधक',
    permissions: ['FACILITIES', 'PARKING_UPDATE', 'SHUTTLE_UPDATE'],
  },
  HELP_ADMIN: {
    description: 'सहायता शिविर एवं खोया-पाया समन्वयक',
    permissions: ['HELP_REQUESTS', 'LOST_FOUND_VERIFY', 'VOLUNTEER_DISPATCH'],
  },
  VOLUNTEER: {
    description: 'सत्यापित ग्राउंड सेवा स्वयंसेवक',
    permissions: ['DUTY_TOGGLE', 'HELP_ACCEPT', 'LOST_FOUND_SUBMIT'],
  },
  USER: {
    description: 'सामान्य श्रद्धालु एवं दर्शनार्थी',
    permissions: ['VIEW_FACILITIES', 'FAMILY_SHARING', 'REQUEST_HELP', 'SUBMIT_REPORT'],
  },
};

rolesRouter.get('/roles', (req, res) => {
  return res.json({
    roles: Object.keys(ROLE_PERMISSIONS_MATRIX),
    matrix: ROLE_PERMISSIONS_MATRIX,
  });
});

rolesRouter.get('/permissions', (req, res) => {
  return res.json({
    matrix: ROLE_PERMISSIONS_MATRIX,
  });
});
