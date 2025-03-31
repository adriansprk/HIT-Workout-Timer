"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Default to true for dark mode
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    useEffect(() => {
        // Initialize dark mode from localStorage or default to true (dark mode)
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            // Default to dark mode (either from storage or as default)
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
            // If not explicitly set, save the default
            if (!savedTheme) {
                localStorage.setItem('theme', 'dark');
            }
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;

            // Update localStorage and class on html element
            if (newMode) {
                localStorage.setItem('theme', 'dark');
                document.documentElement.classList.add('dark');
            } else {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
            }

            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use the theme context
export function useTheme() {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
} 