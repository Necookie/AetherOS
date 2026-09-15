import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const rootDir = import.meta.dirname

export default [
    {
        ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
    },
    {
        ...js.configs.recommended,
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    ...tseslint.configs['flat/recommended'],
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['client/src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './client/tsconfig.json',
                tsconfigRootDir: rootDir,
            },
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        files: ['client/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './client/tsconfig.node.json',
                tsconfigRootDir: rootDir,
            },
        },
    },
    {
        files: ['server/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './server/tsconfig.test.json',
                tsconfigRootDir: rootDir,
            },
        },
    },
    {
        files: ['functions/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './functions/tsconfig.json',
                tsconfigRootDir: rootDir,
            },
            globals: globals.browser,
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
        },
    },
]
