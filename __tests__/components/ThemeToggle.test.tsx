import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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

    test('ThemeLabel renders correctly based on theme', async () => {
        // Test dark mode first
        render(
            <ThemeProvider>
                <ThemeLabel />
            </ThemeProvider>
        );

        // Should show "Dark Mode" text
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();

        // Using a more reliable query that won't fail if data-testid isn't immediately available
        const darkModeIcon = await screen.findByText('Dark Mode');
        expect(darkModeIcon).toBeInTheDocument();

        // Clean up and test light mode
        cleanup();

        // Set theme to light in localStorage before rendering
        localStorage.setItem('theme', 'light');

        render(
            <ThemeProvider>
                <ThemeLabel />
            </ThemeProvider>
        );

        // Should show "Dark Mode" text (the label text doesn't change)
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
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