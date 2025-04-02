/// <reference types="@testing-library/jest-dom" />

// This file extends Chai's Assertion interface with jest-dom matchers
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
    }
} 