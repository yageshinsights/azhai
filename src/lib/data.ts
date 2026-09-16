export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  stockQuantity?: number;
  quantity?: number;
  weightGrams?: number;
  description: string;
  shortDescription: string;
  stylingTip?: string;
  fabricYarn?: string;
  craftedFor?: string;
  careGuide?: string;
  shippingNote?: string;
  pairingProductIds?: number[];
  images: { src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  attributes: { name: string; options: string[] }[];
  isFeatured?: boolean;
  tag?: string;
  occasion?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  count: number;
  season?: string;
  tagline?: string;
  isFeatured?: boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 1,
    name: 'Kurties',
    slug: 'kurties',
    description: 'Modern fitted corsets & fluid handloom kurties.',
    heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
    count: 6,
    season: 'Core Edit',
    tagline: 'Tailored everyday & festive elegance.',
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Sarees',
    slug: 'sarees',
    description: 'Hand-painted organza & pure mulberry silk sarees.',
    heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
    count: 8,
    season: 'Signature Drapes',
    tagline: 'Cloud-light drapes & heirloom weaves.',
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Tops',
    slug: 'tops',
    description: 'Structured handloom silk bustiers & organza tops.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=90',
    count: 5,
    season: 'Modern Muse',
    tagline: 'Versatile structured & sheer silhouettes.',
    isFeatured: true,
  },
  {
    id: 4,
    name: 'Lehengas',
    slug: 'lehengas',
    description: 'Flared 16-kali royal Kalidar bridal & occasion skirts.',
    heroImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=90',
    count: 3,
    season: 'Bridal & Occasion',
    tagline: 'Sweeping voluminous flared silhouettes.',
    isFeatured: true,
  },
  {
    id: 5,
    name: 'Salwar Suits',
    slug: 'salwar-suits',
    description: 'Regal Patiala pleats & bespoke tunic combinations.',
    heroImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
    count: 4,
    season: 'Classic Heritage',
    tagline: 'Artisanal Punjabi & Mughal tailored suits.',
    isFeatured: true,
  },
  {
    id: 6,
    name: 'Shawls',
    slug: 'shawls',
    description: 'Heirloom zari-embroidered pure silk & cashmere wraps.',
    heroImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
    count: 4,
    season: 'Atelier Wraps',
    tagline: 'The finishing touch of warmth & grace.',
    isFeatured: false,
  },
];

export const PRODUCTS: Product[] = [];
