import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
  console.error('Run this command in a real terminal so the password can be entered without echo.');
  process.exit(1);
}

const readHiddenPassword = async () => {
  process.stdout.write('Enter a new administrator password (minimum 14 characters): ');
  process.stdin.setRawMode(true);
  process.stdin.resume();

  let password = '';
  try {
    for await (const chunk of process.stdin) {
      for (const character of chunk.toString()) {
        if (character === '\u0003') throw new Error('Cancelled.');
        if (character === '\r' || character === '\n') {
          process.stdout.write('\n');
          return password;
        }
        if (character === '\u007f' || character === '\b') {
          password = password.slice(0, -1);
        } else if (character >= ' ') {
          password += character;
        }
      }
    }
    throw new Error('No password was provided.');
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
};

try {
  const password = await readHiddenPassword();
  if (password.length < 14) {
    throw new Error('Administrator passwords must be at least 14 characters long.');
  }

  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64, {
    N: 32_768,
    r: 8,
    p: 1,
    maxmem: 128 * 1024 * 1024,
  });
  process.stdout.write(`Password hash for secure provisioning:\nscrypt$${salt.toString('hex')}$${key.toString('hex')}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Password hash generation failed.');
  process.exitCode = 1;
}
