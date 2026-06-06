describe('HIIT Timer App', () => {
    const seedSettings = (workoutParams = {
        exerciseTime: 1,
        restTime: 1,
        roundRestTime: 1,
        exercises: 2,
        rounds: 2,
    }) => {
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('hiit-timer-settings', JSON.stringify({
                    muted: true,
                    audioUnlocked: true,
                    darkMode: true,
                    workoutParams,
                    workoutStreak: {
                        count: 0,
                        lastWorkoutDate: null,
                    },
                }));
                win.localStorage.setItem('theme', 'dark');
            },
        });
    };

    beforeEach(() => {
        try {
            // @ts-ignore - Percy command is provided by @percy/cypress when available.
            if (typeof cy.percySnapshot !== 'function') {
                // @ts-ignore - Add fallback command for local runs without Percy.
                Cypress.Commands.add('percySnapshot', (name) => {
                    cy.log(`Percy snapshot skipped: ${name}`);
                });
            }
        } catch {
            // @ts-ignore - Add fallback command for local runs without Percy.
            Cypress.Commands.add('percySnapshot', (name) => {
                cy.log(`Percy snapshot skipped: ${name}`);
            });
        }

        seedSettings();
        cy.percySnapshot('Homepage - Initial State');
    });

    it('should complete a full workout cycle', () => {
        cy.percySnapshot('Homepage - Configured Settings');

        cy.contains('Start Workout').click();

        cy.contains('EXERCISE', { timeout: 10000 });
        cy.contains('Round 1/2', { timeout: 10000 });
        cy.percySnapshot('Workout - Exercise 1');

        cy.contains('REST', { timeout: 10000 });
        cy.percySnapshot('Workout - Rest Period');

        cy.contains('2/2', { timeout: 10000 });
        cy.percySnapshot('Workout - Exercise 2');

        cy.contains('RECOVERY', { timeout: 10000 });
        cy.percySnapshot('Workout - Round Complete');

        cy.contains('Round 2/2', { timeout: 15000 });
        cy.contains('Workout Complete!', { timeout: 20000 });
        cy.percySnapshot('Workout - Complete');

        cy.contains('New Workout').click();
        cy.contains('Your Workout Timer');
        cy.percySnapshot('Homepage - After Workout');
    });

    it('should pause and resume workout', () => {
        cy.contains('Start Workout').click();
        cy.percySnapshot('Workout - Started');

        cy.get('[data-test="timer-display"]', { timeout: 10000 }).should('be.visible');
        cy.get('button').contains('Pause').click();
        cy.percySnapshot('Workout - Paused');

        cy.get('[data-test="timer-display"]').then(($el) => {
            const initialText = $el.text();
            cy.wait(1500);
            cy.get('[data-test="timer-display"]').should('have.text', initialText);
        });

        cy.get('button').contains('Play').click();
        cy.percySnapshot('Workout - Resumed');
        cy.wait(1500);
    });

    it('should toggle theme', () => {
        cy.get('button[aria-label="Settings"]').click();
        cy.percySnapshot('Settings Modal - Dark Mode');

        cy.contains('Dark Mode')
            .closest('.flex.items-center.justify-between')
            .find('input[type="checkbox"]')
            .click({ force: true });

        cy.contains('Done').click();
        cy.get('html').should('not.have.class', 'dark');
        cy.percySnapshot('Homepage - Light Mode');

        cy.get('button[aria-label="Settings"]').click();
        cy.contains('Dark Mode')
            .closest('.flex.items-center.justify-between')
            .find('input[type="checkbox"]')
            .click({ force: true });
        cy.contains('Done').click();

        cy.get('html').should('have.class', 'dark');
        cy.percySnapshot('Homepage - Dark Mode');
    });

    it('should test mobile viewport', () => {
        cy.viewport('iphone-x');
        cy.percySnapshot('Homepage - Mobile Viewport');

        cy.get('button[aria-label="Settings"]').should('be.visible').click();
        cy.percySnapshot('Settings Modal - Mobile Viewport');

        cy.contains('Done').click();
        cy.contains('Start Workout').should('be.visible').click();
        cy.percySnapshot('Workout - Mobile Viewport');
    });
});
