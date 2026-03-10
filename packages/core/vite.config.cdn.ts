import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cdn.ts'),
      name: 'Loquix',
      formats: ['iife'],
      fileName: () => 'loquix.min.js',
    },
    rollupOptions: {
      // Bundle everything — no externals for CDN
      external: [],
    },
    outDir: 'cdn',
    sourcemap: true,
    minify: 'esbuild',
  },
});
