// backend/src/users/dto/update-user.dto.ts
import { IsEmail, IsOptional, IsString, MinLength, IsBoolean, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['user', 'admin', 'editor'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}