import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Weight Management' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Personalized weight loss and management program' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Achieve sustainable weight loss...' })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({ example: 299.99 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: '3 months' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ example: 'weight-management.jpg' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
