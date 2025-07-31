"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useAudio } from '../contexts/AudioContext';
import { getAudioUnlockStatus } from '../lib/settings';
import { unlockAudioForMobile, forceUnlockAudio } from '../lib/audio';
import { log } from '../lib/utils';

/**
 * AudioUnlocker component that helps on mobile devices to unlock audio
 * iOS requires user interaction to enable audio, this modal helps with that
 */
export const AudioUnlocker = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const { playCountdownSound } = useAudio();
    const clickCountRef = useRef(0);
    const unlockAttemptedRef = useRef(false);

    useEffect(() => {
        // Only show the modal on iOS or Android
        const isMobile = /iPhone|iPad|iPod|Android/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (isMobile) {
            // First check localStorage to see if we've previously unlocked
            const savedUnlockStatus = getAudioUnlockStatus();

            if (savedUnlockStatus) {
                // Audio was previously unlocked, no need to show the modal
                setIsUnlocked(true);
                // Using the imported function directly instead of context
                import('../lib/audio').then(({ setAudioUnlocked }) => {
                    setAudioUnlocked(true);
                });
                log('Audio: Using saved unlock status');
            } else {
                // Check if audio actually needs unlocking
                unlockAudioForMobile().then(unlocked => {
                    if (unlocked) {
                        setIsUnlocked(true);
                        setIsVisible(false);
                    } else {
                        setIsVisible(true);
                    }
                });
            }
        }
    }, []);

    const unlockAudio = async () => {
        // Increment click count - iOS sometimes requires multiple attempts
        clickCountRef.current += 1;
        log(`Audio: Unlock attempt #${clickCountRef.current}`);

        // If this is the second click or later, force close the modal
        if (clickCountRef.current >= 2) {
            log('Audio: Second click detected, forcing modal close');
            setIsUnlocked(true);
            setIsVisible(false);
            // Using the imported function directly instead of context
            const { setAudioUnlocked } = await import('../lib/audio');
            setAudioUnlocked(true);
            return;
        }

        // If we've already attempted to unlock, make doubly sure the modal closes
        if (unlockAttemptedRef.current) {
            log('Audio: Unlock already attempted, forcing modal close');
            setIsUnlocked(true);
            setIsVisible(false);
            // Using the imported function directly instead of context
            const { setAudioUnlocked } = await import('../lib/audio');
            setAudioUnlocked(true);
            return;
        }

        unlockAttemptedRef.current = true;

        try {
            // Try the enhanced iOS unlock method first
            const iosUnlocked = await forceUnlockAudio();
            const { setAudioUnlocked } = await import('../lib/audio');

            if (iosUnlocked) {
                log('Audio: iOS specific unlock method succeeded');
                setAudioUnlocked(true);
                setIsUnlocked(true);
                setIsVisible(false);
                return;
            }

            // If iOS method didn't work, try the standard method
            const audio = new Audio();
            audio.play()
                .then(() => {
                    // Now try to play a test sound to fully unlock the audio context
                    playCountdownSound('one')
                        .then(() => {
                            setAudioUnlocked(true);
                            setIsUnlocked(true);
                            setIsVisible(false);
                            log('Audio: Successfully unlocked audio playback');
                        })
                        .catch(err => {
                            log('Audio: Failed to unlock with test sound: ' + err.message, 'error');
                            // Force unlock even if there was an error
                            setAudioUnlocked(true);
                            setIsUnlocked(true);
                            setIsVisible(false);
                        });
                })
                .catch(err => {
                    log('Audio: Failed to unlock audio: ' + err.message, 'error');
                    // Force unlock even if there was an error - iOS will get a second chance on the next click
                    if (clickCountRef.current >= 2) {
                        setAudioUnlocked(true);
                        setIsUnlocked(true);
                        setIsVisible(false);
                    }
                });
        } catch (error) {
            log('Audio: Error in unlockAudio: ' + (error as Error).message, 'error');
            // Force unlock even if there was an error
            if (clickCountRef.current >= 2) {
                const { setAudioUnlocked } = await import('../lib/audio');
                setAudioUnlocked(true);
                setIsUnlocked(true);
                setIsVisible(false);
            }
        }
    };

    if (!isVisible || isUnlocked) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-md text-center">
                <h2 className="text-xl font-bold mb-4 text-foreground">Permissions Dialog</h2>
                <p className="mb-6 text-card-foreground">
                    To enable workout sounds on your mobile device, please tap the button below.
                    {clickCountRef.current === 1 && (
                        <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                            Tap again to continue if sounds don&apos;t work.
                        </span>
                    )}
                </p>
                <Button
                    onClick={unlockAudio}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-md text-lg w-full sm:w-auto"
                >
                    Enable Sounds
                </Button>
            </div>
        </div>
    );
}; 