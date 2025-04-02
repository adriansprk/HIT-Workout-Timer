/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to take a Percy snapshot
         * @example cy.percySnapshot('Home Page')
         */
        percySnapshot(name: string, options?: object): Chainable<Element>;

        /**
         * Custom command to mount React components for component testing
         * @example cy.mount(<MyComponent />)
         */
        mount(component: React.ReactNode): Chainable<Element>;
    }
} 