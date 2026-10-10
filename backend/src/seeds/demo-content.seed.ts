import { DataSource } from 'typeorm';
import { BlogPost, Category, Tag, Service, PostStatus } from '../entities';
import blogPostsData from '../../demo-blog-posts.json';
import servicesData from '../../demo-services.json';

export async function seedDemoContent(dataSource: DataSource) {
    console.log('🌱 Starting demo content seeding...');

    const blogRepo = dataSource.getRepository(BlogPost);
    const categoryRepo = dataSource.getRepository(Category);
    const tagRepo = dataSource.getRepository(Tag);
    const serviceRepo = dataSource.getRepository(Service);

    try {
        // Seed Blog Posts
        console.log('📝 Seeding blog posts...');
        for (const postData of blogPostsData) {
            // Check if post already exists
            const existing = await blogRepo.findOne({ where: { slug: postData.slug } });
            if (existing) {
                console.log(`  ⏭️  Skipping existing post: ${postData.title}`);
                continue;
            }

            // Create or find categories
            const categories = [];
            if (postData.categories && postData.categories.length > 0) {
                for (const catName of postData.categories) {
                    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    let category = await categoryRepo.findOne({ where: { slug } });

                    if (!category) {
                        category = categoryRepo.create({ name: catName, slug });
                        await categoryRepo.save(category);
                    }
                    categories.push(category);
                }
            }

            // Create or find tags
            const tags = [];
            if (postData.tags && postData.tags.length > 0) {
                for (const tagName of postData.tags) {
                    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    let tag = await tagRepo.findOne({ where: { slug } });

                    if (!tag) {
                        tag = tagRepo.create({ name: tagName, slug });
                        await tagRepo.save(tag);
                    }
                    tags.push(tag);
                }
            }

            // Create blog post
            const post = blogRepo.create({
                title: postData.title,
                slug: postData.slug,
                excerpt: postData.excerpt,
                content: postData.content,
                featuredImage: postData.featuredImage,
                contentImages: [],
                metaTitle: postData.title,
                metaDescription: postData.excerpt,
                status: postData.status as PostStatus,
                published: postData.published,
                publishedAt: postData.published ? new Date() : null,
                categories,
                tags,
            });

            await blogRepo.save(post);
            console.log(`  ✅ Created: ${postData.title}`);
        }

        // Seed Services
        console.log('\n🏥 Seeding services...');
        for (const serviceData of servicesData) {
            // Check if service already exists
            const existing = await serviceRepo.findOne({ where: { slug: serviceData.slug } });
            if (existing) {
                console.log(`  ⏭️  Skipping existing service: ${serviceData.name}`);
                continue;
            }

            // Create service
            const service = serviceRepo.create({
                name: serviceData.name,
                slug: serviceData.slug,
                description: serviceData.description,
                longDescription: serviceData.longDescription,
                icon: serviceData.icon,
                image: serviceData.image,
                price: serviceData.price,
                duration: serviceData.duration,
                active: serviceData.active,
                sortOrder: serviceData.sortOrder,
            });

            await serviceRepo.save(service);
            console.log(`  ✅ Created: ${serviceData.name}`);
        }

        console.log('\n✨ Demo content seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Blog Posts: ${blogPostsData.length} posts`);
        console.log(`   - Services: ${servicesData.length} services`);

    } catch (error) {
        console.error('❌ Error seeding demo content:', error);
        throw error;
    }
}
