import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-localstorage-mock'],
    testEnvironment: 'jest-environment-jsdom',
    testMatch: ['**/__tests__/**/*.test.(js|jsx|ts|tsx)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    collectCoverage: process.env.CI === 'true',
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        'hooks/useWakeLock.ts',
        'lib/settings.ts',
        'lib/utils.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'components/ui/',
        'types/',
        '.d.ts$',
        'lib/audio.ts',
        'lib/wakeLock.ts',
        'hooks/use-toast.ts',
        'hooks/use-mobile.tsx',
    ],
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        },
    },
    testTimeout: 20000,
    verbose: true,
};

export default createJestConfig(config); 