export default {
  async fetch(request, env) {
    // Allows passing custom API routes if needed, and falls back to SPA static assets
    return env.ASSETS.fetch(request);
  },
};
