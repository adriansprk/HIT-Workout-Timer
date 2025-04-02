import '@testing-library/jest-dom';

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
            toBeChecked(): R;
            toBeEmptyDOMElement(): R;
            toHaveValue(value: any): R;
            toHaveBeenCalled(): R;
            toHaveBeenCalledWith(...args: any[]): R;
        }
    }
} 