import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const MAX_TEAM_PHOTO_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export type TeamPhotoMimeType = keyof typeof MIME_EXTENSIONS;

function hasPngChunks(data: Buffer): boolean {
  if (
    data.length < 45 ||
    !data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) return false;

  let offset = 8;
  let hasHeader = false;
  let hasImageData = false;
  while (offset + 12 <= data.length) {
    const chunkLength = data.readUInt32BE(offset);
    const chunkType = data.toString('ascii', offset + 4, offset + 8);
    const chunkEnd = offset + 12 + chunkLength;
    if (chunkEnd > data.length) return false;
    if (!hasHeader) {
      if (chunkType !== 'IHDR' || chunkLength !== 13) return false;
      const width = data.readUInt32BE(offset + 8);
      const height = data.readUInt32BE(offset + 12);
      if (width === 0 || height === 0 || width > 12000 || height > 12000) return false;
      hasHeader = true;
    } else if (chunkType === 'IDAT') {
      hasImageData = true;
    } else if (chunkType === 'IEND') {
      return chunkLength === 0 && hasImageData && chunkEnd === data.length;
    }
    offset = chunkEnd;
  }
  return false;
}

function hasJpegFrame(data: Buffer): boolean {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return false;
  const frameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (data[offset] === 0xff) offset += 1;
    const marker = data[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > data.length) return false;
    const segmentLength = data.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > data.length) return false;
    if (frameMarkers.has(marker)) {
      if (segmentLength < 7) return false;
      const height = data.readUInt16BE(offset + 3);
      const width = data.readUInt16BE(offset + 5);
      return width > 0 && height > 0 && width <= 12000 && height <= 12000;
    }
    offset += segmentLength;
  }
  return false;
}

export function validateTeamPhoto(
  data: Buffer,
  mimeType: string
): TeamPhotoMimeType | null {
  if (data.length === 0 || data.length > MAX_TEAM_PHOTO_BYTES) return null;
  if (mimeType === 'image/png' && hasPngChunks(data)) return 'image/png';
  if (mimeType === 'image/jpeg' && hasJpegFrame(data)) return 'image/jpeg';
  if (
    mimeType === 'image/webp' &&
    data.length >= 25 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP' &&
    data.readUInt32LE(4) + 8 === data.length &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(data.toString('ascii', 12, 16)) &&
    data.readUInt32LE(16) >= (data.toString('ascii', 12, 16) === 'VP8X' ? 10 : 5)
  ) {
    return 'image/webp';
  }
  return null;
}

function getTeamPhotoDirectory(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.TEAM_IMAGE_DIR) {
    throw new Error('TEAM_IMAGE_DIR must point to persistent photo storage in production.');
  }
  return path.resolve(process.env.TEAM_IMAGE_DIR || path.join(process.cwd(), 'data', 'team-images'));
}

export async function storeTeamPhoto(
  data: Buffer,
  mimeType: TeamPhotoMimeType
): Promise<string> {
  const extension = MIME_EXTENSIONS[mimeType];
  const fileName = `${randomUUID()}.${extension}`;
  const directory = getTeamPhotoDirectory();
  await mkdir(directory, { recursive: true, mode: 0o750 });
  await writeFile(path.join(directory, fileName), data, { flag: 'wx', mode: 0o640 });
  return fileName;
}

export function resolveTeamPhotoPath(fileName: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(fileName)) {
    throw new Error('Stored team photo name is invalid.');
  }
  const directory = getTeamPhotoDirectory();
  const resolved = path.resolve(directory, fileName);
  if (!resolved.startsWith(`${directory}${path.sep}`)) {
    throw new Error('Stored team photo path is invalid.');
  }
  return resolved;
}

export async function deleteTeamPhoto(fileName?: string): Promise<void> {
  if (!fileName || fileName === 'demo-placeholder.svg') return;
  try {
    await unlink(resolveTeamPhotoPath(fileName));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
}

export function getTeamPhotoMimeType(fileName: string): TeamPhotoMimeType | null {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'jpg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return null;
}
