# HIIT Timer Testing Documentation

This document outlines the testing infrastructure for the HIIT Timer application.

## Testing Framework

The HIIT Timer app uses the following testing tools:

- **Jest**: For unit and component testing
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end testing

## Running Tests

To run the Jest tests:

```bash
npm test
```

To run Cypress tests:

```bash
npm run cypress:open
```

To run Cypress in headless mode:

```bash
npm run cypress:run
```

## Test Coverage

Test coverage reports are generated automatically when running tests with Jest. The coverage threshold is set to 70% for statements, branches, functions, and lines.

To view the coverage report:

1. Run the tests with `npm test`
2. Open the coverage report in a browser:
   ```bash
   open coverage/lcov-report/index.html
   ```

## Testing Setup Overview

### Jest and React Testing Library Setup

1. **Dependencies**:
   - `jest` - Testing framework
   - `@testing-library/react` - React component testing utilities
   - `@testing-library/jest-dom` - Custom DOM element matchers

2. **Configuration Files**:
   - `jest.config.mjs` - Main Jest configuration
   - `jest.setup.ts` - Test setup and global mocks
   - `jest.d.ts` - Type definitions for Jest
   - Type extensions in `types/` directory

3. **TypeScript Integration**:
   - Custom type definitions to support Jest matchers with TypeScript
   - Configured `tsconfig.json` to include test files and types
   - Reference types in test files with `/// <reference types="@testing-library/jest-dom" />`

### Cypress Setup

1. **Dependencies**:
   - `cypress` - End-to-end testing framework

2. **Configuration Files**:
   - `cypress.config.ts` - Cypress configuration with component and E2E testing setup
   - Component tests in `cypress/component/`
   - E2E tests in `cypress/e2e/`

3. **Running Cypress**:
   - Component Testing: `npm run component`
   - E2E Testing: `npm run e2e`

## Continuous Integration

Tests are automatically run on each pull request and push to the main branch using GitHub Actions. The workflow:

1. Runs all Jest tests
2. Runs Cypress tests in headless mode
3. Uploads coverage reports to Codecov (if configured)

## Test Structure

### Unit Tests

Unit tests are located in the `__tests__` directory, mirroring the structure of the source code. For example, tests for components in `app/components` are located in `__tests__/components`.

### End-to-End Tests

End-to-end tests are located in the `cypress/e2e` directory.

## TypeScript Configuration

The testing setup includes comprehensive TypeScript support:

1. **Type Definitions**: Custom type definition files in the `types/` directory:
   - `jest.d.ts`: Base Jest type extensions
   - `jest-dom.d.ts`: Test-library specific matchers
   - `global.d.ts`: Global interface extensions
   - `testing-library.d.ts`: Testing Library type augmentations
   - `jest-extended.d.ts`: Extended Jest matchers
   - `expect-extend.d.ts`: Chai assertion extensions

2. **Configuration Files**:
   - `jest.setup.ts`: TypeScript setup file for Jest
   - `jest.config.mjs`: Jest configuration that references the TypeScript setup

3. **tsconfig.json** includes test files and type definitions to ensure proper type checking.

## Writing Tests

### Component Tests

When writing component tests, follow these guidelines:

1. Import necessary testing utilities and matchers:
   ```tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import '@testing-library/jest-dom'; // Explicitly import jest-dom
   ```

2. Use `render` from `@testing-library/react` to render components
3. Use queries like `getByText`, `getByRole`, etc. to find elements
4. Use `fireEvent` or `userEvent` to simulate user interactions
5. Use `waitFor` or `findBy` queries for asynchronous behavior

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '@/app/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Context Tests

When testing contexts, create a test component that uses the context hooks and test the behavior through that component.

### Cypress Component Tests

1. Create component tests in `cypress/component/`:
   ```tsx
   import MyComponent from '../../app/components/MyComponent';

   describe('<MyComponent />', () => {
     it('renders and functions correctly', () => {
       cy.mount(<MyComponent />);
       cy.get('button').click();
       cy.contains('Clicked').should('be.visible');
     });
   });
   ```

2. Run with `npm run component`

### Cypress E2E Tests

1. Create E2E tests in `cypress/e2e/`:
   ```tsx
   describe('App navigation', () => {
     it('navigates correctly', () => {
       cy.visit('/');
       cy.get('a[href="/about"]').click();
       cy.url().should('include', '/about');
     });
   });
   ```

2. Run with `npm run e2e`

### Mocking

- Use Jest mocks for external dependencies
- Use `jest.spyOn` to spy on methods
- Mock context providers when necessary

## Troubleshooting

### Common Issues

- **Test timeouts**: Increase the timeout in Jest configuration or use `jest.setTimeout()`
- **Async issues**: Make sure to use `waitFor`, `findBy` queries, or `act` for asynchronous operations
- **TypeScript errors with Jest matchers**:
  1. Make sure to explicitly import `@testing-library/jest-dom` in your test files
  2. Check that your test file is included in the TypeScript compiler paths
  3. For new matchers, add them to the appropriate type definition file
  4. Ensure your `tsconfig.json` includes `@testing-library/jest-dom` in types

## Visual Regression Testing

Visual regression testing captures screenshots of components and UI elements to detect unintended visual changes during development. This helps ensure that UI updates don't accidentally break existing designs.

### Implementation Plan

1. **Tools**:
   - **Cypress**: For capturing screenshots
   - **Percy**: For visual comparison between baseline and current snapshots
   - **Playwright**: Alternative for advanced cross-browser visual testing

2. **Setup**:
   ```bash
   npm install -D @percy/cypress
   ```

3. **Configuration**:
   ```js
   // cypress/support/e2e.js
   import '@percy/cypress';
   ```

4. **Example Usage**:
   ```js
   describe('Visual Regression', () => {
     it('should maintain visual consistency of the homepage', () => {
       cy.visit('/');
       cy.percySnapshot('Homepage');
       
       // Test different viewport sizes
       cy.viewport('iphone-x');
       cy.percySnapshot('Homepage on Mobile');
     });
   });
   ```

5. **Integration with CI**:
   - Connect Percy with GitHub Actions to run visual tests on each PR
   - Add Percy token to GitHub secrets

### Benefits

- Automatic detection of unintended visual changes
- Cross-browser visual consistency
- Visual testing for responsive designs across device sizes
- UI component library quality assurance

### Future Implementation Steps

1. Set up Percy account and get API token
2. Install Percy integration with Cypress
3. Create baseline screenshots for critical UI components
4. Add visual regression tests for key user flows
5. Integrate with CI/CD pipeline

## Future Improvements

- Expand end-to-end test coverage
- Implement visual regression testing as outlined above 