describe('HIIT Timer App', () => {
    beforeEach(() => {
        cy.visit('/');
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

        // Start the workout
        cy.contains('Start Workout').click();

        // Verify initial state
        cy.contains('Exercise 1 of 2');
        cy.contains('Round 1 of 2');

        // Wait for first exercise to complete (3 seconds)
        cy.contains('Rest', { timeout: 5000 });

        // Wait for the rest period (2 seconds)
        cy.contains('Exercise 2 of 2', { timeout: 5000 });

        // Wait for second exercise to complete
        cy.contains('Round Complete!', { timeout: 5000 });

        // Wait for round rest to complete
        cy.contains('Round 2 of 2', { timeout: 10000 });

        // Complete the final round
        cy.contains('Workout Complete!', { timeout: 15000 });

        // Return to home screen
        cy.contains('Return to Home').click();
        cy.contains('Your Workout Timer');
    });

    it('should pause and resume workout', () => {
        // Start the workout with default settings
        cy.contains('Start Workout').click();

        // Pause the workout
        cy.contains('Pause').click();

        // Time display should not change while paused
        cy.contains('0:45').then(($el) => {
            const initialText = ($el as unknown as HTMLElement).textContent || '';
            cy.wait(2000);
            cy.wrap($el).should('have.text', initialText);
        });

        // Resume the workout
        cy.contains('Resume').click();

        // Time should start counting down again
        cy.contains('0:45').should('not.exist', { timeout: 2000 });
    });

    it('should toggle theme', () => {
        // Open settings
        cy.get('button[aria-label="Settings"]').click();

        // Toggle theme
        cy.contains('Dark Mode').parent().find('button[role="switch"]').click();

        // Close settings
        cy.contains('Done').click();

        // Check if body has light mode class
        cy.get('body').should('not.have.class', 'dark');

        // Toggle back to dark mode
        cy.get('button[aria-label="Settings"]').click();
        cy.contains('Dark Mode').parent().find('button[role="switch"]').click();
        cy.contains('Done').click();

        // Check if body has dark mode class again
        cy.get('body').should('have.class', 'dark');
    });
}); 