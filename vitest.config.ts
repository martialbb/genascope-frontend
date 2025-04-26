// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Use jsdom for simulating browser environment
    globals: true, // Use global APIs like expect, describe, it
    setupFiles: './src/tests/setup.ts', // Optional: Setup file for global mocks/config
    // Update include pattern to target the new tests directory
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}'], 
  },
});
