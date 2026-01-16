import federation from '@originjs/vite-plugin-federation';
import {sentryVitePlugin} from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'electron-vite';
import {resolve} from 'path';

export default defineConfig(({mode}) => {
  const isDev = mode === 'development';

  const disableSentrySourceUpload: boolean = false;

  return {
    main: {
      plugins: [
        sentryVitePlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'lynxhub',
          project: 'lynxhub',
          disable: isDev,
          sourcemaps: {
            disable: disableSentrySourceUpload,
            filesToDeleteAfterUpload: '**/*.map',
          },
        }),
      ],
      build: {
        sourcemap: true,
        rollupOptions: {
          external: isDev
            ? undefined
            : ['../../../../../extension/src/main/lynxExtension', '../../../../../module/src/main'],
        },
      },
    },

    preload: {
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
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'lynxhub',
          project: 'lynxhub',
          disable: isDev,
          sourcemaps: {
            disable: disableSentrySourceUpload,
            filesToDeleteAfterUpload: '**/*.map',
          },
        }),
        tailwindcss(),
        react(),
        federation({
          name: 'host-app',
          remotes: {nothing: 'nothing.js'},
          shared: ['antd', 'react', 'lodash', 'react-dom', 'react-redux', '@heroui/react'],
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
        sourcemap: true,
        rollupOptions: {
          external: isDev
            ? undefined
            : ['../../../../../module/src/renderer', '../../../../../extension/src/renderer/Extension'],
          input: {
            index: resolve(__dirname, 'src/renderer/index.html'),
            loading: resolve(__dirname, 'src/renderer/loading.html'),
            dialog: resolve(__dirname, 'src/renderer/dialog.html'),
            context_menu: resolve(__dirname, 'src/renderer/context_menu.html'),
            toast_window: resolve(__dirname, 'src/renderer/toast_window.html'),
            downloads_menu: resolve(__dirname, 'src/renderer/downloads_menu.html'),
            share_screen: resolve(__dirname, 'src/renderer/share_screen.html'),
            link_preview: resolve(__dirname, 'src/renderer/link_preview.html'),
          },
        },
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        modulePreload: false,
      },
      publicDir: resolve(__dirname, 'src/renderer/shared/public'),
    },
  };
});
