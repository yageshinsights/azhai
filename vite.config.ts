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

          // ── Payments.lk Dev Server Proxy ────────────────────────────
          const paymentsLkSecret = env.PAYMENTS_LK_SECRET_KEY || 'sk_test_A9ybTZkoMw9HrgiAvcAlFNdKqp6Kp7hm';

          server.middlewares.use('/api/create-payments-lk-checkout', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (c) => { body += c; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body);
                  const pResp = await fetch('https://api.payments.lk/v1/checkouts', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${paymentsLkSecret}`,
                      'Idempotency-Key': `order-${parsed.orderId}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amountCents: parsed.amountCents,
                      description: parsed.description,
                      reference: String(parsed.orderId),
                      customer: parsed.customer,
                      successUrl: parsed.successUrl,
                      cancelUrl: parsed.cancelUrl,
                    }),
                  });
                  const data: any = await pResp.json();
                  res.statusCode = pResp.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    id: data.id,
                    url: data.url,
                    paymentId: data.payment?.id,
                    status: data.status,
                    error: data.error || data.message,
                  }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });

          server.middlewares.use('/api/refund-payments-lk', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (c) => { body += c; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body);
                  const pResp = await fetch('https://api.payments.lk/v1/refunds', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${paymentsLkSecret}`,
                      'Idempotency-Key': `ref-${parsed.paymentId}-${Date.now()}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      paymentId: parsed.paymentId,
                      amountCents: parsed.amountCents,
                      reason: parsed.reason,
                    }),
                  });
                  const data = await pResp.json();
                  res.statusCode = pResp.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });

          server.middlewares.use('/api/create-payments-lk-payment-link', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (c) => { body += c; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body);
                  const pResp = await fetch('https://api.payments.lk/v1/payment_links', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${paymentsLkSecret}`,
                      'Idempotency-Key': `plink-${Date.now()}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: parsed.title,
                      amountCents: parsed.amountCents,
                      description: parsed.description,
                    }),
                  });
                  const data = await pResp.json();
                  res.statusCode = pResp.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });

          // ── Confirm Card Order Dev Proxy ───────────────────────────
          server.middlewares.use('/api/confirm-card-order', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (c) => { body += c; });
              req.on('end', async () => {
                try {
                  const { orderId } = JSON.parse(body);
                  if (!orderId) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Order ID is required' }));
                    return;
                  }
                  const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                  const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

                  const patchRes = await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(orderId)}`, {
                    method: 'PATCH',
                    headers: {
                      'apikey': sKey,
                      'Authorization': `Bearer ${sKey}`,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({
                      payment_status: 'paid',
                      status: 'confirmed',
                      updated_at: new Date().toISOString(),
                    }),
                  });
                  const updated = await patchRes.json();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, updated }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });

          // ── Payments.lk Webhook Dev Proxy ──────────────────────────
          server.middlewares.use('/api/payments-lk-webhook', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (c) => { body += c; });
              req.on('end', async () => {
                try {
                  const event = JSON.parse(body);
                  const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                  const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

                  if (event.type === 'payment.succeeded') {
                    const reference = event.data?.reference;
                    const paymentId = event.data?.id;
                    if (reference && sUrl) {
                      await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(reference)}`, {
                        method: 'PATCH',
                        headers: {
                          'apikey': sKey,
                          'Authorization': `Bearer ${sKey}`,
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
                    if (reference && sUrl) {
                      await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(reference)}`, {
                        method: 'PATCH',
                        headers: {
                          'apikey': sKey,
                          'Authorization': `Bearer ${sKey}`,
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

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ received: true }));
                } catch (err: any) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
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

