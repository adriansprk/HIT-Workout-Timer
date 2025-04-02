describe('HIIT Timer App', () => {
    beforeEach(() => {
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

        // Verify initial state
        cy.contains('Exercise 1 of 2');
        cy.contains('Round 1 of 2');
        cy.percySnapshot('Workout - Exercise 1');

        // Wait for first exercise to complete (3 seconds)
        cy.contains('Rest', { timeout: 5000 });
        cy.percySnapshot('Workout - Rest Period');

        // Wait for the rest period (2 seconds)
        cy.contains('Exercise 2 of 2', { timeout: 5000 });
        cy.percySnapshot('Workout - Exercise 2');

        // Wait for second exercise to complete
        cy.contains('Round Complete!', { timeout: 5000 });
        cy.percySnapshot('Workout - Round Complete');

        // Wait for round rest to complete
        cy.contains('Round 2 of 2', { timeout: 10000 });

        // Complete the final round
        cy.contains('Workout Complete!', { timeout: 15000 });
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

        // Pause the workout
        cy.contains('Pause').click();
        cy.percySnapshot('Workout - Paused');

        // Time display should not change while paused
        cy.contains('0:45').then(($el) => {
            const initialText = ($el as unknown as HTMLElement).textContent || '';
            cy.wait(2000);
            cy.wrap($el).should('have.text', initialText);
        });

        // Resume the workout
        cy.contains('Resume').click();
        cy.percySnapshot('Workout - Resumed');

        // Time should start counting down again
        cy.contains('0:45').should('not.exist', { timeout: 2000 });
    });

    it('should toggle theme', () => {
        // Open settings
        cy.get('button[aria-label="Settings"]').click();
        cy.percySnapshot('Settings Modal - Dark Mode');

        // Toggle theme
        cy.contains('Dark Mode').parent().find('button[role="switch"]').click();

        // Close settings
        cy.contains('Done').click();

        // Check if body has light mode class
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

        // Open settings on mobile
        cy.get('button[aria-label="Settings"]').click();
        cy.percySnapshot('Settings Modal - Mobile Viewport');

        // Start workout on mobile
        cy.contains('Done').click();
        cy.contains('Start Workout').click();
        cy.percySnapshot('Workout - Mobile Viewport');
    });
}); 