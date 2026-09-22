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
                  const { orderId, amountCents, description, customer, successUrl, cancelUrl } = parsed;

                  const formatSriLankanPhone = (raw: any) => {
                    if (!raw) return undefined;
                    const digits = String(raw).replace(/\D/g, '');
                    if (digits.startsWith('94') && digits.length === 11) return '0' + digits.slice(2);
                    if (!digits.startsWith('0') && digits.length === 9) return '0' + digits;
                    if (digits.startsWith('0') && digits.length === 10) return digits;
                    return digits.length >= 9 ? digits : undefined;
                  };

                  const cleanName = customer?.name ? String(customer.name).trim() : undefined;
                  const cleanEmail = customer?.email ? String(customer.email).trim() : undefined;
                  const cleanPhone = formatSriLankanPhone(customer?.phone);
                  const cleanAddress = customer?.address ? String(customer.address).trim() : undefined;
                  const cleanCity = customer?.city ? String(customer.city).trim() : undefined;
                  const cleanPostal = customer?.postalCode ? String(customer.postalCode).trim() : undefined;

                  const candidates: Array<{ name: string; payload: any }> = [];

                  if (cleanName || cleanEmail || cleanPhone) {
                    const cust1: any = {};
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
                        successUrl,
                        cancelUrl,
                      },
                    });
                  }

                  if (cleanName || cleanEmail || cleanPhone) {
                    const cust2: any = {};
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
                        successUrl,
                        cancelUrl,
                      },
                    });
                  }

                  if (cleanName && cleanEmail) {
                    candidates.push({
                      name: 'guide-name-email-prefill',
                      payload: {
                        amountCents: Math.round(Number(amountCents)),
                        description: description || `Azhai Order #${orderId}`,
                        reference: String(orderId),
                        customer: { name: cleanName, email: cleanEmail },
                        successUrl,
                        cancelUrl,
                      },
                    });
                  }

                  candidates.push({
                    name: 'guaranteed-core',
                    payload: {
                      amountCents: Math.round(Number(amountCents)),
                      description: description || `Azhai Order #${orderId}`,
                      reference: String(orderId),
                      successUrl,
                      cancelUrl,
                    },
                  });

                  let pResp: any = null;
                  let data: any = null;
                  let successTier: string | null = null;

                  for (const candidate of candidates) {
                    try {
                      pResp = await fetch('https://api.payments.lk/v1/checkouts', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${paymentsLkSecret}`,
                          'Idempotency-Key': `order-${orderId}-${candidate.name}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(candidate.payload),
                      });
                      data = await pResp.json();
                      if (pResp.ok && data?.url) {
                        successTier = candidate.name;
                        break;
                      }
                    } catch (e) {
                      // continue cascade
                    }
                  }

                  res.statusCode = pResp ? pResp.status : 500;
                  res.setHeader('Content-Type', 'application/json');
                  const errDetail = typeof data === 'object' ? JSON.stringify(data) : String(data);
                  res.end(JSON.stringify({
                    id: data?.id,
                    url: data?.url,
                    paymentId: data?.payment?.id,
                    status: data?.status,
                    tier: successTier,
                    error: res.statusCode !== 200 ? (data?.message ? `${data.message} (${errDetail})` : errDetail) : undefined,
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
                  let { paymentId, orderId, reference, amountCents, reason, adminNotes } = parsed;
                  const targetRef = orderId || reference || (paymentId?.startsWith('AZH-') ? paymentId : null);

                  if (!amountCents) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing required refund field: amountCents' }));
                    return;
                  }

                  let resolvedPaymentId = paymentId;
                  const isOrderRef = !resolvedPaymentId || resolvedPaymentId.startsWith('AZH-') || (targetRef && resolvedPaymentId === targetRef);

                  if (isOrderRef) {
                    resolvedPaymentId = null;

                    if (adminNotes) {
                      const noteMatch =
                        adminNotes.match(/Payment ID:\s*([a-zA-Z0-9_\-]+)/i) ||
                        adminNotes.match(/pay_[a-zA-Z0-9_\-]+/i);
                      if (noteMatch) {
                        resolvedPaymentId = noteMatch[1] || noteMatch[0];
                      }
                    }

                    const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                    const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

                    if (!resolvedPaymentId && targetRef && sUrl && sKey) {
                      try {
                        const ordLookup = await fetch(
                          `${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(targetRef)}&select=admin_notes,payment_status`,
                          { headers: { apikey: sKey, Authorization: `Bearer ${sKey}` } }
                        );
                        if (ordLookup.ok) {
                          const ordRows: any = await ordLookup.json();
                          if (ordRows && ordRows[0]?.admin_notes) {
                            const match =
                              ordRows[0].admin_notes.match(/Payment ID:\s*([a-zA-Z0-9_\-]+)/i) ||
                              ordRows[0].admin_notes.match(/pay_[a-zA-Z0-9_\-]+/i);
                            if (match) resolvedPaymentId = match[1] || match[0];
                          }
                        }
                      } catch (dbErr) {
                        console.warn('[Vite Proxy Refund DB lookup warning]:', dbErr);
                      }
                    }

                    if (!resolvedPaymentId && targetRef) {
                      try {
                        const pLookup = await fetch(
                          `https://api.payments.lk/v1/payments?reference=${encodeURIComponent(targetRef)}`,
                          { headers: { Authorization: `Bearer ${paymentsLkSecret}` } }
                        );
                        if (pLookup.ok) {
                          const pData: any = await pLookup.json();
                          const list = Array.isArray(pData) ? pData : (pData?.data || [pData]);
                          const found = list.find((it: any) => it && (it.reference === targetRef || it.id));
                          if (found?.id && !found.id.startsWith('AZH-')) {
                            resolvedPaymentId = found.id;
                          }
                        }
                      } catch (pErr) {
                        console.warn('[Vite Proxy Refund Payments.lk API lookup warning]:', pErr);
                      }
                    }
                  }

                  if (!resolvedPaymentId || resolvedPaymentId.startsWith('AZH-')) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: `No Payments.lk transaction ID found for order #${targetRef || 'unknown'}. Please provide the Payment ID (e.g. pay_...) from your Payments.lk Merchant Portal.`,
                      code: 'PAYMENT_ID_REQUIRED',
                      orderId: targetRef,
                    }));
                    return;
                  }

                  const pResp = await fetch('https://api.payments.lk/v1/refunds', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${paymentsLkSecret}`,
                      'Idempotency-Key': `ref-${resolvedPaymentId}-${Date.now()}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      paymentId: resolvedPaymentId,
                      amountCents: parsed.amountCents,
                      reason: reason || 'Merchant issued refund via Azhai Admin',
                    }),
                  });
                  const data: any = await pResp.json();
                  res.statusCode = pResp.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(typeof data === 'object' && data !== null ? { ...data, paymentId: resolvedPaymentId } : data));
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
                  const { orderId, paymentId } = JSON.parse(body);
                  if (!orderId) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Order ID is required' }));
                    return;
                  }
                  const sUrl = env.VITE_SUPABASE_URL || 'https://hrmcxxcrnxqhesiywqsc.supabase.co';
                  const sKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-ZSOc4XGHM2OysLhqKZ5yQ_4OPgdcAm';

                  const patchPayload: Record<string, any> = {
                    payment_status: 'paid',
                    status: 'pending',
                    updated_at: new Date().toISOString(),
                  };
                  if (paymentId) {
                    patchPayload.admin_notes = `Paid via Payments.lk 3DS (Payment ID: ${paymentId})`;
                  }

                  const patchRes = await fetch(`${sUrl}/rest/v1/orders?order_code=eq.${encodeURIComponent(orderId)}`, {
                    method: 'PATCH',
                    headers: {
                      'apikey': sKey,
                      'Authorization': `Bearer ${sKey}`,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(patchPayload),
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

