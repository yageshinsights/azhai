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

          // Format Sri Lankan domestic mobile numbers to 07XXXXXXXX (10 digits) matching Payments.lk hosted form
          const formatSriLankanPhone = (raw) => {
            if (!raw) return undefined;
            const digits = String(raw).replace(/\D/g, '');
            if (digits.startsWith('94') && digits.length === 11) {
              return '0' + digits.slice(2);
            }
            if (!digits.startsWith('0') && digits.length === 9) {
              return '0' + digits;
            }
            if (digits.startsWith('0') && digits.length === 10) {
              return digits;
            }
            return digits.length >= 9 ? digits : undefined;
          };

          const cleanName = customer?.name ? String(customer.name).trim() : undefined;
          const cleanEmail = customer?.email ? String(customer.email).trim() : undefined;
          const cleanPhone = formatSriLankanPhone(customer?.phone);
          const cleanAddress = customer?.address ? String(customer.address).trim() : undefined;
          const cleanCity = customer?.city ? String(customer.city).trim() : undefined;
          const cleanPostal = customer?.postalCode ? String(customer.postalCode).trim() : undefined;

          const candidates = [];

          // Candidate 1: Full pre-fill (name, email, phone, street address, city, postal code)
          if (cleanName || cleanEmail || cleanPhone) {
            const cust1 = {};
            if (cleanName) cust1.name = cleanName;
            if (cleanEmail) cust1.email = cleanEmail;
            if (cleanPhone) cust1.phone = cleanPhone;
            if (cleanAddress) cust1.address = cleanAddress;
            if (cleanCity) cust1.city = cleanCity;
            if (cleanPostal) cust1.postalCode = cleanPostal;

            candidates.push({
              name: 'full-prefill',
              payload: {
                amountCents: Math.round(Number(amountCents)),
                description: description || `Azhai Order #${orderId}`,
                reference: String(orderId),
                customer: cust1,
                successUrl: finalSuccessUrl,
                cancelUrl: finalCancelUrl,
              },
            });
          }

          // Candidate 2: Contact pre-fill with phone (name, email, phone)
          if (cleanName || cleanEmail || cleanPhone) {
            const cust2 = {};
            if (cleanName) cust2.name = cleanName;
            if (cleanEmail) cust2.email = cleanEmail;
            if (cleanPhone) cust2.phone = cleanPhone;

            candidates.push({
              name: 'contact-phone-prefill',
              payload: {
                amountCents: Math.round(Number(amountCents)),
                description: description || `Azhai Order #${orderId}`,
                reference: String(orderId),
                customer: cust2,
                successUrl: finalSuccessUrl,
                cancelUrl: finalCancelUrl,
              },
            });
          }

          // Candidate 3: Official guide pre-fill (name, email)
          if (cleanName && cleanEmail) {
            candidates.push({
              name: 'guide-name-email-prefill',
              payload: {
                amountCents: Math.round(Number(amountCents)),
                description: description || `Azhai Order #${orderId}`,
                reference: String(orderId),
                customer: {
                  name: cleanName,
                  email: cleanEmail,
                },
                successUrl: finalSuccessUrl,
                cancelUrl: finalCancelUrl,
              },
            });
          }

          // Candidate 4: Guaranteed baseline (100% verified to work with Payments.lk)
          candidates.push({
            name: 'guaranteed-core',
            payload: {
              amountCents: Math.round(Number(amountCents)),
              description: description || `Azhai Order #${orderId}`,
              reference: String(orderId),
              successUrl: finalSuccessUrl,
              cancelUrl: finalCancelUrl,
            },
          });

          let pResp = null;
          let pData = null;
          let successTier = null;

          for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const idempotencyKey = `order-${orderId}-${candidate.name}`;

            try {
              pResp = await fetch('https://api.payments.lk/v1/checkouts', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${secretKey}`,
                  'Idempotency-Key': idempotencyKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(candidate.payload),
              });

              pData = await pResp.json();

              if (pResp.ok && pData?.url) {
                successTier = candidate.name;
                console.log(`[Payments.lk Checkout SUCCESS] Order #${orderId} created via tier: ${candidate.name}`);
                break;
              }

              console.warn(`[Payments.lk Checkout] Tier '${candidate.name}' rejected (HTTP ${pResp.status}):`, pData);
            } catch (candidateErr) {
              console.warn(`[Payments.lk Checkout] Exception on tier '${candidate.name}':`, candidateErr);
            }
          }

          if (!pResp || !pResp.ok || !pData?.url) {
            const errDetail = typeof pData === 'object' ? JSON.stringify(pData) : String(pData);
            const errorMsg = pData?.message 
              ? `${pData.message} (${errDetail})`
              : (pData?.error || `Payments.lk API returned an error: ${errDetail}`);

            return new Response(
              JSON.stringify({ error: errorMsg, details: pData }),
              { status: pResp ? pResp.status : 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          return new Response(
            JSON.stringify({
              id: pData.id,
              url: pData.url,
              paymentId: pData.payment?.id,
              status: pData.status,
              tier: successTier,
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

          let { paymentId, orderId, reference, amountCents, reason, adminNotes } = body;
          const targetRef = orderId || reference || (paymentId?.startsWith('AZH-') ? paymentId : null);

          if (!amountCents) {
            return new Response(
              JSON.stringify({ error: 'Missing required refund field: amountCents' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          // Resolve actual Payments.lk payment ID if paymentId is missing or is an order reference
          let resolvedPaymentId = paymentId;
          const isOrderRef = !resolvedPaymentId || resolvedPaymentId.startsWith('AZH-') || (targetRef && resolvedPaymentId === targetRef);

          if (isOrderRef) {
            resolvedPaymentId = null;

            // 1. Try parsing payment ID from passed adminNotes
            if (adminNotes) {
              const noteMatch =
                adminNotes.match(/Payment ID:\s*([a-zA-Z0-9_\-]+)/i) ||
                adminNotes.match(/pay_[a-zA-Z0-9_\-]+/i);
              if (noteMatch) {
                resolvedPaymentId = noteMatch[1] || noteMatch[0];
              }
            }

            // 2. Try looking up order in Supabase to read admin_notes or payment_id
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
                    const match =
                      ordRows[0].admin_notes.match(/Payment ID:\s*([a-zA-Z0-9_\-]+)/i) ||
                      ordRows[0].admin_notes.match(/pay_[a-zA-Z0-9_\-]+/i);
                    if (match) {
                      resolvedPaymentId = match[1] || match[0];
                    }
                  }
                }
              } catch (dbErr) {
                console.warn('[Refund paymentId DB lookup warning]:', dbErr);
              }
            }

            // 3. Try Payments.lk lookup API for the reference
            if (!resolvedPaymentId && targetRef) {
              try {
                const pLookup = await fetch(
                  `https://api.payments.lk/v1/payments?reference=${encodeURIComponent(targetRef)}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${secretKey}`,
                    },
                  }
                );
                if (pLookup.ok) {
                  const pData = await pLookup.json();
                  const list = Array.isArray(pData) ? pData : (pData.data || [pData]);
                  const found = list.find((it) => it && (it.reference === targetRef || it.id));
                  if (found?.id && !found.id.startsWith('AZH-')) {
                    resolvedPaymentId = found.id;
                  }
                }
              } catch (pErr) {
                console.warn('[Refund paymentId Payments.lk API lookup warning]:', pErr);
              }
            }
          }

          // If still no valid payment ID found, return clear, actionable error instead of obscure 400
          if (!resolvedPaymentId || resolvedPaymentId.startsWith('AZH-')) {
            return new Response(
              JSON.stringify({
                error: `No Payments.lk transaction ID found for order #${targetRef || 'unknown'}. Please provide the Payment ID (e.g. pay_...) from your Payments.lk Merchant Portal.`,
                code: 'PAYMENT_ID_REQUIRED',
                orderId: targetRef,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const idempotencyKey = `refund-${resolvedPaymentId}-${amountCents}-${Date.now()}`;
          const refundResp = await fetch('https://api.payments.lk/v1/refunds', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Idempotency-Key': idempotencyKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: resolvedPaymentId,
              amountCents,
              reason: reason || 'Merchant issued refund via Azhai Admin',
            }),
          });

          const refundData = await refundResp.json();

          if (!refundResp.ok) {
            const errorMsg = refundData.message || refundData.error || 'Refund failed at Payments.lk processor';
            return new Response(
              JSON.stringify({
                error: errorMsg,
                details: refundData,
                paymentId: resolvedPaymentId,
              }),
              { status: refundResp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
            JSON.stringify({ ...refundData, paymentId: resolvedPaymentId }),
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
            patchPayload.admin_notes = `Paid via Payments.lk 3DS (Payment ID: ${paymentId})`;
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
