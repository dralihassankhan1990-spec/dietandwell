import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';
import { MAX_DIGITAL_FILE_SIZE } from './product-uploads';

const productFilesInterceptor = FileFieldsInterceptor(
  [
    { name: 'images', maxCount: 10 },
    { name: 'images[]', maxCount: 10 },
    { name: 'digitalFile', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    // File type + size are validated in the service (extension-based, so
    // plain curl -F uploads with generic mimetypes also work).
    limits: { fileSize: MAX_DIGITAL_FILE_SIZE, files: 12 },
  },
);

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(productFilesInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new product (Admin only). Accepts multipart/form-data (images[]/images + digitalFile) or plain JSON.',
  })
  create(
    @Body() body: Record<string, unknown>,
    @UploadedFiles()
    files?: {
      images?: Express.Multer.File[];
      'images[]'?: Express.Multer.File[];
      digitalFile?: Express.Multer.File[];
    },
  ) {
    return this.productsService.createFromRequest(body, files);
  }

  // Legacy JSON create kept for compatibility with existing integrations.
  @Post('json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product from JSON (Admin only)' })
  createJson(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get products. With page/limit: paginated; with only category/type filters: plain array with category embedded.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false, description: 'Category slug' })
  @ApiQuery({ name: 'type', required: false, enum: ['physical', 'digital'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = page === undefined ? undefined : Number(page);
    const limitNum = limit === undefined ? undefined : Number(limit);
    return this.productsService.findAll(pageNum, limitNum, search, category, type);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single product by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(productFilesInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update a product (Admin only). Accepts multipart/form-data (images[]/images + digitalFile) or plain JSON.',
  })
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles()
    files?: {
      images?: Express.Multer.File[];
      'images[]'?: Express.Multer.File[];
      digitalFile?: Express.Multer.File[];
    },
  ) {
    return this.productsService.updateFromRequest(id, body, files);
  }

  @Patch(':id/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product from JSON (Admin only)' })
  updateJson(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
