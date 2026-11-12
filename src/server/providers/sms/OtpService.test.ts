import assert from 'node:assert/strict';
import { after, test } from 'node:test';

const previousEnvironment = {
  nodeEnv: process.env.NODE_ENV,
  otpDevMode: process.env.OTP_DEV_MODE,
  smsApiKey: process.env.SMS_API_KEY,
  smsApiUrl: process.env.SMS_API_URL,
};

process.env.NODE_ENV = 'production';
process.env.OTP_DEV_MODE = 'true';
delete process.env.SMS_API_KEY;
delete process.env.SMS_API_URL;

const { otpService } = await import('./OtpService');

test('production never falls back to a displayed development OTP', async () => {
  const result = await otpService.requestOtp('9876543210');
  assert.equal(result.success, false);
  assert.equal(result.code, 'UNAVAILABLE');
  assert.equal(result.isDevelopmentMode, false);
  assert.equal(result.devOtpHint, undefined);
});

after(() => {
  if (previousEnvironment.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnvironment.nodeEnv;
  if (previousEnvironment.otpDevMode === undefined) delete process.env.OTP_DEV_MODE;
  else process.env.OTP_DEV_MODE = previousEnvironment.otpDevMode;
  if (previousEnvironment.smsApiKey === undefined) delete process.env.SMS_API_KEY;
  else process.env.SMS_API_KEY = previousEnvironment.smsApiKey;
  if (previousEnvironment.smsApiUrl === undefined) delete process.env.SMS_API_URL;
  else process.env.SMS_API_URL = previousEnvironment.smsApiUrl;
});
