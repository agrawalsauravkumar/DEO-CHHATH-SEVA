import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const SCRYPT_OPTIONS = { N: 32_768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

const deriveKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_BYTES, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  if (password.length < 14) {
    throw new Error('Initial administrator passwords must be at least 14 characters long.');
  }

  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
};

export const verifyPassword = async (password: string, encodedHash?: string): Promise<boolean> => {
  if (!encodedHash) return false;

  const parts = encodedHash.split('$');
  if (
    parts.length !== 3 ||
    parts[0] !== 'scrypt' ||
    !/^[a-f0-9]{32}$/i.test(parts[1]) ||
    !/^[a-f0-9]{128}$/i.test(parts[2])
  ) {
    return false;
  }

  const expectedKey = Buffer.from(parts[2], 'hex');
  const actualKey = await deriveKey(password, Buffer.from(parts[1], 'hex'));

  return timingSafeEqual(actualKey, expectedKey);
};
