export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, api-key, Authorization, Payments-Signature',
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

    // ── 2. Payments.lk Create Checkout Session ─────────────────
    if (url.pathname === '/api/create-payments-lk-checkout') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const secretKey =
            env.PAYMENTS_LK_SECRET_KEY ||
            'sk_test_A9ybTZkoMw9HrgiAvcAlFNdKqp6Kp7hm';

          if (!secretKey) {
            return new Response(
              JSON.stringify({ error: 'Payments.lk secret key is not configured in worker environment.' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const { orderId, amountCents, description, customer, successUrl, cancelUrl } = body;

          if (!orderId || !amountCents) {
            return new Response(
              JSON.stringify({ error: 'Missing required checkout fields: orderId, amountCents' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

            const finalSuccessUrl = successUrl || `${url.origin}/order-success/${orderId}?payments_lk=success`;
            const finalCancelUrl = cancelUrl || `${url.origin}/checkout?status=cancelled&order_id=${orderId}`;

            let cleanPhone = (customer?.phone || '').replace(/[^\d+]/g, '').trim();
            if (cleanPhone && cleanPhone.startsWith('0')) {
              cleanPhone = '+94' + cleanPhone.slice(1);
            } else if (cleanPhone && !cleanPhone.startsWith('+')) {
              cleanPhone = '+94' + cleanPhone;
            }

            const customerPayload = customer
              ? {
                  name: customer.name ? String(customer.name).trim() : undefined,
                  email: customer.email ? String(customer.email).trim() : undefined,
                  phone: cleanPhone && cleanPhone.length >= 9 ? cleanPhone : undefined,
                }
              : undefined;

            const checkoutPayload = {
              amountCents: Math.round(Number(amountCents)),
              description: description || `Azhai Order #${orderId}`,
              reference: String(orderId),
              customer: customerPayload,
              successUrl: finalSuccessUrl,
              cancelUrl: finalCancelUrl,
            };

          let pResp = await fetch('https://api.payments.lk/v1/checkouts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Idempotency-Key': `order-${orderId}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutPayload),
          });

          let pData = await pResp.json();

          // Resilient fallback: If gateway rejects payload and customer object was included, retry without customer
          if (!pResp.ok && checkoutPayload.customer) {
            console.warn('[Payments.lk] Retrying checkout creation without customer payload due to gateway response:', pData);
            const fallbackPayload = {
              amountCents: checkoutPayload.amountCents,
              description: checkoutPayload.description,
              reference: checkoutPayload.reference,
              successUrl: checkoutPayload.successUrl,
              cancelUrl: checkoutPayload.cancelUrl,
            };

            const retryResp = await fetch('https://api.payments.lk/v1/checkouts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Idempotency-Key': `order-${orderId}-nocust`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fallbackPayload),
            });

            if (retryResp.ok) {
              pResp = retryResp;
              pData = await retryResp.json();
            } else {
              const retryData = await retryResp.json().catch(() => ({}));
              console.warn('[Payments.lk] Fallback payload also rejected:', retryData);
              pData = retryData;
              pResp = retryResp;
            }
          }

          if (!pResp.ok) {
            const errDetail = typeof pData === 'object' ? JSON.stringify(pData) : String(pData);
            const errorMsg = pData.message 
              ? `${pData.message} (${errDetail})`
              : (pData.error || `Payments.lk API returned an error: ${errDetail}`);

            return new Response(
              JSON.stringify({ error: errorMsg, details: pData }),
              { status: pResp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          return new Response(
            JSON.stringify({
              id: pData.id,
              url: pData.url,
              paymentId: pData.payment?.id,
              status: pData.status,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'Error processing checkout creation' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ── 3. Payments.lk Card Refund ─────────────────────────────
    if (url.pathname === '/api/refund-payments-lk') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const secretKey =
            env.PAYMENTS_LK_SECRET_KEY ||
            'sk_test_A9ybTZkoMw9HrgiAvcAlFNdKqp6Kp7hm';

          const { paymentId, amountCents, reason } = body;

          if (!paymentId || !amountCents) {
            return new Response(
              JSON.stringify({ error: 'Missing required refund fields: paymentId, amountCents' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const idempotencyKey = `refund-${paymentId}-${amountCents}-${Date.now()}`;
          const refundResp = await fetch('https://api.payments.lk/v1/refunds', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Idempotency-Key': idempotencyKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId,
              amountCents,
              reason: reason || 'Merchant issued refund via Azhai Admin',
            }),
          });

          const refundData = await refundResp.json();

          if (!refundResp.ok) {
            return new Response(
              JSON.stringify({ error: refundData.message || 'Refund failed at Payments.lk processor', details: refundData }),
              { status: refundResp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          return new Response(JSON.stringify(refundData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'Error executing refund' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ── 4. Payments.lk Bespoke Payment Link Generator ──────────
    if (url.pathname === '/api/create-payments-lk-payment-link') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const secretKey =
            env.PAYMENTS_LK_SECRET_KEY ||
            'sk_test_A9ybTZkoMw9HrgiAvcAlFNdKqp6Kp7hm';

          const { title, amountCents, description } = body;

          if (!title || !amountCents) {
            return new Response(
              JSON.stringify({ error: 'Missing required fields: title, amountCents' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const linkResp = await fetch('https://api.payments.lk/v1/payment_links', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Idempotency-Key': `plink-${Date.now()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              amountCents,
              description: description || 'Azhai Boutique Bespoke Couture Deposit',
            }),
          });

          const linkData = await linkResp.json();

          if (!linkResp.ok) {
            return new Response(
              JSON.stringify({ error: linkData.message || 'Payment link generation failed', details: linkData }),
              { status: linkResp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          return new Response(JSON.stringify(linkData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
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
          const { orderId } = await request.json();
          if (!orderId) {
            return new Response(JSON.stringify({ error: 'Order ID is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          const patchRes = await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              payment_status: 'paid',
              status: 'pending',
              updated_at: new Date().toISOString(),
            }),
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

    // ── 5. Payments.lk Webhook Receiver ────────────────────────
    if (url.pathname === '/api/payments-lk-webhook') {
      if (request.method === 'POST') {
        try {
          const rawBody = await request.text();
          const signatureHeader = request.headers.get('payments-signature');
          const webhookSecret = env.PAYMENTS_LK_WEBHOOK_SECRET;

          // If webhook secret configured, strictly verify signature
          if (webhookSecret) {
            if (!signatureHeader) {
              return new Response(JSON.stringify({ error: 'Missing payments-signature header' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              });
            }

            const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')));
            const t = Number(parts.t);
            const toleranceSeconds = 300;

            if (!t || isNaN(t) || Math.abs(Date.now() / 1000 - t) > toleranceSeconds) {
              return new Response(JSON.stringify({ error: 'Webhook timestamp expired or invalid' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              });
            }

            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
              'raw',
              encoder.encode(webhookSecret),
              { name: 'HMAC', hash: 'SHA-256' },
              false,
              ['sign']
            );
            const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(`${t}.${rawBody}`));
            const expectedHex = Array.from(new Uint8Array(signatureBuffer))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
            if (expectedHex.toLowerCase() !== (parts.v1 || '').toLowerCase()) {
              return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              });
            }
          }

          const event = JSON.parse(rawBody);
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          if (event.type === 'payment.succeeded') {
            const reference = event.data?.reference;
            const paymentId = event.data?.id;

            if (reference && supabaseUrl) {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(reference)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'paid',
                  status: 'confirmed',
                  admin_notes: `Paid via Payments.lk 3DS (Payment ID: ${paymentId})`,
                  updated_at: new Date().toISOString(),
                }),
              });
            }
          } else if (event.type === 'refund.succeeded') {
            const reference = event.data?.reference;
            if (reference && supabaseUrl) {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(reference)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'refunded',
                  admin_notes: `Refunded via Payments.lk (${event.data?.id})`,
                  updated_at: new Date().toISOString(),
                }),
              });
            }
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (err) {
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
