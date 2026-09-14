import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: [
            'client/src/**/*.test.ts',
            'client/src/**/*.test.tsx',
            'server/src/**/*.test.ts',
            'functions/**/*.test.ts',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: [
                'client/src/**/*.{ts,tsx}',
                'server/src/**/*.ts',
                'functions/**/*.ts',
            ],
            exclude: [
                '**/*.test.{ts,tsx}',
                '**/*.d.ts',
                'client/src/main.tsx',
                'server/src/index.ts',
            ],
            thresholds: {
                statements: 25,
                branches: 25,
                functions: 25,
                lines: 25,
            },
        },
    },
})
