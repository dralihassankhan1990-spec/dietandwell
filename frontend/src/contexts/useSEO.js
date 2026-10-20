/* ================================================================
   useSEO — Dynamic per-page meta tags
   FILE: src/hooks/useSEO.js
   
   Usage:
     useSEO({
       title: 'BMI Calculator | DietAndWell',
       description: '...',
       image: '...',    // optional
       type: 'article', // optional
       schema: {...},   // optional JSON-LD
     });
   ================================================================ */

import { useEffect } from 'react';

const SITE_NAME = 'DietAndWell';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.dietandwell.com').replace(/\/$/,'');
const DEFAULT_IMAGE = `${SITE_URL}/images/nutrition-bowl-v2.png`;

export function useSEO({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = 'website',
  url,
  schema,
  noIndex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? (title.endsWith(`| ${SITE_NAME}`) ? title : `${title} | ${SITE_NAME}`) : `${SITE_NAME} — Evidence-Based Nutrition Coaching`;

    /* ── <title> ── */
    document.title = fullTitle;

    /* ── Helpers ── */
    function setMeta(name, content, property = false) {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    function setLink(rel, href) {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    }

    function setSchema(data) {
      let el = document.querySelector('script[data-dynamic-schema]');
      if (!el) {
        el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-dynamic-schema', 'true');
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    }

    /* ── Meta tags ── */
    if (description) setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    /* ── OG tags ── */
    setMeta('og:title',       fullTitle,   true);
    setMeta('og:type',        type,        true);
    setMeta('og:image',       image,       true);
    setMeta('og:url',         url || SITE_URL + window.location.pathname, true);
    if (description) setMeta('og:description', description, true);

    /* ── Twitter ── */
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:image',       image);
    if (description) setMeta('twitter:description', description);

    /* ── Canonical ── */
    setLink('canonical', url ? url.replace('https://www.dietandwell.com',SITE_URL) : SITE_URL + window.location.pathname);

    /* ── JSON-LD ── */
    if (schema) setSchema(JSON.parse(JSON.stringify(schema).replaceAll('https://www.dietandwell.com',SITE_URL)));

    /* ── Cleanup ── */
    return () => {
      const el = document.querySelector('script[data-dynamic-schema]');
      if (el) el.textContent = '';
    };
  }, [title, description, image, type, url, schema, noIndex]);
}

/* ── Pre-built SEO configs for each page ─────────────────────── */
export const SEO = {
  home: {
    title: 'Evidence-Based Nutrition Coaching & Free Health Calculators',
    description: 'Get personalised nutrition coaching from a certified nutritionist with 10+ years experience. Free BMI, TDEE & macro calculators. Proven meal plans for weight loss, gut health & performance.',
  },
  blog: {
    title: 'Nutrition & Wellness Blog — Expert Articles',
    description: 'Evidence-based articles on nutrition, metabolism, gut health, and performance. Written by a certified nutritionist with 10+ years of clinical practice.',
  },
  services: {
    title: 'Nutrition Coaching Services — 1-on-1, Meal Plans & Lab Analysis',
    description: 'Professional nutrition services: 1-on-1 coaching, personalised meal planning, blood work interpretation, sports nutrition, and corporate wellness programmes.',
  },
  calculators: {
    title: 'Free Health Calculators — BMI, TDEE, Body Fat, Macros & More',
    description: 'Use our free science-backed health calculators: BMI, calorie (TDEE), body fat %, macro split, ideal weight, water intake, heart rate zones and more. No sign-up required.',
  },
  contact: {
    title: 'Book a Free Discovery Call',
    description: 'Ready to transform your health? Book a free 20-minute discovery call with our certified nutritionist. No obligation — just clarity on what your body needs.',
  },
  login: {
    title: 'Sign In to Your Account',
    description: 'Access your personalised nutrition dashboard, meal plans, and health tracking tools.',
    noIndex: true,
  },
  register: {
    title: 'Create Your Free Account',
    description: 'Join DietAndWell to access personalised nutrition coaching, health calculators, and evidence-based meal plans.',
  },
  profile: {
    title: 'My Health Dashboard',
    description: 'View your health metrics, saved calculator results, orders and account settings.',
    noIndex: true,
  },
  admin: {
    title: 'Admin Dashboard',
    description: 'DietAndWell administration panel.',
    noIndex: true,
  },
};

/* ── Blog post schema builder ─────────────────────────────────── */
export function buildBlogPostSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: (post.coverImage || post.featuredImage) ? (/^https?:\/\//i.test(post.coverImage || post.featuredImage) ? (post.coverImage || post.featuredImage) : new URL(post.coverImage || post.featuredImage, (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/,'')+'/').href) : DEFAULT_IMAGE,
    author: {
      '@type': 'Person',
      name: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'DietAndWell',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DietAndWell',
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified:  post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.dietandwell.com/blog/${post.slug}`,
    },
    wordCount: post.content ? post.content.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length : 0,
    articleSection: post.categories?.map(c => c.name).join(', '),
    keywords: post.tags?.map(t => t.name).join(', '),
  };
}

/* ── Calculator schema builder ────────────────────────────────── */
export function buildCalculatorSchema(name, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name} | DietAndWell`,
    description,
    url: `https://www.dietandwell.com/calculators`,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: {
      '@type': 'Organization',
      name: 'DietAndWell',
      url: 'https://www.dietandwell.com',
    },
  };
}
