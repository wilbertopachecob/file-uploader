/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // CI-friendly configuration
    reporter: process.env.CI ? ['default'] : ['verbose'],
    silent: !!process.env.CI,
    run: !!process.env.CI,
    // Mock assets
    alias: {
      '\\.(png|jpg|jpeg|gif|svg)$': 'test-file-stub',
    },
  },
})
