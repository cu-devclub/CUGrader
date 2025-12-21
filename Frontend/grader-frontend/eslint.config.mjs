import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // 'react/no-unescaped-entities': 'off',
      // '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/app/example/**',
    'src/lib/api/generated/**',
  ]),
]);

export default eslintConfig;