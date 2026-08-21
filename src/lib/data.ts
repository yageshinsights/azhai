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
    name: "Kurtis",
    slug: "kurtis",
    description: "Modern corset cuts, longline silhouettes & handloom silk kurtis with temple borders.",
    heroImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=90",
    count: 14,
    season: "Festive '26",
    tagline: "Tailored elegance for everyday & festive occasions."
  },
  {
    id: 2,
    name: "Shalwars",
    slug: "shalwars",
    description: "Rich heirloom shalwar kameez suits with 32-kali twirl flare and delicate dupattas.",
    heroImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=90",
    count: 10,
    season: "Signature Edit",
    tagline: "Statement flairs designed for slow-motion twirls."
  },
  {
    id: 3,
    name: "Tops",
    slug: "tops",
    description: "Handcrafted bustier crop tops, sheer organza peplums & contemporary festive tunics.",
    heroImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=90",
    count: 8,
    season: "Modern Muse",
    tagline: "Effortless separates for contemporary festive styling."
  },
  {
    id: 4,
    name: "Bottoms",
    slug: "bottoms",
    description: "Tailored silk cigarette trousers, flared palazzos & zari-trimmed dhotis.",
    heroImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=90",
    count: 6,
    season: "Atelier Essentials",
    tagline: "Flattering cuts in pure handloom fabrics."
  },
  {
    id: 5,
    name: "Accessories",
    slug: "accessories",
    description: "Handcrafted brass temple jhumkas, embroidered zari potli bags & heirloom belts.",
    heroImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=90",
    count: 12,
    season: "Heirloom Accents",
    tagline: "The finishing touch of traditional grace."
  }
];

export const PRODUCTS: Product[] = [
  // ── KURTIS ──
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
    categories: [{ id: 1, name: "Kurtis", slug: "kurtis" }],
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
    categories: [{ id: 1, name: "Kurtis", slug: "kurtis" }],
    attributes: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Everyday Luxe ✨",
    occasion: "College & Work Festive",
    rating: 4.8,
    reviewsCount: 64
  },

  // ── SHALWARS ──
  {
    id: 201,
    name: "32-Kali Twirl Raw Silk Shalwar Suit",
    slug: "raw-silk-shalwar-suit",
    price: "LKR 28,500",
    regularPrice: "LKR 32,000",
    salePrice: "LKR 28,500",
    description: "Full volume 32-kali flared anarkali shalwar suit crafted in raw silk with unbroken crimson cord embellishments.",
    shortDescription: "Dramatic volume and twirl-tested flair.",
    images: [
      { src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90", alt: "Shalwar Suit" }
    ],
    categories: [{ id: 2, name: "Shalwars", slug: "shalwars" }],
    attributes: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
    isFeatured: true,
    tag: "Twirl Approved 💃",
    occasion: "Sangeet & Reception",
    rating: 5.0,
    reviewsCount: 94
  },
  {
    id: 202,
    name: "Sacred Maroon Embroidered Shalwar Set",
    slug: "sacred-maroon-shalwar-set",
    price: "LKR 22,900",
    regularPrice: "LKR 22,900",
    description: "Traditional straight-cut kameez with pleated shalwar bottoms and rich threadwork dupatta.",
    shortDescription: "Classic temple silhouette with rich floral borders.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Maroon Shalwar" }
    ],
    categories: [{ id: 2, name: "Shalwars", slug: "shalwars" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L"] }],
    isFeatured: false,
    tag: "Heirloom Edition",
    occasion: "Temple Pooja",
    rating: 4.9,
    reviewsCount: 42
  },

  // ── TOPS ──
  {
    id: 301,
    name: "Handloom Silk Bustier Crop Top",
    slug: "handloom-silk-bustier-top",
    price: "LKR 8,500",
    regularPrice: "LKR 9,500",
    description: "Structured corset bustier top with boning and antique gold zari piping. Perfect to pair with sarees, lehengas or trousers.",
    shortDescription: "Structured corset cut in pure handloom silk.",
    images: [
      { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=90", alt: "Bustier Crop Top" }
    ],
    categories: [{ id: 3, name: "Tops", slug: "tops" }],
    attributes: [{ name: "Size", options: ["XS", "S", "M", "L"] }],
    isFeatured: true,
    tag: "Bestseller 🔥",
    occasion: "Cocktails & Sundowners",
    rating: 4.9,
    reviewsCount: 76
  },
  {
    id: 302,
    name: "Sheer Organza Peplum Blouse Top",
    slug: "sheer-organza-peplum-top",
    price: "LKR 9,800",
    regularPrice: "LKR 9,800",
    description: "Cloud-light parchment organza top with gathered peplum waist and hand-painted lotus motifs.",
    shortDescription: "Translucent breeze top for aesthetic layering.",
    images: [
      { src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90", alt: "Peplum Top" }
    ],
    categories: [{ id: 3, name: "Tops", slug: "tops" }],
    attributes: [{ name: "Size", options: ["S", "M", "L"] }],
    isFeatured: false,
    tag: "New Arrival 🌸",
    occasion: "Day Weddings",
    rating: 4.8,
    reviewsCount: 31
  },

  // ── BOTTOMS ──
  {
    id: 401,
    name: "Zari-Trimmed Silk Cigarette Trousers",
    slug: "zari-trimmed-silk-trousers",
    price: "LKR 6,800",
    regularPrice: "LKR 6,800",
    description: "Clean tapered cigarette trousers in pure mulberry silk with subtle 1-inch temple zari ankle hem.",
    shortDescription: "Tailored luxury fit for kurtis and tops.",
    images: [
      { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=90", alt: "Silk Trousers" }
    ],
    categories: [{ id: 4, name: "Bottoms", slug: "bottoms" }],
    attributes: [{ name: "Size", options: ["26", "28", "30", "32", "34"] }],
    isFeatured: true,
    tag: "Essential Luxe",
    occasion: "Festive Mix & Match",
    rating: 4.9,
    reviewsCount: 52
  },
  {
    id: 402,
    name: "Flared Handloom Silk Palazzos",
    slug: "flared-silk-palazzos",
    price: "LKR 7,900",
    regularPrice: "LKR 7,900",
    description: "Dramatic wide-leg palazzo pants crafted with deep pleating and a fluid drape.",
    shortDescription: "Flowing wide-leg fit in rich organic silk.",
    images: [
      { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=90", alt: "Palazzo Pants" }
    ],
    categories: [{ id: 4, name: "Bottoms", slug: "bottoms" }],
    attributes: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
    isFeatured: false,
    tag: "Comfort Glam",
    occasion: "Sangeet & Haldi",
    rating: 4.7,
    reviewsCount: 29
  },

  // ── ACCESSORIES ──
  {
    id: 501,
    name: "Antique Brass Temple Jhumkas",
    slug: "antique-brass-temple-jhumkas",
    price: "LKR 4,200",
    regularPrice: "LKR 4,800",
    description: "Handcrafted with traditional lotus crowns, delicate hanging seed pearls, and antique patina brass finish.",
    shortDescription: "Handcrafted temple brass jhumkas with pearl drops.",
    images: [
      { src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=90", alt: "Temple Jhumkas" }
    ],
    categories: [{ id: 5, name: "Accessories", slug: "accessories" }],
    attributes: [{ name: "Metal", options: ["Antique Gold Brass"] }],
    isFeatured: true,
    tag: "Preethi's Pick 🪷",
    occasion: "Festive & Wedding",
    rating: 5.0,
    reviewsCount: 110
  },
  {
    id: 502,
    name: "Heirloom Zari Embroidered Potli Bag",
    slug: "heirloom-zari-potli-bag",
    price: "LKR 5,500",
    regularPrice: "LKR 5,500",
    description: "Crimson maroon velvet potli pouch adorned with real metallic gold bullion threadwork and pearl tassel drawstrings.",
    shortDescription: "Velvet heirloom potli with pearl tassels.",
    images: [
      { src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=90", alt: "Potli Bag" }
    ],
    categories: [{ id: 5, name: "Accessories", slug: "accessories" }],
    attributes: [{ name: "Color", options: ["Sacred Maroon", "Temple Gold"] }],
    isFeatured: true,
    tag: "Must-Have ✨",
    occasion: "Wedding Reception",
    rating: 4.9,
    reviewsCount: 88
  }
];
