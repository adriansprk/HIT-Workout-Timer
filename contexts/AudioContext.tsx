"use client";

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import {
    preloadSounds,
    playSound,
    unlockAudioForMobile,
    initAudio,
    cleanupAudio,
    restoreAudioPlayback,
    type CountdownSound
} from '../lib/audio';
import { loadSettings, saveSettings } from '../lib/settings';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    needsAudioRestore: boolean;
    restoreAudio: () => Promise<boolean>;
    playCountdownSound: (sound: CountdownSound) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [needsAudioRestore, setNeedsAudioRestore] = useState(false);
    const wasHiddenRef = useRef(false);

    // Initialize audio settings on mount
    useEffect(() => {
        const settings = loadSettings();
        setIsMuted(settings.muted);

        // Initialize audio module
        initAudio();

        // Check if audio needs to be unlocked for mobile
        unlockAudioForMobile().then(() => {
            // Preload audio files
            preloadSounds().then(() => {
                setIsInitialized(true);
            });
        });

        // Clean up audio resources on unmount
        return () => {
            cleanupAudio();
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

    useEffect(() => {
        const isMobileAudioDevice = /iPhone|iPad|iPod|Android/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (!isMobileAudioDevice) {
            return;
        }

        const markRestoreNeeded = () => {
            const settings = loadSettings();
            if (settings.audioUnlocked && !settings.muted) {
                setNeedsAudioRestore(true);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                wasHiddenRef.current = true;
                return;
            }

            if (wasHiddenRef.current) {
                markRestoreNeeded();
            }
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (wasHiddenRef.current || event.persisted) {
                markRestoreNeeded();
            }
        };

        const handleFocus = () => {
            if (wasHiddenRef.current) {
                markRestoreNeeded();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const restoreAudio = useCallback(async () => {
        const restored = await restoreAudioPlayback();
        setNeedsAudioRestore(!restored);
        return restored;
    }, []);

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);

        if (nextMuted) {
            setNeedsAudioRestore(false);
        } else {
            void restoreAudio();
        }
    };

    const playCountdownSound = async (sound: CountdownSound) => {
        await playSound(sound, isMuted);
    };

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, needsAudioRestore, restoreAudio, playCountdownSound }}>
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
