import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { CalculatorResult } from './calculator-result.entity';
import { Subscription } from './subscription.entity';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  CUSTOMER = 'customer',
  VISITOR = 'visitor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Explicit type: a `string | null` union makes reflect-metadata report
  // design:type Object, which TypeORM rejects for postgres at boot.
  @Column({ nullable: true, type: 'varchar' })
  refreshToken: string | null;

  @Column({ default: 0 })
  refreshTokenVersion: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => CalculatorResult, result => result.user)
  calculatorResults: CalculatorResult[];

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @OneToMany('BlogPost', 'author')
  blogPosts: any[];
}
