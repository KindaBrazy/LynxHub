import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: ['module/src/main.ts', 'module/src/renderer.ts'],
  output: {
    dir: '../module_out/scripts',
    format: 'es',
    entryFileNames: '[name].mjs',
    chunkFileNames: '[name]_[hash:6].mjs',
  },
  external: ['electron'],
  plugins: [json(), typescript({tsconfig: 'module/tsconfig.json'}), nodeResolve(), commonjs()],
};

export default config;
