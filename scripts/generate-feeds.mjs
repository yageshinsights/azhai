import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const BASE_URL = 'https://azhaiclothing.lk';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

// Helper to escape XML characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchFromSupabase(table, query = '') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[Feeds Generator] Supabase fetch for ${table} responded with ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Feeds Generator] Error fetching ${table} from Supabase:`, err.message);
    return null;
  }
}

// Fallback products in case Supabase is unreachable during offline build
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'The Empress Anarkali Kurti',
    slug: 'the-empress-anarkali-kurti',
    price: 'LKR 18,500',
    description: 'Crimson pure mulberry silk anarkali kurti adorned with intricate zardozi hand embroidery and gold dabka work.',
    short_description: 'Pure mulberry silk anarkali with zardozi embroidery.',
    images: [{ src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85' }],
    in_stock: true,
  },
  {
    id: 2,
    name: 'Lotus Blossom Organza Saree',
    slug: 'lotus-blossom-organza-saree',
    price: 'LKR 26,000',
    description: 'Hand-painted pastel blush organza saree embellished with delicate pearl tassels and silver gota patti borders.',
    short_description: 'Hand-painted blush organza with pearl borders.',
    images: [{ src: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85' }],
    in_stock: true,
  },
  {
    id: 3,
    name: 'Nilawela Royal Silk Ensemble',
    slug: 'nilawela-royal-silk-ensemble',
    price: 'LKR 22,500',
    description: 'Sapphire blue Raw Silk kurti paired with golden handloom brocade cigarette trousers and silk dupatta.',
    short_description: 'Sapphire raw silk set with golden brocade trousers.',
    images: [{ src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' }],
    in_stock: true,
  },
  {
    id: 4,
    name: 'Mayura Golden Brocade Dupatta',
    slug: 'mayura-golden-brocade-dupatta',
    price: 'LKR 9,500',
    description: 'Heirloom hand-woven golden Banarasi silk brocade dupatta featuring traditional peacock motif zari borders.',
    short_description: 'Handloom golden Banarasi silk dupatta.',
    images: [{ src: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=85' }],
    in_stock: true,
  }
];

const FALLBACK_CATEGORIES = [
  { slug: 'festive-kurtis', name: 'Festive Kurtis' },
  { slug: 'handloom-silk', name: 'Handloom Silks' },
  { slug: 'bridal-couture', name: 'Bridal Couture' },
  { slug: 'luxury-dupattas', name: 'Luxury Dupattas' }
];

async function main() {
  console.log('[Feeds Generator]: Starting Sitemap and Google Merchant feed build...');

  // 1. Fetch live products and categories
  const dbProducts = await fetchFromSupabase('products', 'select=*&order=id.asc');
  const products = (Array.isArray(dbProducts) && dbProducts.length > 0) ? dbProducts : FALLBACK_PRODUCTS;

  const dbCategories = await fetchFromSupabase('categories', 'select=*&order=id.asc');
  const categories = (Array.isArray(dbCategories) && dbCategories.length > 0) ? dbCategories : FALLBACK_CATEGORIES;

  const now = new Date().toISOString().split('T')[0];

  // 2. Generate sitemap.xml
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/collections', priority: '0.9', changefreq: 'daily' },
    { loc: '/tailoring', priority: '0.8', changefreq: 'weekly' },
    { loc: '/story', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
    { loc: '/shipping-policy', priority: '0.5', changefreq: 'monthly' },
    { loc: '/returns-exchanges', priority: '0.5', changefreq: 'monthly' },
    { loc: '/privacy-policy', priority: '0.4', changefreq: 'monthly' },
    { loc: '/terms-and-conditions', priority: '0.4', changefreq: 'monthly' },
  ];

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static routes
  for (const page of staticPages) {
    sitemapXml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  // Add Category/Collection routes
  for (const cat of categories) {
    if (!cat.slug) continue;
    sitemapXml += `  <url>
    <loc>${BASE_URL}/collections/${escapeXml(cat.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // Add Product routes
  for (const prod of products) {
    if (!prod.slug) continue;
    const imgUrl = Array.isArray(prod.images) && prod.images[0]
      ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].src)
      : null;

    sitemapXml += `  <url>
    <loc>${BASE_URL}/products/${escapeXml(prod.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>`;

    if (imgUrl) {
      sitemapXml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(prod.name)}</image:title>
    </image:image>`;
    }

    sitemapXml += `\n  </url>\n`;
  }

  sitemapXml += `</urlset>\n`;

  // Write sitemap.xml
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
  console.log(`[Feeds Generator]: Successfully generated ${sitemapPath} (${products.length} products, ${categories.length} categories)`);

  // 3. Generate Google Merchant Center Product Feed (RSS 2.0 XML)
  let feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Azhai Clothing — Handcrafted Silk &amp; Festive Couture</title>
    <link>${BASE_URL}</link>
    <description>Heirloom mulberry silks, handcrafted bridal kurtis, and bespoke ethnic couture in Colombo, Sri Lanka by Preethi.</description>
`;

  for (const prod of products) {
    if (!prod.slug) continue;
    const priceNum = String(prod.price || '').replace(/[^0-9]/g, '') || '0';
    const formattedPrice = `${priceNum}.00 LKR`;
    const prodUrl = `${BASE_URL}/products/${prod.slug}`;
    const imgUrl = Array.isArray(prod.images) && prod.images[0]
      ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].src)
      : `${BASE_URL}/og-azhai.jpg`;
    const description = prod.short_description || prod.description || prod.name;
    const availability = prod.in_stock === false ? 'out_of_stock' : 'in_stock';

    feedXml += `    <item>
      <g:id>azhai_${prod.id || prod.slug}</g:id>
      <g:title>${escapeXml(prod.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(prodUrl)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${formattedPrice}</g:price>
      <g:brand>Azhai Clothing</g:brand>
      <g:google_product_category>1604</g:google_product_category>
      <g:product_type>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>\n`;
  }

  feedXml += `  </channel>
</rss>\n`;

  const feedPath = path.join(publicDir, 'google-merchant-feed.xml');
  fs.writeFileSync(feedPath, feedXml, 'utf-8');
  console.log(`[Feeds Generator]: Successfully generated ${feedPath} (${products.length} products)`);
}

main().catch((err) => {
  console.error('[Feeds Generator Error]:', err);
  process.exit(1);
});
