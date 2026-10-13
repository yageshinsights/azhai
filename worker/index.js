// ── Pure JavaScript MD5 Implementation (RFC 1321) ─────────────
function md5cycle(x, k) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);
  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);
  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);
  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);
  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}
function cmn(q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}
function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
function md5(s) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  const hex = '0123456789abcdef';
  let res = '';
  for (i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const b = (state[i] >>> (j * 8)) & 0xFF;
      res += hex.charAt((b >> 4) & 0x0F) + hex.charAt(b & 0x0F);
    }
  }
  return res;
}
function md5blk(s) {
  const md5blks = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}
function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = md5(merchantSecret || '').toUpperCase();
  const dataToHash = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return md5(dataToHash).toUpperCase();
}

/**
 * Strips HTML tags, emojis, and control characters that trigger PayHere's
 * "Something Went Wrong" error page (per https://support.payhere.lk/faq/troubleshooting).
 */
function sanitizePayHereText(input, fallback = '') {
  if (!input) return fallback;
  const cleaned = String(input)
    .replace(/<[^>]*>/g, ' ')
    // Strip surrogate pairs / emojis / pictographs
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[^\x20-\x7E\u00A0-\u024F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

/**
 * Verifies that an incoming request to a privileged admin endpoint (/api/payhere-refund,
 * /api/payhere-payment-link) carries a valid Supabase JWT belonging to an authenticated admin.
 */
async function verifyAdminRequest(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization Bearer token.' };
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return { authorized: false, error: 'Empty Authorization Bearer token.' };
  }

  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) {
      return { authorized: false, error: 'Invalid or expired admin session token.' };
    }
    const user = await userRes.json();
    const email = (user?.email || '').toLowerCase();
    const isAdminRole =
      user?.app_metadata?.role === 'admin' ||
      user?.user_metadata?.role === 'admin' ||
      ['admin@azhai.lk', 'preethi@azhaiclothing.lk', 'hello@azhaiclothing.lk', 'orders@azhaiclothing.lk'].includes(email);

    if (!isAdminRole) {
      return { authorized: false, error: 'Forbidden: Admin privileges required.' };
    }
    return { authorized: true, user };
  } catch (err) {
    return { authorized: false, error: 'Failed to verify admin credentials against authentication server.' };
  }
}

async function getPayHereOAuthToken(env) {
  const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX === 'true');
  const tokenUrl = isSandbox
    ? 'https://sandbox.payhere.lk/merchant/v1/oauth/token'
    : 'https://www.payhere.lk/merchant/v1/oauth/token';

  const appId = env.PAYHERE_APP_ID || env.PAYHERE_API_KEY || '';
  const appSecret = env.PAYHERE_APP_SECRET || env.PAYHERE_API_SECRET || '';

  if (!appId || !appSecret) {
    throw new Error('PayHere API Key (App ID) and Secret must be configured in environment for OAuth API.');
  }

  const credentials = btoa(`${appId}:${appSecret}`);
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to obtain PayHere OAuth token: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Queries PayHere Retrieval API (/merchant/v1/payment/search) by order_id
 * to look up payment details or verify transaction status.
 */
async function searchPayHerePaymentByOrderId(orderId, env) {
  const appId = env.PAYHERE_APP_ID || env.PAYHERE_API_KEY || '';
  const appSecret = env.PAYHERE_APP_SECRET || env.PAYHERE_API_SECRET || '';
  if (!appId || !appSecret || !orderId) return null;

  try {
    const accessToken = await getPayHereOAuthToken(env);
    const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX === 'true');
    const searchUrl = isSandbox
      ? `https://sandbox.payhere.lk/merchant/v1/payment/search?order_id=${encodeURIComponent(orderId)}`
      : `https://www.payhere.lk/merchant/v1/payment/search?order_id=${encodeURIComponent(orderId)}`;

    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.status === 1 && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (err) {
    console.warn('[PayHere Retrieval API lookup warning]:', err);
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://azhaiclothing.lk',
      'https://www.azhaiclothing.lk',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
    ];
    const isAllowedOrigin = allowedOrigins.includes(origin) || origin.endsWith('.pages.dev') || origin.endsWith('.workers.dev');
    const allowOrigin = isAllowedOrigin ? origin : 'https://azhaiclothing.lk';

    const securityHeaders = {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...securityHeaders,
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ── Canonical Collection URL Normalization (Edge 301 Permanent Redirect) ──
    if (url.pathname.startsWith('/collections/')) {
      const rawCollectionSlug = url.pathname.slice('/collections/'.length);
      if (rawCollectionSlug) {
        let decodedSlug = rawCollectionSlug;
        try {
          decodedSlug = decodeURIComponent(rawCollectionSlug);
        } catch {}

        const cleanSlug = decodedSlug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        if (cleanSlug && (rawCollectionSlug !== cleanSlug || url.pathname !== `/collections/${cleanSlug}`)) {
          const redirectUrl = new URL(request.url);
          redirectUrl.pathname = `/collections/${cleanSlug}`;
          return Response.redirect(redirectUrl.toString(), 301);
        }
      }
    }

    // ── 1. Secure Server-Side Brevo Email Dispatcher ───────────
    if (url.pathname === '/api/send-email') {
      if (request.method === 'POST') {
        try {
          // Reject cross-origin requests from untrusted external websites
          if (origin && !isAllowedOrigin) {
            return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const body = await request.json();
          // Never trust client-supplied apiKey; use server-side environment secret only
          const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY;

          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Brevo API key is not configured on server.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const payload = body.payload || {};
          // Enforce sender domain restrictions to prevent arbitrary email spoofing
          const allowedSenderEmails = ['orders@azhaiclothing.lk', 'hello@azhaiclothing.lk', 'support@azhaiclothing.lk'];
          if (payload.sender && payload.sender.email && !allowedSenderEmails.includes(payload.sender.email.toLowerCase())) {
            payload.sender.email = 'orders@azhaiclothing.lk';
          }

          const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify(payload),
          });

          const data = await brevoRes.json();
          return new Response(JSON.stringify(data), {
            status: brevoRes.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // ── 1b. Brevo Contact Management & Newsletter Sync ─────────
    if (url.pathname === '/api/create-brevo-contact') {
      if (request.method === 'POST') {
        try {
          if (origin && !isAllowedOrigin) {
            return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const body = await request.json();
          const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY;

          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Brevo API key is not configured on server.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify(body.payload),
          });

          const data = brevoRes.status === 204 ? { updated: true } : await brevoRes.json().catch(() => ({}));
          return new Response(JSON.stringify(data), {
            status: brevoRes.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // ── 1c. Meta / WhatsApp Product Catalog Feeds (XML & CSV) ──────
    if (url.pathname === '/meta-catalog.xml' || url.pathname === '/api/meta-catalog.xml' ||
        url.pathname === '/meta-catalog.csv' || url.pathname === '/api/meta-catalog.csv' ||
        url.pathname === '/google-merchant-feed.xml' || url.pathname === '/api/google-merchant-feed.xml') {
      try {
        const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

        const sbRes = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=id.asc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (sbRes.ok) {
          const products = await sbRes.json();
          const baseUrl = 'https://azhaiclothing.lk';

          if (url.pathname.endsWith('.csv')) {
            const csvHeaders = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category', 'fb_product_category'];
            const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
            let csv = csvHeaders.join(',') + '\n';
            for (const p of products) {
              if (!p.slug) continue;
              const priceNum = String(p.price || '').replace(/[^0-9]/g, '') || '0';
              const imgUrl = Array.isArray(p.images) && p.images[0]
                ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].src)
                : `${baseUrl}/og-azhai.jpg`;
              csv += [
                escapeCsv(`azhai_${p.id || p.slug}`),
                escapeCsv(p.name),
                escapeCsv(p.short_description || p.description || p.name),
                escapeCsv(p.in_stock === false ? 'out of stock' : 'in stock'),
                escapeCsv('new'),
                escapeCsv(`${priceNum}.00 LKR`),
                escapeCsv(`${baseUrl}/products/${p.slug}`),
                escapeCsv(imgUrl),
                escapeCsv('Azhai Clothing'),
                escapeCsv('1604'),
                escapeCsv('Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing')
              ].join(',') + '\n';
            }

            return new Response(csv, {
              headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                ...corsHeaders,
              },
            });
          } else {
            // XML feed format (Google Merchant / Meta RSS 2.0)
            const escapeXml = (unsafe) => String(unsafe || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
            let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Azhai Clothing — Handcrafted Silk &amp; Festive Couture</title>
    <link>${baseUrl}</link>
    <description>Heirloom mulberry silks, handcrafted bridal kurtis, and bespoke ethnic couture in Colombo, Sri Lanka by Preethi.</description>\n`;

            for (const p of products) {
              if (!p.slug) continue;
              const priceNum = String(p.price || '').replace(/[^0-9]/g, '') || '0';
              const imgUrl = Array.isArray(p.images) && p.images[0]
                ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].src)
                : `${baseUrl}/og-azhai.jpg`;
              xml += `    <item>
      <g:id>azhai_${p.id || p.slug}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.short_description || p.description || p.name)}</g:description>
      <g:link>${escapeXml(`${baseUrl}/products/${p.slug}`)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.in_stock === false ? 'out_of_stock' : 'in_stock'}</g:availability>
      <g:price>${priceNum}.00 LKR</g:price>
      <g:brand>Azhai Clothing</g:brand>
      <g:google_product_category>1604</g:google_product_category>
      <g:product_type>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>\n`;
            }
            xml += `  </channel>\n</rss>\n`;

            return new Response(xml, {
              headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                ...corsHeaders,
              },
            });
          }
        }
      } catch (err) {
        console.warn('[Catalog Feed Worker Exception]:', err);
      }
      return env.ASSETS.fetch(request);
    }

    // ── 2. PayHere.lk Initiate Checkout Session (Hash Generation) ──
    if (url.pathname === '/api/payhere-initiate' || url.pathname === '/api/create-payments-lk-checkout') {
      if (request.method === 'POST') {
        try {
          if (origin && !isAllowedOrigin) {
            return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const body = await request.json();
          const merchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '262596';
          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX === 'true');

          if (!merchantSecret) {
            return new Response(
              JSON.stringify({ error: 'Server configuration error: PayHere Merchant Secret is not configured.' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const { orderId, amount, amountCents, currency: passedCurrency, description, customer, items } = body;
          let finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

          if (!orderId) {
            return new Response(
              JSON.stringify({ error: 'Missing required checkout field: orderId' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          // Authoritative Order Lookup: Verify order total in Supabase so client cannot tamper with amount
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';
          let dbOrder = null;

          if (supabaseUrl && supabaseKey) {
            try {
              const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_order_by_code`, {
                method: 'POST',
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_order_code: String(orderId) }),
              });
              if (rpcRes.ok) {
                const rows = await rpcRes.json();
                dbOrder = Array.isArray(rows) ? rows[0] : rows;
              }
            } catch (lookupErr) {
              console.warn('[PayHere Initiate DB Lookup Warning]:', lookupErr);
            }
          }

          if (dbOrder) {
            if (dbOrder.payment_status === 'paid') {
              return new Response(
                JSON.stringify({ error: 'This order has already been paid.' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
              );
            }
            const dbTotal = Number(dbOrder.total);
            if (dbTotal > 0) {
              finalAmount = dbTotal;
            }
          }

          if (!finalAmount || finalAmount <= 0 || Number.isNaN(finalAmount)) {
            return new Response(
              JSON.stringify({ error: 'Invalid or missing checkout amount.' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const currency = (passedCurrency || 'LKR').toUpperCase();
          if (currency !== 'LKR') {
            return new Response(
              JSON.stringify({ error: 'Only LKR currency is supported for checkout.' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const formattedAmount = finalAmount.toFixed(2);
          const hash = generatePayHereHash(merchantId, String(orderId), finalAmount, currency, merchantSecret);

          const notifyUrl = `${url.origin}/api/payhere-notify`;
          const returnUrl = `${url.origin}/order-success/${orderId}?payhere=success`;
          const cancelUrl = `${url.origin}/checkout?status=cancelled&order_id=${orderId}`;

          const rawFirstName = customer?.firstName || customer?.name?.split(' ')[0] || dbOrder?.customer_name?.split(' ')[0] || 'Valued';
          const rawLastName = customer?.lastName || customer?.name?.split(' ').slice(1).join(' ') || dbOrder?.customer_name?.split(' ').slice(1).join(' ') || 'Patron';
          const safeItems = sanitizePayHereText(items || description || `Azhai Order #${orderId}`, `Azhai Order #${orderId}`).slice(0, 200);
          const safeFirstName = sanitizePayHereText(rawFirstName, 'Valued').slice(0, 80);
          const safeLastName = sanitizePayHereText(rawLastName, 'Patron').slice(0, 80);
          const safeEmail = (customer?.email || dbOrder?.customer_email || 'concierge@azhaiclothing.lk').trim();
          const safePhone = (customer?.phone || dbOrder?.customer_phone || '0770000000').trim();
          const safeAddress = sanitizePayHereText(customer?.address || dbOrder?.shipping_address?.address || 'Colombo', 'Colombo').slice(0, 200);
          const safeCity = sanitizePayHereText(customer?.city || dbOrder?.shipping_address?.city || 'Colombo', 'Colombo').slice(0, 80);
          const safeCountry = sanitizePayHereText(customer?.country || 'Sri Lanka', 'Sri Lanka').slice(0, 80);

          return new Response(
            JSON.stringify({
              success: true,
              sandbox: isSandbox,
              merchant_id: merchantId,
              order_id: String(orderId),
              items: safeItems,
              amount: formattedAmount,
              currency,
              hash,
              return_url: returnUrl,
              cancel_url: cancelUrl,
              notify_url: notifyUrl,
              first_name: safeFirstName,
              last_name: safeLastName,
              email: safeEmail,
              phone: safePhone,
              address: safeAddress,
              city: safeCity,
              country: safeCountry,
              delivery_address: safeAddress,
              delivery_city: safeCity,
              delivery_country: safeCountry,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'Error processing checkout initiation' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ── 2b. PayHere Order Payment Verification Endpoint ─────────
    if (url.pathname === '/api/payhere-verify') {
      try {
        let orderId = url.searchParams.get('orderId') || url.searchParams.get('order_id') || '';
        if (!orderId && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          orderId = body.orderId || body.order_id || '';
        }
        if (!orderId) {
          return new Response(JSON.stringify({ error: 'Missing orderId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

        let dbOrder = null;
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_order_by_code`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ p_order_code: String(orderId) }),
        });
        if (rpcRes.ok) {
          const rows = await rpcRes.json();
          dbOrder = Array.isArray(rows) ? rows[0] : rows;
        }

        if (dbOrder && dbOrder.payment_status === 'paid') {
          return new Response(
            JSON.stringify({
              verified: true,
              payment_status: 'paid',
              status: dbOrder.status || 'confirmed',
              admin_notes: dbOrder.admin_notes || '',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        if (dbOrder && dbOrder.admin_notes && /Failed\/Cancelled/i.test(dbOrder.admin_notes)) {
          return new Response(
            JSON.stringify({
              verified: false,
              failed: true,
              payment_status: dbOrder.payment_status || 'pending_card',
              status: dbOrder.status || 'pending',
              admin_notes: dbOrder.admin_notes,
              error: 'Your card payment was declined or cancelled by the bank. Please try again.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Fallback: If IPN hasn't arrived yet and PayHere Retrieval API credentials are configured, check PayHere directly
        const phPayment = await searchPayHerePaymentByOrderId(orderId, env);
        if (phPayment && phPayment.status === 'RECEIVED') {
          const paidAmount = Number(phPayment.amount || 0);
          const expectedTotal = dbOrder ? Number(dbOrder.total || 0) : 0;
          if (paidAmount >= expectedTotal - 0.01) {
            return new Response(
              JSON.stringify({
                verified: true,
                payment_status: 'paid',
                status: 'confirmed',
                payment_id: phPayment.payment_id,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
        }

        return new Response(
          JSON.stringify({
            verified: false,
            payment_status: dbOrder?.payment_status || 'pending_card',
            status: dbOrder?.status || 'pending',
            admin_notes: dbOrder?.admin_notes || '',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ verified: false, error: err.message || 'Verification error' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // ── 3. PayHere.lk Card Refund (Admin Authenticated) ─────────
    if (url.pathname === '/api/payhere-refund' || url.pathname === '/api/refund-payments-lk') {
      if (request.method === 'POST') {
        try {
          if (origin && !isAllowedOrigin) {
            return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const authCheck = await verifyAdminRequest(request, env);
          if (!authCheck.authorized) {
            return new Response(JSON.stringify({ error: authCheck.error || 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const body = await request.json();
          let { paymentId, orderId, reference, amount, amountCents, reason, adminNotes } = body;
          const targetRef = orderId || reference;
          const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : undefined);

          // Resolve numeric PayHere payment ID
          let resolvedPaymentId = paymentId;
          const isNumeric = resolvedPaymentId && /^\d+$/.test(String(resolvedPaymentId).trim());

          if (!isNumeric) {
            resolvedPaymentId = null;

            // 1. Try parsing payment ID from passed adminNotes (e.g. "Payment ID: 320025071278")
            if (adminNotes) {
              const noteMatch = adminNotes.match(/Payment ID:\s*(\d+)/i) || adminNotes.match(/\b\d{6,16}\b/);
              if (noteMatch) {
                resolvedPaymentId = noteMatch[1] || noteMatch[0];
              }
            }

            // 2. Try looking up in Supabase order
            const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
            const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

            if (!resolvedPaymentId && targetRef && supabaseUrl && supabaseKey) {
              try {
                const ordLookup = await fetch(`${supabaseUrl}/rest/v1/rpc/get_order_by_code`, {
                  method: 'POST',
                  headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ p_order_code: String(targetRef) }),
                });
                if (ordLookup.ok) {
                  const ordRows = await ordLookup.json();
                  const row = Array.isArray(ordRows) ? ordRows[0] : ordRows;
                  if (row?.admin_notes) {
                    const match = row.admin_notes.match(/Payment ID:\s*(\d+)/i) || row.admin_notes.match(/\b\d{6,16}\b/);
                    if (match) {
                      resolvedPaymentId = match[1] || match[0];
                    }
                  }
                }
              } catch (dbErr) {
                console.warn('[Refund paymentId DB lookup warning]:', dbErr);
              }
            }

            // 3. Fallback: Query PayHere Retrieval API by order_id
            if (!resolvedPaymentId && targetRef) {
              const phRecord = await searchPayHerePaymentByOrderId(targetRef, env);
              if (phRecord && phRecord.payment_id) {
                resolvedPaymentId = String(phRecord.payment_id);
              }
            }
          }

          if (!resolvedPaymentId) {
            return new Response(
              JSON.stringify({
                error: `No PayHere Payment ID found for order #${targetRef || 'unknown'}. Please provide the numeric Payment ID (e.g. 3200...) from your PayHere Merchant Dashboard.`,
                code: 'PAYMENT_ID_REQUIRED',
                orderId: targetRef,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const accessToken = await getPayHereOAuthToken(env);
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX === 'true');
          const refundUrl = isSandbox
            ? 'https://sandbox.payhere.lk/merchant/v1/payment/refund'
            : 'https://www.payhere.lk/merchant/v1/payment/refund';

          const refundPayload = {
            payment_id: Number(resolvedPaymentId) || resolvedPaymentId,
            description: sanitizePayHereText(reason || 'Merchant initiated refund via Azhai Admin', 'Merchant initiated refund'),
          };
          if (finalAmount) {
            refundPayload.amount = Number(finalAmount.toFixed(2));
          }

          const refundResp = await fetch(refundUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(refundPayload),
          });

          const refundData = await refundResp.json();

          if (!refundResp.ok || (refundData.status !== undefined && refundData.status !== 1)) {
            const errorMsg = refundData.msg || refundData.message || refundData.error || 'Refund failed at PayHere gateway';
            return new Response(
              JSON.stringify({ error: errorMsg, details: refundData, paymentId: resolvedPaymentId }),
              { status: refundResp.status || 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          // Automatically sync refund status to Supabase using admin's JWT or service role key
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
          const authBearer = env.SUPABASE_SERVICE_ROLE_KEY ? `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` : (request.headers.get('Authorization') || `Bearer ${supabaseKey}`);
          if (targetRef && supabaseUrl && supabaseKey) {
            try {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': authBearer,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'refunded',
                  updated_at: new Date().toISOString(),
                }),
              });
            } catch (dbErr) {
              console.warn('[Refund DB auto-sync warning]:', dbErr);
            }
          }

          return new Response(
            JSON.stringify({ success: true, ...refundData, paymentId: resolvedPaymentId }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'Error executing refund' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ── 4. PayHere Hosted Payment Link Generator (Admin Authenticated) ───
    if (url.pathname === '/api/payhere-payment-link' || url.pathname === '/api/create-payments-lk-payment-link') {
      if (request.method === 'POST') {
        try {
          if (origin && !isAllowedOrigin) {
            return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const authCheck = await verifyAdminRequest(request, env);
          if (!authCheck.authorized) {
            return new Response(JSON.stringify({ error: authCheck.error || 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const body = await request.json();
          const merchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '262596';
          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX === 'true');

          if (!merchantSecret) {
            return new Response(
              JSON.stringify({ error: 'Server configuration error: PayHere Merchant Secret is not configured.' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const { title, amount, amountCents, orderId: passedOrderId, description, customer } = body;
          const orderId = passedOrderId || `AZH-PLINK-${Date.now().toString(36).toUpperCase()}`;
          const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

          if (!finalAmount || finalAmount <= 0) {
            return new Response(
              JSON.stringify({ error: 'Missing or invalid required field: amount' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const formattedAmount = finalAmount.toFixed(2);
          const currency = 'LKR';
          const hash = generatePayHereHash(merchantId, orderId, finalAmount, currency, merchantSecret);

          const baseUrl = isSandbox
            ? 'https://sandbox.payhere.lk/pay/checkout'
            : 'https://www.payhere.lk/pay/checkout';

          const params = new URLSearchParams({
            merchant_id: merchantId,
            return_url: `${url.origin}/order-success/${orderId}?payhere=success`,
            cancel_url: `${url.origin}/checkout?status=cancelled&order_id=${orderId}`,
            notify_url: `${url.origin}/api/payhere-notify`,
            order_id: orderId,
            items: sanitizePayHereText(title || description || 'Azhai Bespoke Couture Payment', 'Azhai Bespoke Couture Payment'),
            currency: currency,
            amount: formattedAmount,
            first_name: sanitizePayHereText(customer?.name?.split(' ')[0] || 'Valued', 'Valued'),
            last_name: sanitizePayHereText(customer?.name?.split(' ').slice(1).join(' ') || 'Patron', 'Patron'),
            email: (customer?.email || 'concierge@azhaiclothing.lk').trim(),
            phone: (customer?.phone || '0771234567').trim(),
            address: sanitizePayHereText(customer?.address || 'Azhai Boutique Atelier', 'Azhai Boutique Atelier'),
            city: sanitizePayHereText(customer?.city || 'Colombo', 'Colombo'),
            country: 'Sri Lanka',
            hash: hash,
          });

          const checkoutUrl = `${baseUrl}?${params.toString()}`;

          return new Response(
            JSON.stringify({
              success: true,
              id: orderId,
              orderId,
              url: checkoutUrl,
              amount: formattedAmount,
              currency,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'Error generating payment link' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ── 4b. Confirm Card Order Endpoint (Decommissioned for Security) ────
    if (url.pathname === '/api/confirm-card-order') {
      return new Response(
        JSON.stringify({ error: 'Endpoint decommissioned for security: Orders are verified exclusively via PayHere IPN.' }),
        { status: 410, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ── 5. PayHere IPN Webhook Receiver (Cryptographically Verified) ───
    if (url.pathname === '/api/payhere-notify' || url.pathname === '/api/payments-lk-webhook') {
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let params = {};

          if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
              params[key] = value.toString();
            }
          } else {
            params = await request.json();
          }

          const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            method,
            status_message,
          } = params;

          const expectedMerchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '262596';
          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';

          // Mandatory Signature Check: Reject any request missing the merchant secret or signature
          if (!merchantSecret) {
            console.error('[PayHere IPN] Server configuration error: PAYHERE_MERCHANT_SECRET is missing.');
            return new Response('Server Configuration Error', { status: 500, headers: corsHeaders });
          }

          if (!md5sig) {
            console.error('[PayHere IPN] Rejected unauthenticated IPN: Missing md5sig for order:', order_id);
            return new Response('Missing Signature', { status: 400, headers: corsHeaders });
          }

          if (merchant_id && String(merchant_id).trim() !== String(expectedMerchantId).trim()) {
            console.error('[PayHere IPN] Merchant ID mismatch:', merchant_id);
            return new Response('Invalid Merchant ID', { status: 401, headers: corsHeaders });
          }

          const hashedSecret = md5(merchantSecret).toUpperCase();
          const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
          const localSig = md5(rawString).toUpperCase();

          if (localSig !== md5sig.toUpperCase()) {
            console.error('[PayHere IPN] Cryptographic verification failed! Invalid MD5 signature for order:', order_id);
            return new Response('Invalid Signature', { status: 401, headers: corsHeaders });
          }

          const statusCode = parseInt(status_code, 10);
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          if (order_id && supabaseUrl) {
            // 1. Fetch existing order via RPC to verify amount & currency and check if already paid
            let dbOrder = null;
            try {
              const rpcLookup = await fetch(`${supabaseUrl}/rest/v1/rpc/get_order_by_code`, {
                method: 'POST',
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_order_code: String(order_id) }),
              });
              if (rpcLookup.ok) {
                const rows = await rpcLookup.json();
                dbOrder = Array.isArray(rows) ? rows[0] : rows;
              }
            } catch (e) {
              console.warn('[PayHere IPN Order Lookup Warning]:', e);
            }

            const wasAlreadyPaid = dbOrder?.payment_status === 'paid';

            if (statusCode === 2 && dbOrder) {
              const paidAmt = Number(payhere_amount || 0);
              const expectedAmt = Number(dbOrder.total || 0);
              if (paidAmt < expectedAmt - 0.01 || (payhere_currency && payhere_currency.toUpperCase() !== 'LKR')) {
                console.error(`[PayHere IPN] Amount/Currency mismatch for ${order_id}: expected ${expectedAmt} LKR, got ${paidAmt} ${payhere_currency}`);
                return new Response('Amount or Currency Mismatch', { status: 400, headers: corsHeaders });
              }
            }

            // 2. Execute SECURITY DEFINER RPC `worker_update_payhere_order` (works even without service_role key)
            let rpcUpdated = false;
            try {
              const rpcUpdateRes = await fetch(`${supabaseUrl}/rest/v1/rpc/worker_update_payhere_order`, {
                method: 'POST',
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  p_order_code: String(order_id),
                  p_merchant_id: String(merchant_id || expectedMerchantId),
                  p_payment_id: String(payment_id || ''),
                  p_payhere_amount: String(payhere_amount || '0.00'),
                  p_payhere_currency: String(payhere_currency || 'LKR'),
                  p_status_code: String(status_code ?? statusCode),
                  p_md5sig: String(md5sig),
                  p_hashed_secret: hashedSecret,
                  p_method: String(method || 'Card'),
                  p_status_message: String(status_message || ''),
                  p_card_no: String(params.get('card_no') || ''),
                }),
              });
              if (rpcUpdateRes.ok) {
                const rpcResult = await rpcUpdateRes.json();
                if (rpcResult && rpcResult.success) {
                  rpcUpdated = true;
                }
              } else {
                // Fallback to 8-param signature if older RPC version is installed
                const legacyRes = await fetch(`${supabaseUrl}/rest/v1/rpc/worker_update_payhere_order`, {
                  method: 'POST',
                  headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    p_order_code: String(order_id),
                    p_payment_id: String(payment_id || ''),
                    p_payhere_amount: String(payhere_amount || '0.00'),
                    p_payhere_currency: String(payhere_currency || 'LKR'),
                    p_status_code: statusCode,
                    p_md5sig: String(md5sig),
                    p_method: String(method || 'Card'),
                    p_status_message: String(status_message || ''),
                  }),
                });
                if (legacyRes.ok) {
                  const legacyResult = await legacyRes.json();
                  if (legacyResult && legacyResult.success) {
                    rpcUpdated = true;
                  }
                }
              }
            } catch (rpcErr) {
              console.warn('[PayHere IPN RPC Update Fallback]:', rpcErr);
            }

            // 3. Fallback direct PATCH if service_role key is present or RPC migration hasn't been applied yet
            if (!rpcUpdated) {
              let patchBody = null;
              if (statusCode === 2) {
                patchBody = {
                  payment_status: 'paid',
                  status: 'confirmed',
                  admin_notes: `Paid via PayHere (Payment ID: ${payment_id || 'N/A'}, Method: ${method || 'Card'})`,
                  updated_at: new Date().toISOString(),
                };
              } else if (statusCode === 0) {
                patchBody = {
                  payment_status: 'pending_card',
                  admin_notes: `PayHere Payment Pending (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                };
              } else if (statusCode === -1 || statusCode === -2) {
                patchBody = {
                  payment_status: 'pending_card',
                  admin_notes: `PayHere Payment Failed/Cancelled: ${status_message || status_code} (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                };
              } else if (statusCode === -3) {
                patchBody = {
                  payment_status: 'refunded',
                  admin_notes: `PayHere Chargeback (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                };
              }

              if (patchBody) {
                await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                  method: 'PATCH',
                  headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(patchBody),
                });
              }
            }

            // 4. Server-Side Brevo Transactional Emails on Confirmed Payment (status_code === 2)
            const brevoKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY;
            if (statusCode === 2 && !wasAlreadyPaid && dbOrder && brevoKey) {
              try {
                const customerEmail = dbOrder.customer_email;
                const customerName = dbOrder.customer_name || 'Valued Patron';
                const totalFormatted = Number(dbOrder.total || payhere_amount || 0).toLocaleString();

                if (customerEmail) {
                  await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
                    body: JSON.stringify({
                      sender: { name: 'Azhai Atelier', email: 'orders@azhaiclothing.lk' },
                      to: [{ email: customerEmail, name: customerName }],
                      subject: `Payment Confirmed — Order #${order_id} | Azhai`,
                      htmlContent: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF7F2; color: #1A1412; border: 1px solid #E5DEC9;">
                        <h2 style="margin-top: 0; color: #1A1412;">Thank You for Your Order, ${sanitizePayHereText(customerName, 'Valued Patron')}</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #4A3F3A;">We have received your payment of <strong>LKR ${totalFormatted}</strong> via PayHere (${sanitizePayHereText(method || 'Card', 'Card')}) for Order <strong>#${sanitizePayHereText(order_id)}</strong>.</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #4A3F3A;">PayHere Payment Reference: <strong>#${sanitizePayHereText(payment_id || 'N/A')}</strong></p>
                        <p style="margin-top: 24px;"><a href="https://azhaiclothing.lk/order-success/${encodeURIComponent(order_id)}" style="display: inline-block; padding: 12px 24px; background: #1A1412; color: #FAF7F2; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">View Order Status</a></p>
                      </div>`,
                    }),
                  });
                }

                await fetch('https://api.brevo.com/v3/smtp/email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
                  body: JSON.stringify({
                    sender: { name: 'Azhai Order System', email: 'orders@azhaiclothing.lk' },
                    to: [{ email: 'orders@azhaiclothing.lk', name: 'Azhai Orders' }],
                    subject: `[PAID] Order #${order_id} — LKR ${totalFormatted} (${method || 'PayHere'})`,
                    htmlContent: `<p>Order <strong>#${sanitizePayHereText(order_id)}</strong> has been cryptographically verified and marked as <strong>PAID</strong> via PayHere IPN.</p>
                      <ul>
                        <li><strong>Customer:</strong> ${sanitizePayHereText(customerName)} (${sanitizePayHereText(customerEmail || 'N/A')})</li>
                        <li><strong>Amount:</strong> LKR ${totalFormatted}</li>
                        <li><strong>PayHere Payment ID:</strong> ${sanitizePayHereText(payment_id || 'N/A')}</li>
                        <li><strong>Method:</strong> ${sanitizePayHereText(method || 'Card')}</li>
                      </ul>`,
                  }),
                });
              } catch (emailErr) {
                console.warn('[PayHere IPN Brevo Email Warning]:', emailErr);
              }
            }
          }

          return new Response('OK', { status: 200, headers: corsHeaders });
        } catch (err) {
          console.error('[PayHere IPN Error]:', err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // ── 4. Dynamic Open Graph Crawler Support (WhatsApp, Meta, Twitter, LinkedIn) ──
    const userAgent = request.headers.get('user-agent') || '';
    const isSocialCrawler = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|Pinterest|LinkedInBot|TelegramBot|Slackbot|Discordbot/i.test(userAgent);

    if (isSocialCrawler && url.pathname.startsWith('/products/')) {
      const slug = url.pathname.replace('/products/', '').split('/')[0].split('?')[0];
      if (slug) {
        try {
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';
          const sbRes = await fetch(
            `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=name,price,description,short_description,images`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            }
          );
          if (sbRes.ok) {
            const products = await sbRes.json();
            const product = products[0];
            if (product) {
              const res = await env.ASSETS.fetch(request);
              const ogTitle = `${product.name} | Azhai Clothing by Preethi`;
              const ogDesc = product.short_description || product.description || 'Handcrafted festive and bespoke couture by Preethi in Colombo, Sri Lanka.';
              const firstImg = Array.isArray(product.images) && product.images[0]
                ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].src)
                : `${url.origin}/og-azhai.jpg`;
              const ogUrl = `${url.origin}/products/${slug}`;

              return new HTMLRewriter()
                .on('title', { element(e) { e.setInnerContent(ogTitle); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute('content', ogTitle); } })
                .on('meta[property="og:description"]', { element(e) { e.setAttribute('content', ogDesc); } })
                .on('meta[property="og:image"]', { element(e) { e.setAttribute('content', firstImg); } })
                .on('meta[property="og:url"]', { element(e) { e.setAttribute('content', ogUrl); } })
                .on('meta[name="twitter:title"]', { element(e) { e.setAttribute('content', ogTitle); } })
                .on('meta[name="twitter:description"]', { element(e) { e.setAttribute('content', ogDesc); } })
                .on('meta[name="twitter:image"]', { element(e) { e.setAttribute('content', firstImg); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute('content', ogDesc); } })
                .transform(res);
            }
          }
        } catch (e) {
          console.warn('[Social Crawler Rewrite Error]:', e);
        }
      }
    }

    // Falls back to SPA static assets with defensive security headers
    const assetResponse = await env.ASSETS.fetch(request);
    const responseHeaders = new Headers(assetResponse.headers);
    responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    responseHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: responseHeaders,
    });
  },
};
