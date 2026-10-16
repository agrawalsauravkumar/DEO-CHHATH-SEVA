import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_TEAM_PHOTO_BYTES,
  resolveTeamPhotoPath,
  validateTeamPhoto,
} from './teamPhoto';

const pngImage = () => {
  const chunks: Buffer[] = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])];
  const addChunk = (type: string, data: Buffer) => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(data.length, 0);
    header.write(type, 4, 'ascii');
    const crc = Buffer.alloc(4);
    chunks.push(header, data, crc);
  };
  const imageHeader = Buffer.alloc(13);
  imageHeader.writeUInt32BE(1, 0);
  imageHeader.writeUInt32BE(1, 4);
  addChunk('IHDR', imageHeader);
  addChunk('IDAT', Buffer.from([0]));
  addChunk('IEND', Buffer.alloc(0));
  return Buffer.concat(chunks);
};

const jpegImage = () => Buffer.from([
  0xff, 0xd8,
  0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x10, 0x00, 0x10, 0x01, 0x01, 0x11, 0x00,
  0xff, 0xd9,
]);

const webpImage = () => {
  const image = Buffer.alloc(25);
  image.write('RIFF', 0, 'ascii');
  image.writeUInt32LE(17, 4);
  image.write('WEBP', 8, 'ascii');
  image.write('VP8L', 12, 'ascii');
  image.writeUInt32LE(5, 16);
  image.set([0x2f, 0, 0, 0, 0], 20);
  return image;
};

test('accepts supported PNG, JPEG, and WebP signatures and structure with matching content types', () => {
  assert.equal(validateTeamPhoto(pngImage(), 'image/png'), 'image/png');
  assert.equal(validateTeamPhoto(jpegImage(), 'image/jpeg'), 'image/jpeg');
  assert.equal(validateTeamPhoto(webpImage(), 'image/webp'), 'image/webp');
});

test('rejects mismatched MIME types, malformed files, and oversized photos', () => {
  assert.equal(validateTeamPhoto(pngImage(), 'image/jpeg'), null);
  assert.equal(validateTeamPhoto(Buffer.from('not an image'), 'image/png'), null);
  assert.equal(validateTeamPhoto(Buffer.alloc(MAX_TEAM_PHOTO_BYTES + 1), 'image/jpeg'), null);
  assert.equal(validateTeamPhoto(Buffer.alloc(0), 'image/jpeg'), null);
});

test('rejects unsafe stored photo paths', () => {
  assert.throws(() => resolveTeamPhotoPath('..\\outside.jpg'));
  assert.throws(() => resolveTeamPhotoPath('demo-placeholder.svg'));
});
