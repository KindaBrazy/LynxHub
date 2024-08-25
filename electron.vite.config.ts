import react from '@vitejs/plugin-react';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import {resolve} from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {rollupOptions: {output: {format: 'cjs'}}},
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {rollupOptions: {input: {index: resolve(__dirname, 'src/preload/index.js')}}},
  },
  renderer: {
    resolve: {alias: {'@renderer': resolve('src/renderer/src')}},
    plugins: [react()],
    base: '',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          initializer: resolve(__dirname, 'src/renderer/initializer.html'),
          loading: resolve(__dirname, 'src/renderer/loading.html'),
        },
      },
      target: 'esnext',
    },
    publicDir: resolve(__dirname, 'src/renderer/public'),
  },
});
