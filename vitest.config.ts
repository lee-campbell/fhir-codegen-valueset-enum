import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./tests/**/*.{spec,test}.ts'],
    coverage: {
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.d.ts'],
    },
    setupFiles: './tests/setupTests.ts',
  },
});
