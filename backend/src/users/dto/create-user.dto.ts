// backend/src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsIn, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsIn(['user', 'admin', 'editor', 'customer', 'visitor'])
  @IsOptional()
  role?: string = 'user';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}