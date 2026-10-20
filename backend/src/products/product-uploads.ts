import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export const DIGITAL_UPLOAD_DIR = path.join(process.cwd(), 'private-uploads', 'digital');
export const PRODUCT_GALLERY_DIR = path.join(process.cwd(), 'public', 'uploads', 'products', 'gallery');

const DIGITAL_EXTENSIONS = ['.pdf', '.doc', '.docx', '.epub', '.zip'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export const MAX_DIGITAL_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Create the upload directories at runtime when they do not exist. */
export function ensureProductUploadDirs(): void {
  for (const dir of [DIGITAL_UPLOAD_DIR, PRODUCT_GALLERY_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/** `<uuid>-<sanitized-original>` — path-traversal safe, no user-controlled dirs. */
export function buildStoredFilename(originalName: string): string {
  const base = path
    .basename(String(originalName || 'file'))
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 120);
  const safe = base && base !== '.' && base !== '..' ? base : 'file';
  return `${randomUUID()}-${safe}`;
}

function assertExtension(originalName: string, allowed: string[], kind: string): string {
  const ext = path.extname(String(originalName || '')).toLowerCase();
  if (!allowed.includes(ext)) {
    throw new BadRequestException(
      `${kind} file type not allowed: "${ext || 'unknown'}". Allowed: ${allowed.join(', ')}`,
    );
  }
  return ext;
}

/**
 * Persist a digital product file under backend/private-uploads/digital/
 * (never under public/ or any statically-served path).
 * Returns the relative path stored in the DB.
 */
export async function saveDigitalFile(file: Express.Multer.File): Promise<{
  storedPath: string;
  storedName: string;
  originalName: string;
}> {
  ensureProductUploadDirs();
  assertExtension(file.originalname, DIGITAL_EXTENSIONS, 'Digital');
  if (file.size > MAX_DIGITAL_FILE_SIZE) {
    throw new BadRequestException(
      `Digital file is too large (max ${MAX_DIGITAL_FILE_SIZE / 1024 / 1024} MB)`,
    );
  }
  const storedName = buildStoredFilename(file.originalname);
  await fs.promises.writeFile(path.join(DIGITAL_UPLOAD_DIR, storedName), file.buffer);
  return {
    storedPath: path.join('private-uploads', 'digital', storedName),
    storedName,
    originalName: path.basename(String(file.originalname || storedName)),
  };
}

/**
 * Persist product images under public/uploads/products/gallery/.
 * Returns the public URL paths.
 */
export async function saveProductImages(files: Express.Multer.File[]): Promise<string[]> {
  ensureProductUploadDirs();
  const urls: string[] = [];
  for (const file of files) {
    assertExtension(file.originalname, IMAGE_EXTENSIONS, 'Image');
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      throw new BadRequestException(
        `Image "${file.originalname}" is too large (max 5 MB)`,
      );
    }
    const storedName = buildStoredFilename(file.originalname);
    await fs.promises.writeFile(path.join(PRODUCT_GALLERY_DIR, storedName), file.buffer);
    urls.push(`/uploads/products/gallery/${storedName}`);
  }
  return urls;
}
