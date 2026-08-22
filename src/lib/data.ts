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
    name: "Kurties",
    slug: "kurties",
    description: "Modern corset cuts, longline silhouettes & handloom cotton-silks with subtle temple borders.",
    heroImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=90",
    count: 6,
    season: "Core Edit",
    tagline: "Tailored everyday & festive elegance."
  },
  {
    id: 2,
    name: "Sarees",
    slug: "sarees",
    description: "Featherlight hand-painted organzas and rich sacred temple silks made for golden hour photos.",
    heroImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=90",
    count: 8,
    season: "Signature Drapes",
    tagline: "Cloud-light drapes & heirloom weaves."
  },
  {
    id: 3,
    name: "Shawls",
    slug: "shawls",
    description: "Heirloom zari-embroidered silk dupattas & featherlight wraps to elevate any festive look.",
    heroImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=90",
    count: 4,
    season: "Atelier Wraps",
    tagline: "The finishing touch of warmth & grace."
  },
  {
    id: 4,
    name: "Tops",
    slug: "tops",
    description: "Handcrafted corset bustiers & sheer organza peplums for modern festive separates.",
    heroImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=90",
    count: 5,
    season: "Modern Muse",
    tagline: "Versatile structured & sheer silhouettes."
  }
];

export const PRODUCTS: Product[] = [
  // ── 1. KURTIES ──
  {
    id: 101,
    name: "Maroon Corset Handloom Kurti Set",
    slug: "maroon-corset-kurti-set",
    price: "LKR 14,500",
    regularPrice: "LKR 16,800",
    salePrice: "LKR 14,500",
    description: "Crafted from hand-dyed crimson maroon silk with a contemporary fitted silhouette and delicate temple zari thread border accents. Includes chic cigarette trousers and a featherlight organza dupatta.",
    shortDescription: "Fitted corset cut with pure handloom silk & temple gold accents.",
    images: [
      { src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90", alt: "Maroon Kurti Set" },
      { src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90", alt: "Detail" }
    ],
    categories: [{ id: 1, name: "Kurties", slug: "kurties" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Viral on Reels ✨",
    occasion: "Sangeet Night",
    rating: 4.9,
    reviewsCount: 128
  },
  {
    id: 102,
    name: "Temple Border Chanderi Kurti",
    slug: "temple-border-chanderi-kurti",
    price: "LKR 11,200",
    regularPrice: "LKR 11,200",
    description: "Lightweight cream-gold Chanderi kurti with a tailored mandarin collar and traditional woven gold zari temple arches.",
    shortDescription: "Everyday festive luxury in breathable cotton-silk.",
    images: [
      { src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90", alt: "Chanderi Kurti" }
    ],
    categories: [{ id: 1, name: "Kurties", slug: "kurties" }],
    attributes: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Everyday Luxe ✨",
    occasion: "College & Work Festive",
    rating: 4.8,
    reviewsCount: 64
  },

  // ── 2. SAREES ──
  {
    id: 201,
    name: "Ivory Hand-Painted Lotus Organza Saree",
    slug: "ivory-lotus-organza-saree",
    price: "LKR 18,500",
    regularPrice: "LKR 21,000",
    salePrice: "LKR 18,500",
    description: "Featherlight parchment-cream organza draped in hand-painted crimson lotus blooms. Floats like a cloud with an unstitched raw silk blouse piece.",
    shortDescription: "Cloud-light sheer organza with crimson lotus motifs.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Lotus Organza Saree" }
    ],
    categories: [{ id: 2, name: "Sarees", slug: "sarees" }],
    attributes: [{ name: "Blouse", options: ["Unstitched (Included)", "Custom Tailored"] }],
    isFeatured: true,
    tag: "Spotted on Preethi 🌸",
    occasion: "Day Weddings & Golden Hour",
    rating: 5.0,
    reviewsCount: 94
  },
  {
    id: 202,
    name: "Sacred Crimson Kanjivaram Silk Saree",
    slug: "sacred-crimson-kanjivaram-saree",
    price: "LKR 26,500",
    regularPrice: "LKR 26,500",
    description: "Traditional pit-loom woven mulberry silk with interlocking temple gold borders and deep sacred maroon luster.",
    shortDescription: "Heirloom mulberry silk with pure gold zari borders.",
    images: [
      { src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90", alt: "Kanjivaram Saree" }
    ],
    categories: [{ id: 2, name: "Sarees", slug: "sarees" }],
    attributes: [{ name: "Blouse", options: ["Unstitched (Included)"] }],
    isFeatured: true,
    tag: "Heirloom Edition ✨",
    occasion: "Temple Pooja & Weddings",
    rating: 4.9,
    reviewsCount: 78
  },

  // ── 3. SHAWLS ──
  {
    id: 301,
    name: "Heirloom Zari Embroidered Silk Shawl",
    slug: "heirloom-zari-silk-shawl",
    price: "LKR 8,900",
    regularPrice: "LKR 9,900",
    salePrice: "LKR 8,900",
    description: "Sacred maroon pure silk wrap detailed with gold zari cord borders and delicate hand-knotted tassels.",
    shortDescription: "Rich crimson silk shawl with gold bullion trim.",
    images: [
      { src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90", alt: "Silk Shawl" }
    ],
    categories: [{ id: 3, name: "Shawls", slug: "shawls" }],
    attributes: [{ name: "Size", options: ["Free Size (2.5m)"] }],
    isFeatured: true,
    tag: "Atelier Classic",
    occasion: "Evening Receptions & Sangeet",
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: 302,
    name: "Featherlight Handloom Cashmere Wool Shawl",
    slug: "featherlight-cashmere-shawl",
    price: "LKR 10,500",
    regularPrice: "LKR 10,500",
    description: "Ultra-soft ivory cashmere blend wrap with intricate lotus weave borders for effortless evening styling.",
    shortDescription: "Ultra-soft ivory cashmere wrap with lotus accents.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Cashmere Shawl" }
    ],
    categories: [{ id: 3, name: "Shawls", slug: "shawls" }],
    attributes: [{ name: "Size", options: ["Free Size (2.2m)"] }],
    isFeatured: false,
    tag: "Winter Luxe ❄️",
    occasion: "Sundowner Cocktails",
    rating: 4.8,
    reviewsCount: 38
  },

  // ── 4. TOPS ──
  {
    id: 401,
    name: "Handloom Silk Bustier Crop Top",
    slug: "handloom-silk-bustier-top",
    price: "LKR 8,500",
    regularPrice: "LKR 9,500",
    salePrice: "LKR 8,500",
    description: "Structured corset bustier top with boning and antique gold zari piping. Perfect to pair with sarees, skirts or tailored trousers.",
    shortDescription: "Structured corset cut in pure handloom silk.",
    images: [
      { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=90", alt: "Bustier Crop Top" }
    ],
    categories: [{ id: 4, name: "Tops", slug: "tops" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L"] }],
    isFeatured: true,
    tag: "Bestseller 🔥",
    occasion: "Cocktails & Sangeet",
    rating: 4.9,
    reviewsCount: 76
  },
  {
    id: 402,
    name: "Sheer Organza Peplum Blouse Top",
    slug: "sheer-organza-peplum-top",
    price: "LKR 9,800",
    regularPrice: "LKR 9,800",
    description: "Cloud-light parchment organza top with gathered peplum waist and hand-painted lotus motifs.",
    shortDescription: "Translucent breeze top for aesthetic layering.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Peplum Top" }
    ],
    categories: [{ id: 4, name: "Tops", slug: "tops" }],
    attributes: [{ name: "Size", options: ["S", "M", "L"] }],
    isFeatured: false,
    tag: "New Arrival 🌸",
    occasion: "Day Weddings & Brunch",
    rating: 4.8,
    reviewsCount: 31
  }
];
