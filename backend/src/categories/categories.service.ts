import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export function slugify(name: string): string {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  private shape(category: ProductCategory) {
    const { id, name, slug, image, description, sortOrder } = category;
    return { id, name, slug, image, description, sortOrder };
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return categories.map((c) => this.shape(c));
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      category: this.shape(category),
      products: category.products ?? [],
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = createCategoryDto.slug?.trim()
      ? slugify(createCategoryDto.slug)
      : slugify(createCategoryDto.name);
    if (!slug) {
      throw new BadRequestException('Could not generate a slug from the name');
    }
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category slug "${slug}" already exists`);
    }
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      slug,
      image: createCategoryDto.image ?? null,
      description: createCategoryDto.description ?? null,
      sortOrder: createCategoryDto.sortOrder ?? 0,
    });
    return this.shape(await this.categoryRepository.save(category));
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const { name, slug, image, description, sortOrder } = updateCategoryDto;
    if (slug?.trim()) {
      const newSlug = slugify(slug);
      if (newSlug !== category.slug) {
        const clash = await this.categoryRepository.findOne({ where: { slug: newSlug } });
        if (clash && clash.id !== id) {
          throw new ConflictException(`Category slug "${newSlug}" already exists`);
        }
        category.slug = newSlug;
      }
    }
    if (name !== undefined) category.name = name;
    if (image !== undefined) category.image = image ?? null;
    if (description !== undefined) category.description = description ?? null;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    return this.shape(await this.categoryRepository.save(category));
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const productCount = category.products?.length ?? 0;
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category — it still has ${productCount} product(s)`,
      );
    }
    await this.categoryRepository.remove(category);
    return { success: true, id };
  }
}
