# Demo Content Import Guide

This directory contains high-quality demo content for the DietAndWell application.

## Files

### 1. demo-blog-posts.json
Contains 5 comprehensive blog posts based on 2024 nutrition trends:
- The Gut-Brain Connection: How Your Microbiome Affects Mental Health
- Plant-Based Protein: Complete Guide to Meeting Your Daily Goals
- Sustainable Eating: Nutrition for You and the Planet
- Personalized Nutrition: Finding Your Perfect Diet in 2024
- Anti-Inflammatory Foods for Healthy Aging and Longevity

Each post includes:
- Full content (1500-3000 words)
- Featured image URL
- Categories and tags
- SEO-friendly slug
- Excerpt

### 2. demo-services.json
Contains 10 professional nutrition services:
1. One-on-One Nutrition Consultation
2. Personalized Meal Planning
3. Weight Management Program
4. Sports Nutrition Coaching
5. Gut Health Optimization
6. Plant-Based Transition Support
7. Family Nutrition Planning
8. Corporate Wellness Programs
9. Prenatal & Postnatal Nutrition
10. Healthy Aging Nutrition

Each service includes:
- Detailed description
- Long description (200+ words)
- Pricing
- Duration
- Icon and image
- SEO-friendly slug

## How to Import

### Option 1: Using Admin Panel
1. Start the backend server: `cd backend && npm run dev`
2. Login to admin panel at `/admin`
3. Navigate to Blog Posts or Services section
4. Use the import feature (if available) or manually create entries

### Option 2: Direct Database Import
Create a seed script in `backend/src/seeds/`:

```typescript
// demo-content.seed.ts
import { BlogPost } from '../entities/blog-post.entity';
import { Service } from '../entities/service.entity';
import * as blogPosts from '../../demo-blog-posts.json';
import * as services from '../../demo-services.json';

export async function seedDemoContent(dataSource) {
  const blogRepo = dataSource.getRepository(BlogPost);
  const serviceRepo = dataSource.getRepository(Service);
  
  // Import blog posts
  for (const post of blogPosts) {
    await blogRepo.save(post);
  }
  
  // Import services
  for (const service of services) {
    await serviceRepo.save(service);
  }
  
  console.log('Demo content imported successfully!');
}
```

### Option 3: API Endpoints
Use POST requests to create each item via the API:

```bash
# Blog Post Example
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @demo-blog-posts.json

# Service Example
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @demo-services.json
```

## Notes

- All images use Unsplash URLs (free to use)
- Content is SEO-optimized with proper headings and structure
- Blog posts are written in Markdown format
- All content is based on 2024 nutrition research and trends
- Services reflect current professional dietitian offerings
- Pricing is realistic for the US market (adjust as needed)

## Customization

Feel free to:
- Adjust pricing for your market
- Modify service durations
- Update images with your own
- Edit content to match your brand voice
- Add or remove categories/tags
- Translate to other languages

## Content Quality

All content is:
- ✅ Professionally written
- ✅ Evidence-based (2024 research)
- ✅ SEO-optimized
- ✅ Engaging and informative
- ✅ Properly structured
- ✅ Ready for production use

Replace with your own content when ready!
