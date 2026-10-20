import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalOrder, Product } from '../entities';
import { DigitalOrdersController } from './digital-orders.controller';
import { DigitalOrdersService } from './digital-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([DigitalOrder, Product])],
  controllers: [DigitalOrdersController],
  providers: [DigitalOrdersService],
  exports: [DigitalOrdersService],
})
export class DigitalOrdersModule {}
