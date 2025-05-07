import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import {resolve} from 'path';

// import packageJson from './package.json';

export default defineConfig({
  main: {
    root: resolve('extension/main'),
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve('extension_out/main'),
      rollupOptions: {
        input: resolve('extension/main/lynxExtension.ts'),
        output: {entryFileNames: 'mainEntry.mjs'},
      },
    },
  },
  renderer: {
    root: resolve('extension/renderer'),
    plugins: [
      react(),
      federation({
        name: 'extension',
        filename: 'rendererEntry.mjs',
        exposes: {
          Extension: resolve('extension/renderer/Extension.tsx'),
        },
        shared: {
          antd: {generate: false},
          react: {generate: false},
          lodash: {generate: false},
          'react-dom': {generate: false},
          'react-redux': {generate: false},
          'mobx-react-lite': {generate: false},
          '@heroui/react': {generate: false},
        },
      }),
    ],
    build: {
      outDir: resolve('extension_out/renderer'),
      rollupOptions: {
        input: resolve('extension/renderer/index.html'),
        // external: Object.keys(packageJson.devDependencies),
        treeshake: {moduleSideEffects: false},
      },
      assetsDir: '',
      minify: false,
      target: 'esnext',
      cssCodeSplit: false,
      modulePreload: false,
    },

    publicDir: resolve(__dirname, 'extension/renderer/Public'),
  },
});
