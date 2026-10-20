import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory, ProductType } from '../entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { saveDigitalFile, saveProductImages } from './product-uploads';

interface UploadedProductFiles {
  images?: Express.Multer.File[];
  'images[]'?: Express.Multer.File[];
  digitalFile?: Express.Multer.File[];
}

function toNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new BadRequestException(`Field "${field}" must be a number`);
  }
  return num;
}

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  throw new BadRequestException(`Field must be a boolean, got "${value}"`);
}

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const s = String(value).trim();
  if (!s) return undefined;
  if (s.startsWith('[')) {
    const parsed: unknown = JSON.parse(s);
    if (!Array.isArray(parsed)) {
      throw new BadRequestException('Expected a JSON array');
    }
    return parsed.map(String).filter(Boolean);
  }
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function toVariants(value: unknown): Array<{ label: string; price: number }> | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = typeof value === 'string' ? (JSON.parse(value) as unknown) : value;
  if (!Array.isArray(raw)) {
    throw new BadRequestException('variants must be an array like [{label, price}]');
  }
  return raw.map((v, i) => {
    const label = String((v as Record<string, unknown>)?.label ?? '').trim();
    const price = Number((v as Record<string, unknown>)?.price);
    if (!label || Number.isNaN(price)) {
      throw new BadRequestException(`variants[${i}] needs {label, price}`);
    }
    return { label, price };
  });
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
  ) {}

  /** Shape a product for the plain-array list endpoint: embeds category {id,name,slug}. */
  private shapeForList(product: Product) {
    const { category, ...rest } = product;
    return {
      ...rest,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    };
  }

  private applyTypeFilter(
    qb: ReturnType<Repository<Product>['createQueryBuilder']>,
    type?: string,
  ) {
    if (type !== undefined && type !== null && type !== '') {
      const t = String(type).toLowerCase();
      if (t !== ProductType.PHYSICAL && t !== ProductType.DIGITAL) {
        throw new BadRequestException('type must be "physical" or "digital"');
      }
      qb.andWhere('product.type = :ptype', { ptype: t });
    }
  }

  /**
   * Legacy behaviour (page/limit given — the frontend shop uses this):
   * paginated `{ products, total, page, limit, totalPages }`.
   * Filter-only calls (category/type, no pagination): plain array with the
   * primary category embedded as `{ id, name, slug }`.
   */
  async findAll(page?: number, limit?: number, search?: string, categorySlug?: string, type?: string) {
    const paginated = page !== undefined || limit !== undefined;
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.category', 'primaryCategory')
      .where('product.active = :active', { active: true });

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categorySlug) {
      queryBuilder.andWhere(
        '(category.slug = :categorySlug OR primaryCategory.slug = :categorySlug)',
        { categorySlug },
      );
    }

    this.applyTypeFilter(queryBuilder, type);

    if (!paginated) {
      const products = await queryBuilder
        .orderBy('product.createdAt', 'DESC')
        .getMany();
      return products.map((p) => this.shapeForList(p));
    }

    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limitNum)
      .getManyAndCount();

    return {
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['categories', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /** Legacy JSON create (kept working) — delegates to the unified handler. */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.createFromRequest(createProductDto as unknown as Record<string, unknown>);
  }

  /**
   * Unified create: accepts plain JSON bodies AND multipart/form-data with
   * `images`/`images[]` image files + a single `digitalFile` digital file.
   */
  async createFromRequest(
    body: Record<string, unknown>,
    files?: UploadedProductFiles,
  ): Promise<Product> {
    const name = String(body.name ?? '').trim();
    const description = String(body.description ?? '').trim();
    const price = toNumber(body.price, 'price');
    if (!name) throw new BadRequestException('name is required');
    if (!description) throw new BadRequestException('description is required');
    if (price === undefined) throw new BadRequestException('price is required');

    const slugInput = String(body.slug ?? '').trim();
    const slug = slugInput ? this.generateSlug(slugInput) : this.generateSlug(name);
    const existing = await this.productRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Product slug "${slug}" already exists`);
    }

    const typeInput = String(body.type ?? ProductType.PHYSICAL).toLowerCase();
    if (typeInput !== ProductType.PHYSICAL && typeInput !== ProductType.DIGITAL) {
      throw new BadRequestException('type must be "physical" or "digital"');
    }

    const product = this.productRepository.create({
      name,
      description,
      slug,
      price,
      salePrice: toNumber(body.salePrice, 'salePrice') ?? null,
      stock: toNumber(body.stock, 'stock') ?? 0,
      stockStatus: body.stockStatus ? String(body.stockStatus) : 'in_stock',
      featuredImage: body.featuredImage ? String(body.featuredImage) : null,
      galleryImages: toStringArray(body.galleryImages) ?? [],
      images: [],
      variants: toVariants(body.variants) ?? null,
      type: typeInput as ProductType,
      active: toBoolean(body.active) ?? true,
      sku: body.sku ? String(body.sku) : null,
    });

    await this.applyUploads(product, body, files);
    await this.applyCategory(product, body);

    return this.productRepository.save(product);
  }

  /** Unified update (multipart or JSON). Only provided fields change. */
  async updateFromRequest(
    id: string,
    body: Record<string, unknown>,
    files?: UploadedProductFiles,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'category'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) throw new BadRequestException('name cannot be empty');
      product.name = name;
      // Regenerate slug from the new name unless an explicit slug was given.
      const slugInput = String(body.slug ?? '').trim();
      product.slug = slugInput ? this.generateSlug(slugInput) : this.generateSlug(name);
    } else if (body.slug !== undefined) {
      product.slug = this.generateSlug(String(body.slug));
    }
    if (product.slug) {
      const clash = await this.productRepository
        .createQueryBuilder('p')
        .where('p.slug = :slug', { slug: product.slug })
        .andWhere('p.id != :id', { id })
        .getOne();
      if (clash) {
        throw new ConflictException(`Product slug "${product.slug}" already exists`);
      }
    }

    if (body.description !== undefined) product.description = String(body.description);
    const price = toNumber(body.price, 'price');
    if (price !== undefined) product.price = price;
    const salePrice = toNumber(body.salePrice, 'salePrice');
    if (salePrice !== undefined) product.salePrice = salePrice;
    const stock = toNumber(body.stock, 'stock');
    if (stock !== undefined) product.stock = stock;
    if (body.stockStatus !== undefined) product.stockStatus = String(body.stockStatus);
    if (body.featuredImage !== undefined) {
      product.featuredImage = body.featuredImage ? String(body.featuredImage) : null;
    }
    const galleryImages = toStringArray(body.galleryImages);
    if (galleryImages !== undefined) product.galleryImages = galleryImages;
    if (body.sku !== undefined) product.sku = body.sku ? String(body.sku) : null;
    const active = toBoolean(body.active);
    if (active !== undefined) product.active = active;
    if (body.type !== undefined) {
      const t = String(body.type).toLowerCase();
      if (t !== ProductType.PHYSICAL && t !== ProductType.DIGITAL) {
        throw new BadRequestException('type must be "physical" or "digital"');
      }
      product.type = t as ProductType;
    }
    const variants = toVariants(body.variants);
    if (variants !== undefined) product.variants = variants;
    const imagesBody = toStringArray(body.images);
    if (imagesBody !== undefined) product.images = imagesBody;
    if (body.digitalFilePath !== undefined) {
      product.digitalFilePath = body.digitalFilePath ? String(body.digitalFilePath) : null;
    }
    if (body.digitalFileName !== undefined) {
      product.digitalFileName = body.digitalFileName ? String(body.digitalFileName) : null;
    }

    await this.applyUploads(product, body, files, true);
    await this.applyCategory(product, body);

    return this.productRepository.save(product);
  }

  /** Legacy update signature — kept for compatibility. */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.updateFromRequest(id, updateProductDto as unknown as Record<string, unknown>);
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

  // ---------- internal helpers ----------

  private async applyUploads(
    product: Product,
    body: Record<string, unknown>,
    files: UploadedProductFiles | undefined,
    isUpdate = false,
  ): Promise<void> {
    const imageFiles = [
      ...(files?.images ?? []),
      ...(files?.['images[]'] ?? []),
    ];
    if (imageFiles.length > 0) {
      const urls = await saveProductImages(imageFiles);
      product.images = isUpdate
        ? Array.from(new Set([...(product.images ?? []), ...urls]))
        : urls;
    } else if (!isUpdate) {
      // JSON create may pass image URLs directly.
      product.images = toStringArray(body.images) ?? [];
    }

    const digitalFile = files?.digitalFile?.[0];
    if (digitalFile) {
      const saved = await saveDigitalFile(digitalFile);
      product.digitalFilePath = saved.storedPath;
      product.digitalFileName = saved.originalName;
    }
  }

  /** Resolve categoryId / categorySlug / legacy categories names. */
  private async applyCategory(
    product: Product,
    body: Record<string, unknown>,
  ): Promise<void> {
    let primary: ProductCategory | null = null;

    if (body.categoryId) {
      primary = await this.categoryRepository.findOne({
        where: { id: String(body.categoryId) },
      });
      if (!primary) {
        throw new BadRequestException(`Category id "${body.categoryId}" not found`);
      }
    } else if (body.categorySlug) {
      primary = await this.categoryRepository.findOne({
        where: { slug: this.generateSlug(String(body.categorySlug)) },
      });
      if (!primary) {
        throw new BadRequestException(`Category slug "${body.categorySlug}" not found`);
      }
    }

    const categoryNames = toStringArray(body.categories);
    if (categoryNames && categoryNames.length > 0) {
      product.categories = await this.findOrCreateCategories(categoryNames);
    }

    if (primary) {
      product.category = primary;
      product.categoryId = primary.id;
      const inList = (product.categories ?? []).some((c) => c.id === primary.id);
      if (!inList) {
        product.categories = [...(product.categories ?? []), primary];
      }
    }
  }

  private async findOrCreateCategories(categoryNames: string[]): Promise<ProductCategory[]> {
    const categories: ProductCategory[] = [];
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
