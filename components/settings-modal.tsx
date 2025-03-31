"use client";

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"

interface SettingsModalProps {
    onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { isMuted } = useAudio()

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
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* Sound toggle */}
                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sound</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{isMuted ? "Unmute" : "Mute"} workout sounds</p>
                            </div>
                            <MuteButton />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700">
                    <Button
                        onClick={onClose}
                        className="w-full py-6 text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    )
} 