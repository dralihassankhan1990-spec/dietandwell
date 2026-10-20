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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post (Admin only)' })
  create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.blogService.create(createPostDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published blog posts' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'tag', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.blogService.findAll(Number(page) || 1, Number(limit) || 10, search, category, tag);
  }

  // NOTE: static segments (admin/all, categories, tags) MUST stay above the
  // ':slug' route, or Nest would treat e.g. 'admin' as a slug.
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ALL blog posts incl. drafts (Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'tag', required: false })
  findAllForAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.blogService.findAllForAdmin(
      Number(page) || 1,
      Number(limit) || 100,
      search,
      category,
      tag,
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  findAllTags() {
    return this.blogService.findAllTags();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single blog post by slug' })
  findOne(@Param('slug') slug: string) {
    return this.blogService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post (Admin only)' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.blogService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post (Admin only)' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
