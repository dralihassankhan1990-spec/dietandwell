import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../../entities';

export class CreatePostDto {
  @ApiProperty({ example: 'Blog Post Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the blog post content...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'my-post-slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'A brief excerpt...' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ example: '/uploads/blogs/featured/image.jpg' })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({ example: '/uploads/blogs/featured/cover.jpg', description: 'Preferred cover image; falls back to featuredImage' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: ['/uploads/blogs/content/img1.jpg'] })
  @IsArray()
  @IsOptional()
  contentImages?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.DRAFT })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ example: 'SEO Meta Title' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'SEO Meta Description' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['category1', 'category2'] })
  @IsArray()
  @IsOptional()
  categories?: string[];
}