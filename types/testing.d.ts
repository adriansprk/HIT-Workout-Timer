/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// For jest namespace
declare namespace jest {
    interface Matchers<R, T = any> {
        toBeInTheDocument(): R;
        toBeVisible(): R;
        toHaveTextContent(text: string | RegExp): R;
        toHaveStyle(style: Record<string, any>): R;
        toHaveClass(className: string): R;
        toHaveAttribute(attr: string, value?: any): R;
        toBeDisabled(): R;
        toBeEnabled(): R;
        toBeChecked(): R;
        toHaveValue(value: any): R;
        toBeEmptyDOMElement(): R;
        toHaveBeenCalled(): R;
        toHaveBeenCalledWith(...args: any[]): R;
    }
}

// For Chai namespace (used by TypeScript's expect)
declare namespace Chai {
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
        toBeEmptyDOMElement(): Assertion;
        toHaveValue(value: any): Assertion;
        toHaveBeenCalled(): Assertion;
        toHaveBeenCalledWith(...args: any[]): Assertion;
        toThrow(error?: string | Error | RegExp): Assertion;
        toMatchSnapshot(): Assertion;
        toBe(expected: any): Assertion;
        toBeTruthy(): Assertion;
        toBeFalsy(): Assertion;
        toEqual(expected: any): Assertion;
        toContain(item: any): Assertion;
    }
} 