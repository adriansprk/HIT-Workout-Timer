/// <reference types="jest" />

declare namespace jest {
    // Extend the global expect interface
    interface Expect extends jest.Matchers<void> {
        toBeInTheDocument(): void;
        toBeVisible(): void;
        toHaveTextContent(text: string | RegExp): void;
        toHaveStyle(style: Record<string, any>): void;
        toHaveClass(className: string): void;
        toHaveAttribute(attr: string, value?: any): void;
        toBeDisabled(): void;
        toBeEnabled(): void;
        toBeChecked(): void;
        toHaveValue(value: any): void;
        toBeEmptyDOMElement(): void;
    }

    // Extend expect matchers for all variations
    interface Matchers<R> {
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

// Extend the expect object globally
declare global {
    const expect: jest.Expect;
} 