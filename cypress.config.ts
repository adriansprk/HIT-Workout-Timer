import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Implement node event listeners here
        },
        baseUrl: 'http://localhost:3000',
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
    env: {
        percy: true,
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
}); 