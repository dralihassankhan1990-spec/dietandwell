import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalculatorType } from '../../entities';

export class CalculateDto {
  @ApiProperty({ enum: CalculatorType, example: 'bmi' })
  @IsEnum(CalculatorType)
  @IsNotEmpty()
  type: CalculatorType;

  /**
   * Canonical shape: all inputs nested here.
   * The flat fields below are accepted as well (the frontend's api.js sends
   * `{ type, ...inputs }`) and are merged underneath inputData, which wins
   * on conflicts. They must be declared explicitly because the global
   * ValidationPipe uses forbidNonWhitelisted — undeclared fields would 400.
   */
  @ApiPropertyOptional({ example: { weight: 70, height: 170 } })
  @IsOptional()
  @IsObject()
  inputData?: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  saveResult?: boolean;

  // ---- Flat input fields (merged into inputData) ----
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() height?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() age?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() activityLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() activity?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() goal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() diet?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() climate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() waist?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() neck?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() hip?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() people?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() animal?: string;
}

export class SaveCalculatorDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: CalculatorType, example: 'bmi' })
  @IsEnum(CalculatorType)
  @IsNotEmpty()
  type: CalculatorType;

  @ApiProperty({ example: { bmi: 24.2, category: 'Normal Weight' } })
  @IsNotEmpty()
  result: Record<string, any>;

  @ApiPropertyOptional({ example: { weight: 70, height: 170 } })
  @IsOptional()
  inputs?: Record<string, any>;
}
