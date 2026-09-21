/**
 * Google Tag Manager (GTM) Integration Utility
 * 
 * Injects GTM container script dynamically across all pages when VITE_GTM_ID
 * is configured in the environment variables (e.g. VITE_GTM_ID=GTM-XXXXXXX).
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Initializes Google Tag Manager in <head> and <body>.
 * Safe to call multiple times (guarded against duplicate injection).
 */
export function initGTM(customId?: string): void {
  if (typeof window === 'undefined') return;

  const gtmId = (customId || import.meta.env.VITE_GTM_ID || '').trim();

  // If no container ID is configured, exit silently without error
  if (!gtmId) {
    return;
  }

  // Prevent duplicate script injection
  if (document.getElementById('gtm-script')) {
    return;
  }

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
 * Helper to dispatch custom events to GTM dataLayer
 */
export function pushGTMEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}
