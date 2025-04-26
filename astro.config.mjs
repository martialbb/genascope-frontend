// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from "@astrojs/tailwind"; // Import the official integration

// https://astro.build/config
export default defineConfig({
  output: 'server', // Set the output mode to server
  integrations: [react(), tailwind()],
});