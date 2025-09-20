// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from "@astrojs/tailwind"; // Import the official integration
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: 'server', // Set the output mode to server
  adapter: node({
    mode: "standalone"
  }),
  integrations: [react(), tailwind()],
  security: {
    checkOrigin: false  // Disable origin checking for CSRF protection to allow Cloudflare tunnel
  },
  vite: {
    build: {
      assetsInlineLimit: 0, // Force assets to be served as separate files
    },
    server: {
      headers: {
        'Cache-Control': 'public, max-age=31536000', // Cache static assets
      }
    }
  }
});