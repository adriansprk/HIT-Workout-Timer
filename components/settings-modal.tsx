"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, X } from 'lucide-react';
import { Button } from './ui/button';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    // Animation states
    useEffect(() => {
        // Delay to allow the modal to be in the DOM before animating in
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Delay the actual close to allow the animation to complete
        setTimeout(onClose, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md transform rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all duration-300"
                style={{
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="rounded-full h-8 w-8"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-100 dark:bg-blue-900" : "bg-yellow-100"}`}>
                                {isDarkMode ? (
                                    <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-yellow-600" />
                                )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                        </div>
                        <div className="flex items-center">
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
                    </div>

                    {/* App Version */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">App Version</span>
                        <span className="text-gray-600 dark:text-gray-400">1.0.0</span>
                    </div>
                </div>

                <div className="mt-6">
                    <Button
                        className="w-full"
                        onClick={handleClose}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
} 