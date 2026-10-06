// ── Pure JavaScript MD5 Implementation (RFC 1321) for Vite Proxy ─
function md5cycle(x: number[], k: number[]) {
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
function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
function add32(a: number, b: number) { return (a + b) & 0xFFFFFFFF; }
function md5(s: string): string {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
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
function md5blk(s: string) {
  const md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}
function generatePayHereHash(merchantId: string, orderId: string, amount: number, currency: string, merchantSecret: string) {
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = md5(merchantSecret || '').toUpperCase();
  const dataToHash = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return md5(dataToHash).toUpperCase();
}

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'brevo-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/send-email', (req, res, next) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api-key');
              res.end();
              return;
            }
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body);
                  const apiKey = env.VITE_BREVO_API_KEY || parsed.apiKey;
                  if (!apiKey) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Brevo API key is not set in .env' }));
                    return;
                  }
                  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'api-key': apiKey,
                    },
                    body: JSON.stringify(parsed.payload),
                  });
                  const data = await brevoRes.json();
                  res.statusCode = brevoRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal dev server proxy error' }));
                }
              });
            } else {
              next();
            }
          });

          // ── Brevo Contact Dev Server Proxy ──────────────────────────
          server.middlewares.use('/api/create-brevo-contact', (req, res, next) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api-key');
              res.end();
              return;
            }
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body);
                  const apiKey = env.VITE_BREVO_API_KEY || parsed.apiKey;
                  if (!apiKey) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Brevo API key is not set in .env' }));
                    return;
                  }
                  const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'api-key': apiKey,
                    },
                    body: JSON.stringify(parsed.payload),
                  });
                  const data = brevoRes.status === 204 ? { updated: true } : await brevoRes.json().catch(() => ({}));
                  res.statusCode = brevoRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal dev server proxy error' }));
                }
              });
            } else {
              next();
            }
          });

          // ── PayHere.lk Dev Server Proxy ────────────────────────────
          const payhereMerchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '1237099';
          const payhereSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';
          const isPayhereSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX !== 'false');

          // 1. Checkout Session Initiation & Hash Generation
          const handlePayHereInitiate = (req: any, res: any) => {
            let body = '';
            req.on('data', (c: any) => { body += c; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                const { orderId, amount, amountCents, currency: passedCurrency, description, customer, items } = parsed;
                const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

                if (!orderId || !finalAmount) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing required checkout fields: orderId, amount' }));
                  return;
                }

                const currency = passedCurrency || 'LKR';
                const formattedAmount = finalAmount.toFixed(2);
                const hash = generatePayHereHash(payhereMerchantId, orderId, finalAmount, currency, payhereSecret);

                const host = req.headers.host || 'localhost:5173';
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const origin = `${protocol}://${host}`;

                const notifyUrl = `${origin}/api/payhere-notify`;
                const returnUrl = `${origin}/order-success/${orderId}?payhere=success`;
                const cancelUrl = `${origin}/checkout?status=cancelled&order_id=${orderId}`;

                const firstName = customer?.firstName || customer?.name?.split(' ')[0] || 'Valued';
                const lastName = customer?.lastName || customer?.name?.split(' ').slice(1).join(' ') || 'Patron';

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  sandbox: isPayhereSandbox,
                  merchant_id: payhereMerchantId,
                  order_id: String(orderId),
                  items: items || description || `Azhai Order #${orderId}`,
                  amount: formattedAmount,
                  currency,
                  hash,
                  return_url: returnUrl,
                  cancel_url: cancelUrl,
                  notify_url: notifyUrl,
                  first_name: firstName,
                  last_name: lastName,
                  email: customer?.email || '',
                  phone: customer?.phone || '',
                  address: customer?.address || '',
                  city: customer?.city || 'Colombo',
                  country: customer?.country || 'Sri Lanka',
                  delivery_address: customer?.address || '',
                  delivery_city: customer?.city || 'Colombo',
                  delivery_country: customer?.country || 'Sri Lanka',
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error processing checkout initiation' }));
              }
            });
          };

          server.middlewares.use('/api/payhere-initiate', (req, res, next) => {
            if (req.method === 'POST') handlePayHereInitiate(req, res);
            else next();
          });
          server.middlewares.use('/api/create-payments-lk-checkout', (req, res, next) => {
            if (req.method === 'POST') handlePayHereInitiate(req, res);
            else next();
          });

          // 2. PayHere Refund Proxy
          const handlePayHereRefund = (req: any, res: any) => {
            let body = '';
            req.on('data', (c: any) => { body += c; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                let { paymentId, orderId, reference, amount, amountCents, reason, adminNotes } = parsed;
                const targetRef = orderId || reference;
                const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : undefined);

                let resolvedPaymentId = paymentId;
                const isNumeric = resolvedPaymentId && /^\d+$/.test(String(resolvedPaymentId).trim());

                if (!isNumeric) {
                  resolvedPaymentId = null;
                  if (adminNotes) {
                    const match = adminNotes.match(/Payment ID:\s*(\d+)/i) || adminNotes.match(/\b\d{6,16}\b/);
                    if (match) resolvedPaymentId = match[1] || match[0];
                  }

                  const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                  const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
                  if (!resolvedPaymentId && targetRef && sUrl && sKey) {
                    try {
                      const dbLookup = await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}&select=admin_notes`, {
                        headers: { apikey: sKey, Authorization: `Bearer ${sKey}` },
                      });
                      if (dbLookup.ok) {
                        const rows: any = await dbLookup.json();
                        const match = rows[0]?.admin_notes?.match(/Payment ID:\s*(\d+)/i) || rows[0]?.admin_notes?.match(/\b\d{6,16}\b/);
                        if (match) resolvedPaymentId = match[1] || match[0];
                      }
                    } catch (e) {
                      console.warn('[Vite Proxy Refund DB lookup warning]:', e);
                    }
                  }
                }

                if (!resolvedPaymentId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: `No PayHere Payment ID found for order #${targetRef || 'unknown'}. Please provide the numeric Payment ID from your PayHere Dashboard.`,
                    code: 'PAYMENT_ID_REQUIRED',
                  }));
                  return;
                }

                const appId = env.PAYHERE_APP_ID || '';
                const appSecret = env.PAYHERE_APP_SECRET || '';

                if (!appId || !appSecret) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'PayHere App ID and App Secret must be set in .env to process refunds.',
                    code: 'CREDENTIALS_REQUIRED',
                  }));
                  return;
                }

                const tokenUrl = isPayhereSandbox
                  ? 'https://sandbox.payhere.lk/merchant/v1/oauth/token'
                  : 'https://www.payhere.lk/merchant/v1/oauth/token';

                const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');
                const tokenRes = await fetch(tokenUrl, {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: 'grant_type=client_credentials',
                });

                if (!tokenRes.ok) {
                  const errText = await tokenRes.text();
                  res.statusCode = tokenRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: `PayHere OAuth failed: ${errText}` }));
                  return;
                }

                const tokenData: any = await tokenRes.json();
                const accessToken = tokenData.access_token;

                const refundUrl = isPayhereSandbox
                  ? 'https://sandbox.payhere.lk/merchant/v1/payment/refund'
                  : 'https://www.payhere.lk/merchant/v1/payment/refund';

                const refundPayload: any = {
                  payment_id: Number(resolvedPaymentId) || resolvedPaymentId,
                  description: reason || 'Merchant initiated refund via Azhai Admin',
                };
                if (finalAmount) {
                  refundPayload.amount = Number(finalAmount.toFixed(2));
                }

                const refundResp = await fetch(refundUrl, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(refundPayload),
                });

                const refundData: any = await refundResp.json();

                if (!refundResp.ok || (refundData.status !== undefined && refundData.status !== 1)) {
                  res.statusCode = refundResp.status || 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: refundData.msg || refundData.message || 'Refund failed at PayHere gateway',
                    details: refundData,
                  }));
                  return;
                }

                // Sync status to Supabase
                const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
                if (targetRef && sUrl && sKey) {
                  try {
                    await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}`, {
                      method: 'PATCH',
                      headers: { apikey: sKey, Authorization: `Bearer ${sKey}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ payment_status: 'refunded', updated_at: new Date().toISOString() }),
                    });
                  } catch (e) {
                    console.warn('[Vite Proxy Refund DB update warning]:', e);
                  }
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, ...refundData, paymentId: resolvedPaymentId }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          };

          server.middlewares.use('/api/payhere-refund', (req, res, next) => {
            if (req.method === 'POST') handlePayHereRefund(req, res);
            else next();
          });
          server.middlewares.use('/api/refund-payments-lk', (req, res, next) => {
            if (req.method === 'POST') handlePayHereRefund(req, res);
            else next();
          });

          // 3. PayHere Payment Link Proxy
          const handlePayHereLink = (req: any, res: any) => {
            let body = '';
            req.on('data', (c: any) => { body += c; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                const { title, amount, amountCents, orderId: passedOrderId, description, customer } = parsed;
                const orderId = passedOrderId || `AZH-PLINK-${Date.now().toString(36).toUpperCase()}`;
                const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

                if (!finalAmount) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing required field: amount' }));
                  return;
                }

                const formattedAmount = finalAmount.toFixed(2);
                const currency = 'LKR';
                const hash = generatePayHereHash(payhereMerchantId, orderId, finalAmount, currency, payhereSecret);

                const host = req.headers.host || 'localhost:5173';
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const origin = `${protocol}://${host}`;

                const baseUrl = isPayhereSandbox
                  ? 'https://sandbox.payhere.lk/pay/checkout'
                  : 'https://www.payhere.lk/pay/checkout';

                const params = new URLSearchParams({
                  merchant_id: payhereMerchantId,
                  return_url: `${origin}/order-success/${orderId}?payhere=success`,
                  cancel_url: `${origin}/checkout?status=cancelled&order_id=${orderId}`,
                  notify_url: `${origin}/api/payhere-notify`,
                  order_id: orderId,
                  items: title || description || 'Azhai Bespoke Couture Payment',
                  currency: currency,
                  amount: formattedAmount,
                  first_name: customer?.name?.split(' ')[0] || 'Valued',
                  last_name: customer?.name?.split(' ').slice(1).join(' ') || 'Patron',
                  email: customer?.email || 'concierge@azhaiclothing.lk',
                  phone: customer?.phone || '0771234567',
                  address: customer?.address || 'Azhai Boutique Atelier',
                  city: customer?.city || 'Colombo',
                  country: 'Sri Lanka',
                  hash: hash,
                });

                const checkoutUrl = `${baseUrl}?${params.toString()}`;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  id: orderId,
                  orderId,
                  url: checkoutUrl,
                  amount: formattedAmount,
                  currency,
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          };

          server.middlewares.use('/api/payhere-payment-link', (req, res, next) => {
            if (req.method === 'POST') handlePayHereLink(req, res);
            else next();
          });
          server.middlewares.use('/api/create-payments-lk-payment-link', (req, res, next) => {
            if (req.method === 'POST') handlePayHereLink(req, res);
            else next();
          });

          // 4. Confirm Card Order Proxy (Decommissioned for Security)
          server.middlewares.use('/api/confirm-card-order', (_req, res) => {
            res.statusCode = 410;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Endpoint decommissioned for security: Orders are verified exclusively via PayHere IPN.' }));
          });

          // 5. PayHere IPN Webhook Dev Proxy
          const handlePayHereIpn = (req: any, res: any) => {
            let body = '';
            req.on('data', (c: any) => { body += c; });
            req.on('end', async () => {
              try {
                let params: any = {};
                const contentType = req.headers['content-type'] || '';
                if (contentType.includes('application/x-www-form-urlencoded')) {
                  const urlParams = new URLSearchParams(body);
                  for (const [key, val] of urlParams.entries()) {
                    params[key] = val;
                  }
                } else {
                  params = JSON.parse(body || '{}');
                }

                const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig, method } = params;

                // Mandatory Signature Verification: Reject any notification without signature or secret
                if (!payhereSecret) {
                  res.statusCode = 500;
                  res.end('PayHere merchant secret not configured in local environment');
                  return;
                }
                if (!md5sig) {
                  res.statusCode = 400;
                  res.end('Missing Signature');
                  return;
                }

                const hashedSecret = md5(payhereSecret).toUpperCase();
                const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
                const localSig = md5(rawString).toUpperCase();
                if (localSig !== md5sig.toUpperCase()) {
                  res.statusCode = 401;
                  res.end('Invalid Signature');
                  return;
                }

                const statusCode = parseInt(status_code, 10);
                const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

                if (order_id && sUrl) {
                  if (statusCode === 2) {
                    await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                      method: 'PATCH',
                      headers: { apikey: sKey, Authorization: `Bearer ${sKey}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        payment_status: 'paid',
                        status: 'confirmed',
                        admin_notes: `Paid via PayHere (Payment ID: ${payment_id || 'N/A'}, Method: ${method || 'Card'})`,
                        updated_at: new Date().toISOString(),
                      }),
                    });
                  }
                }

                res.statusCode = 200;
                res.end('OK');
              } catch (err: any) {
                res.statusCode = 400;
                res.end(err.message);
              }
            });
          };

          server.middlewares.use('/api/payhere-notify', (req, res, next) => {
            if (req.method === 'POST') handlePayHereIpn(req, res);
            else next();
          });
          server.middlewares.use('/api/payments-lk-webhook', (req, res, next) => {
            if (req.method === 'POST') handlePayHereIpn(req, res);
            else next();
          });

        },
      },
    ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
        },
      },
    },
  },
};
});

