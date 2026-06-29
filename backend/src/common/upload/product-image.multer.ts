import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const ALLOWED = /^image\/(png|jpe?g|webp|gif)$/;

/**
 * Multer config for product images: local disk storage under /uploads with a
 * random filename, image-only filter, and a 5 MB cap. Served statically at
 * /uploads (configured in main.ts).
 */
export const productImageMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files (png, jpg, webp, gif) are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

/** Public path stored on the product for an uploaded file. */
export const toPublicImagePath = (filename: string): string =>
  `/uploads/${filename}`;
