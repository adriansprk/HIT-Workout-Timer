"use client";

import { Button } from "@/components/ui/button"
import { X, Moon, Sun, VolumeX, Volume2, Mic, MicOff } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"
import { useTheme } from "../contexts/ThemeContext"

interface SettingsModalProps {
    onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { isMuted, toggleMute } = useAudio()
    const { isDarkMode, toggleDarkMode } = useTheme()

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                <div className="p-5 space-y-6">
                    <div className="space-y-4">
                        {/* Theme toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    {isDarkMode ? (
                                        <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                        <Sun className="h-5 w-5 text-amber-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={toggleDarkMode}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {/* Audio Announcements toggle */}
                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    {isMuted ? (
                                        <VolumeX className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                        <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audio Announcements</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {isMuted ? "Off: No workout announcements" : "On: Workout progress announcements"}
                                    </p>
                                </div>
                            </div>
                            <MuteButton variant="toggle" />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700">
                    <Button
                        onClick={onClose}
                        className="w-full py-6 text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    )
} 