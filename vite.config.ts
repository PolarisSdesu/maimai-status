import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  build: {
    target: 'es2023',
    // 将小 SVG 内联为 data URL，减少请求次数
    assetsInlineLimit: 4096,
  },

  css: {
    devSourcemap: true,
  },

  server: {
    host: true,
  },
});
