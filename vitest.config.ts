import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./tests/**/*.{spec,test}.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
    setupFiles: './tests/setupTests.ts',
  },
});