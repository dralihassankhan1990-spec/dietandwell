import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Organic Protein Powder' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'High-quality whey protein for muscle recovery' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'in_stock', enum: ['in_stock', 'out_of_stock', 'backorder'] })
  @IsString()
  @IsOptional()
  stockStatus?: string;

  @ApiPropertyOptional({ example: '/uploads/products/featured/protein-powder.jpg' })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({ example: ['/uploads/products/gallery/image1.jpg', '/uploads/products/gallery/image2.jpg'] })
  @IsArray()
  @IsOptional()
  galleryImages?: string[];

  @ApiPropertyOptional({ example: ['supplements'] })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: 'PROT-001' })
  @IsString()
  @IsOptional()
  sku?: string;
}

