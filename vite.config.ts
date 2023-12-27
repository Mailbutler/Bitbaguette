import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import vue from '@vitejs/plugin-vue';
import path from 'path';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  plugins: [
    vue(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json']
    })
  ]
});
