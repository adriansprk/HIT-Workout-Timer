// Type declarations for Percy with Cypress
declare namespace Cypress {
    interface Chainable {
        /**
         * Take a Percy snapshot of the current state of the application
         * @param name The name of the snapshot
         * @param options Optional Percy snapshot options
         */
        percySnapshot(name: string, options?: object): Chainable<Element>;
    }
} 