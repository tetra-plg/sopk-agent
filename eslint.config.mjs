import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  // Ignorer les fichiers de build et scripts
  {
    ignores: ['dist/**', '.github/**', 'node_modules/**', '*.config.js']
  },

  // Configuration pour les fichiers source TypeScript/JavaScript
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': typescript
    },
    rules: {
      ...js.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-undef': 'error',
      'no-empty': 'error',
      'no-useless-catch': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  // Configuration spécifique pour les fichiers Node.js
  {
    files: ['vite.config.ts', '*.config.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },

  // Configuration pour les fichiers JavaScript uniquement
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        process: 'readonly',
        require: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off'
    }
  }
];