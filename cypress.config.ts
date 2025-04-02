import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Import Percy plugin
            return require('@percy/cypress/task')(on, config);
        },
        baseUrl: 'http://localhost:3000',
        supportFile: 'cypress/support/e2e.js',
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
        supportFile: 'cypress/support/component.js',
    },
    env: {
        percy: true,
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
}); 