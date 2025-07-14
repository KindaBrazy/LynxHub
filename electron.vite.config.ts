import federation from '@originjs/vite-plugin-federation';
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
          only_ipc: resolve(__dirname, 'src/preload/only_ipc.js'),
        },
      },
    },
  },
  renderer: {
    plugins: [
      react(),
      federation({
        name: 'host-app',
        remotes: {nothing: 'nothing.js'},
        shared: ['antd', 'react', 'lodash', 'react-dom', 'react-redux', 'mobx-react-lite', '@heroui/react'],
      }),
    ],
    resolve: {
      alias: {
        '@lynx_module': resolve(__dirname, 'module/src'),
        '@lynx_extension': resolve(__dirname, 'extension/src'),
      },
    },
    base: '',
    define: {
      'process.env': {},
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          initializer: resolve(__dirname, 'src/renderer/initializer.html'),
          loading: resolve(__dirname, 'src/renderer/loading.html'),
          dialog: resolve(__dirname, 'src/renderer/dialog.html'),
          context_menu: resolve(__dirname, 'src/renderer/context_menu.html'),
          error_page: resolve(__dirname, 'src/renderer/error_page.html'),
          toast_window: resolve(__dirname, 'src/renderer/toast_window.html'),
        },
      },
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      modulePreload: false,
    },
    publicDir: resolve(__dirname, 'src/renderer/public'),
  },
});
