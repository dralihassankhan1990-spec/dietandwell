import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'public/uploads/blogs/featured',
    'public/uploads/blogs/content',
    'public/uploads/products/featured',
    'public/uploads/products/gallery',
  ];

  dirs.forEach(dir => {
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
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}-${randomString}${ext}`);
    },
  }),
  fileFilter: (req, file, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new BadRequestException('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

@ApiTags('Upload')
@Controller('upload')
export class UploadController {

  // Blog Featured Image Upload
  @Post('blog/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('blogs/featured')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload blog featured image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  uploadBlogFeatured(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      success: true,
      message: 'Blog featured image uploaded successfully',
      filename: file.filename,
      url: `/uploads/blogs/featured/${file.filename}`,
      path: `uploads/blogs/featured/${file.filename}`,
      size: file.size,
    };
  }

  // Blog Content Images Upload (Multiple)
  @Post('blog/content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions('blogs/content')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload blog content images (Admin only, max 10 files)' })
  @ApiConsumes('multipart/form-data')
  uploadBlogContent(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return {
      success: true,
      message: `${files.length} blog content image(s) uploaded successfully`,
      files: files.map(file => ({
        filename: file.filename,
        url: `/uploads/blogs/content/${file.filename}`,
        path: `uploads/blogs/content/${file.filename}`,
        size: file.size,
      })),
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
  uploadProductFeatured(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      success: true,
      message: 'Product featured image uploaded successfully',
      filename: file.filename,
      url: `/uploads/products/featured/${file.filename}`,
      path: `uploads/products/featured/${file.filename}`,
      size: file.size,
    };
  }

  // Product Gallery Images Upload (Multiple or Single)
  @Post('product/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('products/gallery')))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload product gallery images (Admin only)' })
  @ApiConsumes('multipart/form-data')
  uploadProductGallery(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      success: true,
      message: 'Product gallery image uploaded successfully',
      filename: file.filename,
      url: `/uploads/products/gallery/${file.filename}`,
      path: `uploads/products/gallery/${file.filename}`,
      size: file.size,
      files: [{
        filename: file.filename,
        url: `/uploads/products/gallery/${file.filename}`,
        path: `uploads/products/gallery/${file.filename}`,
        size: file.size,
      }],
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
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      success: true,
      message: 'Image uploaded successfully',
      filename: file.filename,
      url: `/uploads/general/${file.filename}`,
      path: `uploads/general/${file.filename}`,
      size: file.size,
    };
  }
}
