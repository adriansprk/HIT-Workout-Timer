"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

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
        <Dialog open={isVisible} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg rounded-xl dark:bg-gray-900 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Settings</DialogTitle>
                    <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                        Customize your workout experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col">
                            <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                        onClick={handleClose}
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 