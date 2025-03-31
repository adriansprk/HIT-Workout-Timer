"use client";

import { useAudio } from '../contexts/AudioContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';

interface MuteButtonProps {
    variant?: 'icon' | 'toggle';
}

export const MuteButton = ({ variant = 'icon' }: MuteButtonProps) => {
    const { isMuted, toggleMute } = useAudio();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    const handleToggleMute = () => {
        setIsAnimating(true);
        toggleMute();
    };

    if (variant === 'toggle') {
        return (
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={!isMuted}
                    onChange={toggleMute}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
        );
    }

    return (
        <Button
            size="icon"
            variant="ghost"
            aria-label={isMuted ? "Unmute" : "Mute"}
            onClick={handleToggleMute}
            className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border dark:border-gray-600 p-0 flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
        >
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isMuted ? (isAnimating ? 'opacity-0' : 'opacity-100') : 'opacity-0'}`}>
                <VolumeX className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-90' : 'rotate-0'} text-gray-700 dark:text-white`} />
            </div>

            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isMuted ? 'opacity-0' : (isAnimating ? 'opacity-0' : 'opacity-100')}`}>
                <Volume2 className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-90' : 'rotate-0'} text-gray-700 dark:text-white`} />
            </div>
        </Button>
    );
}; 