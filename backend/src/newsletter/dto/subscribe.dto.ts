import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
