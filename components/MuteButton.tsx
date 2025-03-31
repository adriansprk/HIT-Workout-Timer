"use client";

import { useAudio } from '../contexts/AudioContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';

export const MuteButton = () => {
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

    return (
        <Button
            size="icon"
            variant="ghost"
            aria-label={isMuted ? "Unmute" : "Mute"}
            onClick={handleToggleMute}
            className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 flex items-center justify-center"
        >
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isMuted ? (isAnimating ? 'opacity-0' : 'opacity-100') : 'opacity-0'}`}>
                <VolumeX className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-90' : 'rotate-0'} text-gray-600 dark:text-gray-300`} />
            </div>

            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isMuted ? 'opacity-0' : (isAnimating ? 'opacity-0' : 'opacity-100')}`}>
                <Volume2 className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-90' : 'rotate-0'} text-gray-600 dark:text-gray-300`} />
            </div>
        </Button>
    );
}; 