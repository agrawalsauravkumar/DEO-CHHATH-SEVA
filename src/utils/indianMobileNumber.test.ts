import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidIndianMobileNumber } from './indianMobileNumber';

test('Indian mobile validation accepts ten-digit numbers beginning 6 through 9', () => {
  for (const phone of ['6123456789', '7123456789', '8123456789', '9123456789']) {
    assert.equal(isValidIndianMobileNumber(phone), true);
  }
});

test('Indian mobile validation rejects incomplete, malformed, or out-of-range numbers', () => {
  for (const phone of ['1234567890', '5123456789', '912345678', '91234567890', '91234a6789', '+919123456789']) {
    assert.equal(isValidIndianMobileNumber(phone), false);
  }
});
