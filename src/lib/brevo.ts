/**
 * Brevo (formerly Sendinblue) Transactional Email & Marketing Automation Engine
 * for Azhai Clothing by Preethi
 * Official Boutique Domain: azhaiclothing.lk
 * Official Inquiries & Orders: orders@azhaiclothing.lk
 */

const BREVO_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_API_KEY) || '';
const SENDER_EMAIL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SENDER_EMAIL) || 'orders@azhaiclothing.lk';
const SENDER_NAME = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SENDER_NAME) || 'Azhai Clothing by Preethi';
const STORE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STORE_URL) || 'https://azhaiclothing.lk';

// Supabase Public Storage Brand Asset URL (Publicly accessible in all email inboxes)
export const LOGO_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BRAND_LOGO_URL) ||
  'https://hrmcxxcrnxqhesiywqsc.supabase.co/storage/v1/object/public/product-images/brand/logo-gold.png';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailPayload {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  replyTo?: EmailRecipient;
}

export async function sendBrevoEmail(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
  const emailBody = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: payload.to,
    subject: payload.subject,
    htmlContent: payload.htmlContent,
    replyTo: payload.replyTo || { name: SENDER_NAME, email: SENDER_EMAIL },
  };

  // 1. Try server-side proxy endpoint (/api/send-email) which bypasses browser CORS.
  // In production (Cloudflare Worker), the worker securely holds the Brevo API key as a secret.
  try {
    const proxyRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: BREVO_API_KEY || undefined,
        payload: emailBody,
      }),
    });

    if (proxyRes.ok) {
      console.log(`[Brevo Email Sent via Server Proxy]: Dispatched to ${payload.to.map(t => t.email).join(', ')}`);
      return { success: true };
    }

    const errData = await proxyRes.json().catch(() => ({}));
    console.warn('[Brevo Proxy Non-200]:', errData);
  } catch (proxyErr) {
    console.warn('[Brevo Proxy Unreachable, trying direct fetch]:', proxyErr);
  }

  // 2. Direct fallback to Brevo REST API (only if client has direct API key)
  if (!BREVO_API_KEY) {
    console.warn(`[Brevo Email]: Proxy failed or unreachable, and no client VITE_BREVO_API_KEY for direct fallback.`);
    return { success: false, error: 'Email service unreachable' };
  }

  // 2. Direct fallback to Brevo REST API
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Brevo Email Direct Error]:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    console.log(`[Brevo Email Sent Direct]: Dispatched to ${payload.to.map(t => t.email).join(', ')}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Brevo Fetch Exception]:', err);
    return { success: false, error: err?.message || 'Network/CORS error communicating with Brevo' };
  }
}

export const BREVO_LISTS = {
  NEWSLETTER: 5, // "VIP Newsletter Subscribers"
  CUSTOMERS: 6,  // "Atelier Customers & Orders"
  MEMBERS: 7,    // "Registered Members"
} as const;

export interface BrevoContactPayload {
  email: string;
  name?: string;
  attributes?: Record<string, any>;
  listIds?: number[];
}

/**
 * Creates or updates a subscriber in Brevo's master Contact list & CRM
 */
export async function createOrUpdateBrevoContact(
  payload: BrevoContactPayload
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const contactBody: Record<string, any> = {
    email: cleanEmail,
    updateEnabled: true,
    listIds: payload.listIds || [BREVO_LISTS.NEWSLETTER],
  };

  const attributes: Record<string, any> = { ...payload.attributes };
  if (payload.name) {
    const parts = payload.name.trim().split(/\s+/);
    attributes.FIRSTNAME = parts[0];
    if (parts.length > 1) {
      attributes.LASTNAME = parts.slice(1).join(' ');
    }
  }
  if (Object.keys(attributes).length > 0) {
    contactBody.attributes = attributes;
  }

  // 1. Try server-side proxy endpoint (/api/create-brevo-contact)
  try {
    const proxyRes = await fetch('/api/create-brevo-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: BREVO_API_KEY || undefined,
        payload: contactBody,
      }),
    });

    if (proxyRes.ok || proxyRes.status === 204) {
      console.log(`[Brevo Contact Synced via Proxy]: ${cleanEmail}`);
      return { success: true };
    }

    const errData = await proxyRes.json().catch(() => ({}));
    console.warn('[Brevo Contact Proxy Non-200]:', errData);
  } catch (proxyErr) {
    console.warn('[Brevo Contact Proxy Unreachable, attempting direct fetch]:', proxyErr);
  }

  // 2. Direct fallback (if client has direct API key)
  if (!BREVO_API_KEY) {
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(contactBody),
    });

    if (response.ok || response.status === 204) {
      console.log(`[Brevo Contact Synced Direct]: ${cleanEmail}`);
      return { success: true };
    }

    const errData = await response.json().catch(() => ({}));
    console.error('[Brevo Contact Direct Error]:', errData);
    return { success: false, error: errData.message || 'Failed to sync contact with Brevo' };
  } catch (err: any) {
    console.error('[Brevo Contact Fetch Exception]:', err);
    return { success: false, error: err?.message || 'Network error syncing contact' };
  }
}

// ── SHARED LUXURY EMAIL WRAPPER WITH EXACT BRAND LOGO & GOLD TRIM ──
function wrapEmailLayout(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FCFBF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #110B0E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFBF8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 1px solid #DFBF77; overflow: hidden; box-shadow: 0 12px 36px rgba(112, 22, 38, 0.07);">
          
          <!-- Top Atelier Header with Exact Brand Logo -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); padding: 26px 20px 22px 20px; border-bottom: 3px solid #C5A059;">
              <a href="${STORE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img 
                  src="${LOGO_URL}" 
                  alt="Azhai Clothing by Preethi" 
                  style="max-height: 52px; width: auto; max-width: 220px; display: block; margin: 0 auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"
                />
              </a>
              <p style="margin: 8px 0 0 0; font-size: 9.5px; text-transform: uppercase; letter-spacing: 3.5px; color: #DFBF77; font-weight: bold;">
                Boutique Couture & Handlooms
              </p>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 32px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Dynamic Editorial Lookbook Footer Banner -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div style="background: linear-gradient(135deg, #FCFBF8 0%, #F7F4EE 100%); border-radius: 18px; border: 1px solid #DFBF77; padding: 20px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #701626; text-align: center;">Festive Atelier Releases</p>
                <p style="margin: 0 0 14px 0; font-size: 12px; color: #6D6268; text-align: center;">Featherlight hand-painted organzas & pure temple silks</p>
                
                <!-- Strictly Centered 3-Column Image Table for all Email Clients -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 14px auto; text-align: center;">
                  <tr>
                    <td style="padding: 0 5px;" align="center" valign="middle">
                      <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80" alt="Kurti Set" style="width: 82px; height: 98px; object-fit: cover; border-radius: 10px; border: 1px solid #DFBF77; display: block;" />
                    </td>
                    <td style="padding: 0 5px;" align="center" valign="middle">
                      <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80" alt="Lotus Saree" style="width: 82px; height: 98px; object-fit: cover; border-radius: 10px; border: 1px solid #DFBF77; display: block;" />
                    </td>
                    <td style="padding: 0 5px;" align="center" valign="middle">
                      <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80" alt="Silk Shawl" style="width: 82px; height: 98px; object-fit: cover; border-radius: 10px; border: 1px solid #DFBF77; display: block;" />
                    </td>
                  </tr>
                </table>

                <div style="text-align: center;">
                  <a href="${STORE_URL}/collections" style="display: inline-block; font-size: 11px; font-weight: bold; color: #701626; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; border-bottom: 1px solid #701626; padding-bottom: 2px;">
                    Explore Lookbook ↗
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Boutique Contact Footer -->
          <tr>
            <td align="center" style="background-color: #F7F4EE; padding: 24px 20px; border-top: 1px solid #DFBF77; font-size: 11px; color: #6D6268; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #701626; text-transform: uppercase; letter-spacing: 1.5px;">Azhai Clothing Colombo</p>
              <p style="margin: 0 0 8px 0;">Handloom, Mulberry Silk & Bespoke Tailoring · Colombo, Sri Lanka</p>
              <p style="margin: 0; font-size: 10.5px; color: #9B9197;">
                Inquiries & Sizing Concierge: <a href="mailto:orders@azhaiclothing.lk" style="color: #701626; font-weight: bold; text-decoration: none;">orders@azhaiclothing.lk</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ─────────────────────────────────────────────────────────────
// 1. 🌟 WELCOME TO AZHAI ATELIER EMAIL (WITH DYNAMIC HERO BANNER)
// ─────────────────────────────────────────────────────────────
export function buildWelcomeEmailHtml(params: { customerName: string; email: string }): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <!-- Editorial Welcome Hero Banner Image -->
    <div style="margin-bottom: 24px; border-radius: 18px; overflow: hidden; border: 1px solid #DFBF77; position: relative;">
      <img 
        src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85" 
        alt="Azhai Couture" 
        style="width: 100%; height: 210px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.4);">
        Atelier Welcome
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 25px; margin: 14px 0 8px 0; font-weight: bold;">
        Welcome to the Inner Circle, ${firstName}
      </h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        You have entered the home of artisanal handlooms, featherlight mulberry silks, and bespoke tailoring designed by Preethi.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <h3 style="font-family: Georgia, serif; font-size: 14px; color: #701626; margin: 0 0 10px 0;">Your Patron Privileges:</h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #110B0E; line-height: 1.8;">
        <li><strong>Bespoke Silhouette Studio:</strong> Save your custom waist, bust & sleeve measurements for 1-tap tailoring.</li>
        <li><strong>VIP Live Order Tracking:</strong> Real-time updates from our cutting table to your doorstep.</li>
        <li><strong>Complimentary Alteration Support:</strong> 1.5-inch inner seam margin on all tailored garments.</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${STORE_URL}/collections" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 30px; border-radius: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(112, 22, 38, 0.25);">
        Explore Signature Collections →
      </a>
    </div>
  `;
  return wrapEmailLayout('Welcome to Azhai Atelier', body);
}

// ─────────────────────────────────────────────────────────────
// 2. 🛍️ CUSTOMER ORDER CONFIRMATION (WITH PRODUCT IMAGES & TAILORING)
// ─────────────────────────────────────────────────────────────
export function buildOrderConfirmationHtml(order: {
  orderId: string;
  customerName: string;
  total: number;
  items: { name: string; size?: string; quantity: number; price: string; image?: string; tailoring?: any }[];
  deliveryMethod: string;
  paymentMethod: string;
  bankTransferDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchName?: string;
    swiftCode?: string;
    customInstructions?: string;
  };
}): string {
  const firstName = order.customerName ? order.customerName.split(' ')[0] : 'Valued Patron';
  const isBankTransfer = 
    Boolean(order.bankTransferDetails) || 
    (order.paymentMethod && order.paymentMethod.toLowerCase().includes('bank'));
  
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E0D8; vertical-align: top; width: 75px;">
          <img 
            src="${item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}" 
            alt="${item.name}" 
            style="width: 68px; height: 86px; object-fit: cover; border-radius: 12px; border: 1px solid #DFBF77; display: block;" 
          />
        </td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #E5E0D8; vertical-align: top;">
          <strong style="color: #110B0E; font-size: 13.5px; font-family: Georgia, serif;">${item.name}</strong><br>
          <span style="font-size: 11px; color: #6D6268;">Size: <strong style="color: #701626;">${item.size || 'M'}</strong> | Qty: ${item.quantity}</span>
          ${
            item.tailoring
              ? `<div style="margin-top: 6px; font-size: 10px; color: #701626; font-weight: bold; background: #F7F4EE; padding: 4px 8px; border-radius: 6px; border: 1px solid #DFBF77; display: inline-block;">
                  ✂️ Bespoke Custom Fitting (${item.tailoring.leadTime || '4-7 days'})
                 </div>`
              : ''
          }
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E0D8; vertical-align: top; text-align: right; color: #701626; font-weight: bold; font-size: 13.5px; white-space: nowrap;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join('');

  const bankHtml = isBankTransfer ? `
    <!-- Direct Bank Deposit Instructions Table -->
    <div style="background-color: #FFFFFF; border-radius: 16px; border: 2px solid #DFBF77; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <span style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #701626;">
              Direct Bank Deposit Details
            </span>
            <h4 style="font-family: Georgia, serif; font-size: 16px; color: #110B0E; margin: 4px 0 12px 0;">
              ${order.bankTransferDetails?.bankName || 'Bank Transfer Account'}
            </h4>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0" style="font-size: 12px; background-color: #FCFBF8; border-radius: 10px; border: 1px solid #E5E0D8;">
              <tr>
                <td style="color: #6D6268; width: 38%;"><strong>Account Holder:</strong></td>
                <td style="color: #110B0E; font-weight: bold;">${order.bankTransferDetails?.accountName || 'Azhai Clothing (Pvt) Ltd'}</td>
              </tr>
              <tr>
                <td style="color: #6D6268;"><strong>Account Number:</strong></td>
                <td style="color: #701626; font-family: monospace; font-size: 14px; font-weight: bold;">${order.bankTransferDetails?.accountNumber || 'Pending Account #'}</td>
              </tr>
              ${order.bankTransferDetails?.branchName ? `
              <tr>
                <td style="color: #6D6268;"><strong>Branch:</strong></td>
                <td style="color: #110B0E;">${order.bankTransferDetails.branchName}</td>
              </tr>` : ''}
              ${order.bankTransferDetails?.swiftCode ? `
              <tr>
                <td style="color: #6D6268;"><strong>SWIFT Code:</strong></td>
                <td style="color: #110B0E; font-family: monospace;">${order.bankTransferDetails.swiftCode}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #6D6268;"><strong>Exact Amount:</strong></td>
                <td style="color: #701626; font-weight: bold; font-size: 14px;">LKR ${order.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #6D6268;"><strong>Payment Reference:</strong></td>
                <td style="color: #110B0E; font-family: monospace; font-weight: bold;">#${order.orderId}</td>
              </tr>
            </table>
            <p style="font-size: 11px; color: #6D6268; margin: 12px 0 0 0; line-height: 1.5;">
              Once deposited, please reply to this email with your slip or send it to our WhatsApp concierge (+94 77 123 4567). Your order will be confirmed and processed immediately upon verification.
            </p>
          </td>
        </tr>
      </table>
    </div>
  ` : '';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: ${isBankTransfer ? '#FFF8E1' : '#E8F5E9'}; color: ${isBankTransfer ? '#B78103' : '#2E7D32'}; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        ${isBankTransfer ? 'Awaiting Bank Deposit · Order Reserved' : `Order Placed #${order.orderId}`}
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 25px; margin: 12px 0 6px 0;">Thank you, ${firstName}</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        ${isBankTransfer 
          ? 'Your handcrafted pieces have been reserved. Please complete your bank transfer using the instructions below.' 
          : 'Your handcrafted order has been received by our Colombo atelier and is being carefully tailored for dispatch.'}
      </p>
    </div>

    ${bankHtml}

    <!-- Itemized Products Table with Images -->
    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 20px; margin-bottom: 24px;">
      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #701626; margin: 0 0 14px 0; font-weight: bold;">
        Itemized Receipt
      </h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${itemsHtml}
      </table>

      <div style="margin-top: 18px; padding-top: 14px; border-top: 2px solid #701626; text-align: right;">
        <p style="font-size: 18px; font-weight: bold; color: #701626; margin: 0; font-family: Georgia, serif;">
          Total Amount: LKR ${order.total.toLocaleString()}
        </p>
        <p style="font-size: 11px; color: #6D6268; margin: 6px 0 0 0;">
          Payment Method: <strong>${order.paymentMethod}</strong><br>
          Delivery: <strong>${order.deliveryMethod}</strong>
        </p>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/account?tab=orders" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 26px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(112, 22, 38, 0.2);">
        Track Live in My Orders →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Order Confirmed #${order.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 3. 🚨 ADMIN NEW ORDER NOTIFICATION
// ─────────────────────────────────────────────────────────────
export function buildAdminOrderAlertHtml(order: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  district: string;
  total: number;
  items: { name: string; size?: string; quantity: number; price: string; image?: string; tailoring?: any }[];
  deliveryMethod: string;
  paymentMethod: string;
}): string {
  const itemsHtml = order.items
    .map(
      (item) => {
        let tailoringInfo = '';
        if (item.tailoring) {
          const measures = item.tailoring.measurements && typeof item.tailoring.measurements === 'object'
            ? Object.entries(item.tailoring.measurements)
                .filter(([_, val]) => val !== undefined && val !== null && val !== '')
                .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}"`)
                .join(' · ')
            : '';
          tailoringInfo = `<br><small style="color: #701626; font-weight: bold;">✂️ Bespoke Fitting: ${item.tailoring.dressTypeName || item.tailoring.sizeLabel}${measures ? ` (${measures})` : ''}</small>`;
        }

        return `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #ddd; width: 60px;">
          <img src="${item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 8px;" />
        </td>
        <td style="padding: 10px 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.name}</strong> (${item.size || 'M'} x ${item.quantity})
          ${tailoringInfo}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #701626;">
          ${item.price}
        </td>
      </tr>
    `;
      }
    )
    .join('');

  const body = `
    <h2 style="font-family: Georgia, serif; color: #701626; margin-top: 0;">🛍️ New Order Received: #${order.orderId}</h2>
    <div style="background-color: #F7F4EE; padding: 18px; border-radius: 14px; margin-bottom: 18px; font-size: 13px; line-height: 1.6;">
      <p style="margin: 0;"><strong>Patron:</strong> ${order.customerName}</p>
      <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:${order.customerPhone}" style="color: #701626; font-weight: bold;">${order.customerPhone}</a></p>
      <p style="margin: 0;"><strong>Email:</strong> ${order.customerEmail}</p>
      <p style="margin: 0;"><strong>Destination:</strong> ${order.customerAddress}, ${order.city}, ${order.district}</p>
      <p style="margin: 0;"><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p style="margin: 0;"><strong>Delivery:</strong> ${order.deliveryMethod}</p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px;">
      ${itemsHtml}
    </table>

    <div style="text-align: right; padding-top: 14px; font-size: 17px; font-weight: bold; color: #701626;">
      Total Collected: LKR ${order.total.toLocaleString()}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${STORE_URL}/admin/orders" style="display: inline-block; background-color: #701626; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        Open Order in Master Admin →
      </a>
    </div>
  `;
  return wrapEmailLayout(`New Order Alert #${order.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 4. ✂️ IN ATELIER TAILORING & CUTTING PROGRESS
// ─────────────────────────────────────────────────────────────
export function buildOrderProcessingHtml(params: {
  orderId: string;
  customerName: string;
  items: { name: string; size?: string; quantity: number; image?: string }[];
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <!-- Atelier Workshop Banner Image -->
    <div style="margin-bottom: 22px; border-radius: 16px; overflow: hidden; border: 1px solid #DFBF77;">
      <img 
        src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80" 
        alt="Atelier Crafting" 
        style="width: 100%; height: 180px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(197, 160, 89, 0.15); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px; border: 1px solid #DFBF77;">
        ✂️ Atelier Crafting in Progress
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">On the Cutting Table, ${firstName}</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Your order <strong>#${params.orderId}</strong> is in the skilled hands of our master tailors.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 16px; border: 1px solid #DFBF77; padding: 20px; margin-bottom: 24px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #701626; margin: 0 0 10px 0;">Crafting Timeline</h3>
      <p style="font-size: 12px; color: #110B0E; line-height: 1.8; margin: 0;">
        • <strong>Fabric Inspection & Hand-Cutting:</strong> Completed<br>
        • <strong>Precision Seaming & Lining:</strong> In Progress<br>
        • <strong>Quality Assurance & Packaging:</strong> Next (estimated dispatch in 1–2 days)
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/account?tab=orders" style="display: inline-block; background-color: #701626; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        View Atelier Progress →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Atelier Progress #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 5. 🚚 ORDER SHIPPED & IN TRANSIT (WITH EXPRESS COURIER BANNER)
// ─────────────────────────────────────────────────────────────
export function buildOrderShippedHtml(params: {
  orderId: string;
  customerName: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  destinationCity: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const trackLink = params.trackingUrl || `${STORE_URL}/account?tab=orders`;

  const body = `
    <!-- Transit Visual Header -->
    <div style="margin-bottom: 22px; border-radius: 16px; overflow: hidden; border: 1px solid #DFBF77;">
      <img 
        src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80" 
        alt="In Transit" 
        style="width: 100%; height: 180px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #E3F2FD; color: #1565C0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        🚚 Dispatched & In Transit
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Your Package is on the Way, ${firstName}</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Your Azhai parcel <strong>#${params.orderId}</strong> has been dispatched for express delivery to ${params.destinationCity}.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D6268; margin: 0;">Courier Partner</p>
      <p style="font-size: 17px; font-weight: bold; color: #701626; margin: 4px 0 14px 0;">${params.courierName}</p>
      
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D6268; margin: 0;">Waybill / Tracking Number</p>
      <p style="font-family: monospace; font-size: 19px; font-weight: bold; color: #110B0E; margin: 4px 0 18px 0; letter-spacing: 2.5px;">
        ${params.trackingNumber}
      </p>

      <a href="${trackLink}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 26px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(112, 22, 38, 0.2);">
        Track Live Parcel →
      </a>
    </div>

    <p style="font-size: 11px; color: #6D6268; text-align: center; margin: 0;">
      Please ensure someone is available at the delivery destination to receive your boutique parcel.
    </p>
  `;
  return wrapEmailLayout(`Dispatched: Order #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 6. 📦 DELIVERED TO YOUR DOOR EMAIL
// ─────────────────────────────────────────────────────────────
export function buildOrderDeliveredHtml(params: {
  orderId: string;
  customerName: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #E8F5E9; color: #2E7D32; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        ✨ Delivered with Grace
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Enjoy Your Masterpiece, ${firstName}</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Your order <strong>#${params.orderId}</strong> has been successfully delivered. We hope you cherish every handwoven detail.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <h3 style="font-family: Georgia, serif; font-size: 13.5px; color: #701626; margin: 0 0 10px 0;">Handloom & Silk Care Instructions</h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 11.5px; color: #110B0E; line-height: 1.8;">
        <li>Dry clean recommended for hand-painted organza & pure zari silks.</li>
        <li>Gentle handwash in cold water with mild detergent for pure cotton handlooms.</li>
        <li>Warm iron on reverse side using a protective cloth.</li>
        <li>All bespoke garments include a 1.5" inner margin for any future fit adjustments.</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/account?tab=orders" style="display: inline-block; background-color: #701626; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        View Order & Receipt →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Delivered: Order #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 7. ❌ ORDER CANCELLED & REFUND EMAIL
// ─────────────────────────────────────────────────────────────
export function buildOrderCancelledHtml(params: {
  orderId: string;
  customerName: string;
  reason?: string;
  refundNote?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #FFEBEE; color: #C62828; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        Order Cancelled
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Notice of Cancellation, ${firstName}</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Your order <strong>#${params.orderId}</strong> has been cancelled.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 16px; border: 1px solid #DFBF77; padding: 20px; margin-bottom: 24px; font-size: 12.5px; line-height: 1.7;">
      <p style="margin: 0 0 8px 0;"><strong>Reason:</strong> ${params.reason || 'Customer request / Inventory adjustment'}</p>
      ${
        params.refundNote
          ? `<p style="margin: 0; color: #701626;"><strong>Refund Note:</strong> ${params.refundNote}</p>`
          : '<p style="margin: 0;">If you completed an online card payment, your refund will be credited back to your original payment method within 3–5 business days.</p>'
      }
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/collections" style="display: inline-block; background-color: #701626; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        Continue Shopping →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Order Cancelled #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 8. ⭐ POST-DELIVERY FIT & CRAFTSMANSHIP REVIEW EMAIL
// ─────────────────────────────────────────────────────────────
export function buildPostDeliveryFeedbackEmailHtml(params: {
  orderId: string;
  customerName: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <!-- Lookbook Review Banner -->
    <div style="margin-bottom: 22px; border-radius: 16px; overflow: hidden; border: 1px solid #DFBF77;">
      <img 
        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80" 
        alt="Azhai Patron Review" 
        style="width: 100%; height: 180px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        ⭐ Craftsmanship & Fit Feedback
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">How was your fit, ${firstName}?</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Every stitch in order <strong>#${params.orderId}</strong> was crafted with dedication. We would be honored to hear your thoughts.
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <p style="font-size: 13px; font-weight: bold; margin-bottom: 12px; color: #701626;">Rate Your Experience:</p>
      <div style="font-size: 28px; letter-spacing: 8px;">
        <a href="${STORE_URL}/contact?order=${params.orderId}&rating=5" style="text-decoration: none; color: #DFBF77;">⭐</a>
        <a href="${STORE_URL}/contact?order=${params.orderId}&rating=4" style="text-decoration: none; color: #DFBF77;">⭐</a>
        <a href="${STORE_URL}/contact?order=${params.orderId}&rating=3" style="text-decoration: none; color: #DFBF77;">⭐</a>
        <a href="${STORE_URL}/contact?order=${params.orderId}&rating=2" style="text-decoration: none; color: #DFBF77;">⭐</a>
        <a href="${STORE_URL}/contact?order=${params.orderId}&rating=1" style="text-decoration: none; color: #DFBF77;">⭐</a>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/contact?order=${params.orderId}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 26px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(112, 22, 38, 0.2);">
        Share Your Fit Review →
      </a>
    </div>
  `;
  return wrapEmailLayout(`How was your Azhai fit?`, body);
}

// ─────────────────────────────────────────────────────────────
// 9. 🛒 ABANDONED BAG RECOVERY EMAIL (WITH PRODUCT IMAGES & 5% PRIVILEGE)
// ─────────────────────────────────────────────────────────────
export function buildAbandonedCartEmailHtml(params: {
  customerName?: string;
  items: { name: string; price: string; size?: string; image?: string }[];
  couponCode?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const coupon = params.couponCode || 'ATELIER5';

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D8; width: 75px; vertical-align: middle;">
          <img 
            src="${item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80'}" 
            alt="${item.name}" 
            style="width: 68px; height: 86px; object-fit: cover; border-radius: 12px; border: 1px solid #DFBF77; display: block;" 
          />
        </td>
        <td style="padding: 12px 12px; border-bottom: 1px solid #E5E0D8; vertical-align: middle;">
          <strong style="color: #110B0E; font-size: 13.5px; font-family: Georgia, serif;">${item.name}</strong><br>
          <span style="font-size: 11px; color: #6D6268;">Size: <strong style="color: #701626;">${item.size || 'M'}</strong></span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E5E0D8; text-align: right; color: #701626; font-weight: bold; font-size: 13.5px; vertical-align: middle; white-space: nowrap;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join('');

  const body = `
    <!-- Reserved Bag Editorial Banner -->
    <div style="margin-bottom: 22px; border-radius: 16px; overflow: hidden; border: 1px solid #DFBF77;">
      <img 
        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80" 
        alt="Reserved Bag" 
        style="width: 100%; height: 180px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px;">
        Atelier Reserved
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">You left something exquisite behind</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, your handcrafted selections are reserved in your bag.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 20px; margin-bottom: 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${itemsHtml}
      </table>

      <div style="margin-top: 16px; padding: 14px; background-color: #F7F4EE; border-radius: 12px; text-align: center; border: 1px dashed #C5A059;">
        <p style="font-size: 11.5px; color: #701626; font-weight: bold; margin: 0;">
          Enjoy 5% Courtesy Privilege: Use code <span style="font-family: monospace; font-size: 13.5px; letter-spacing: 2px; background: #fff; padding: 3px 8px; border-radius: 6px; border: 1px solid #701626; color: #701626;">${coupon}</span> at checkout.
        </p>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/checkout" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 30px; border-radius: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(112, 22, 38, 0.25);">
        Complete Your Order →
      </a>
    </div>
  `;
  return wrapEmailLayout('Your Azhai bag is waiting for you', body);
}

// ─────────────────────────────────────────────────────────────
// 10. 💖 WISHLIST LOW STOCK ALERT EMAIL
// ─────────────────────────────────────────────────────────────
export function buildWishlistLowStockEmailHtml(params: {
  customerName?: string;
  productName: string;
  productPrice: string;
  productImage?: string;
  productUrl: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const imgUrl = params.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #FFF3E0; color: #E65100; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        Almost Sold Out
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Only a few pieces remain</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, an item from your boutique wishlist is almost out of stock.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px; text-align: center;">
      <img src="${imgUrl}" alt="${params.productName}" style="width: 140px; height: 180px; object-fit: cover; border-radius: 14px; border: 1px solid #DFBF77; margin-bottom: 12px;" />
      <h3 style="font-family: Georgia, serif; font-size: 18px; color: #701626; margin: 0 0 6px 0;">${params.productName}</h3>
      <p style="font-size: 16px; font-weight: bold; color: #110B0E; margin: 0 0 16px 0;">${params.productPrice}</p>
      
      <a href="${params.productUrl}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        Secure Yours Before It's Gone →
      </a>
    </div>
  `;
  return wrapEmailLayout('Your Wishlist Piece is Almost Gone', body);
}

// ─────────────────────────────────────────────────────────────
// 11. 🔐 SECURE PASSWORD RESET EMAIL
// ─────────────────────────────────────────────────────────────
export function buildPasswordResetEmailHtml(params: {
  customerName?: string;
  resetUrl: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Patron';
  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px;">
        Security Notice
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Password Reset Request</h2>
      <p style="color: #6D6268; font-size: 13px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, we received a request to reset your Azhai Atelier account password.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 12.5px; color: #110B0E; margin: 0 0 18px 0; line-height: 1.6;">
        Click the button below to set a new secure password. This secure link is valid for 1 hour.
      </p>
      <a href="${params.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(112, 22, 38, 0.2);">
        Reset My Password →
      </a>
    </div>

    <p style="font-size: 11px; color: #6D6268; text-align: center; margin: 0;">
      If you did not request this change, you can safely disregard this email.
    </p>
  `;
  return wrapEmailLayout('Reset Your Azhai Password', body);
}

// ─────────────────────────────────────────────────────────────
// 12. 🏦 BANK DEPOSIT SLIP SUBMITTED (CUSTOMER RECEIPT)
// ─────────────────────────────────────────────────────────────
export function buildBankSlipReceivedCustomerHtml(params: {
  orderId: string;
  customerName: string;
  total: number;
  bankName: string;
  referenceNumber?: string;
  slipUrl?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Valued Patron';
  const refDisplay = params.referenceNumber ? `<strong style="color: #701626;">${params.referenceNumber}</strong>` : 'Attached Deposit Slip';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(197, 160, 89, 0.15); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px; border: 1px solid #DFBF77;">
        Deposit Slip Received
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">We're Verifying Your Transfer</h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, thank you for submitting your bank transfer slip for Order <strong>#${params.orderId}</strong>.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Order ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #110B0E; text-align: right;">#${params.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Amount Deposited:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #701626; text-align: right; font-size: 15px;">LKR ${params.total.toLocaleString('en-US')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Target Bank:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #110B0E; text-align: right;">${params.bankName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Reference / Note:</td>
          <td style="padding: 6px 0; text-align: right;">${refDisplay}</td>
        </tr>
      </table>

      ${params.slipUrl ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #DFBF77; text-align: center;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6D6268; margin-bottom: 8px; font-weight: bold;">Submitted Slip Document</p>
          <a href="${params.slipUrl}" target="_blank" style="display: inline-block; font-size: 11.5px; color: #701626; font-weight: bold; text-decoration: underline;">
            View Uploaded Deposit Receipt ↗
          </a>
        </div>
      ` : ''}
    </div>

    <div style="background-color: rgba(112, 22, 38, 0.04); border-radius: 14px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 12px; color: #701626; margin: 0; line-height: 1.6; font-weight: 500;">
        ⏱ Our finance concierge cross-verifies bank statements every <strong>2 to 4 business hours</strong>. You will receive an instant confirmation as soon as your payment is reconciled!
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/order-success/${params.orderId}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 28px; border-radius: 12px; text-decoration: none;">
        Track Order Status →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Deposit Slip Received for #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 13. 🔔 BANK DEPOSIT SLIP SUBMITTED (ADMIN ALERT)
// ─────────────────────────────────────────────────────────────
export function buildBankSlipAdminAlertHtml(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  bankName: string;
  referenceNumber?: string;
  slipUrl?: string;
}): string {
  const body = `
    <div style="border-bottom: 2px solid #701626; padding-bottom: 12px; margin-bottom: 18px;">
      <span style="background: #701626; color: #DFBF77; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 3px 10px; border-radius: 6px;">
        Action Required
      </span>
      <h2 style="color: #701626; margin: 10px 0 4px 0; font-size: 20px;">Bank Slip Uploaded: Order #${params.orderId}</h2>
      <p style="color: #6D6268; margin: 0; font-size: 13px;">A patron has uploaded a bank transfer slip for verification.</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 7px 0; color: #6D6268; width: 140px;"><strong>Order ID:</strong></td>
        <td style="padding: 7px 0; color: #110B0E; font-weight: bold;">#${params.orderId}</td>
      </tr>
      <tr>
        <td style="padding: 7px 0; color: #6D6268;"><strong>Customer:</strong></td>
        <td style="padding: 7px 0; color: #110B0E;">${params.customerName} (${params.customerEmail})</td>
      </tr>
      <tr>
        <td style="padding: 7px 0; color: #6D6268;"><strong>Phone:</strong></td>
        <td style="padding: 7px 0; color: #110B0E;">${params.customerPhone || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 7px 0; color: #6D6268;"><strong>Deposited Amount:</strong></td>
        <td style="padding: 7px 0; color: #701626; font-weight: bold; font-size: 16px;">LKR ${params.total.toLocaleString('en-US')}</td>
      </tr>
      <tr>
        <td style="padding: 7px 0; color: #6D6268;"><strong>Credited Bank:</strong></td>
        <td style="padding: 7px 0; color: #110B0E;">${params.bankName}</td>
      </tr>
      <tr>
        <td style="padding: 7px 0; color: #6D6268;"><strong>Bank Reference:</strong></td>
        <td style="padding: 7px 0; color: #701626; font-weight: bold;">${params.referenceNumber || 'None entered'}</td>
      </tr>
    </table>

    ${params.slipUrl ? `
      <div style="background: #ffffff; border: 1px solid #E6DEC9; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <p style="font-size: 12px; font-weight: bold; color: #701626; margin: 0 0 10px 0;">Attached Slip Receipt</p>
        <a href="${params.slipUrl}" target="_blank" style="display: inline-block; background: #701626; color: #DFBF77; padding: 10px 20px; font-size: 11.5px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Open / Download Slip Document ↗
        </a>
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 20px;">
      <a href="${STORE_URL}/admin/orders" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 26px; border-radius: 10px; text-decoration: none;">
        Open Admin Order to Verify & Mark Paid →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Action: Bank Slip Uploaded for #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 14. 💳 DEDICATED BANK PAYMENT VERIFIED & CLEARED RECEIPT
// ─────────────────────────────────────────────────────────────
export function buildBankPaymentVerifiedHtml(params: {
  orderId: string;
  customerName: string;
  total: number;
  items: { name: string; size?: string; quantity: number; price: string; image?: string; tailoring?: any }[];
  deliveryMethod: string;
  adminNotes?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Valued Patron';

  const itemsRows = params.items.map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(197, 160, 89, 0.2);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            ${item.image ? `
              <td style="width: 48px; vertical-align: top; padding-right: 12px;">
                <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #DFBF77;" />
              </td>
            ` : ''}
            <td style="vertical-align: top;">
              <p style="margin: 0; font-weight: bold; color: #110B0E; font-size: 13px;">${item.name}</p>
              ${item.size ? `<span style="font-size: 11px; color: #6D6268;">Size: <strong>${item.size}</strong></span>` : ''}
              ${item.tailoring ? `<div style="font-size: 10px; color: #701626; font-weight: bold; margin-top: 2px;">✂️ Bespoke Tailored Garment</div>` : ''}
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #6D6268;">Qty: ${item.quantity}</p>
            </td>
            <td style="vertical-align: top; text-align: right; font-weight: bold; color: #110B0E; font-size: 13px;">
              ${item.price}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #E8F5E9; color: #2E7D32; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 5px 16px; border-radius: 20px; border: 1px solid #A5D6A7;">
        ✓ Payment Verified & Cleared
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 25px; margin: 14px 0 6px 0;">Your Order is Fully Confirmed</h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, your direct bank deposit has been successfully verified by the Azhai finance team.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #DFBF77; padding-bottom: 12px; margin-bottom: 14px;">
        <span style="font-size: 12px; color: #6D6268; text-transform: uppercase; letter-spacing: 1px;">Order Reference</span>
        <strong style="font-size: 13px; color: #701626;">#${params.orderId}</strong>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsRows}
      </table>

      <div style="margin-top: 16px; padding-top: 14px; border-top: 2px solid #701626; text-align: right;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D6268; font-weight: bold;">Cleared Total: </span>
        <strong style="font-size: 18px; color: #701626; font-family: Georgia, serif; margin-left: 8px;">LKR ${params.total.toLocaleString('en-US')}</strong>
      </div>
    </div>

    ${params.adminNotes ? `
      <div style="background-color: #F7F4EE; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; border-left: 3px solid #C5A059;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #701626; font-weight: bold; margin: 0 0 4px 0;">Atelier Note</p>
        <p style="font-size: 12.5px; color: #110B0E; margin: 0; line-height: 1.5;">${params.adminNotes}</p>
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${STORE_URL}/order-success/${params.orderId}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(112, 22, 38, 0.2);">
        Track Production & Dispatch →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Payment Cleared: Order #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 15. 💌 CUSTOMER INQUIRY AUTORESPONDER / CONFIRMATION
// ─────────────────────────────────────────────────────────────
export function buildCustomerInquiryConfirmationHtml(params: {
  customerName: string;
  topic: string;
  messageSnippet?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Valued Patron';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.4);">
        Atelier Concierge
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 14px 0 6px 0;">Thank You for Reaching Out</h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, your inquiry regarding <strong>"${params.topic}"</strong> has been warmly received by our Colombo atelier.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #110B0E; margin: 0 0 12px 0; line-height: 1.6;">
        Our lead designer Preethi and concierge team personally review all tailoring questions, fabric consultations, and order requests. We aim to respond within <strong>24 business hours</strong>.
      </p>

      ${params.messageSnippet ? `
        <div style="background: #ffffff; border-radius: 10px; border: 1px solid #E6DEC9; padding: 12px 14px; margin-top: 12px;">
          <div style="font-size: 10.5px; color: #C5A059; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 4px;">Summary of Your Inquiry</div>
          <p style="font-size: 12px; color: #6D6268; margin: 0; font-style: italic; line-height: 1.5;">"${params.messageSnippet}"</p>
        </div>
      ` : ''}
    </div>

    <div style="background-color: #F7F4EE; border-radius: 14px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 11.5px; color: #6D6268; margin: 0 0 8px 0;">Need immediate bridal consultation or sizing assistance?</p>
      <a href="https://wa.me/94777595955" style="display: inline-block; font-size: 12px; font-weight: bold; color: #25D366; text-decoration: none;">
        💬 Chat on WhatsApp with Preethi (+94 77 759 5955)
      </a>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/collections" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 26px; border-radius: 12px; text-decoration: none;">
        Browse New Arrivals →
      </a>
    </div>
  `;
  return wrapEmailLayout(`We Received Your Inquiry: ${params.topic}`, body);
}

// ─────────────────────────────────────────────────────────────
// 16. ✂️ BESPOKE TAILORING INSPECTION COMPLETE & READY FOR DISPATCH
// ─────────────────────────────────────────────────────────────
export function buildTailoringReadyEmailHtml(params: {
  orderId: string;
  customerName: string;
  dressTypeName: string;
  fabricName: string;
  sizeLabel: string;
  measurements?: Record<string, number>;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Valued Patron';

  const measurementItems = params.measurements 
    ? Object.entries(params.measurements).map(([k, v]) => `
        <span style="display: inline-block; background: #ffffff; border: 1px solid #DFBF77; padding: 4px 10px; border-radius: 8px; font-size: 11px; margin: 3px;">
          ${k}: <strong>${v}"</strong>
        </span>
      `).join('')
    : '';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.4);">
        Atelier Master Artisan Report
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Your Bespoke Creation is Ready</h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, your custom <strong>${params.dressTypeName}</strong> has passed our final seam quality inspection.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 22px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Order Reference:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #110B0E; text-align: right;">#${params.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Silhouette:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #701626; text-align: right;">${params.dressTypeName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Artisanal Fabric:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #110B0E; text-align: right;">${params.fabricName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6D6268;">Fitted Size:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #701626; text-align: right;">${params.sizeLabel}</td>
        </tr>
      </table>

      ${measurementItems ? `
        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #DFBF77;">
          <p style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: #6D6268; font-weight: bold; margin: 0 0 8px 0;">Tailored Dimensions Summary:</p>
          <div>${measurementItems}</div>
        </div>
      ` : ''}
    </div>

    <div style="background-color: rgba(197, 160, 89, 0.1); border-radius: 14px; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #110B0E; margin: 0; line-height: 1.6; text-align: center;">
        Your garment is now entering our steam-pressing room and will be encased in signature Azhai keepsake packaging for courier pickup today.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${STORE_URL}/order-success/${params.orderId}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 13px 28px; border-radius: 12px; text-decoration: none;">
        View Atelier Order Status →
      </a>
    </div>
  `;
  return wrapEmailLayout(`Your Tailored Garment is Complete #${params.orderId}`, body);
}

// ─────────────────────────────────────────────────────────────
// 17. 💳 BESPOKE CONCIERGE PAYMENT LINK EMAIL INVOICE
// ─────────────────────────────────────────────────────────────
export function buildConciergePaymentLinkEmailHtml(params: {
  customerName?: string;
  title: string;
  amount: number;
  paymentUrl: string;
  description?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Valued Patron';

  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.4);">
        Atelier Direct Invoice
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 24px; margin: 12px 0 6px 0;">Your Bespoke Payment Link</h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Dear ${firstName}, here is your secure 3D Secure payment link from Azhai Boutique.
      </p>
    </div>

    <div style="background-color: #FCFBF8; border-radius: 18px; border: 1px solid #DFBF77; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D6268; margin: 0 0 6px 0; font-weight: bold;">Invoice Title</p>
      <h3 style="font-family: Georgia, serif; font-size: 20px; color: #701626; margin: 0 0 12px 0;">${params.title}</h3>
      
      ${params.description ? `
        <p style="font-size: 13px; color: #6D6268; margin: 0 0 16px 0; line-height: 1.5;">${params.description}</p>
      ` : ''}

      <div style="margin: 18px 0; padding: 14px 0; border-top: 1px dashed #DFBF77; border-bottom: 1px dashed #DFBF77;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D6268; font-weight: bold;">Amount Due: </span>
        <strong style="font-size: 22px; color: #110B0E; font-family: Georgia, serif; margin-left: 8px;">LKR ${params.amount.toLocaleString('en-US')}</strong>
      </div>

      <a href="${params.paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 30px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 18px rgba(112, 22, 38, 0.25);">
        Complete Secure Payment →
      </a>

      <p style="font-size: 11px; color: #9E9399; margin: 14px 0 0 0;">
        Powered by Payments.lk · Visa, Mastercard, and LankaQR accepted
      </p>
    </div>
  `;
  return wrapEmailLayout(`Invoice: ${params.title} — Azhai Boutique`, body);
}

// ─────────────────────────────────────────────────────────────
// 18. 🎁 ATELIER VIP NEWSLETTER WELCOME PRIVILEGE (5% CODE)
// ─────────────────────────────────────────────────────────────
export function buildNewsletterWelcomeHtml(params: {
  customerName?: string;
  couponCode?: string;
}): string {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'Cherished Patron';
  const code = params.couponCode || 'ATELIER5';

  const body = `
    <!-- Editorial Banner Image -->
    <div style="margin-bottom: 24px; border-radius: 18px; overflow: hidden; border: 1px solid #DFBF77; position: relative;">
      <img 
        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85" 
        alt="Azhai Silk Edit" 
        style="width: 100%; height: 210px; object-fit: cover; display: block;" 
      />
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(112, 22, 38, 0.08); color: #701626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.4);">
        Atelier VIP Invitation
      </span>
      <h2 style="font-family: Georgia, serif; color: #110B0E; font-size: 25px; margin: 14px 0 8px 0; font-weight: bold;">
        Welcome to the Azhai Circle, ${firstName}
      </h2>
      <p style="color: #6D6268; font-size: 13.5px; margin: 0; line-height: 1.6;">
        Thank you for subscribing to our private salon. As a welcome token, please enjoy an exclusive 5% privilege on your first handloom silk creation.
      </p>
    </div>

    <!-- Exclusive Promo Code Box -->
    <div style="background-color: #FCFBF8; border-radius: 18px; border: 2px dashed #DFBF77; padding: 22px; margin-bottom: 24px; text-align: center;">
      <span style="font-size: 10.5px; uppercase; letter-spacing: 2px; color: #701626; font-weight: bold; display: block; margin-bottom: 6px;">Your Private Privilege Code</span>
      <div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #701626; letter-spacing: 4px; padding: 10px 18px; background: rgba(112, 22, 38, 0.06); border-radius: 12px; display: inline-block; margin-bottom: 10px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #6D6268; margin: 0;">
        Enter code <strong>${code}</strong> at checkout to redeem 5% off any order.
      </p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${STORE_URL}/collections" style="display: inline-block; background: linear-gradient(135deg, #701626 0%, #8E1E34 100%); color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 30px; border-radius: 14px; text-decoration: none; box-shadow: 0 6px 20px rgba(112, 22, 38, 0.25);">
        Explore Handcrafted Collections →
      </a>
    </div>
  `;
  return wrapEmailLayout('Welcome to the Azhai Circle · 5% Privilege Code Inside', body);
}
