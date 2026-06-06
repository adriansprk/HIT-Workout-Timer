import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
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
    allowCypressEnv: false,
    video: false,
    screenshotOnRunFailure: true,
});
