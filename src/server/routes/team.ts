import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Router, raw } from 'express';
import { repository } from '../db/repository';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';
import {
  deleteTeamPhoto,
  getTeamPhotoMimeType,
  resolveTeamPhotoPath,
  storeTeamPhoto,
  validateTeamPhoto,
} from '../teamPhoto';
import {
  canPublishTeamMember,
  validateNewTeamMemberFields,
  validateUpdatedTeamMemberFields,
} from '../teamValidation';

export const teamRouter = Router();

const teamAdmin = [requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN')];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidId = (id: string) => UUID_PATTERN.test(id);

function publicMember(member: Awaited<ReturnType<typeof repository.getTeamMembers>>[number]) {
  return {
    id: member.id,
    fullName: member.fullName,
    designation: member.designation,
    isDemo: member.isDemo,
    photoUrl: `/api/team/${member.id}/photo`,
  };
}

function adminMember(member: Awaited<ReturnType<typeof repository.getTeamMembers>>[number]) {
  return {
    ...publicMember(member),
    hasPhoto: Boolean(member.photoPath),
    photoPermissionConfirmed: member.photoPermissionConfirmed,
    isPublished: member.isPublished,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    adminPhotoUrl: `/api/team/admin/${member.id}/photo`,
  };
}

async function readPhoto(photoPath: string | undefined, res: import('express').Response) {
  if (!photoPath) return res.status(404).json({ error: 'इस सदस्य का फोटो उपलब्ध नहीं है।' });
  if (photoPath === 'demo-placeholder.svg') {
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, '/team-placeholder.svg');
  }
  const mimeType = getTeamPhotoMimeType(photoPath);
  if (!mimeType) return res.status(404).json({ error: 'फोटो उपलब्ध नहीं है।' });
  try {
    const photo = await readFile(resolveTeamPhotoPath(photoPath));
    res.setHeader('Content-Type', mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(photo);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return res.status(404).json({ error: 'सदस्य का फोटो नहीं मिला।' });
    }
    throw error;
  }
}

teamRouter.get('/', asyncHandler(async (_req, res) => {
  const members = await repository.getTeamMembers(true);
  return res.json({
    members: members.map(publicMember),
    containsDemo: members.some((member) => member.isDemo),
  });
}));

teamRouter.get(
  '/admin',
  ...teamAdmin,
  asyncHandler(async (_req, res) => {
    const members = await repository.getTeamMembers();
    return res.json({ members: members.map(adminMember) });
  })
);

teamRouter.get(
  '/admin/:id/photo',
  ...teamAdmin,
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
    const member = await repository.getTeamMemberById(req.params.id);
    if (!member) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    return readPhoto(member.photoPath, res);
  })
);

teamRouter.get('/:id/photo', asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
  const member = await repository.getTeamMemberById(req.params.id);
  if (!member || !member.isPublished) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
  return readPhoto(member.photoPath, res);
}));

teamRouter.post(
  '/admin',
  ...teamAdmin,
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const fields = validateNewTeamMemberFields(req.body);
    if (!fields) {
      return res.status(400).json({ error: 'पूरा नाम (150 अक्षर तक) और पद (120 अक्षर तक) आवश्यक हैं।' });
    }

    const now = new Date().toISOString();
    const member = await repository.createTeamMember({
      id: randomUUID(),
      ...fields,
      photoPermissionConfirmed: false,
      isDemo: false,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    }, req.user?.id);
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'CREATE_TEAM_MEMBER',
      entity: 'TeamMember',
      entityId: member.id,
      newValueSummary: `${member.fullName} — ${member.designation}`,
      ipAddress: req.ip,
    });
    return res.status(201).json({ success: true, member: adminMember(member) });
  })
);

teamRouter.put(
  '/admin/:id',
  ...teamAdmin,
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
    const updates = validateUpdatedTeamMemberFields(req.body);
    if (!updates) return res.status(400).json({ error: 'बदलने के लिए मान्य विवरण देना आवश्यक है।' });

    const oldMember = await repository.getTeamMemberById(req.params.id);
    if (!oldMember) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    const member = await repository.updateTeamMember(req.params.id, updates);
    if (!member) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'UPDATE_TEAM_MEMBER',
      entity: 'TeamMember',
      entityId: member.id,
      oldValueSummary: `${oldMember.fullName} — ${oldMember.designation}`,
      newValueSummary: `${member.fullName} — ${member.designation}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, member: adminMember(member) });
  })
);

teamRouter.patch(
  '/admin/:id/publish',
  ...teamAdmin,
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
    const { isPublished } = req.body || {};
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ error: 'प्रकाशन स्थिति चुनना आवश्यक है।' });
    }
    const existing = await repository.getTeamMemberById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    if (isPublished && !existing.photoPath) {
      return res.status(400).json({ error: 'प्रकाशित करने से पहले सदस्य का फोटो जोड़ें।' });
    }
    if (isPublished && !canPublishTeamMember(existing)) {
      return res.status(400).json({ error: 'प्रकाशित करने से पहले फोटो उपयोग की अनुमति की पुष्टि करें।' });
    }
    const member = await repository.updateTeamMember(req.params.id, { isPublished });
    if (!member) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: isPublished ? 'PUBLISH_TEAM_MEMBER' : 'UNPUBLISH_TEAM_MEMBER',
      entity: 'TeamMember',
      entityId: member.id,
      oldValueSummary: `${existing.fullName} — ${existing.isPublished ? 'published' : 'draft'}`,
      newValueSummary: `${member.fullName} — ${member.isPublished ? 'published' : 'draft'}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, member: adminMember(member) });
  })
);

teamRouter.post(
  '/admin/:id/photo',
  ...teamAdmin,
  requirePersistentDatabase,
  raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
    const existing = await repository.getTeamMemberById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: 'केवल JPG, PNG या WebP फोटो अपलोड करें।' });
    }
    if (req.get('x-photo-permission-confirmed') !== 'true') {
      return res.status(400).json({ error: 'फोटो उपयोग/प्रकाशन की अनुमति की पुष्टि आवश्यक है।' });
    }
    const mimeType = validateTeamPhoto(req.body, req.get('content-type') || '');
    if (!mimeType) {
      return res.status(400).json({ error: 'फोटो का वास्तविक प्रारूप मान्य नहीं है या फ़ाइल 5 MB से बड़ी है।' });
    }

    const photoPath = await storeTeamPhoto(req.body, mimeType);
    let member;
    try {
      member = await repository.updateTeamMember(req.params.id, {
        photoPath,
        photoPermissionConfirmed: true,
      });
      if (!member) throw new Error('टीम सदस्य अपडेट नहीं हुआ।');
    } catch (error) {
      try {
        await deleteTeamPhoto(photoPath);
      } catch (cleanupError) {
        console.error('New team photo cleanup failed after database update failure.', cleanupError);
      }
      throw error;
    }

    let cleanupWarning: string | undefined;
    if (existing.photoPath && existing.photoPath !== 'demo-placeholder.svg') {
      try {
        await deleteTeamPhoto(existing.photoPath);
      } catch (error) {
        cleanupWarning = 'पुरानी फोटो फ़ाइल हटाने में समस्या हुई; कृपया भंडारण की जाँच करें।';
        console.error('Replaced team photo could not be removed.', error);
      }
    }
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'REPLACE_TEAM_MEMBER_PHOTO',
      entity: 'TeamMember',
      entityId: member.id,
      newValueSummary: `Photo updated for ${member.fullName}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, member: adminMember(member), ...(cleanupWarning ? { warning: cleanupWarning } : {}) });
  })
);

teamRouter.delete(
  '/admin/:id',
  ...teamAdmin,
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'सदस्य आईडी मान्य नहीं है।' });
    const member = await repository.deleteTeamMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'टीम सदस्य नहीं मिला।' });
    let cleanupWarning: string | undefined;
    try {
      await deleteTeamPhoto(member.photoPath);
    } catch (error) {
      cleanupWarning = 'सदस्य हट गया, लेकिन फोटो फ़ाइल साफ़ नहीं हो सकी; कृपया भंडारण की जाँच करें।';
      console.error('Deleted team member photo could not be removed.', error);
    }
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'DELETE_TEAM_MEMBER',
      entity: 'TeamMember',
      entityId: member.id,
      oldValueSummary: `${member.fullName} — ${member.designation}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, ...(cleanupWarning ? { warning: cleanupWarning } : {}) });
  })
);
