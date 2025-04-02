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
        let mounted = true;

        const initializeAudio = async () => {
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
            await initAudio();

            // Check if audio needs to be unlocked for mobile and preload sounds
            await unlockAudioForMobile();
            await preloadSounds();

            // Only update state if component is still mounted
            if (mounted) {
                setIsInitialized(true);
            }
        };

        initializeAudio().catch(console.error);

        // Clean up audio resources on unmount if needed
        return () => {
            mounted = false;
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