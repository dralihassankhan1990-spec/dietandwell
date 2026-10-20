import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {
  DigitalOrder,
  DigitalOrderStatus,
  DigitalOrderPaymentMethod,
  Product,
  ProductType,
  UserRole,
} from '../entities';
import { CreateDigitalOrderDto } from './dto/create-digital-order.dto';
import { UpdateDigitalOrderDto } from './dto/update-digital-order.dto';

function shape(order: DigitalOrder) {
  const { product, ...rest } = order;
  return {
    ...rest,
    product: product ? { id: product.id, name: product.name, slug: product.slug } : null,
  };
}

@Injectable()
export class DigitalOrdersService {
  constructor(
    @InjectRepository(DigitalOrder)
    private readonly orderRepository: Repository<DigitalOrder>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateDigitalOrderDto, caller?: { id: string }) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.type !== ProductType.DIGITAL) {
      throw new BadRequestException('Digital orders can only be placed for digital products');
    }

    const order = this.orderRepository.create({
      productId: product.id,
      userId: caller?.id ?? null,
      name: dto.name,
      contact: dto.contact,
      email: dto.email.toLowerCase(),
      paymentMethod: (dto.paymentMethod ?? 'request') as DigitalOrderPaymentMethod,
      status: DigitalOrderStatus.PENDING,
    });
    const saved = await this.orderRepository.save(order);
    return { id: saved.id, status: saved.status };
  }

  async findAll(status?: string) {
    const where =
      status !== undefined && status !== ''
        ? { status: status as DigitalOrderStatus }
        : undefined;
    const orders = await this.orderRepository.find({
      where,
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
    return orders.map(shape);
  }

  async findMine(caller: { id: string; email: string }) {
    const orders = await this.orderRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.product', 'product')
      .where('o.userId = :userId OR LOWER(o.email) = LOWER(:email)', {
        userId: caller.id,
        email: caller.email,
      })
      .orderBy('o.createdAt', 'DESC')
      .getMany();
    return orders.map(shape);
  }

  async updateStatus(id: string, dto: UpdateDigitalOrderDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!order) {
      throw new NotFoundException('Digital order not found');
    }
    order.status = dto.status as DigitalOrderStatus;
    return shape(await this.orderRepository.save(order));
  }

  /**
   * Stream the digital file. Caller must have a granted order for it
   * (ownership by userId or email, or an admin).
   */
  async getDownloadStream(
    id: string,
    caller: { id: string; email: string; role: string },
  ): Promise<{ stream: StreamableFile; filename: string; contentType: string }> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!order) {
      throw new NotFoundException('Digital order not found');
    }
    if (order.status !== DigitalOrderStatus.GRANTED) {
      throw new ForbiddenException('This order has not been granted yet');
    }

    const isAdmin = caller.role === UserRole.ADMIN;
    const ownsByUser = order.userId !== null && order.userId === caller.id;
    const ownsByEmail =
      order.email && caller.email && order.email.toLowerCase() === caller.email.toLowerCase();
    if (!isAdmin && !ownsByUser && !ownsByEmail) {
      throw new ForbiddenException('You do not have access to this file');
    }

    const storedPath = order.product?.digitalFilePath;
    if (!storedPath) {
      throw new NotFoundException('No digital file attached to this product');
    }
    // Stay inside private-uploads/digital no matter what the DB row says.
    const absolute = path.resolve(
      process.cwd(),
      'private-uploads',
      'digital',
      path.basename(storedPath),
    );
    if (!absolute.startsWith(path.resolve(process.cwd(), 'private-uploads', 'digital') + path.sep)) {
      throw new ForbiddenException('Invalid file path');
    }
    if (!fs.existsSync(absolute)) {
      throw new NotFoundException('Digital file not found on disk');
    }

    const filename = order.product.digitalFileName || path.basename(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.epub': 'application/epub+zip',
      '.zip': 'application/zip',
    };
    return {
      stream: new StreamableFile(fs.createReadStream(absolute)),
      filename,
      contentType: contentTypes[ext] ?? 'application/octet-stream',
    };
  }
}
