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
            statements: 52,
            branches: 34,
            functions: 48,
            lines: 51
        },
    },
    testTimeout: 30000,
    verbose: true,
    resetMocks: false,
    restoreMocks: false,
    testEnvironmentOptions: {
        url: 'http://localhost/',
        resources: 'usable',
    },
    maxWorkers: process.env.CI === 'true' ? 2 : '50%',
    maxConcurrency: process.env.CI === 'true' ? 5 : 10,
};

export default createJestConfig(config); 