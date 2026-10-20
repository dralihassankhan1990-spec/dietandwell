import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calculator, CalculatorResult } from '../entities';
import { CalculatorsController } from './calculators.controller';
import { CalculatorsService } from './calculators.service';

@Module({
  imports: [TypeOrmModule.forFeature([Calculator, CalculatorResult])],
  controllers: [CalculatorsController],
  providers: [CalculatorsService],
  exports: [CalculatorsService],
})
export class CalculatorsModule {}
