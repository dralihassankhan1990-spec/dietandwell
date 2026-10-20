import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, JoinTable, JoinColumn } from 'typeorm';
import { ProductCategory } from './product-category.entity';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

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
  salePrice: number | null;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 'in_stock' })
  stockStatus: string;

  @Column({ nullable: true, type: 'varchar' })
  featuredImage: string | null;

  @Column('simple-array', { nullable: true })
  galleryImages: string[] | null;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true, type: 'varchar' })
  sku: string | null;

  // Round 1 additions: digital products, variants, stock media.

  // Pack-size / price variants, e.g. [{ label: '500g', price: 850 }].
  @Column('jsonb', { nullable: true })
  variants: Array<{ label: string; price: number }> | null;

  // Plain URL list for product images (in addition to the legacy
  // featuredImage / galleryImages fields, which keep working).
  @Column('text', { array: true, default: () => "'{}'" })
  images: string[];

  @Column({ type: 'enum', enum: ProductType, default: ProductType.PHYSICAL })
  type: ProductType;

  // Relative path under backend/private-uploads/digital/ (never publicly
  // served) for digital products.
  @Column({ type: 'text', nullable: true })
  digitalFilePath: string | null;

  // Original filename, kept for the Content-Disposition download header.
  @Column({ type: 'text', nullable: true })
  digitalFileName: string | null;

  // Primary category (new style). The legacy ManyToMany `categories`
  // relation below is kept working alongside it.
  @Column({ nullable: true, type: 'varchar' })
  categoryId: string | null;

  @ManyToOne(() => ProductCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory | null;

  @ManyToMany(() => ProductCategory, category => category.products, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({ name: 'product_product_categories' })
  categories: ProductCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
