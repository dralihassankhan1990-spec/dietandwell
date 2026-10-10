import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { BlogPost, Category, Tag, User } from '../entities';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private postRepository: Repository<BlogPost>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) { }

  async create(createPostDto: CreatePostDto, author: User): Promise<BlogPost> {
    console.log('[BlogService] Creating post for author:', author?.id);
    try {
      const { tags, categories, contentImages, ...postData } = createPostDto;

      const slug = this.generateSlug(createPostDto.title);

      const post = this.postRepository.create({
        ...postData,
        slug,
        author,
        contentImages: contentImages || [],
        published: createPostDto.published ?? false,
        metaTitle: createPostDto.metaTitle || createPostDto.title,
        metaDescription: createPostDto.metaDescription || createPostDto.excerpt?.substring(0, 160) || ''
      });

      if (categories && categories.length > 0) {
        post.categories = await this.findOrCreateCategories(categories);
      }

      if (tags && tags.length > 0) {
        post.tags = await this.findOrCreateTags(tags);
      }

      return await this.postRepository.save(post);
    } catch (error) {
      console.error('[BlogService] Create error:', error);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string, categorySlug?: string, tagSlug?: string) {
    // ... (unchanged)
    const skip = (page - 1) * limit;
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.published = :published', { published: true });

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categorySlug) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (tagSlug) {
      queryBuilder.andWhere('tag.slug = :tagSlug', { tagSlug });
    }

    const [posts, total] = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(slug: string): Promise<BlogPost> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'categories', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.views += 1;
    await this.postRepository.save(post);

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<BlogPost> {
    console.log('[BlogService] Updating post:', id);
    const post = await this.postRepository.findOne({ where: { id }, relations: ['categories', 'tags'] });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { tags, categories, contentImages, ...postData } = updatePostDto;

    if (postData.title) {
      postData['slug'] = this.generateSlug(postData.title);
    }

    Object.assign(post, postData);
    if (contentImages) {
      post.contentImages = contentImages;
    }

    if (categories) {
      post.categories = await this.findOrCreateCategories(categories);
    }

    if (tags) {
      post.tags = await this.findOrCreateTags(tags);
    }

    return this.postRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Post not found');
    }
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findAllTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  private async findOrCreateCategories(categoryNames: string[]): Promise<Category[]> {
    const categories = [];
    for (const name of categoryNames) {
      const slug = this.generateSlug(name);
      let category = await this.categoryRepository.findOne({ where: { slug } });

      if (!category) {
        category = this.categoryRepository.create({ name, slug });
        await this.categoryRepository.save(category);
      }
      categories.push(category);
    }
    return categories;
  }

  private async findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const tags = [];
    for (const name of tagNames) {
      const slug = this.generateSlug(name);
      let tag = await this.tagRepository.findOne({ where: { slug } });

      if (!tag) {
        tag = this.tagRepository.create({ name, slug });
        await this.tagRepository.save(tag);
      }
      tags.push(tag);
    }
    return tags;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}
