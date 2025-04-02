import '@testing-library/jest-dom';

declare global {
    const jest: {
        fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.Mock<ReturnType<T>, Parameters<T>>;
        mock: (moduleName: string, factory?: any) => jest.Mock;
        spyOn: <T extends {}, M extends keyof T>(object: T, method: M) => jest.SpyInstance;
        clearAllMocks: () => void;
        resetAllMocks: () => void;
        restoreAllMocks: () => void;
    };

    namespace jest {
        interface Mock<T = any, Y extends any[] = any[]> {
            (...args: Y): T;
            mockClear(): this;
            mockReset(): this;
            mockRestore(): this;
            mockImplementation(fn: (...args: Y) => T): this;
            mockImplementationOnce(fn: (...args: Y) => T): this;
            mockReturnValue(value: T): this;
            mockReturnValueOnce(value: T): this;
            mockResolvedValue(value: T): this;
            mockResolvedValueOnce(value: T): this;
            mockRejectedValue(value: any): this;
            mockRejectedValueOnce(value: any): this;
            getMockName(): string;
            mockName(name: string): this;
            mock: {
                calls: Y[];
                instances: T[];
                invocationCallOrder: number[];
                results: { type: string; value: T }[];
            };
        }

        interface SpyInstance<T = any, Y extends any[] = any[]> extends Mock<T, Y> {
            mockRestore(): void;
        }
    }

    namespace jest {
        interface Matchers<R, T = any> {
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

    interface ExpectStatic {
        objectContaining<T extends object>(obj: T): T;
    }
}

export { }; 