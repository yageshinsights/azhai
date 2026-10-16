/**
 * Google Tag Manager (GTM) & E-Commerce Conversion Analytics Engine
 * for Azhai Clothing by Preethi (https://azhaiclothing.lk)
 *
 * Implements GA4 and Meta Pixel-compliant e-commerce events via GTM dataLayer:
 * - page_view (virtual SPA route transitions)
 * - view_item_list (collection browsing)
 * - view_item (product views / ViewContent)
 * - add_to_cart (add item / AddToCart)
 * - remove_from_cart (remove item)
 * - begin_checkout (checkout start / InitiateCheckout)
 * - purchase (completed orders / Purchase)
 * - contact_inquiry (WhatsApp & concierge leads)
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    google_tag_manager?: Record<string, unknown>;
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

export const DEFAULT_GTM_ID = 'GTM-5JFH9Q8R';
export const DEFAULT_META_PIXEL_ID = '2535266683895942';

/**
 * Ensures ID format strictly matches the Meta & Google Catalog feed item ID:
 * e.g., '10' -> 'azhai_10', 'azhai_10' -> 'azhai_10'
 */
export function toCatalogId(id?: string | number): string {
  const strId = String(id ?? '').trim();
  if (!strId) return 'azhai_0';
  if (strId.startsWith('azhai_')) return strId;
  return `azhai_${strId}`;
}

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

/**
 * Extracts numeric float price from string like "LKR 14,500" or "6000.00 LKR"
 */
export function parsePriceNumber(priceStr?: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Low-level dispatch to Meta (Facebook) Pixel fbq
 */
export function trackMetaEvent(event: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  if (isLocalhost() || import.meta.env.DEV) {
    console.debug(`[Meta Pixel Dev Log]: ${event}`, params);
    return;
  }
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', event, params);
    } catch (err) {
      console.warn(`[Meta Pixel] Error tracking ${event}:`, err);
    }
  }
}


/**
 * Initializes Google Tag Manager in <head> and <body>.
 * Guarded against duplicate injection if already present in index.html.
 */
export function initGTM(customId?: string): void {
  if (typeof window === 'undefined') return;

  // Never track on localhost to prevent test data pollution
  if (isLocalhost() || import.meta.env.DEV) {
    return;
  }

  // Prevent duplicate script injection if already added via index.html or earlier call
  if (
    document.getElementById('gtm-script') ||
    document.querySelector('script[src*="googletagmanager.com/gtm.js"]') ||
    window.google_tag_manager
  ) {
    return;
  }

  const gtmId = (customId || import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID).trim();
  if (!gtmId) return;

  // 1. Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // 2. Inject GTM <script> into <head>
  try {
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // 3. Inject GTM <noscript> <iframe> into <body>
    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);

    if (document.body.firstChild) {
      document.body.insertBefore(noscript, document.body.firstChild);
    } else {
      document.body.appendChild(noscript);
    }

    console.info(`[Azhai Analytics] Google Tag Manager initialized with container: ${gtmId}`);
  } catch (err) {
    console.warn('[Azhai Analytics] Failed to initialize Google Tag Manager:', err);
  }
}

/**
 * Low-level dispatch to window.dataLayer
 */
export function pushGTMEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  if (isLocalhost() || import.meta.env.DEV) {
    console.debug(`[Analytics Dev Log]: ${event}`, params);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

/**
 * Track SPA Virtual Page Views on route transitions
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  pushGTMEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
  trackMetaEvent('PageView');
}

/**
 * Track Product Impression / ViewContent
 * Parameterized to guarantee 100% Catalog Match Rate with Meta Commerce Manager
 */
export function trackViewItem(product: {
  id: string | number;
  name: string;
  price: string | number;
  categories?: { name: string }[];
}): void {
  if (typeof window === 'undefined') return;
  const numPrice = parsePriceNumber(product.price);
  const primaryCategory = product.categories?.[0]?.name || 'Traditional & Ceremonial Clothing';
  const catalogId = toCatalogId(product.id);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object per GA4 spec
  window.dataLayer.push({
    event: 'view_item',
    ecommerce: {
      currency: 'LKR',
      value: numPrice,
      items: [
        {
          item_id: catalogId,
          item_name: product.name,
          price: numPrice,
          item_category: primaryCategory,
          quantity: 1,
        },
      ],
    },
  });

  // Direct Meta Pixel ViewContent event with matching catalog content_ids & contents
  trackMetaEvent('ViewContent', {
    content_ids: [catalogId],
    contents: [
      {
        id: catalogId,
        quantity: 1,
        item_price: numPrice,
      },
    ],
    content_type: 'product',
    content_name: product.name,
    content_category: primaryCategory,
    value: numPrice,
    currency: 'LKR',
  });
}

/**
 * Track Collection / Category Page Impression
 */
export function trackViewItemList(categoryName: string, products: Array<{
  id: string | number;
  name: string;
  price: string | number;
}>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'view_item_list',
    ecommerce: {
      item_list_name: categoryName,
      items: products.slice(0, 20).map((p, idx) => ({
        item_id: toCatalogId(p.id),
        item_name: p.name,
        price: parsePriceNumber(p.price),
        item_category: categoryName,
        index: idx + 1,
      })),
    },
  });

  // Meta Pixel Category view
  trackMetaEvent('ViewCategory', {
    content_category: categoryName,
    content_ids: products.slice(0, 10).map((p) => toCatalogId(p.id)),
    content_type: 'product',
  });
}

/**
 * Track Add to Cart (Standard Product, Bundle & Bespoke Tailored Pieces)
 * Guaranteed Catalog ID match for Meta Catalog
 */
export function trackAddToCart(item: {
  id: string | number;
  name: string;
  price: string | number;
  quantity?: number;
  size?: string;
  category?: string;
}): void {
  if (typeof window === 'undefined') return;
  const numPrice = parsePriceNumber(item.price);
  const qty = item.quantity || 1;
  const catalogId = toCatalogId(item.id);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'LKR',
      value: numPrice * qty,
      items: [
        {
          item_id: catalogId,
          item_name: item.name,
          price: numPrice,
          item_category: item.category || 'Traditional & Ceremonial Clothing',
          item_variant: item.size || 'M',
          quantity: qty,
        },
      ],
    },
  });

  // Direct Meta Pixel AddToCart event
  trackMetaEvent('AddToCart', {
    content_ids: [catalogId],
    contents: [
      {
        id: catalogId,
        quantity: qty,
        item_price: numPrice,
      },
    ],
    content_type: 'product',
    content_name: item.name,
    content_category: item.category || 'Traditional & Ceremonial Clothing',
    value: numPrice * qty,
    currency: 'LKR',
  });
}

/**
 * Track Remove from Cart
 */
export function trackRemoveFromCart(item: {
  id: string | number;
  name: string;
  price: string | number;
  quantity?: number;
  size?: string;
}): void {
  if (typeof window === 'undefined') return;
  const numPrice = parsePriceNumber(item.price);
  const qty = item.quantity || 1;
  const catalogId = toCatalogId(item.id);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'LKR',
      value: numPrice * qty,
      items: [
        {
          item_id: catalogId,
          item_name: item.name,
          price: numPrice,
          item_variant: item.size,
          quantity: qty,
        },
      ],
    },
  });
}

/**
 * Track Begin Checkout (InitiateCheckout)
 */
export function trackBeginCheckout(
  items: Array<{ id: string | number; name: string; price: string | number; quantity: number; size?: string }>,
  totalValue: number,
  couponCode?: string
): void {
  if (typeof window === 'undefined') return;
  const catalogIds = items.map((i) => toCatalogId(i.id));

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'LKR',
      value: totalValue,
      coupon: couponCode || undefined,
      items: items.map((i) => ({
        item_id: toCatalogId(i.id),
        item_name: i.name,
        price: parsePriceNumber(i.price),
        item_variant: i.size,
        quantity: i.quantity,
      })),
    },
  });

  // Direct Meta Pixel InitiateCheckout event
  trackMetaEvent('InitiateCheckout', {
    content_ids: catalogIds,
    contents: items.map((i) => ({
      id: toCatalogId(i.id),
      quantity: i.quantity || 1,
      item_price: parsePriceNumber(i.price),
    })),
    content_type: 'product',
    value: totalValue,
    currency: 'LKR',
    num_items: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
  });
}

/**
 * Track Purchase (Meta & GA4 Revenue Event)
 * Guaranteed Catalog ID match for Meta Catalog ROAS
 */
export function trackPurchase(order: {
  id: string;
  total: number;
  shippingFee?: number;
  couponCode?: string;
  paymentMethod?: string;
  items: Array<{ id?: string | number; name: string; price: string | number; quantity: number; size?: string }>;
}): void {
  if (typeof window === 'undefined') return;

  // Deduplicate against refreshing the Order Success page
  const dedupeKey = `azhai_tracked_order_${order.id}`;
  if (sessionStorage.getItem(dedupeKey)) {
    return;
  }
  sessionStorage.setItem(dedupeKey, 'true');

  const catalogIds = order.items.map((i) => toCatalogId(i.id || i.name));
  const totalVal = Number(order.total) || 0;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.id,
      value: totalVal,
      currency: 'LKR',
      tax: 0,
      shipping: Number(order.shippingFee) || 0,
      coupon: order.couponCode || undefined,
      payment_type: order.paymentMethod || 'Online',
      items: order.items.map((i) => ({
        item_id: toCatalogId(i.id || i.name),
        item_name: i.name,
        price: parsePriceNumber(i.price),
        item_variant: i.size,
        quantity: i.quantity || 1,
      })),
    },
  });

  // Direct Meta Pixel Purchase event with catalog content_ids & contents
  trackMetaEvent('Purchase', {
    content_ids: catalogIds,
    contents: order.items.map((i) => ({
      id: toCatalogId(i.id || i.name),
      quantity: i.quantity || 1,
      item_price: parsePriceNumber(i.price),
    })),
    content_type: 'product',
    value: totalVal,
    currency: 'LKR',
    num_items: order.items.reduce((sum, i) => sum + (i.quantity || 1), 0),
  });
}

/**
 * Track WhatsApp Concierge / Customer Lead
 */
export function trackWhatsAppClick(source: string, productTitle?: string): void {
  pushGTMEvent('contact_inquiry', {
    method: 'whatsapp',
    source,
    product_name: productTitle || undefined,
  });

  trackMetaEvent('Contact', {
    content_name: productTitle || source,
    content_category: 'WhatsApp Concierge',
  });
}
