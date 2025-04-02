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
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/components/ui/**',
        '!**/hooks/use-toast.ts',
        '!**/hooks/use-mobile.tsx',
    ],
    coverageThreshold: {
        global: {
            statements: 30,
            branches: 30,
            functions: 30,
            lines: 30,
        },
        './components/!(ui)/**/*.{ts,tsx}': {
            statements: 50,
            branches: 50,
            functions: 50,
            lines: 50,
        },
        './contexts/**/*.{ts,tsx}': {
            statements: 80,
            branches: 70,
            functions: 80,
            lines: 80,
        }
    },
    testTimeout: 20000,
    verbose: true,
};

export default createJestConfig(config); 