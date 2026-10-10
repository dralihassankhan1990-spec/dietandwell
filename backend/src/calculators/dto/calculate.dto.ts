import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalculatorType } from '../../entities';

export class CalculateDto {
  @ApiProperty({ enum: CalculatorType, example: 'bmi' })
  @IsEnum(CalculatorType)
  @IsNotEmpty()
  type: CalculatorType;

  @ApiProperty({ example: { weight: 70, height: 170 } })
  @IsNotEmpty()
  inputData: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  saveResult?: boolean;
}
