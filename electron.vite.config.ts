import federation from '@originjs/vite-plugin-federation';
import {sentryVitePlugin} from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import {resolve} from 'path';

export default defineConfig(({mode}) => {
  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      build: {rollupOptions: {output: {format: 'cjs'}}},
    },
    preload: {
      plugins: [
        sentryVitePlugin({
          org: 'lynxhub',
          project: 'lynxhub',
          disable: mode === 'development',
          sourcemaps: {
            filesToDeleteAfterUpload: '**/*.map',
          },
        }),
        externalizeDepsPlugin(),
      ],
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
        sentryVitePlugin({
          org: 'lynxhub',
          project: 'lynxhub',
          disable: mode === 'development',
          sourcemaps: {
            filesToDeleteAfterUpload: '**/*.map',
          },
        }),
        react(),
        tailwindcss(),
        federation({
          name: 'host-app',
          remotes: {nothing: 'nothing.js'},
          shared: ['antd', 'react', 'lodash', 'react-dom', 'react-redux', 'zustand', '@heroui/react'],
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
            loading: resolve(__dirname, 'src/renderer/loading.html'),
            dialog: resolve(__dirname, 'src/renderer/dialog.html'),
            context_menu: resolve(__dirname, 'src/renderer/context_menu.html'),
            error_page: resolve(__dirname, 'src/renderer/error_page.html'),
            toast_window: resolve(__dirname, 'src/renderer/toast_window.html'),
            downloads_menu: resolve(__dirname, 'src/renderer/downloads_menu.html'),
            share_screen: resolve(__dirname, 'src/renderer/share_screen.html'),
          },
        },
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        modulePreload: false,
      },
      publicDir: resolve(__dirname, 'src/renderer/public'),
    },
  };
});
