"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { preloadSounds, playSound, unlockAudioForMobile, initAudio, type CountdownSound } from '../lib/audio';
import { loadSettings, saveSettings } from '../lib/settings';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playCountdownSound: (sound: CountdownSound) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize audio settings on mount
    useEffect(() => {
        const settings = loadSettings();
        // Always start with unmuted audio
        setIsMuted(false);

        // If there are saved settings, update to save the unmuted state
        if (settings.muted) {
            saveSettings({
                ...settings,
                muted: false
            });
        }

        // Initialize audio module
        initAudio();

        // Check if audio needs to be unlocked for mobile
        unlockAudioForMobile().then(() => {
            // Preload audio files
            preloadSounds().then(() => {
                setIsInitialized(true);
            });
        });

        // Clean up audio resources on unmount if needed
        return () => {
            // Any cleanup code for audio resources can go here
        };
    }, []);

    // Update localStorage when mute state changes
    useEffect(() => {
        if (isInitialized) {
            saveSettings({
                ...loadSettings(),
                muted: isMuted
            });
        }
    }, [isMuted, isInitialized]);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const playCountdownSound = async (sound: CountdownSound) => {
        await playSound(sound, isMuted);
    };

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, playCountdownSound }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);

    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }

    return context;
}; 