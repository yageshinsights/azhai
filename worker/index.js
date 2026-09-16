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

          const checkoutPayload = {
            amountCents,
            description: description || `Azhai Order #${orderId}`,
            reference: String(orderId),
            customer: customer
              ? {
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone || undefined,
                }
              : undefined,
            successUrl: successUrl || `${url.origin}/order-success/${orderId}?payments_lk=success`,
            cancelUrl: cancelUrl || `${url.origin}/checkout?status=cancelled&order_id=${orderId}`,
          };

          const pResp = await fetch('https://api.payments.lk/v1/checkouts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Idempotency-Key': `order-${orderId}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutPayload),
          });

          const pData = await pResp.json();

          if (!pResp.ok) {
            return new Response(
              JSON.stringify({ error: pData.message || pData.error || 'Payments.lk API returned an error', details: pData }),
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

    // ── 5. Payments.lk Webhook Receiver ────────────────────────
    if (url.pathname === '/api/payments-lk-webhook') {
      if (request.method === 'POST') {
        try {
          const rawBody = await request.text();
          const signatureHeader = request.headers.get('payments-signature');
          const webhookSecret = env.PAYMENTS_LK_WEBHOOK_SECRET;

          // If webhook secret configured, verify signature
          if (webhookSecret && signatureHeader) {
            const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')));
            const t = Number(parts.t);
            const toleranceSeconds = 300;
            if (t && Math.abs(Date.now() / 1000 - t) <= toleranceSeconds) {
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
                return new Response('Invalid webhook signature', { status: 400, headers: corsHeaders });
              }
            }
          }

          const event = JSON.parse(rawBody);
          const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
          const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

          if (event.type === 'payment.succeeded') {
            const reference = event.data?.reference;
            const paymentId = event.data?.id;

            if (reference && supabaseUrl) {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${encodeURIComponent(reference)}`, {
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
                }),
              });
            }
          } else if (event.type === 'refund.succeeded') {
            const reference = event.data?.reference;
            if (reference && supabaseUrl) {
              await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${encodeURIComponent(reference)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_status: 'refunded',
                  admin_notes: `Refunded via Payments.lk (${event.data?.id})`,
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

    // Falls back to SPA static assets
    return env.ASSETS.fetch(request);
  },
};
