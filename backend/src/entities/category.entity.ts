import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  // BlogPost.categories is a ManyToMany — the inverse side must be ManyToMany too.
  // The old @OneToMany(post => post.category) referenced a property that does
  // not exist on BlogPost and broke TypeORM metadata at boot.
  @ManyToMany(() => BlogPost, (post) => post.categories)
  posts: BlogPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
