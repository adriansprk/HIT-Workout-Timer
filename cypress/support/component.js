// Import Percy for visual testing
import '@percy/cypress';

// Import commands.js for custom commands
// (create this file if needed for custom commands)
// import './commands';

// Mount function for React components
import { mount } from 'cypress/react18';

// Add "mount" command for component testing
Cypress.Commands.add('mount', mount);

// Global setup for component tests
beforeEach(() => {
    // You can add global setup here
}); 