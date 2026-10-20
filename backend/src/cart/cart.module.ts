import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem, Order, OrderItem, Product } from '../entities';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Order, OrderItem, Product])],
  controllers: [CartController, OrdersController],
  providers: [CartService, OrdersService],
  exports: [CartService, OrdersService],
})
export class CartModule {}
