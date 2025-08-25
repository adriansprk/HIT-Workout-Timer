"use client";

import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Component that dynamically updates theme-color meta tags based on current theme
 * This ensures iOS status bar colors are properly updated when users manually toggle themes
 */
export function ThemeColorManager() {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        // Update theme-color meta tag dynamically
        const updateThemeColor = (color: string) => {
            // Remove existing theme-color meta tags
            const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
            existingMetas.forEach(meta => meta.remove());

            // Add new theme-color meta tag
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);

            // Also update for iOS status bar
            const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
            if (statusBarMeta) {
                // For dark backgrounds, use light content
                statusBarMeta.setAttribute('content', isDarkMode ? 'light-content' : 'default');
            }

            // Update MS application colors for Windows
            const navButtonMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
            if (navButtonMeta) {
                navButtonMeta.setAttribute('content', color);
            }

            const tileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
            if (tileMeta) {
                tileMeta.setAttribute('content', color);
            }
        };

        // Set colors based on current theme - exactly matching CSS background colors
        const lightColor = '#ffffff';  // Light mode: HSL(0 0% 100%) = white
        const darkColor = '#020817';   // Dark mode: HSL(222.2 84% 4.9%) = very dark blue-gray

        updateThemeColor(isDarkMode ? darkColor : lightColor);
    }, [isDarkMode]);

    // This component doesn't render anything visible
    return null;
}