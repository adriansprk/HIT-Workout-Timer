/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
    interface Expect {
        objectContaining<T extends object>(obj: T): T;
    }
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toBeVisible(): R;
            toHaveTextContent(text: string | RegExp): R;
            toHaveStyle(style: Record<string, any>): R;
            toHaveClass(className: string): R;
            toHaveAttribute(attr: string, value?: any): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toHaveBeenCalledWith(...args: any[]): R;
            toHaveBeenCalled(): R;
            toBeChecked(): R;
            toHaveValue(value: any): R;
            toBe(expected: any): R;
            toBeTruthy(): R;
            toBeFalsy(): R;
            toEqual(expected: any): R;
            toContain(item: any): R;
            toThrow(error?: string | Error | RegExp): R;
            toMatchSnapshot(): R;
            toBeEmptyDOMElement(): R;
        }
    }
} 