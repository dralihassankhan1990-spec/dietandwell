import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column('text')
  content: string;

  @Column({ nullable: true, type: 'varchar' })
  featuredImage: string | null;

  /** Preferred cover image for cards/heroes (synced with featuredImage when
   *  only one of them is provided). */
  @Column({ type: 'text', nullable: true })
  coverImage: string | null;

  @Column('simple-array', { nullable: true })
  contentImages: string[];

  @Column({ nullable: true })
  metaTitle: string;

  @Column('text', { nullable: true })
  metaDescription: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ default: 0 })
  views: number;

  @Column({ default: false })
  published: boolean;

  @ManyToOne(() => User, user => user.blogPosts, { nullable: true })
  author: User;

  @ManyToMany(() => Category, category => category.posts, { eager: true })
  @JoinTable({ name: 'post_categories' })
  categories: Category[];

  @ManyToMany(() => Tag, tag => tag.posts, { eager: true })
  @JoinTable({ name: 'post_tags' })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
