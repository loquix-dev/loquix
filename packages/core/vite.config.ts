import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Collect all component entries for multi-entry build
function getComponentEntries() {
  const componentsDir = resolve(__dirname, 'src/components/core');
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(componentsDir);
    for (const file of files) {
      if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.styles.ts')) {
        const name = file.replace('.ts', '');
        entries[`components/core/${name}`] = resolve(componentsDir, file);
      }
    }
  } catch {
    // Directory may not exist yet during initial setup
  }

  return entries;
}

// Collect controller entries
function getControllerEntries() {
  const controllersDir = resolve(__dirname, 'src/controllers');
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(controllersDir);
    for (const file of files) {
      if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
        const name = file.replace('.ts', '');
        entries[`controllers/${name}`] = resolve(controllersDir, file);
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return entries;
}

// Collect provider entries
function getProviderEntries() {
  const dir = resolve(__dirname, 'src/providers');
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
        const name = file.replace('.ts', '');
        entries[`providers/${name}`] = resolve(dir, file);
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return entries;
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ...getComponentEntries(),
        ...getControllerEntries(),
        ...getProviderEntries(),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^lit/, /^@lit/, /^@shoelace-style/, /^@floating-ui/],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
});
