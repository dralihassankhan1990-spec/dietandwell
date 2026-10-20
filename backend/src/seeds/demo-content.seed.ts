import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {
  BlogPost,
  Category,
  Tag,
  Service,
  Metric,
  Calculator,
  CalculatorType,
  Product,
  ProductCategory,
  ProductType,
} from '../entities';
import { PostStatus } from '../entities/blog-post.entity';
import { createSeedDataSource } from './seed-connection';
import { seedDefaultSettings } from './default-settings.seed';
import { ensureProductUploadDirs } from '../products/product-uploads';

type AnyRecord = Record<string, any>;

/**
 * Loads a JSON file from the backend root. Returns [] (with a warning) when
 * the file is missing, empty, or invalid — seeding must never crash or wipe
 * data because a demo file is absent. Nothing in this seed overwrites
 * existing rows: every insert is skip-if-exists.
 */
function loadDemoJson(fileName: string): AnyRecord[] {
  const candidates = [
    path.join(process.cwd(), fileName),
    path.join(__dirname, '..', fileName),
    path.join(__dirname, '..', '..', fileName),
  ];
  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const raw = fs.readFileSync(candidate, 'utf8').trim();
      if (!raw) {
        console.log(`  [warn] ${fileName} is empty — skipping its demo rows.`);
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.log(`  [warn] ${fileName} is not a JSON array — skipping its demo rows.`);
        return [];
      }
      return parsed;
    } catch (error) {
      console.log(`  [warn] Could not parse ${fileName} — skipping its demo rows.`);
      return [];
    }
  }
  console.log(`  [warn] ${fileName} not found — skipping its demo rows.`);
  return [];
}

const DEFAULT_METRICS = [
  { key: 'total_clients', label: 'Happy Clients', value: 666, unit: '+', icon: 'users', sortOrder: 1 },
  { key: 'avg_fat_loss', label: 'Avg. Fat Loss', value: 13, unit: '%', icon: 'chart', sortOrder: 2 },
  { key: 'years_experience', label: 'Years Experience', value: 2, unit: '+', icon: 'trophy', sortOrder: 3 },
  { key: 'total_articles', label: 'Articles Published', value: 26, unit: '+', icon: 'article', sortOrder: 4 },
];

const DEFAULT_CALCULATORS = [
  { name: 'BMI Calculator', type: CalculatorType.BMI, description: 'Body Mass Index from weight and height.', instructions: 'Enter weight (kg) and height (cm).', sortOrder: 1 },
  { name: 'Calorie Calculator (TDEE)', type: CalculatorType.TDEE, description: 'Daily calorie needs from BMR x activity level.', instructions: 'Enter age, gender, weight, height and activity level.', sortOrder: 2 },
  { name: 'Macro Split Calculator', type: CalculatorType.MACRO, description: 'Protein / carbs / fat split for a calorie target.', instructions: 'Enter total calories, goal and diet style.', sortOrder: 3 },
  { name: 'Body Fat Calculator', type: CalculatorType.BODY_FAT, description: 'U.S. Navy body-fat estimate from tape measurements.', instructions: 'Enter gender, waist, neck, height (and hip for women).', sortOrder: 4 },
  { name: 'Water Intake Calculator', type: CalculatorType.WATER_INTAKE, description: 'Daily water needs from body weight, activity and climate.', instructions: 'Enter weight, activity level and climate.', sortOrder: 5 },
  { name: 'Qurbani Meat Calculator', type: CalculatorType.QURBANI_MEAT, description: 'Estimated meat yield and per-person share.', instructions: 'Enter animal, live weight and number of people sharing.', sortOrder: 6 },
];

/**
 * Starter articles seeded ONLY when demo-blog-posts.json is missing/empty —
 * restores the blog so the public listing has published content on a fresh
 * database. Skip-if-exists: never overwrites real posts. Content is stored as
 * HTML (the same format the TipTap admin editor produces).
 */
const DEFAULT_BLOG_POSTS: AnyRecord[] = [
  {
    title: 'The Complete Guide to Macro Tracking',
    slug: 'complete-guide-macro-tracking',
    excerpt: 'Learn to optimise your protein, carbs and fats for maximum results — without turning every meal into a maths exercise.',
    content: '<p>Macro tracking is the practice of counting the three macronutrients — <strong>protein, carbohydrates and fats</strong> — rather than only counting calories. It gives you control over body composition, not just body weight.</p><h2>Why macros matter more than calories alone</h2><p>Two people can eat 2,000 calories a day and look completely different. One eating enough protein preserves muscle while losing fat; the other loses muscle and keeps the fat. The difference is the macro split.</p><h2>A sensible starting split</h2><ul><li><strong>Protein:</strong> 1.6–2.2 g per kg of body weight (muscle retention and satiety).</li><li><strong>Fat:</strong> 0.8–1.0 g per kg (hormone health and vitamin absorption).</li><li><strong>Carbohydrates:</strong> fill the remaining calories (training fuel and recovery).</li></ul><blockquote>Track consistently for two weeks before changing anything — the data is only useful when it reflects your real habits.</blockquote><h2>Common mistakes</h2><ol><li>Tracking everything except weekends — the days you skip are the days that matter most.</li><li>Changing targets every few days instead of waiting for a trend.</li><li>Ignoring food quality: macros control quantity, whole foods control hunger and health.</li></ol><p>Start simple, stay consistent, and adjust based on two-week trends — not daily noise.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    published: true,
    categories: ['Nutrition'],
    tags: ['macros', 'fat loss', 'beginners'],
  },
  {
    title: '5 Supplements Worth Taking (and 5 to Skip)',
    slug: '5-supplements-worth-taking',
    excerpt: 'Science-backed supplements for health and performance — plus the ones that are mostly marketing.',
    content: '<p>The supplement industry sells billions of dollars of hope. Only a handful of products have evidence strong enough to justify the money.</p><h2>Worth taking</h2><ol><li><strong>Creatine monohydrate</strong> — the most studied sports supplement in history; improves strength and lean mass.</li><li><strong>Vitamin D3</strong> — most indoor workers are deficient; essential for bone and immune health.</li><li><strong>Omega-3 (EPA/DHA)</strong> — supports heart, brain and joint health.</li><li><strong>Whey protein</strong> — convenient, not magical; useful when whole-food protein falls short.</li><li><strong>Magnesium</strong> — many people under-consume it; supports sleep and recovery.</li></ol><h2>Probably skip</h2><ul><li>Fat burners and detox teas — no meaningful evidence.</li><li>Most "testosterone boosters" — the effect, if any, is negligible.</li><li>Collagen for muscle growth — it is an incomplete protein.</li></ul><blockquote>Supplements fill gaps — they never fix a poor diet, bad sleep, or zero training.</blockquote>',
    featuredImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    published: true,
    categories: ['Supplements'],
    tags: ['supplements', 'evidence-based', 'health'],
  },
  {
    title: 'Hydration: The Foundation of Wellness',
    slug: 'hydration-foundation-wellness',
    excerpt: 'Why water is your secret weapon for better health, clearer thinking, and easier fat loss.',
    content: '<p>Your body is roughly 60% water, and even <strong>mild dehydration</strong> — as little as 1–2% of body weight — impairs concentration, mood, and physical performance.</p><h2>How much do you actually need?</h2><p>Forget the rigid "8 glasses" rule. A practical target is <strong>30–40 ml per kilogram of body weight</strong> per day, plus more in heat or around training. Pale-yellow urine is a better guide than any formula.</p><h2>Signs you are under-hydrated</h2><ul><li>Afternoon headaches and brain fog</li><li>Dark urine by midday</li><li>Feeling hungry when you recently ate — thirst is often mistaken for hunger</li><li>Poor training performance and slow recovery</li></ul><blockquote>Front-load your water: drink 500 ml within an hour of waking to replace overnight losses.</blockquote><p>Keep a bottle in sight, sip steadily, and treat hydration as the cheapest performance upgrade available.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1200&q=80',
    published: true,
    categories: ['Health'],
    tags: ['hydration', 'wellness', 'habits'],
  },
  {
    title: 'Gut Health 101: Feed Your Microbiome',
    slug: 'gut-health-101-microbiome',
    excerpt: 'Fibre, fermented foods, and the small daily habits that keep your gut — and your immune system — thriving.',
    content: '<p>The gut microbiome — trillions of microbes living in your digestive tract — influences immunity, mood, and even weight regulation. Feeding it well is one of the highest-leverage health habits.</p><h2>The three pillars</h2><ol><li><strong>Fibre diversity:</strong> aim for 25–35 g of fibre daily from varied plants — vegetables, legumes, whole grains, nuts.</li><li><strong>Fermented foods:</strong> yoghurt, kefir, kimchi, and sauerkraut introduce beneficial bacteria.</li><li><strong>Consistency over cleanses:</strong> the microbiome responds to daily patterns, not occasional "detoxes".</li></ol><h2>What harms the gut</h2><ul><li>Ultra-processed diets low in fibre</li><li>Chronic stress and poor sleep</li><li>Unnecessary antibiotic courses (always follow medical advice)</li></ul><blockquote>Count plants, not just macros: 30 different plant foods per week is a research-backed target for microbial diversity.</blockquote>',
    featuredImage: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&q=80',
    published: true,
    categories: ['Nutrition'],
    tags: ['gut health', 'fibre', 'immunity'],
  },
];

export async function seedDemoContent(dataSource: DataSource) {
  console.log('Starting demo content seeding (skip-if-exists — never overwrites)...');

  const blogRepo = dataSource.getRepository(BlogPost);
  const categoryRepo = dataSource.getRepository(Category);
  const tagRepo = dataSource.getRepository(Tag);
  const serviceRepo = dataSource.getRepository(Service);
  const metricRepo = dataSource.getRepository(Metric);
  const calculatorRepo = dataSource.getRepository(Calculator);

  try {
    const blogPostsData = loadDemoJson('demo-blog-posts.json');
    const servicesData = loadDemoJson('demo-services.json');
    // Fall back to built-in starter articles when the demo JSON is empty —
    // the public blog listing needs published content on a fresh database.
    const postsToSeed = blogPostsData.length > 0 ? blogPostsData : DEFAULT_BLOG_POSTS;

    // Seed Blog Posts
    console.log('Seeding blog posts...');
    for (const postData of postsToSeed) {
      const existing = await blogRepo.findOne({ where: { slug: postData.slug } });
      if (existing) {
        console.log(`  [skip] existing post: ${postData.title}`);
        continue;
      }

      const categories: Category[] = [];
      if (postData.categories && postData.categories.length > 0) {
        for (const catName of postData.categories) {
          const slug = String(catName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let category = await categoryRepo.findOne({ where: { slug } });
          if (!category) {
            category = categoryRepo.create({ name: catName, slug });
            await categoryRepo.save(category);
          }
          categories.push(category);
        }
      }

      const tags: Tag[] = [];
      if (postData.tags && postData.tags.length > 0) {
        for (const tagName of postData.tags) {
          const slug = String(tagName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let tag = await tagRepo.findOne({ where: { slug } });
          if (!tag) {
            tag = tagRepo.create({ name: tagName, slug });
            await tagRepo.save(tag);
          }
          tags.push(tag);
        }
      }

      const post = blogRepo.create({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        coverImage: postData.coverImage ?? postData.featuredImage ?? null,
        contentImages: [],
        metaTitle: postData.title,
        metaDescription: postData.excerpt,
        status: postData.status ?? (postData.published ? PostStatus.PUBLISHED : PostStatus.DRAFT),
        published: postData.published ?? false,
        publishedAt: postData.published ? new Date() : null,
        categories,
        tags,
      });

      await blogRepo.save(post);
      console.log(`  [created] ${postData.title}`);
    }

    // Seed Services
    console.log('\nSeeding services...');
    for (const serviceData of servicesData) {
      const existing = await serviceRepo.findOne({ where: { slug: serviceData.slug } });
      if (existing) {
        console.log(`  [skip] existing service: ${serviceData.name}`);
        continue;
      }

      const service = serviceRepo.create({
        name: serviceData.name,
        slug: serviceData.slug,
        description: serviceData.description,
        longDescription: serviceData.longDescription,
        icon: serviceData.icon,
        image: serviceData.image,
        price: serviceData.price,
        duration: serviceData.duration,
        active: serviceData.active ?? true,
        sortOrder: serviceData.sortOrder ?? 0,
      });

      await serviceRepo.save(service);
      console.log(`  [created] ${serviceData.name}`);
    }

    // Seed Metrics (skip-if-exists) — powers GET /api/metrics.
    console.log('\nSeeding metrics...');
    for (const metricData of DEFAULT_METRICS) {
      const existing = await metricRepo.findOne({ where: { key: metricData.key } });
      if (existing) {
        console.log(`  [skip] existing metric: ${metricData.key}`);
        continue;
      }
      await metricRepo.save(metricRepo.create(metricData));
      console.log(`  [created] metric: ${metricData.key}`);
    }

    // Seed Calculator definitions (skip-if-exists) — powers GET /api/calculators.
    console.log('\nSeeding calculators...');
    for (const calcData of DEFAULT_CALCULATORS) {
      const existing = await calculatorRepo.findOne({ where: { type: calcData.type } });
      if (existing) {
        console.log(`  [skip] existing calculator: ${calcData.type}`);
        continue;
      }
      await calculatorRepo.save(
        calculatorRepo.create({ ...calcData, isActive: true }),
      );
      console.log(`  [created] calculator: ${calcData.type}`);
    }

    console.log('\nDemo content seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo content:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Round-1 shop demo content (runs via `npm run seed:demo`).
// Idempotent: any slug that already exists is skipped, nothing is wiped.
// ---------------------------------------------------------------------------

const DEMO_CATEGORIES = [
  {
    name: 'Digital Books',
    slug: 'digital-books',
    image: '/images/cat-digital-books.jpg',
    description: '[Demo] Downloadable nutrition guides and handbooks.',
    sortOrder: 1,
  },
  {
    name: 'Nutritional Products',
    slug: 'nutritional-products',
    image: '/images/cat-nutritional.jpg',
    description: '[Demo] Everyday nutrition staples and protein products.',
    sortOrder: 2,
  },
  {
    name: 'Superfoods & Seeds',
    slug: 'superfoods-seeds',
    image: '/images/cat-superfoods.jpg',
    description: '[Demo] Nutrient-dense seeds and nuts.',
    sortOrder: 3,
  },
];

const DEMO_DIGITAL_PRODUCTS = [
  {
    name: 'Little Tummies: Child Nutrition 0–5',
    slug: 'little-tummies-child-nutrition-0-5',
    pdfTitle: 'Little Tummies: Child Nutrition 0-5',
    price: 499,
    description:
      '[Demo] A practical guide to feeding children from birth to age five — portions, first foods, and fussy-eater strategies.',
  },
  {
    name: 'Nourished Beginnings: Pregnancy Nutrition Guide',
    slug: 'nourished-beginnings-pregnancy-nutrition-guide',
    pdfTitle: 'Nourished Beginnings: Pregnancy Nutrition Guide',
    price: 799,
    description:
      '[Demo] Trimester-by-trimester nutrition for expecting mothers — key nutrients, meal ideas, and foods to limit.',
  },
  {
    name: 'Balanced & Light: Weight Management Handbook',
    slug: 'balanced-and-light-weight-management-handbook',
    pdfTitle: 'Balanced and Light: Weight Management Handbook',
    price: 599,
    description:
      '[Demo] A sustainable, no-crash-diet handbook for healthy weight management — habits, plates, and tracking.',
  },
  {
    name: 'Family Table: Healthy Meals for Everyone',
    slug: 'family-table-healthy-meals-for-everyone',
    pdfTitle: 'Family Table: Healthy Meals for Everyone',
    price: 699,
    description:
      '[Demo] Family-friendly meal planning with balanced recipes everyone at the table will enjoy.',
  },
];

interface DemoVariant {
  label: string;
  price: number;
}

const DEMO_PHYSICAL_PRODUCTS: Array<{
  name: string;
  slug: string;
  categorySlug: string;
  variants: DemoVariant[];
  description: string;
}> = [
  {
    name: 'Rolled Oats',
    slug: 'rolled-oats',
    categorySlug: 'nutritional-products',
    variants: [
      { label: '250g', price: 380 },
      { label: '500g', price: 720 },
      { label: '1kg', price: 1350 },
    ],
    description: '[Demo] Wholegrain rolled oats — a fibre-rich breakfast staple.',
  },
  {
    name: 'Whey Protein',
    slug: 'whey-protein',
    categorySlug: 'nutritional-products',
    variants: [
      { label: '500g', price: 3200 },
      { label: '1kg', price: 5900 },
    ],
    description: '[Demo] Whey protein concentrate for muscle recovery and daily protein.',
  },
  {
    name: 'Chia Seeds',
    slug: 'chia-seeds',
    categorySlug: 'superfoods-seeds',
    variants: [
      { label: '250g', price: 650 },
      { label: '500g', price: 1200 },
    ],
    description: '[Demo] Omega-3 rich chia seeds — great for puddings and smoothies.',
  },
  {
    name: 'Flaxseed',
    slug: 'flaxseed',
    categorySlug: 'superfoods-seeds',
    variants: [
      { label: '250g', price: 420 },
      { label: '500g', price: 780 },
    ],
    description: '[Demo] Ground flaxseed — fibre and plant omega-3 for everyday meals.',
  },
  {
    name: 'Almonds',
    slug: 'almonds',
    categorySlug: 'superfoods-seeds',
    variants: [
      { label: '250g', price: 850 },
      { label: '500g', price: 1600 },
      { label: '1kg', price: 3100 },
    ],
    description: '[Demo] Premium almonds — protein, vitamin E and healthy fats.',
  },
  {
    name: 'Pumpkin Seeds',
    slug: 'pumpkin-seeds',
    categorySlug: 'superfoods-seeds',
    variants: [
      { label: '250g', price: 700 },
      { label: '500g', price: 1300 },
    ],
    description: '[Demo] Zinc-rich pumpkin seeds — a crunchy snack or salad topper.',
  },
  {
    name: 'Quinoa',
    slug: 'quinoa',
    categorySlug: 'nutritional-products',
    variants: [
      { label: '500g', price: 950 },
      { label: '1kg', price: 1800 },
    ],
    description: '[Demo] Complete-protein quinoa — a versatile gluten-free grain.',
  },
];

/**
 * Build a minimal but valid one-page PDF (ASCII title/subtitle only).
 * Offsets for the xref table are computed from real byte lengths.
 */
function makeOnePagePdf(title: string, subtitle: string): Buffer {
  const esc = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const content =
    `BT /F1 24 Tf 72 730 Td (${esc(title)}) Tj ET\n` +
    `BT /F1 12 Tf 72 700 Td (${esc(subtitle)}) Tj ET\n` +
    `BT /F1 11 Tf 72 668 Td (Sample chapter - DietAndWell demo content.) Tj ET\n` +
    `BT /F1 11 Tf 72 650 Td (Replace this file with the real book before launch.) Tj ET`;
  const contentBytes = Buffer.byteLength(content, 'latin1');
  const objects: string[] = [
    '',
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
      '/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contentBytes} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

export async function seedDemoShopContent(dataSource: DataSource) {
  console.log('Seeding Round-1 shop demo content (skip-if-exists — never wipes)...');
  ensureProductUploadDirs();

  const categoryRepo = dataSource.getRepository(ProductCategory);
  const productRepo = dataSource.getRepository(Product);

  // Categories
  console.log('Seeding demo categories...');
  const categoriesBySlug = new Map<string, ProductCategory>();
  for (const c of DEMO_CATEGORIES) {
    let category = await categoryRepo.findOne({ where: { slug: c.slug } });
    if (category) {
      console.log(`  [skip] existing category: ${c.slug}`);
    } else {
      category = await categoryRepo.save(categoryRepo.create(c));
      console.log(`  [created] category: ${c.slug}`);
    }
    categoriesBySlug.set(c.slug, category);
  }

  // Digital products + sample PDFs
  console.log('\nSeeding demo digital products...');
  for (const p of DEMO_DIGITAL_PRODUCTS) {
    const existing = await productRepo.findOne({ where: { slug: p.slug } });
    if (existing) {
      console.log(`  [skip] existing product: ${p.slug}`);
      continue;
    }
    const fileName = `demo-${p.slug}.pdf`;
    const storedPath = path.join('private-uploads', 'digital', fileName);
    const absolutePath = path.join(process.cwd(), storedPath);
    const pdf = makeOnePagePdf(p.pdfTitle, 'DietAndWell digital book (demo sample)');
    await fs.promises.writeFile(absolutePath, pdf);

    const category = categoriesBySlug.get('digital-books')!;
    const product = productRepo.create({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      stock: 0,
      stockStatus: 'in_stock',
      active: true,
      images: [],
      variants: null,
      type: ProductType.DIGITAL,
      digitalFilePath: storedPath,
      digitalFileName: `${p.slug}.pdf`,
      categoryId: category.id,
      category,
      categories: [category],
    });
    await productRepo.save(product);
    console.log(`  [created] product: ${p.slug} (PDF: ${storedPath})`);
  }

  // Physical products with variants
  console.log('\nSeeding demo physical products...');
  for (const p of DEMO_PHYSICAL_PRODUCTS) {
    const existing = await productRepo.findOne({ where: { slug: p.slug } });
    if (existing) {
      console.log(`  [skip] existing product: ${p.slug}`);
      continue;
    }
    const category = categoriesBySlug.get(p.categorySlug);
    if (!category) {
      throw new Error(`Demo category missing: ${p.categorySlug}`);
    }
    const product = productRepo.create({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.variants[0].price,
      stock: 100,
      stockStatus: 'in_stock',
      active: true,
      images: [],
      variants: p.variants,
      type: ProductType.PHYSICAL,
      digitalFilePath: null,
      digitalFileName: null,
      categoryId: category.id,
      category,
      categories: [category],
    });
    await productRepo.save(product);
    console.log(`  [created] product: ${p.slug} (${p.variants.length} variants)`);
  }

  // Default settings (bank_account_details placeholder; never overwrites).
  console.log('\nSeeding default settings...');
  await seedDefaultSettings(dataSource);

  console.log('\nShop demo content seeding completed.');
}

async function main() {
  const dataSource = createSeedDataSource();
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected.\n');
    await seedDemoContent(dataSource);
    await seedDemoShopContent(dataSource);
    console.log('\nDone. Run again any time — existing slugs are skipped (idempotent).');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Only runs when invoked directly: `ts-node src/seeds/demo-content.seed.ts`
// (`npm run seed:demo`). Importing this module never seeds anything.
if (require.main === module) {
  main().catch((error) => {
    console.error('seed:demo failed:', error);
    process.exit(1);
  });
}
