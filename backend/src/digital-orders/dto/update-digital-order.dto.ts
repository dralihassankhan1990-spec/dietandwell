import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDigitalOrderDto {
  @ApiProperty({ example: 'granted', enum: ['granted', 'rejected'] })
  @IsIn(['granted', 'rejected'])
  status: 'granted' | 'rejected';
}
