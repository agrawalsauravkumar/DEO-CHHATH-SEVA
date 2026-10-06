/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const familyRouter = Router();

// 1. Create Family Group
familyRouter.post('/groups', async (req, res) => {
  const { groupName, leaderName, leaderPhone, meetingPointName } = req.body;
  if (!groupName || !leaderName || !leaderPhone) {
    return res.status(400).json({ error: 'Group name, leader name, and phone required' });
  }

  // Generate 6-char alphanumeric group code
  const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const leaderId = `ldr-${Date.now()}`;
  const groupId = `grp-${Date.now()}`;

  const group = await repository.createFamilyGroup({
    id: groupId,
    groupCode,
    groupName,
    leaderId,
    leaderName,
    leaderPhone,
    meetingPointName: meetingPointName || 'सूर्य मंदिर मुख्य तोरण द्वार',
    createdAt: new Date().toISOString(),
  });

  // Add leader as first member
  await repository.addFamilyMember({
    id: leaderId,
    groupId,
    name: leaderName,
    phone: leaderPhone,
    relation: 'परिवार प्रमुख (Leader)',
    isElderly: false,
    lastPingAt: new Date().toISOString(),
    isSafe: true,
  });

  return res.status(201).json({ success: true, group });
});

// 2. Join Family Group by Code
familyRouter.post('/join', async (req, res) => {
  const { groupCode, name, phone, relation, isElderly } = req.body;
  if (!groupCode || !name) {
    return res.status(400).json({ error: 'Group code and member name required' });
  }

  const group = await repository.getFamilyGroupByCode(groupCode);
  if (!group) {
    return res.status(404).json({ error: 'अमान्य समूह कोड (Group not found with this code)' });
  }

  const memberId = `mbr-${Date.now()}`;
  const member = await repository.addFamilyMember({
    id: memberId,
    groupId: group.id,
    name,
    phone,
    relation: relation || 'परिवार सदस्य',
    isElderly: !!isElderly,
    lastPingAt: new Date().toISOString(),
    isSafe: true,
  });

  return res.status(201).json({ success: true, group, member });
});

// 3. Get Members of Group
familyRouter.get('/groups/:groupId/members', async (req, res) => {
  const members = await repository.getFamilyMembers(req.params.groupId);
  return res.json({ total: members.length, members });
});

// 4. Update Location & Safety Status (Heartbeat)
familyRouter.post('/members/:memberId/ping', async (req, res) => {
  const { latitude, longitude, isSafe } = req.body;
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Valid latitude and longitude required' });
  }

  const updated = await repository.updateFamilyMemberLocation(
    req.params.memberId,
    latitude,
    longitude,
    isSafe !== false
  );

  if (!updated) {
    return res.status(404).json({ error: 'Member not found' });
  }

  return res.json({ success: true, member: updated });
});
