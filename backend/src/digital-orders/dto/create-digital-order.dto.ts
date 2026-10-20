import { IsString, IsNotEmpty, IsEmail, IsUUID, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDigitalOrderDto {
  @ApiProperty({ example: 'c0a1...' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'Ayesha Khan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '03001234567' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({ example: 'ayesha@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'bank_transfer', enum: ['request', 'bank_transfer'] })
  @IsIn(['request', 'bank_transfer'])
  @IsOptional()
  paymentMethod?: 'request' | 'bank_transfer';
}
