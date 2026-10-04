import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The dataset lives in /data so the backend and the UI share one copy.
    alias: { '@data': path.resolve(here, '../data') },
  },
  server: {
    port: 5175,
    fs: { allow: [path.resolve(here, '..')] },
  },
});
