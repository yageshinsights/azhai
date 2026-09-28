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

async function getPayHereOAuthToken(env) {
  const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX !== 'false');
  const tokenUrl = isSandbox
    ? 'https://sandbox.payhere.lk/merchant/v1/oauth/token'
    : 'https://www.payhere.lk/merchant/v1/oauth/token';

  const appId = env.PAYHERE_APP_ID || '';
  const appSecret = env.PAYHERE_APP_SECRET || '';

  if (!appId || !appSecret) {
    throw new Error('PayHere App ID and App Secret must be configured in environment for refund API.');
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, api-key, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ── 1. Secure Server-Side Brevo Email Dispatcher ───────────
    if (url.pathname === '/api/send-email') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY || body.apiKey;

          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Brevo API key is not configured.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify(body.payload),
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
          const body = await request.json();
          const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY || body.apiKey;

          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Brevo API key is not configured.' }), {
              status: 400,
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

    // ── 2. PayHere.lk Initiate Checkout Session (Hash Generation) ──
    if (url.pathname === '/api/payhere-initiate' || url.pathname === '/api/create-payments-lk-checkout') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const merchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '1237099';
          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX !== 'false');

          const { orderId, amount, amountCents, currency: passedCurrency, description, customer, items } = body;
          const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

          if (!orderId || !finalAmount) {
            return new Response(
              JSON.stringify({ error: 'Missing required checkout fields: orderId, amount' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const currency = passedCurrency || 'LKR';
          const formattedAmount = finalAmount.toFixed(2);
          const hash = generatePayHereHash(merchantId, orderId, finalAmount, currency, merchantSecret);

          const notifyUrl = `${url.origin}/api/payhere-notify`;
          const returnUrl = `${url.origin}/order-success/${orderId}?payhere=success`;
          const cancelUrl = `${url.origin}/checkout?status=cancelled&order_id=${orderId}`;

          const firstName = customer?.firstName || customer?.name?.split(' ')[0] || 'Valued';
          const lastName = customer?.lastName || customer?.name?.split(' ').slice(1).join(' ') || 'Patron';

          return new Response(
            JSON.stringify({
              success: true,
              sandbox: isSandbox,
              merchant_id: merchantId,
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

    // ── 3. PayHere.lk Card Refund ─────────────────────────────
    if (url.pathname === '/api/payhere-refund' || url.pathname === '/api/refund-payments-lk') {
      if (request.method === 'POST') {
        try {
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
                const ordLookup = await fetch(
                  `${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}&select=admin_notes,payment_status`,
                  {
                    headers: {
                      'apikey': supabaseKey,
                      'Authorization': `Bearer ${supabaseKey}`,
                    },
                  }
                );
                if (ordLookup.ok) {
                  const ordRows = await ordLookup.json();
                  if (ordRows && ordRows[0]?.admin_notes) {
                    const match = ordRows[0].admin_notes.match(/Payment ID:\s*(\d+)/i) || ordRows[0].admin_notes.match(/\b\d{6,16}\b/);
                    if (match) {
                      resolvedPaymentId = match[1] || match[0];
                    }
                  }
                }
              } catch (dbErr) {
                console.warn('[Refund paymentId DB lookup warning]:', dbErr);
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
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX !== 'false');
          const refundUrl = isSandbox
            ? 'https://sandbox.payhere.lk/merchant/v1/payment/refund'
            : 'https://www.payhere.lk/merchant/v1/payment/refund';

          const refundPayload = {
            payment_id: Number(resolvedPaymentId) || resolvedPaymentId,
            description: reason || 'Merchant initiated refund via Azhai Admin',
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

          // Automatically sync refund status to Supabase if order code is known
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
          if (targetRef && supabaseUrl && supabaseKey) {
            try {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
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

    // ── 4. PayHere Hosted Payment Link Generator ───────────────
    if (url.pathname === '/api/payhere-payment-link' || url.pathname === '/api/create-payments-lk-payment-link') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const merchantId = env.PAYHERE_MERCHANT_ID || env.VITE_PAYHERE_MERCHANT_ID || '1237099';
          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';
          const isSandbox = (env.PAYHERE_ENV === 'sandbox' || env.VITE_PAYHERE_SANDBOX !== 'false');

          const { title, amount, amountCents, orderId: passedOrderId, description, customer } = body;
          const orderId = passedOrderId || `AZH-PLINK-${Date.now().toString(36).toUpperCase()}`;
          const finalAmount = amount !== undefined ? Number(amount) : (amountCents ? (Number(amountCents) / 100) : 0);

          if (!finalAmount) {
            return new Response(
              JSON.stringify({ error: 'Missing required field: amount' }),
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

    // ── 4b. Confirm Card Order (Server-Side Fallback) ──────────
    if (url.pathname === '/api/confirm-card-order') {
      if (request.method === 'POST') {
        try {
          const { orderId, paymentId } = await request.json();
          if (!orderId) {
            return new Response(JSON.stringify({ error: 'Order ID is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          const patchPayload = {
            payment_status: 'paid',
            status: 'pending',
            updated_at: new Date().toISOString(),
          };
          if (paymentId) {
            patchPayload.admin_notes = `Paid via PayHere (Payment ID: ${paymentId})`;
          }

          const patchRes = await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(patchPayload),
          });

          const updated = await patchRes.json();
          return new Response(JSON.stringify({ success: true, updated }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // ── 5. PayHere IPN Webhook Receiver ────────────────────────
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

          const merchantSecret = env.PAYHERE_MERCHANT_SECRET || env.VITE_PAYHERE_SECRET || '';

          // Verify md5sig if merchantSecret is configured
          if (merchantSecret && md5sig) {
            const hashedSecret = md5(merchantSecret).toUpperCase();
            const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
            const localSig = md5(rawString).toUpperCase();

            if (localSig !== md5sig.toUpperCase()) {
              console.error('[PayHere IPN] Invalid MD5 signature for order:', order_id);
              return new Response('Invalid Signature', { status: 400, headers: corsHeaders });
            }
          }

          const statusCode = parseInt(status_code, 10);
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          if (order_id && supabaseUrl) {
            if (statusCode === 2) {
              // 2 = SUCCESS
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'paid',
                  status: 'confirmed',
                  admin_notes: `Paid via PayHere (Payment ID: ${payment_id || 'N/A'}, Method: ${method || 'Card'})`,
                  updated_at: new Date().toISOString(),
                }),
              });
            } else if (statusCode === 0) {
              // 0 = PENDING
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'pending_card',
                  admin_notes: `PayHere Payment Pending (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                }),
              });
            } else if (statusCode === -1 || statusCode === -2) {
              // -1 = CANCELED, -2 = FAILED
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'pending_card',
                  admin_notes: `PayHere Payment Failed/Cancelled: ${status_message || status_code} (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                }),
              });
            } else if (statusCode === -3) {
              // -3 = CHARGEDBACK
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(order_id)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'refunded',
                  admin_notes: `PayHere Chargeback (Payment ID: ${payment_id || 'N/A'})`,
                  updated_at: new Date().toISOString(),
                }),
              });
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

    // Falls back to SPA static assets
    return env.ASSETS.fetch(request);
  },
};
