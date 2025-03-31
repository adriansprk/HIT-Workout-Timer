"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useAudio } from '../contexts/AudioContext';
import { unlockAudioForMobile, setAudioUnlocked } from '../lib/audio';
import { getAudioUnlockStatus } from '../lib/settings';

export const AudioUnlocker = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { playCountdownSound } = useAudio();
    const unlockAttemptedRef = useRef(false);

    useEffect(() => {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (isMobile) {
            // First check localStorage to see if we've previously unlocked
            const savedUnlockStatus = getAudioUnlockStatus();

            if (savedUnlockStatus) {
                // Audio was previously unlocked, no need to show the modal
                setIsUnlocked(true);
                setAudioUnlocked(true);
                console.log('Audio: Using saved unlock status');
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
        if (unlockAttemptedRef.current) {
            console.log('Audio: Unlock already attempted, forcing modal close');
            setIsUnlocked(true);
            setIsVisible(false);
            setAudioUnlocked(true);
            return;
        }

        unlockAttemptedRef.current = true;

        try {
            // Play a silent sound to unlock audio
            const audio = new Audio();
            audio.play()
                .then(() => {
                    // Now try to play a test sound to fully unlock the audio context
                    playCountdownSound('one')
                        .then(() => {
                            setAudioUnlocked(true);
                            setIsUnlocked(true);
                            setIsVisible(false);
                            console.log('Audio: Successfully unlocked audio playback');
                        })
                        .catch(err => {
                            console.error('Audio: Failed to unlock with test sound:', err);
                            // Force unlock even if there was an error
                            setAudioUnlocked(true);
                            setIsUnlocked(true);
                            setIsVisible(false);
                        });
                })
                .catch(err => {
                    console.error('Audio: Failed to unlock audio:', err);
                    // Force unlock even if there was an error
                    setAudioUnlocked(true);
                    setIsUnlocked(true);
                    setIsVisible(false);
                });
        } catch (error) {
            console.error('Audio: Error in unlockAudio:', error);
            // Force unlock even if there was an error
            setAudioUnlocked(true);
            setIsUnlocked(true);
            setIsVisible(false);
        }
    };

    if (!isVisible || isUnlocked) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md text-center">
                <h2 className="text-xl font-bold mb-4">Enable Audio</h2>
                <p className="mb-6">
                    To enable workout sounds on your mobile device, please tap the button below.
                </p>
                <Button
                    onClick={unlockAudio}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                    Enable Sounds
                </Button>
            </div>
        </div>
    );
}; 