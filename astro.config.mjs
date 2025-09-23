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
    checkOrigin: false // Disable CSRF protection for API routes
  },
  build: {
    assets: '_astro' // Ensure assets directory is correct
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Force new asset names by adding timestamp
          assetFileNames: '_astro/[name].[hash].[ext]',
          chunkFileNames: '_astro/[name].[hash].js',
          entryFileNames: '_astro/[name].[hash].js'
        }
      }
    }
  }
});