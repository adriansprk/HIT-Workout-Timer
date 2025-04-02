/// <reference types="@testing-library/jest-dom" />

// This file extends the Jest expectation interface
// It ensures TypeScript recognizes the matchers added by jest-dom

declare global {
    // Extend the Assertion interface
    namespace Chai {
        interface Assertion {
            // Jest DOM matchers
            toBeInTheDocument(): Assertion;
            toBeVisible(): Assertion;
            toHaveTextContent(text: string | RegExp): Assertion;
            toHaveStyle(style: Record<string, any>): Assertion;
            toHaveClass(className: string): Assertion;
            toHaveAttribute(attr: string, value?: any): Assertion;
            toBeDisabled(): Assertion;
            toBeEnabled(): Assertion;
            toBeChecked(): Assertion;
            toHaveValue(value: any): Assertion;
            toBeEmptyDOMElement(): Assertion;

            // Jest matchers
            toHaveBeenCalled(): Assertion;
            toHaveBeenCalledWith(...args: any[]): Assertion;
            toBe(expected: any): Assertion;
            toBeTruthy(): Assertion;
            toBeFalsy(): Assertion;
            toEqual(expected: any): Assertion;
            toContain(item: any): Assertion;
            toThrow(error?: string | Error | RegExp): Assertion;
            toMatchSnapshot(): Assertion;
        }
    }

    // Extend expect with objectContaining
    interface ExpectStatic {
        objectContaining<T extends object>(obj: T): T;
    }
} 