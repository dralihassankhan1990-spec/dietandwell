import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderItem, User, OrderStatus, Product, CartItem } from '../entities';
import { CartService } from './cart.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private cartService: CartService,
    private dataSource: DataSource,
  ) {}

  async createOrder(user: User, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(user);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += Number(item.price) * item.quantity;
    });
    // No tax/shipping rules are defined yet — tax stays 0 and total == subtotal.
    const tax = 0;
    const total = subtotal + tax;

    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        user,
        total,
        subtotal,
        tax,
        status: OrderStatus.PENDING,
        shippingAddress: createOrderDto.shippingAddress,
        notes: createOrderDto.notes,
      });
      await manager.save(order);

      for (const cartItem of cart.items) {
        // The guarded update prevents overselling when two checkouts race.
        const stockUpdate = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `"stock" - ${cartItem.quantity}` })
          .where('id = :id', { id: cartItem.product.id })
          .andWhere('stock >= :quantity', { quantity: cartItem.quantity })
          .execute();
        if (stockUpdate.affected !== 1) {
          throw new BadRequestException(
            `Insufficient stock for ${cartItem.product.name}`,
          );
        }

        await manager.save(
          manager.create(OrderItem, {
            order,
            product: cartItem.product,
            quantity: cartItem.quantity,
            price: cartItem.price,
            variantLabel: cartItem.variantLabel,
            subtotal: Number(cartItem.price) * cartItem.quantity,
          }),
        );
      }

      await manager.delete(CartItem, cart.items.map((item) => item.id));

      const created = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items', 'items.product'],
      });
      if (!created) throw new NotFoundException('Order not found after creation');
      return created;
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

  async getAllOrders(page = 1, limit = 50, status?: OrderStatus) {
    if (status && !Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException(`Invalid order status: ${status}`);
    }
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [orders, total] = await this.orderRepository.findAndCount({
      where: status ? { status } : undefined,
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      orders: orders.map((order) => {
        const { user, ...rest } = order;
        return {
          ...rest,
          user: user
            ? {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
              }
            : null,
        };
      }),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException(`Invalid order status: ${status}`);
    }
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
