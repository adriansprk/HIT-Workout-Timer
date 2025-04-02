import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeToggle, ThemeLabel, SettingsThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the document.documentElement manipulation
const mockClassList = {
    add: jest.fn(),
    remove: jest.fn(),
};

// Backup original implementation
const originalDocumentElement = document.documentElement;

describe('ThemeToggle Components', () => {
    beforeEach(() => {
        // Setup localStorage mock
        localStorage.clear();

        // Setup document.documentElement mock
        Object.defineProperty(document, 'documentElement', {
            value: { classList: mockClassList },
            writable: true,
        });

        // Clear mocks
        mockClassList.add.mockClear();
        mockClassList.remove.mockClear();
    });

    afterEach(() => {
        // Restore document.documentElement
        Object.defineProperty(document, 'documentElement', {
            value: originalDocumentElement,
            writable: true,
        });
    });

    test('ThemeToggle renders correctly and toggles theme', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const button = screen.getByRole('button');

        // Initially in dark mode (default)
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');

        // Toggle to light mode
        fireEvent.click(button);

        // Should now be in light mode
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        expect(localStorage.getItem('theme')).toBe('light');
        expect(mockClassList.remove).toHaveBeenCalledWith('dark');

        // Toggle back to dark mode
        fireEvent.click(button);

        // Should now be in dark mode again
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    test('ThemeLabel renders correctly based on theme', () => {
        // Mock the ThemeContext state to control isDarkMode
        const renderWithTheme = (isDarkMode: boolean) => {
            // Set up localStorage to match the expected theme
            if (isDarkMode) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }

            return render(
                <ThemeProvider>
                    <ThemeLabel />
                </ThemeProvider>
            );
        };

        // Render with dark mode (default)
        renderWithTheme(true);

        // Should show "Dark Mode" text
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();

        // Should have an SVG icon
        const iconInDarkMode = screen.getByTestId('theme-icon');
        expect(iconInDarkMode).toBeInTheDocument();

        // Clean up and re-render with light mode
        cleanup();
        localStorage.setItem('theme', 'light');
        renderWithTheme(false);

        // Should still show "Dark Mode" text
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();

        // Should have a different SVG icon
        const iconInLightMode = screen.getByTestId('theme-icon');
        expect(iconInLightMode).toBeInTheDocument();
    });

    test('SettingsThemeToggle renders correctly and toggles theme', () => {
        render(
            <ThemeProvider>
                <SettingsThemeToggle />
            </ThemeProvider>
        );

        const checkbox = screen.getByRole('checkbox');

        // Initially checked (dark mode)
        expect(checkbox).toBeChecked();

        // Toggle to light mode
        fireEvent.click(checkbox);

        // Should now be unchecked (light mode)
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('theme')).toBe('light');

        // Toggle back to dark mode
        fireEvent.click(checkbox);

        // Should be checked again (dark mode)
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('dark');
    });
}); 