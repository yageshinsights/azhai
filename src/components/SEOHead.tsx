import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, any> | Array<Record<string, any>>;
  canonicalUrl?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Azhai Clothing — Handcrafted Silk & Festive Couture by Preethi';
const DEFAULT_DESC = 'An invitation to rediscover your inherent beauty through handloom tradition, bespoke tailored kurtis, and pure mulberry silks. Colombo, Sri Lanka.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85';
const DEFAULT_URL = 'https://azhaiclothing.lk';

export default function SEOHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
  type = 'website',
  schema,
  canonicalUrl,
  noindex = false,
}: SEOHeadProps) {
  const settings = useAdminStore((s) => s.settings);
  const fallbackTitle = settings?.seo?.metaTitle || DEFAULT_TITLE;
  const fallbackDesc = settings?.seo?.metaDescription || DEFAULT_DESC;

  const fullTitle = title ? `${title} | Azhai Clothing by Preethi` : fallbackTitle;
  const activeDesc = description || fallbackDesc;
  const canonical = canonicalUrl || url || DEFAULT_URL;
  const schemaString = schema ? JSON.stringify(schema) : '';

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // 2. Helper to set/update meta tag
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', nameOrProperty);
        } else {
          el.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('description', activeDesc);

    // Robots meta tag (index / noindex)
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);

    // OpenGraph (WhatsApp, Instagram, Facebook, iMessage)
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', activeDesc, true);
    setMeta('og:image', image, true);
    setMeta('og:url', canonical, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'Azhai Clothing Colombo', true);
    setMeta('og:locale', 'en_US', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', activeDesc);
    setMeta('twitter:image', image);

    // Schema.org JSON-LD Structured Data
    const scriptId = 'azhai-schema-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (schemaString) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = schemaString;
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [fullTitle, description, image, canonical, type, schemaString, noindex]);

  return null;
}
