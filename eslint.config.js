import {fixupConfigRules} from '@eslint/compat';
import {FlatCompat} from '@eslint/eslintrc';
import eslint from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwind from 'eslint-plugin-tailwindcss';
import tsEslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: import.meta.dirname,
  recommendedConfig: eslint.configs.recommended,
});

const MAX_LINE_LENGTH = 120;

export default [
  ...fixupConfigRules(compat.extends('plugin:react-hooks/recommended')),

  ...compat.config({
    extends: ['@electron-toolkit/eslint-config-prettier'],
  }),

  ...tsEslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  ...tailwind.configs['flat/recommended'],

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      perfectionist,
      'simple-import-sort': simpleImportSort,
      'jsx-a11y': jsxA11y,
    },

    rules: {
      'jsx-a11y/alt-text': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react/display-name': 'off',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'tailwindcss/no-custom-classname': 'off',

      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
          groups: ['multiline', 'unknown', 'shorthand'],
        },
      ],

      'max-len': ['error', {code: MAX_LINE_LENGTH}],

      'prettier/prettier': [
        'error',
        {
          proseWrap: 'always',
          singleQuote: true,
          printWidth: MAX_LINE_LENGTH,
          bracketSpacing: false,
          bracketSameLine: true,
          arrowParens: 'avoid',
        },
      ],
    },
  },
];
