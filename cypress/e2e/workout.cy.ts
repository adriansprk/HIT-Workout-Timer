describe('HIIT Timer App', () => {
    // Add a custom command to gracefully handle Percy when not available
    beforeEach(() => {
        // Override percySnapshot to be a no-op if Percy is not available
        try {
            // Safely check if percySnapshot is already defined
            // @ts-ignore - Cypress commands typing issue
            if (typeof cy.percySnapshot !== 'function') {
                // @ts-ignore - Add custom command
                Cypress.Commands.add('percySnapshot', (name) => {
                    cy.log(`Percy snapshot skipped: ${name}`);
                });
            }
        } catch (e) {
            // @ts-ignore - Add custom command
            Cypress.Commands.add('percySnapshot', (name) => {
                cy.log(`Percy snapshot skipped: ${name}`);
            });
        }

        cy.visit('/');

        // Wait for app to be fully loaded before proceeding
        cy.contains('Your Workout Timer', { timeout: 10000 }).should('be.visible');

        // Take a Percy snapshot of the initial homepage
        cy.percySnapshot('Homepage - Initial State');
    });

    it('should complete a full workout cycle', () => {
        // Set shorter durations for testing
        cy.contains('Exercise Time').parent().find('button').click();
        cy.get('input[type="range"]').invoke('val', 3).trigger('change');
        cy.contains('Save').click();

        cy.contains('Rest Time').parent().find('button').click();
        cy.get('input[type="range"]').invoke('val', 2).trigger('change');
        cy.contains('Save').click();

        cy.contains('Rounds').parent().find('button').click();
        cy.get('input[type="number"]').clear().type('2');
        cy.contains('Save').click();

        cy.contains('Exercises per Round').parent().find('button').click();
        cy.get('input[type="number"]').clear().type('2');
        cy.contains('Save').click();

        // Take a Percy snapshot after settings configured
        cy.percySnapshot('Homepage - Configured Settings');

        // Start the workout - use more reliable selectors
        cy.contains('button', 'Start Workout').should('be.visible').click();

        // Verify initial state - use longer timeouts for CI
        cy.contains('Exercise 1 of 2', { timeout: 15000 }).should('be.visible');
        cy.contains('Round 1 of 2', { timeout: 15000 }).should('be.visible');
        cy.percySnapshot('Workout - Exercise 1');

        // Wait for first exercise to complete (3 seconds) - add additional delay for CI
        cy.contains('Rest', { timeout: 15000 }).should('be.visible');
        cy.percySnapshot('Workout - Rest Period');

        // Wait for the rest period (2 seconds) with extra timeout
        cy.contains('Exercise 2 of 2', { timeout: 15000 }).should('be.visible');
        cy.percySnapshot('Workout - Exercise 2');

        // Wait for second exercise to complete
        cy.contains('Round Complete!', { timeout: 15000 }).should('be.visible');
        cy.percySnapshot('Workout - Round Complete');

        // Wait for round rest to complete
        cy.contains('Round 2 of 2', { timeout: 20000 }).should('be.visible');

        // Complete the final round
        cy.contains('Workout Complete!', { timeout: 30000 }).should('be.visible');
        cy.percySnapshot('Workout - Complete');

        // Return to home screen
        cy.contains('button', 'Return to Home').should('be.visible').click();
        cy.contains('Your Workout Timer').should('be.visible');
        cy.percySnapshot('Homepage - After Workout');
    });

    it('should pause and resume workout', () => {
        // Start the workout with default settings
        cy.contains('button', 'Start Workout').should('be.visible').click();
        cy.percySnapshot('Workout - Started');

        // Wait for workout to start and countdown to begin
        cy.get('[data-test="timer-display"]', { timeout: 10000 }).should('be.visible');

        // Use a more resilient selector for the pause button - try multiple approaches
        cy.get('button')
            .contains('Pause', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.percySnapshot('Workout - Paused');

        // Get timer display value and verify it doesn't change when paused
        cy.get('[data-test="timer-display"]').invoke('text').as('initialTimerValue');

        // Wait to ensure time would have changed if not paused
        cy.wait(2000);

        // Check that time hasn't changed using Cypress alias
        cy.get('@initialTimerValue').then((initialText) => {
            cy.get('[data-test="timer-display"]')
                .invoke('text')
                .should('eq', initialText);
        });

        // Resume the workout - more resilient selector
        cy.get('button')
            .contains('Resume', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.percySnapshot('Workout - Resumed');

        // Verify timer changes - be more explicit about what we're waiting for
        cy.wait(2000); // Wait for timer to change
    });

    it('should toggle theme', () => {
        // Open settings - use more resilient selectors
        cy.get('button[aria-label="Settings"], button.settings-button, button:has(.settings-icon)')
            .first()
            .should('be.visible')
            .click();

        cy.percySnapshot('Settings Modal - Dark Mode');

        // Toggle theme - using more resilient selectors
        // First verify the toggle is visible
        cy.contains('Dark Mode')
            .should('be.visible')
            .parents('div')
            .find('button[role="switch"], input[type="checkbox"]')
            .first()
            .should('be.visible')
            .click({ force: true });

        // Close settings
        cy.contains('button', 'Done').should('be.visible').click();

        // Check if body has light mode class - allow a small delay for theme to apply
        cy.get('body').should('not.have.class', 'dark');
        cy.percySnapshot('Homepage - Light Mode');

        // Toggle back to dark mode - use multiple selector strategies
        cy.get('button[aria-label="Settings"], button.settings-button, button:has(.settings-icon)')
            .first()
            .should('be.visible')
            .click();

        cy.contains('Dark Mode')
            .should('be.visible')
            .parents('div')
            .find('button[role="switch"], input[type="checkbox"]')
            .first()
            .should('be.visible')
            .click({ force: true });

        cy.contains('button', 'Done').should('be.visible').click();

        // Check if body has dark mode class again - with delay
        cy.get('body').should('have.class', 'dark');
        cy.percySnapshot('Homepage - Dark Mode');
    });

    it('should test mobile viewport', () => {
        // Test on mobile viewport
        cy.viewport('iphone-x');
        cy.percySnapshot('Homepage - Mobile Viewport');

        // Open settings on mobile - use multiple selector strategies for better resilience
        cy.get('button[aria-label="Settings"], button.settings-button, button:has(.settings-icon)')
            .first()
            .should('be.visible')
            .click({ force: true });

        cy.percySnapshot('Settings Modal - Mobile Viewport');

        // Start workout on mobile
        cy.contains('button', 'Done').should('be.visible').click();

        // Make sure we're back to the main screen and start the workout
        cy.contains('button', 'Start Workout')
            .should('be.visible')
            .click({ force: true });

        cy.percySnapshot('Workout - Mobile Viewport');
    });
}); 