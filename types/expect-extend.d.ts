/// <reference types="@testing-library/jest-dom" />

declare global {
    namespace Chai {
        interface Assertion {
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
} 