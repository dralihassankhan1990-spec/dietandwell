import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum DigitalOrderPaymentMethod {
  REQUEST = 'request',
  BANK_TRANSFER = 'bank_transfer',
}

export enum DigitalOrderStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  REJECTED = 'rejected',
}

@Entity('digital_orders')
export class DigitalOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Set when the requester was logged in; stays null for guest orders.
  @Column({ nullable: true, type: 'varchar' })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  name: string;

  @Column()
  contact: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: DigitalOrderPaymentMethod,
    default: DigitalOrderPaymentMethod.REQUEST,
  })
  paymentMethod: DigitalOrderPaymentMethod;

  @Column({
    type: 'enum',
    enum: DigitalOrderStatus,
    default: DigitalOrderStatus.PENDING,
  })
  status: DigitalOrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
