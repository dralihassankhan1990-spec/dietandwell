import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost, Category, Tag, User, PostStatus } from '../entities';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private postRepository: Repository<BlogPost>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  /** Keep the `published` boolean and `status` enum in sync. */
  private resolveVisibility(input: {
    published?: boolean;
    status?: PostStatus;
  }): { published: boolean; status: PostStatus } {
    if (input.status) {
      return { published: input.status === PostStatus.PUBLISHED, status: input.status };
    }
    const published = input.published ?? false;
    return { published, status: published ? PostStatus.PUBLISHED : PostStatus.DRAFT };
  }

  async create(createPostDto: CreatePostDto, author: User): Promise<BlogPost> {
    const { tags, categories, contentImages, ...postData } = createPostDto;
    const { published, status } = this.resolveVisibility(createPostDto);
    const baseSlug = (createPostDto.slug || createPostDto.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const post = this.postRepository.create({
      ...postData,
      slug,
      author,
      contentImages: contentImages || [],
      published,
      status,
      // excerpt column is nullable — default to '' when the client omits it.
      excerpt: createPostDto.excerpt ?? '',
      // Keep coverImage/featuredImage in sync: coverImage wins, then falls
      // back to featuredImage, and the loser copies the winner so old and
      // new clients always find an image.
      coverImage: createPostDto.coverImage ?? createPostDto.featuredImage ?? null,
      featuredImage: createPostDto.featuredImage ?? createPostDto.coverImage ?? null,
      publishedAt: published ? new Date() : null,
      metaTitle: createPostDto.metaTitle || createPostDto.title,
      metaDescription:
        createPostDto.metaDescription || createPostDto.excerpt?.substring(0, 160) || '',
    });

    if (categories && categories.length > 0) {
      post.categories = await this.findOrCreateCategories(categories);
    }

    if (tags && tags.length > 0) {
      post.tags = await this.findOrCreateTags(tags);
    }

    return await this.postRepository.save(post);
  }

  async findAll(page = 1, limit = 10, search?: string, categorySlug?: string, tagSlug?: string) {
    return this.findPaged(page, limit, search, categorySlug, tagSlug, true);
  }

  /** Admin listing: ALL posts including drafts (used by GET /blog/admin/all). */
  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
    categorySlug?: string,
    tagSlug?: string,
  ) {
    return this.findPaged(page, limit, search, categorySlug, tagSlug, false);
  }

  private async findPaged(
    page = 1,
    limit = 10,
    search?: string,
    categorySlug?: string,
    tagSlug?: string,
    publishedOnly = true,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.tags', 'tag');

    if (publishedOnly) {
      queryBuilder.where('post.published = :published', { published: true });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` },
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

  /**
   * Public single-post fetch. Published-only so drafts never leak, and the
   * view count increments on every public read (spec §5.2).
   */
  async findOne(slug: string): Promise<BlogPost> {
    const post = await this.postRepository.findOne({
      where: { slug, published: true },
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
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['categories', 'tags'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { tags, categories, contentImages, ...postData } = updatePostDto;

    const updates: Partial<BlogPost> = { ...postData };
    if (postData.title) {
      updates.slug = await this.ensureUniqueSlug(this.generateSlug(postData.title), id);
    } else if (updatePostDto.slug) {
      updates.slug = await this.ensureUniqueSlug(updatePostDto.slug, id);
    }
    // coverImage and featuredImage stay in sync: whichever is explicitly set
    // wins and copies to the other when the other isn't also set.
    const newCover = updates.coverImage ?? updates.featuredImage ?? null;
    if (updates.coverImage !== undefined || updates.featuredImage !== undefined) {
      if (updates.coverImage === undefined) updates.coverImage = newCover;
      if (updates.featuredImage === undefined) updates.featuredImage = newCover;
    }
    // An explicit status wins; otherwise an explicit published flag wins.
    // The two fields are always kept consistent.
    if (updatePostDto.status !== undefined) {
      updates.status = updatePostDto.status;
      updates.published = updatePostDto.status === PostStatus.PUBLISHED;
    } else if (updatePostDto.published !== undefined) {
      updates.published = updatePostDto.published;
      updates.status = updatePostDto.published ? PostStatus.PUBLISHED : PostStatus.DRAFT;
    }
    if (updates.published && !post.publishedAt) {
      updates.publishedAt = new Date();
    }
    if (updates.published === false) {
      updates.publishedAt = null;
    }

    Object.assign(post, updates);
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
    return this.tagRepository.createQueryBuilder('tag')
      .innerJoin('tag.posts', 'post', 'post.published = :published', { published: true })
      .distinct(true).orderBy('tag.name', 'ASC').getMany();
  }

  private async findOrCreateCategories(categoryNames: string[]): Promise<Category[]> {
    const categories: Category[] = [];
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
    const tags: Tag[] = [];
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

  /**
   * Base slug from a title/string (no uniqueness check — use
   * ensureUniqueSlug for that).
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  /**
   * Returns a slug that is unique in blog_posts, appending a numeric suffix
   * (-2, -3, ...) when the base is taken. `excludeId` skips the post being
   * updated so it doesn't collide with itself.
   */
  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const stem = base || 'post';
    let slug = stem;
    let counter = 2;
    // eslint-disable-next-line no-await-in-loop
    let conflict = await this.postRepository.findOne({ where: { slug } });
    while (conflict && conflict.id !== excludeId) {
      slug = `${stem}-${counter}`;
      counter += 1;
      // eslint-disable-next-line no-await-in-loop
      conflict = await this.postRepository.findOne({ where: { slug } });
    }
    return slug;
  }
}
