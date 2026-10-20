import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadEnv} from 'vite';
const env={...loadEnv('production',process.cwd(),''),...process.env};
const site=(env.VITE_SITE_URL||'https://www.dietandwell.com').replace(/\/$/,'');
const api=(env.SEO_API_URL||env.VITE_API_URL||'http://localhost:8000/api').replace(/\/$/,'');
if(!/^https?:\/\/[^/]+$/.test(site))throw new Error('VITE_SITE_URL must be an origin');
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const routes=[['/','DietAndWell Nutrition & Wellness','Nutrition coaching, wellness tools and educational resources.'],['/blog','Nutrition & Wellness Blog','Read DietAndWell articles on nutrition, balanced meals and wellbeing.'],['/services','Nutrition Services','Explore nutrition coaching and personalised support.'],['/about','About DietAndWell','Our approach to nutrition and wellbeing.'],['/contact','Contact DietAndWell','Contact DietAndWell about nutrition services.'],['/calculators','Health & Nutrition Calculators','Educational tools for energy, BMI, macronutrients and more.'],['/shop','DietAndWell Shop','Explore our available nutrition and wellness products.'],['/subscriptions','Nutrition Memberships','Explore DietAndWell memberships.'],['/diet-plan-studio','Diet Plan Studio — Coming Soon','Preview daily and weekly regional diet planning.']];
const posts=[];
try{for(let page=1;page<=100;page++){const res=await fetch(`${api}/blog?limit=100&page=${page}`,{signal:AbortSignal.timeout(12000)});if(!res.ok)throw new Error('Blog source unavailable');const data=await res.json();posts.push(...(data.posts||[]));if(page>=(data.totalPages||1))break;}}catch{if(env.REQUIRE_BLOG_SEO==='true')throw new Error('Blog SEO build requires the public blog API. Set SEO_API_URL.');console.warn('Blog API unavailable: static routes generated, article snapshots omitted. Set REQUIRE_BLOG_SEO=true for launch.');}
for(const post of posts)if(/^[a-z0-9-]+$/.test(post.slug))routes.push([`/blog/${post.slug}`,post.metaTitle||post.title,plain(post.metaDescription||post.excerpt||post.content).slice(0,160),post]);
const template=await readFile(resolve('dist/index.html'),'utf8');
for(const [path,title,description,post] of routes){
 const url=site+path;
 const schema=post?{'@context':'https://schema.org','@type':'BlogPosting',headline:title,description,datePublished:post.publishedAt||post.createdAt,dateModified:post.updatedAt||post.createdAt,mainEntityOfPage:url,author:{'@type':'Organization',name:'DietAndWell'},publisher:{'@type':'Organization',name:'DietAndWell'}}:{'@context':'https://schema.org','@type':'WebPage',name:title,url};
 let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)} | DietAndWell</title>`).replace(/<meta[^>]+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi,'').replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi,'');
 html=html.replace('</head>',`<meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${escape(url)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(url)}"><meta property="og:type" content="${post?'article':'website'}"><meta property="og:image" content="${escape(site)}/images/nutrition-bowl-v2.png"><script type="application/ld+json" data-static-page-schema>${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head>`);
 const content=post?plain(post.content):description;
 html=html.replace(/<div id="root"><\/div>/,`<div id="root"><main><h1>${escape(title)}</h1><p>${escape(content)}</p><nav><a href="/">Home</a> · <a href="/blog">Nutrition articles</a> · <a href="/services">Services</a></nav></main></div>`);
 const folder=path==='/'?resolve('dist'):resolve('dist',path.slice(1));await mkdir(folder,{recursive:true});await writeFile(resolve(folder,'index.html'),html);
}
await writeFile(resolve('dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([path])=>`<url><loc>${escape(site+path)}</loc></url>`).join('')}</urlset>`);
await writeFile(resolve('dist/robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /profile\nDisallow: /cart\nDisallow: /library\nDisallow: /login\nDisallow: /register\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n`);
console.log(`Search snapshots: ${routes.length} pages, ${posts.length} articles. Rebuild after publishing or updating posts.`);
