import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

// Ensure upload directories exist (incl. 'general' for the legacy endpoint —
/// multer does NOT create the destination directory itself).
const createUploadDirs = () => {
  const dirs = [
    'public/uploads/blogs/featured',
    'public/uploads/blogs/content',
    'public/uploads/products/featured',
    'public/uploads/products/gallery',
    'public/uploads/general',
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

const createMulterOptions = (destination: string) => ({
  storage: diskStorage({
    destination: path.join(process.cwd(), 'public', 'uploads', destination),
    filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const ext = ({ 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' } as Record<string,string>)[file.mimetype] || '.bin';
      cb(null, `${timestamp}-${randomString}${ext}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new BadRequestException('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const logger = new Logger('Upload');

/**
 * If ALL Cloudinary vars are set, move the just-saved local file to
 * Cloudinary and return its secure URL (local file deleted). Otherwise
 * returns null and the caller keeps the local /uploads URL. Any Cloudinary
 * failure also falls back to local storage — uploads never fail for a
 * missing/misconfigured Cloudinary setup.
 */
async function maybeUploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
): Promise<string | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return null;
  }
  try {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `dietandwell/${folder}`,
      resource_type: 'image',
    });
    fs.unlinkSync(file.path);
    return result.secure_url;
  } catch (error) {
    logger.warn(`Cloudinary upload failed, keeping local file: ${(error as Error).message}`);
    return null;
  }
}

async function resolveFileUrl(file: Express.Multer.File, folder: string) {
  const handle=fs.openSync(file.path,'r');
  const signature=Buffer.alloc(12);
  try { fs.readSync(handle,signature,0,12,0); } finally { fs.closeSync(handle); }
  const valid = (['image/jpeg','image/jpg'].includes(file.mimetype) && signature[0]===0xff && signature[1]===0xd8 && signature[2]===0xff)
    || (file.mimetype==='image/png' && signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    || (file.mimetype==='image/gif' && ['GIF87a','GIF89a'].includes(signature.subarray(0,6).toString()))
    || (file.mimetype==='image/webp' && signature.subarray(0,4).toString()==='RIFF' && signature.subarray(8,12).toString()==='WEBP');
  if(!valid){fs.unlinkSync(file.path);throw new BadRequestException('File content does not match a supported image format');}
  const cloudUrl = await maybeUploadToCloudinary(file, folder);
  if (cloudUrl) {
    return { url: cloudUrl, path: cloudUrl };
  }
  return {
    url: `/uploads/${folder}/${file.filename}`,
    path: `uploads/${folder}/${file.filename}`,
  };
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  // Blog Featured Image Upload
  @Post('blog/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('blogs/featured')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload blog featured image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  async uploadBlogFeatured(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const { url, path: filePath } = await resolveFileUrl(file, 'blogs/featured');
    return {
      success: true,
      message: 'Blog featured image uploaded successfully',
      filename: file.filename,
      url,
      path: filePath,
      size: file.size,
    };
  }

  // Blog Content Images Upload (Multiple)
  @Post('blog/content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions('blogs/content')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload blog content images (Admin only, max 10 files)' })
  @ApiConsumes('multipart/form-data')
  async uploadBlogContent(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const resolved = await Promise.all(
      files.map(async (file) => {
        const { url, path: filePath } = await resolveFileUrl(file, 'blogs/content');
        return { filename: file.filename, url, path: filePath, size: file.size };
      }),
    );
    return {
      success: true,
      message: `${files.length} blog content image(s) uploaded successfully`,
      files: resolved,
    };
  }

  // Product Featured Image Upload
  @Post('product/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('products/featured')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload product featured image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  async uploadProductFeatured(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const { url, path: filePath } = await resolveFileUrl(file, 'products/featured');
    return {
      success: true,
      message: 'Product featured image uploaded successfully',
      filename: file.filename,
      url,
      path: filePath,
      size: file.size,
    };
  }

  // Product Gallery Images Upload (Single per request — call once per image)
  @Post('product/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('products/gallery')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload product gallery image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  async uploadProductGallery(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const { url, path: filePath } = await resolveFileUrl(file, 'products/gallery');
    return {
      success: true,
      message: 'Product gallery image uploaded successfully',
      filename: file.filename,
      url,
      path: filePath,
      size: file.size,
      files: [
        {
          filename: file.filename,
          url,
          path: filePath,
          size: file.size,
        },
      ],
    };
  }

  // Legacy endpoint for backward compatibility
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('general')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload general image (Admin only - Legacy)' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const { url, path: filePath } = await resolveFileUrl(file, 'general');
    return {
      success: true,
      message: 'Image uploaded successfully',
      filename: file.filename,
      url,
      path: filePath,
      size: file.size,
    };
  }
}
