"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAudio } from '../contexts/AudioContext';
import { unlockAudioForMobile, setAudioUnlocked } from '../lib/audio';

export const AudioUnlocker = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { playCountdownSound } = useAudio();

    useEffect(() => {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (isMobile) {
            // Only show the unlocker on mobile devices
            // First check if audio is already unlocked
            unlockAudioForMobile().then(unlocked => {
                if (unlocked) {
                    setIsUnlocked(true);
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
            });
        }
    }, []);

    const unlockAudio = async () => {
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
                        });
                })
                .catch(err => {
                    console.error('Audio: Failed to unlock audio:', err);
                });
        } catch (error) {
            console.error('Audio: Error in unlockAudio:', error);
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