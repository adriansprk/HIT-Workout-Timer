import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Mock document.documentElement manipulation
const mockClassList = {
    add: jest.fn(),
    remove: jest.fn()
};

// Backup original implementation
const originalDocumentElement = document.documentElement;

// Test component that uses the theme context
const TestComponent = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div>
            <div data-testid="theme-status">{isDarkMode ? 'dark' : 'light'}</div>
            <button onClick={toggleDarkMode}>Toggle Theme</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        // Setup localStorage mock
        localStorage.clear();

        // Setup document.documentElement mock
        Object.defineProperty(document, 'documentElement', {
            value: { classList: mockClassList },
            writable: true
        });

        // Clear mocks
        mockClassList.add.mockClear();
        mockClassList.remove.mockClear();
    });

    afterEach(() => {
        // Restore document.documentElement
        Object.defineProperty(document, 'documentElement', {
            value: originalDocumentElement,
            writable: true
        });
    });

    test('initializes with dark mode by default', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    test('loads theme preference from localStorage', () => {
        // Set light theme in localStorage
        localStorage.setItem('theme', 'light');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
        expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    });

    test('toggles between light and dark mode', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        // Should start in dark mode
        expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

        // Toggle to light mode
        fireEvent.click(screen.getByText('Toggle Theme'));

        // Should now be in light mode
        expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
        expect(localStorage.getItem('theme')).toBe('light');
        expect(mockClassList.remove).toHaveBeenCalledWith('dark');

        // Toggle back to dark mode
        fireEvent.click(screen.getByText('Toggle Theme'));

        // Should now be in dark mode again
        expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    test('throws error when useTheme is used outside of ThemeProvider', () => {
        // Mock console.error to prevent expected error from being printed in test output
        const originalError = console.error;
        console.error = jest.fn();

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useTheme must be used within a ThemeProvider');

        // Restore console.error
        console.error = originalError;
    });
}); 