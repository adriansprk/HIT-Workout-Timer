"use client";

import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';

interface MuteButtonProps {
    variant?: 'icon' | 'toggle';
    className?: string;
}

export const MuteButton: React.FC<MuteButtonProps> = ({ variant = 'icon', className }) => {
    const { isMuted, toggleMute } = useAudio();
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggleMute = () => {
        setIsAnimating(true);
        setTimeout(() => {
            toggleMute();
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }, 150);
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="sr-only">Toggle audio announcements</span>
            </label>
        );
    }

    return (
        <button
            onClick={toggleMute}
            className={`h-12 w-12 rounded-full bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 border border-gray-700/50 flex items-center justify-center transition-colors ${className || ''}`}
            aria-label={isMuted ? "Unmute audio announcements" : "Mute audio announcements"}
        >
            {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
            ) : (
                <Volume2 className="h-5 w-5 text-white" />
            )}
        </button>
    );
};