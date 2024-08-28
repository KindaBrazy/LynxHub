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
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
        },
        input: {
          index: resolve(__dirname, 'src/preload/index.js'),
          dialog: resolve(__dirname, 'src/preload/dialog.js'),
          webview: resolve(__dirname, 'src/preload/webview.js'),
        },
      },
    },
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
          dialog: resolve(__dirname, 'src/renderer/dialog.html'),
        },
      },
      target: 'esnext',
    },
    publicDir: resolve(__dirname, 'src/renderer/public'),
  },
});
