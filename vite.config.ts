/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig } from 'vite'
import createExternal from 'vite-plugin-external'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    lib: {
      entry: 'src/cli.ts',
      fileName: 'cli',
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
  plugins: [
    createExternal({ nodeBuiltins: true }),
  ],
  // https://github.com/vitest-dev/vitest
  test: {},
})
