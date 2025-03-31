"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span
                className={`block w-5 h-5 rounded-full transition-transform duration-200 transform ${isDarkMode ? "translate-x-7 bg-indigo-500" : "translate-x-0 bg-white"
                    }`}
            />
            <span className="sr-only">{isDarkMode ? "Dark mode" : "Light mode"}</span>
        </button>
    );
}

export function ThemeLabel() {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className={`${isDarkMode ? "bg-blue-800" : "bg-yellow-400"} p-1 rounded-md`}>
                {isDarkMode ? (
                    <Moon className="h-4 w-4 text-white" />
                ) : (
                    <Sun className="h-4 w-4 text-white" />
                )}
            </div>
            <span className="font-medium">Dark Mode</span>
        </div>
    );
}

export function SettingsThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <ThemeLabel />
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
} 