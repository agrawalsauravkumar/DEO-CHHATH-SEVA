/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { randomInt, randomUUID } from 'node:crypto';
import { repository } from '../db/repository';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const familyRouter = Router();

// 1. Create Family Group
familyRouter.post('/groups', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { groupName, meetingPointName } = req.body;
  if (typeof groupName !== 'string' || !groupName.trim()) {
    return res.status(400).json({ error: 'Group name required' });
  }

  const user = req.user!;
  const groupCode = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const leaderId = `ldr-${randomUUID()}`;
  const groupId = `grp-${randomUUID()}`;

  const group = await repository.createFamilyGroup({
    id: groupId,
    groupCode,
    groupName: groupName.trim(),
    leaderId: user.id,
    leaderName: user.fullName,
    leaderPhone: user.phone || '',
    meetingPointName: meetingPointName || 'सूर्य मंदिर मुख्य तोरण द्वार',
    createdAt: new Date().toISOString(),
  });

  // Add leader as first member
  await repository.addFamilyMember({
    id: leaderId,
    groupId,
    userId: user.id,
    name: user.fullName,
    phone: user.phone,
    relation: 'परिवार प्रमुख (Leader)',
    isElderly: false,
    lastPingAt: new Date().toISOString(),
    isSafe: true,
  });

  return res.status(201).json({ success: true, group });
});

// 2. Join Family Group by Code
familyRouter.post('/join', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { groupCode, relation, isElderly } = req.body;
  if (typeof groupCode !== 'string' || !groupCode.trim()) {
    return res.status(400).json({ error: 'Group code required' });
  }
  if (relation !== undefined && (typeof relation !== 'string' || relation.length > 100)) {
    return res.status(400).json({ error: 'Relation must be a string of at most 100 characters' });
  }

  const group = await repository.getFamilyGroupByCode(groupCode);
  if (!group) {
    return res.status(404).json({ error: 'अमान्य समूह कोड (Group not found with this code)' });
  }

  const user = req.user!;
  const memberId = `mbr-${randomUUID()}`;
  const member = await repository.addFamilyMember({
    id: memberId,
    groupId: group.id,
    userId: user.id,
    name: user.fullName,
    phone: user.phone,
    relation: relation || 'परिवार सदस्य',
    isElderly: isElderly === true,
    lastPingAt: new Date().toISOString(),
    isSafe: true,
  });

  return res.status(201).json({ success: true, group, member });
});

// 3. Get Members of Group
familyRouter.get('/groups/:groupId/members', requireAuth, async (req: AuthenticatedRequest, res) => {
  const members = await repository.getFamilyMembers(req.params.groupId);
  if (!members.some((member) => member.userId === req.user!.id)) {
    return res.status(403).json({ error: 'Only family group members can view member details' });
  }
  return res.json({ total: members.length, members });
});

// 4. Update Location & Safety Status (Heartbeat)
familyRouter.post('/members/:memberId/ping', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { latitude, longitude, isSafe } = req.body;
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    (isSafe !== undefined && typeof isSafe !== 'boolean')
  ) {
    return res.status(400).json({ error: 'Valid latitude and longitude required' });
  }

  const member = await repository.getFamilyMemberById(req.params.memberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const familyMembers = await repository.getFamilyMembers(member.groupId);
  if (
    member.userId !== req.user!.id ||
    !familyMembers.some((familyMember) => familyMember.userId === req.user!.id)
  ) {
    return res.status(403).json({ error: 'You may only update your own family location' });
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
