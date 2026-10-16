import assert from 'node:assert/strict';
import test from 'node:test';
import { repository } from './repository';

test('development demo team seeding is idempotent and does not replace edited or deleted profiles', async (context) => {
  if (process.env.NODE_ENV === 'production') {
    context.skip('In-memory fallback seeding is development-only.');
    return;
  }

  await repository.seedDemoTeamMembers();
  const seeded = await repository.getTeamMembers();
  assert.equal(seeded.length, 5);
  assert.deepEqual(
    seeded.map(({ fullName, designation }) => [fullName, designation]).sort(),
    [
      ['Demo Member 1', 'Founder (Demo)'],
      ['Demo Member 2', 'President (Demo)'],
      ['Demo Member 3', 'Secretary (Demo)'],
      ['Demo Member 4', 'Coordinator (Demo)'],
      ['Demo Member 5', 'Volunteer (Demo)'],
    ].sort()
  );

  await repository.updateTeamMember(seeded[0].id, { fullName: 'Approved Member' });
  await repository.deleteTeamMember(seeded[1].id);
  await repository.seedDemoTeamMembers();

  const afterRepeat = await repository.getTeamMembers();
  assert.equal(afterRepeat.length, 4);
  assert.ok(afterRepeat.some((member) => member.fullName === 'Approved Member'));
  assert.ok(!afterRepeat.some((member) => member.id === seeded[1].id));
});
