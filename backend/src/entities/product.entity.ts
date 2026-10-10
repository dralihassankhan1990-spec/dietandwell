import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { ProductCategory } from './product-category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 'in_stock' })
  stockStatus: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column('simple-array', { nullable: true })
  galleryImages: string[];

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  sku: string;

  @ManyToMany(() => ProductCategory, category => category.products, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({ name: 'product_product_categories' })
  categories: ProductCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
