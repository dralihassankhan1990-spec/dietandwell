import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, User, OrderStatus } from '../entities';
import { CartService } from './cart.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
  ) {}

  async createOrder(user: User, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(user);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;
    cart.items.forEach(item => {
      total += item.price * item.quantity;
    });

    const order = this.orderRepository.create({
      user,
      total,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
    });

    await this.orderRepository.save(order);

    const orderItems = cart.items.map(cartItem =>
      this.orderItemRepository.create({
        order,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.price,
      })
    );

    await this.orderItemRepository.save(orderItems);

    await this.cartService.clearCart(user);

    return this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['items', 'items.product'],
    });
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
