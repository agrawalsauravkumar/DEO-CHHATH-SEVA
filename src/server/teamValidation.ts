export interface NewTeamMemberFields {
  fullName: string;
  designation: string;
}

export interface UpdatedTeamMemberFields extends Partial<NewTeamMemberFields> {
  isDemo?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateNewTeamMemberFields(value: unknown): NewTeamMemberFields | null {
  if (!isRecord(value)) return null;
  const { fullName, designation } = value;
  if (
    typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 150 ||
    typeof designation !== 'string' || !designation.trim() || designation.trim().length > 120
  ) return null;
  return { fullName: fullName.trim(), designation: designation.trim() };
}

export function validateUpdatedTeamMemberFields(value: unknown): UpdatedTeamMemberFields | null {
  if (!isRecord(value)) return null;
  const updates: UpdatedTeamMemberFields = {};
  if (value.fullName !== undefined) {
    if (typeof value.fullName !== 'string' || !value.fullName.trim() || value.fullName.trim().length > 150) {
      return null;
    }
    updates.fullName = value.fullName.trim();
  }
  if (value.designation !== undefined) {
    if (typeof value.designation !== 'string' || !value.designation.trim() || value.designation.trim().length > 120) {
      return null;
    }
    updates.designation = value.designation.trim();
  }
  if (value.isDemo !== undefined) {
    if (typeof value.isDemo !== 'boolean') return null;
    updates.isDemo = value.isDemo;
  }
  return Object.keys(updates).length > 0 ? updates : null;
}

export function canPublishTeamMember(member: {
  photoPath?: string;
  isDemo: boolean;
  photoPermissionConfirmed: boolean;
}): boolean {
  return Boolean(member.photoPath && (member.isDemo || member.photoPermissionConfirmed));
}
