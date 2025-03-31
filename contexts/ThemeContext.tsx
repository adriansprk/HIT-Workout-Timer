"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDarkMode, setDarkMode } from '../lib/settings';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    enableDarkMode: () => void;
    disableDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to true, will be updated from localStorage

    // Initialize dark mode from localStorage on mount
    useEffect(() => {
        const darkModeSetting = getDarkMode();
        setIsDarkMode(darkModeSetting);

        // Apply dark mode class to html element
        if (darkModeSetting) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            setDarkMode(newValue);

            if (newValue) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            return newValue;
        });
    };

    // Enable dark mode
    const enableDarkMode = () => {
        setIsDarkMode(true);
        setDarkMode(true);
        document.documentElement.classList.add('dark');
    };

    // Disable dark mode
    const disableDarkMode = () => {
        setIsDarkMode(false);
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, enableDarkMode, disableDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 