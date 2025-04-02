/// <reference types="@testing-library/jest-dom" />

declare global {
    namespace jest {
        interface Expect {
            /**
             * Used to check if a value is what you expect
             */
            toBe(expected: any): any;

            /**
             * Used when you want to check that an item is in a collection
             */
            toContain(expected: any): any;

            /**
             * Used to verify that a function was called
             */
            toHaveBeenCalled(): any;

            /**
             * Used to verify that a function was called with specific arguments
             */
            toHaveBeenCalledWith(...args: any[]): any;

            /**
             * Used when checking if an element is present in the DOM
             */
            toBeInTheDocument(): any;

            /**
             * Used to check if an element is empty
             */
            toBeEmptyDOMElement(): any;

            /**
             * Used to check if an element has specific text content
             */
            toHaveTextContent(text: string | RegExp): any;

            /**
             * Used to check if an element has a specific class
             */
            toHaveClass(className: string): any;

            /**
             * Used to check if an element has a specific attribute
             */
            toHaveAttribute(attr: string, value?: any): any;

            /**
             * Used to check if a checkbox is checked
             */
            toBeChecked(): any;

            /**
             * Used for snapshot testing
             */
            toMatchSnapshot(): any;

            /**
             * Used when you want to check that an object is what you expect
             */
            toEqual(expected: any): any;

            objectContaining<T extends object>(obj: T): T;
        }

        interface AsymmetricMatchers {
            toBeInTheDocument(): void;
            toBeEmptyDOMElement(): void;
            toHaveTextContent(text: string | RegExp): void;
            toHaveBeenCalled(): void;
            toHaveBeenCalledWith(...args: any[]): void;
            objectContaining<T extends object>(obj: T): T;
        }

        interface Matchers<R, T = {}> {
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
            toMatchObject(obj: any): R;
            toBe(expected: any): R;
            toBeTruthy(): R;
            toBeFalsy(): R;
            toEqual(expected: any): R;
            toContain(item: any): R;
            toThrow(error?: string | Error | RegExp): R;
            toMatchSnapshot(): R;
        }
    }

    namespace expect {
        /**
         * Used to create a partial object matcher
         */
        function objectContaining<T extends object>(obj: T): T;
    }
} 