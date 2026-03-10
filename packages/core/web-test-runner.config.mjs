import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  plugins: [
    esbuildPlugin({ ts: true, target: 'es2021', tsconfig: '../../tsconfig.json' }),
  ],
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    include: ['src/**/*.ts'],
    exclude: [
      'src/**/*.test.ts',
      'src/**/*.styles.ts',
      'src/test-utils.ts',
      '**/node_modules/**',
    ],
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
