import globals from 'globals';
import js from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Apply recommended rules
  js.configs.recommended,

  // Configuration for all JavaScript files
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      // Code quality
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for debugging in this project
      'no-debugger': 'warn',

      // Best practices
      'eqeqeq': ['warn', 'smart'],
      'no-var': 'warn',
      'prefer-const': 'warn',

      // Style (relaxed for existing codebase)
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'no-trailing-spaces': 'warn',
      'comma-dangle': ['warn', 'only-multiline'],
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'space-before-blocks': 'warn',
      'keyword-spacing': 'warn',
      'space-infix-ops': 'warn',
      'brace-style': ['warn', '1tbs', { allowSingleLine: true }],

      // Relax rules for existing codebase patterns
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/content/**',
      'processor/**'
    ]
  }
];
