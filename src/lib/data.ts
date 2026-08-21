export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  description: string;
  shortDescription: string;
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
}

export const COLLECTIONS: Collection[] = [
  {
    id: 1,
    name: "The Sacred Thread",
    slug: "sacred-thread",
    description: "Modern pre-draped silhouettes, corset kurtas & rich temple maroon silks.",
    heroImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=90",
    count: 8,
    season: "Viral Drop '26",
    tagline: "Desi glam for the modern muse."
  },
  {
    id: 2,
    name: "Lotus in Bloom",
    slug: "lotus-in-bloom",
    description: "Breezy pastel & cream organza sarees made for effortless golden hour photos.",
    heroImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=90",
    count: 12,
    season: "Pinterest Aesthetic",
    tagline: "Sheer, dreamy & twirl-worthy."
  },
  {
    id: 3,
    name: "Azhagu Festive",
    slug: "azhagu-festive",
    description: "Dramatic 32-kali flairs and heirloom anarkalis made for wedding after-parties.",
    heroImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=90",
    count: 6,
    season: "Main Character Edit",
    tagline: "Statement looks only."
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Maroon Kanjivaram Corset Kurta Set",
    slug: "maroon-kanjivaram-kurta-set",
    price: "₹8,499",
    regularPrice: "₹9,999",
    salePrice: "₹8,499",
    description: "Crafted from hand-dyed crimson maroon silk with a contemporary fitted silhouette and delicate temple zari thread border accents. Includes chic cigarette trousers and a featherlight organza dupatta.",
    shortDescription: "Fitted corset cut with pure handloom silk & temple gold accents.",
    images: [
      { src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90", alt: "Maroon Kurta Set" },
      { src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90", alt: "Detail" }
    ],
    categories: [{ id: 1, name: "The Sacred Thread", slug: "sacred-thread" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Viral on Reels ✨",
    occasion: "Sangeet Night",
    rating: 4.9,
    reviewsCount: 128
  },
  {
    id: 102,
    name: "Dreamy Ivory Lotus Organza Saree",
    slug: "ivory-lotus-organza-saree",
    price: "₹12,800",
    regularPrice: "₹12,800",
    description: "Super light parchment-cream organza adorned with hand-painted maroon lotus motifs. Floats like a cloud — paired with a sleek backless raw silk blouse.",
    shortDescription: "Ultra-dreamy sheer organza drape for aesthetic photo dumps.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Ivory Lotus Saree" }
    ],
    categories: [{ id: 2, name: "Lotus in Bloom", slug: "lotus-in-bloom" }],
    attributes: [{ name: "Blouse", options: ["Unstitched", "Bespoke Cut"] }],
    isFeatured: true,
    tag: "Spotted on Preethi 💖",
    occasion: "Day Wedding & Pooja",
    rating: 5.0,
    reviewsCount: 94
  },
  {
    id: 103,
    name: "32-Kali Twirl Raw Silk Anarkali",
    slug: "raw-silk-anarkali",
    price: "₹15,500",
    regularPrice: "₹17,000",
    salePrice: "₹15,500",
    description: "Massive 32-kali raw silk flair designed for effortless 360° slow-mo twirls. Adorned with unbroken maroon cord-work inspired by the Azhai 'A' monogram.",
    shortDescription: "Insane 32-kali twirl volume with heirloom thread work.",
    images: [
      { src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90", alt: "Raw Silk Anarkali" }
    ],
    categories: [{ id: 3, name: "Azhagu Festive", slug: "azhagu-festive" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Twirl Approved 💃",
    occasion: "Sangeet & Reception",
    rating: 4.8,
    reviewsCount: 67
  },
  {
    id: 104,
    name: "Pre-Draped Chanderi Co-ord Set",
    slug: "temple-border-chanderi-tunic",
    price: "₹6,200",
    regularPrice: "₹6,200",
    description: "Breathable handwoven Chanderi cotton-silk tunic & palazzo set in warm unbleached linen cream with brass-tone temple borders.",
    shortDescription: "Zero-effort chic ethnic fit for college fests & brunch.",
    images: [
      { src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90", alt: "Chanderi Tunic" }
    ],
    categories: [{ id: 1, name: "The Sacred Thread", slug: "sacred-thread" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L"] }],
    isFeatured: false,
    tag: "College Fave 🎓",
    occasion: "Campus Ethnic Day",
    rating: 4.9,
    reviewsCount: 43
  }
];
