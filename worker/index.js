export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Secure server-side Brevo email dispatcher (avoids browser CORS & hides credentials)
    if (url.pathname === '/api/send-email') {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, api-key',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

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

    // Falls back to SPA static assets
    return env.ASSETS.fetch(request);
  },
};
