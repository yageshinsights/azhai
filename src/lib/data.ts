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

export const COLLECTIONS: Collection[] = [];

export const PRODUCTS: Product[] = [];
