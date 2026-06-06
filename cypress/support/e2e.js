// Import Percy for visual testing
import '@percy/cypress';

// Add any other global e2e support code
Cypress.on('uncaught:exception', (err) => {
    // Returning false here prevents Cypress from failing the test
    // when an uncaught exception happens in the app
    // (which can happen in normal usage and shouldn't fail tests)
    console.error('Uncaught exception:', err.message);
    return false;
});
