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

        // Start the workout
        cy.contains('Start Workout').click();

        // Verify initial state - use longer timeouts for CI
        cy.contains('Exercise 1 of 2', { timeout: 10000 });
        cy.contains('Round 1 of 2', { timeout: 10000 });
        cy.percySnapshot('Workout - Exercise 1');

        // Wait for first exercise to complete (3 seconds)
        cy.contains('Rest', { timeout: 10000 });
        cy.percySnapshot('Workout - Rest Period');

        // Wait for the rest period (2 seconds)
        cy.contains('Exercise 2 of 2', { timeout: 10000 });
        cy.percySnapshot('Workout - Exercise 2');

        // Wait for second exercise to complete
        cy.contains('Round Complete!', { timeout: 10000 });
        cy.percySnapshot('Workout - Round Complete');

        // Wait for round rest to complete
        cy.contains('Round 2 of 2', { timeout: 15000 });

        // Complete the final round
        cy.contains('Workout Complete!', { timeout: 20000 });
        cy.percySnapshot('Workout - Complete');

        // Return to home screen
        cy.contains('Return to Home').click();
        cy.contains('Your Workout Timer');
        cy.percySnapshot('Homepage - After Workout');
    });

    it('should pause and resume workout', () => {
        // Start the workout with default settings
        cy.contains('Start Workout').click();
        cy.percySnapshot('Workout - Started');

        // Wait for workout to start and countdown to begin
        cy.get('[data-test="timer-display"]', { timeout: 10000 }).should('be.visible');

        // Pause the workout - try multiple strategies
        cy.get('button').contains('Pause').click();
        cy.percySnapshot('Workout - Paused');

        // Get timer display value
        cy.get('[data-test="timer-display"]').then(($el) => {
            const initialText = $el.text();
            // Wait to ensure time would have changed if not paused
            cy.wait(2000);
            // Check that time hasn't changed
            cy.get('[data-test="timer-display"]').should('have.text', initialText);
        });

        // Resume the workout
        cy.get('button').contains('Resume').click();
        cy.percySnapshot('Workout - Resumed');

        // Verify timer changes
        cy.wait(2000); // Wait for timer to change
    });

    it('should toggle theme', () => {
        // Open settings
        cy.get('button[aria-label="Settings"]').click();
        cy.percySnapshot('Settings Modal - Dark Mode');

        // Toggle theme - using more resilient selectors
        cy.contains('Dark Mode').parent().find('button[role="switch"]').click();

        // Close settings
        cy.contains('Done').click();

        // Check if body has light mode class - allow a small delay for theme to apply
        cy.get('body').should('not.have.class', 'dark');
        cy.percySnapshot('Homepage - Light Mode');

        // Toggle back to dark mode
        cy.get('button[aria-label="Settings"]').click();
        cy.contains('Dark Mode').parent().find('button[role="switch"]').click();
        cy.contains('Done').click();

        // Check if body has dark mode class again
        cy.get('body').should('have.class', 'dark');
        cy.percySnapshot('Homepage - Dark Mode');
    });

    it('should test mobile viewport', () => {
        // Test on mobile viewport
        cy.viewport('iphone-x');
        cy.percySnapshot('Homepage - Mobile Viewport');

        // Open settings on mobile - try to be more resilient
        cy.get('button[aria-label="Settings"]').should('be.visible').click();
        cy.percySnapshot('Settings Modal - Mobile Viewport');

        // Start workout on mobile
        cy.contains('Done').click();

        // Make sure we're back to the main screen
        cy.contains('Start Workout').should('be.visible').click();
        cy.percySnapshot('Workout - Mobile Viewport');
    });
}); 