import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  // Ignore generated and dependency directories
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cdk.out/**',
      '**/*.d.ts',
      'package-lock.json',
    ],
  },

  // Base JS rules
  eslint.configs.recommended,

  // TypeScript rules for all .ts/.tsx files
  {
    files: ['**/*.{ts,tsx}'],
    extends: tseslint.configs.recommended,
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Browser globals for web package
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },

  // Node globals for api, infra, shared
  {
    files: ['packages/api/**/*.ts', 'packages/infra/**/*.ts', 'packages/shared/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
