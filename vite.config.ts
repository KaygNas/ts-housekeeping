/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      fileName: 'main',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
    target: 'es2016',
    minify: false,
  },
  plugins: [],
  // https://github.com/vitest-dev/vitest
  test: {},
})
