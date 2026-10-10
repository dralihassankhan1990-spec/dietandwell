import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from '../entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categories, galleryImages, ...productData } = createProductDto;

    const slug = this.generateSlug(createProductDto.name);

    const product = this.productRepository.create({
      ...productData,
      slug,
      galleryImages: galleryImages || [],
      active: createProductDto.active ?? true,
      stock: createProductDto.stock ?? 0,
    });

    if (categories && categories.length > 0) {
      product.categories = await this.findOrCreateCategories(categories);
    }

    return this.productRepository.save(product);
  }

  async findAll(page = 1, limit = 10, search?: string, categorySlug?: string) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.active = :active', { active: true });

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categorySlug) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['categories'] });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { categories, galleryImages, ...productData } = updateProductDto;

    if (productData.name) {
      productData['slug'] = this.generateSlug(productData.name);
    }

    Object.assign(product, productData);

    if (galleryImages) {
      product.galleryImages = galleryImages;
    }

    if (categories) {
      product.categories = await this.findOrCreateCategories(categories);
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async findAllCategories(): Promise<ProductCategory[]> {
    return this.categoryRepository.find();
  }

  private async findOrCreateCategories(categoryNames: string[]): Promise<ProductCategory[]> {
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}
