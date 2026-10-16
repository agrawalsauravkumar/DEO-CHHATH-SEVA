import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canPublishTeamMember,
  validateNewTeamMemberFields,
  validateUpdatedTeamMemberFields,
} from './teamValidation';

test('team profile validation trims required fields and enforces length limits', () => {
  assert.deepEqual(
    validateNewTeamMemberFields({ fullName: '  Member Name ', designation: ' Founder ' }),
    { fullName: 'Member Name', designation: 'Founder' }
  );
  assert.equal(validateNewTeamMemberFields({ fullName: ' ', designation: 'Founder' }), null);
  assert.equal(validateNewTeamMemberFields({ fullName: 'Name' }), null);
  assert.equal(validateNewTeamMemberFields({ fullName: 'N'.repeat(151), designation: 'Founder' }), null);
  assert.equal(validateNewTeamMemberFields({ fullName: 'Name', designation: 'D'.repeat(121) }), null);
});

test('team edits accept only non-empty valid fields and a boolean demo flag', () => {
  assert.deepEqual(
    validateUpdatedTeamMemberFields({ fullName: ' Updated ', isDemo: false }),
    { fullName: 'Updated', isDemo: false }
  );
  assert.equal(validateUpdatedTeamMemberFields({}), null);
  assert.equal(validateUpdatedTeamMemberFields({ designation: ' ' }), null);
  assert.equal(validateUpdatedTeamMemberFields({ isDemo: 'false' }), null);
});

test('publishing a real member requires a photo and recorded permission; demo placeholders are allowed', () => {
  assert.equal(canPublishTeamMember({ photoPath: 'image.jpg', isDemo: false, photoPermissionConfirmed: true }), true);
  assert.equal(canPublishTeamMember({ photoPath: 'image.jpg', isDemo: false, photoPermissionConfirmed: false }), false);
  assert.equal(canPublishTeamMember({ isDemo: false, photoPermissionConfirmed: true }), false);
  assert.equal(canPublishTeamMember({ photoPath: 'demo-placeholder.svg', isDemo: true, photoPermissionConfirmed: false }), true);
});
