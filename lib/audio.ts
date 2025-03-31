import { saveAudioUnlockStatus, getAudioUnlockStatus as getSavedAudioUnlockStatus } from './settings';

export type CountdownSound = 'three' | 'two' | 'one' | 'rest' | 'go';

interface AudioCache {
    [key: string]: HTMLAudioElement;
}

// Cache for preloaded audio elements
const audioCache: AudioCache = {};

// Create a persistent Audio element for iOS
let masterAudioElement: HTMLAudioElement | null = null;

// Flag to track if audio has been unlocked for mobile
let isAudioUnlocked = false;

/**
 * Set the audio unlock status
 */
export const setAudioUnlocked = (value: boolean): void => {
    isAudioUnlocked = value;

    // Also save to localStorage for persistence
    saveAudioUnlockStatus(value);

    if (value) {
        console.log('Audio: Unlock status set to true');
    }
};

/**
 * Get the current audio unlock status
 */
export const getAudioUnlockStatus = (): boolean => {
    return isAudioUnlocked;
};

/**
 * Completely unlock audio playback on iOS devices
 * This will play a silent sound to unlock the Audio API
 */
export const forceUnlockAudio = async (): Promise<boolean> => {
    try {
        console.log('Audio: Attempting to force unlock audio playback');

        // Create a master audio element if we don't have one yet
        if (!masterAudioElement) {
            masterAudioElement = new Audio();
        }

        // iOS hack: play a silent base64-encoded MP3
        masterAudioElement.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        masterAudioElement.autoplay = true;
        masterAudioElement.load();

        // iOS requires a play attempt from a user gesture
        // This would be called from a button click
        await masterAudioElement.play()
            .then(() => {
                console.log('Audio: Successfully unlocked audio with silent sound');
                isAudioUnlocked = true;
                saveAudioUnlockStatus(true);

                // Now try to unlock all the cached sounds by quickly playing them
                // This is a key step for iOS Safari
                Object.values(audioCache).forEach(audio => {
                    try {
                        console.log(`Audio: Unlocking cached sound: ${audio.src}`);
                        const promise = audio.play();
                        if (promise !== undefined) {
                            promise
                                .then(() => {
                                    audio.pause();
                                    audio.currentTime = 0;
                                })
                                .catch(e => console.log('Audio unlock attempt ignored:', e));
                        }
                    } catch (e) {
                        console.log('Error attempting to unlock audio:', e);
                    }
                });

                return true;
            })
            .catch(e => {
                console.error('Audio: Failed to unlock audio:', e);
                return false;
            });

        return isAudioUnlocked;
    } catch (error) {
        console.error('Audio: Error in forceUnlockAudio:', error);
        return false;
    }
};

/**
 * Initialize audio module with stored preferences
 */
export const initAudio = (): void => {
    // Try to get unlock status from localStorage
    try {
        const storedUnlockStatus = getSavedAudioUnlockStatus();
        isAudioUnlocked = storedUnlockStatus;

        if (storedUnlockStatus) {
            console.log('Audio: Restored unlocked status from localStorage');
        }
    } catch (error) {
        console.error('Audio: Error loading audio unlock status:', error);
    }
};

/**
 * Preloads all countdown sound files
 */
export const preloadSounds = async (): Promise<void> => {
    try {
        const sounds: CountdownSound[] = ['three', 'two', 'one', 'rest', 'go'];

        for (const sound of sounds) {
            try {
                // Make sure we use the correct path
                const audio = new Audio(`/audio/${sound}.mp3`);

                // Set up error handler
                audio.onerror = (e) => {
                    console.error(`Error loading ${sound}.mp3:`, e);
                };

                // Load the audio
                audio.load();

                // Save to cache
                audioCache[sound] = audio;

                // Log successful loads for debugging
                console.log(`Audio: Successfully loaded ${sound}.mp3`);
            } catch (err) {
                console.error(`Failed to preload ${sound}.mp3:`, err);
            }
        }

        console.log('Audio: All audio files preloaded successfully');
    } catch (error) {
        console.warn('Failed to preload audio files:', error);
    }
};

/**
 * Attempt to unlock audio on mobile devices
 */
export const unlockAudioForMobile = async (): Promise<boolean> => {
    // First check if we've already been unlocked according to localStorage
    try {
        const storedUnlockStatus = getSavedAudioUnlockStatus();
        if (storedUnlockStatus) {
            isAudioUnlocked = true;
            console.log('Audio: Using stored unlock status from localStorage');
            return true;
        }
    } catch (error) {
        console.error('Audio: Error checking stored audio unlock status:', error);
    }

    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    if (!isMobile) {
        // Not a mobile device, no need to unlock
        isAudioUnlocked = true;
        saveAudioUnlockStatus(true);
        return true;
    }

    try {
        // Create an empty audio element
        const audio = new Audio();

        // Try to play it (this will fail on mobile without user interaction)
        const result = await audio.play().then(() => {
            // If successful, audio is already unlocked
            audio.pause();
            isAudioUnlocked = true;
            saveAudioUnlockStatus(true);
            console.log('Audio: Playback already unlocked');
            return true;
        }).catch(err => {
            // If it fails, audio is locked
            console.log('Audio: Playback locked, requires user interaction', err);
            isAudioUnlocked = false;
            saveAudioUnlockStatus(false);
            return false;
        });

        return result;
    } catch (error) {
        console.error('Audio: Error checking audio unlock status:', error);
        return false;
    }
};

/**
 * Plays the specified countdown sound if not muted
 */
export const playSound = async (sound: CountdownSound, isMuted: boolean): Promise<void> => {
    if (isMuted) {
        console.log(`Audio: Skipping ${sound} (muted)`);
        return;
    }

    // Check if we're on mobile and audio is not unlocked
    if (!isAudioUnlocked) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (isMobile) {
            console.log(`Audio: Not playing ${sound} - audio not yet unlocked on mobile`);
            return;
        }
    }

    try {
        const audio = audioCache[sound];

        if (!audio) {
            console.warn(`Audio: Sound "${sound}" not found in cache. Attempting to load directly.`);
            const newAudio = new Audio(`/audio/${sound}.mp3`);

            newAudio.onerror = (e) => {
                console.error(`Audio: Error loading ${sound}.mp3 on demand:`, e);
            };

            await new Promise((resolve) => {
                newAudio.addEventListener('canplaythrough', resolve, { once: true });
                newAudio.addEventListener('error', () => {
                    console.error(`Audio: Failed to load sound: ${sound}`);
                    resolve(null);
                }, { once: true });
                newAudio.load();
            });

            if (newAudio.readyState >= 3) {
                console.log(`Audio: Playing ${sound}.mp3 on demand`);
                // Reset playback position to ensure it plays from the start
                newAudio.currentTime = 0;
                await newAudio.play().catch(err => console.error(`Audio: Error playing sound ${sound}:`, err));
            }
            return;
        }

        // If sound is already cached, play it
        console.log(`Audio: Playing ${sound}.mp3 from cache`);

        // Create a fresh copy to avoid interference with ongoing playback
        const freshAudio = audio.cloneNode() as HTMLAudioElement;

        // Reset playback position to ensure it plays from the start
        freshAudio.currentTime = 0;

        await freshAudio.play().catch(err => {
            console.error(`Audio: Error playing sound ${sound}:`, err);

            // Handle browsers with autoplay restrictions
            if (err.name === 'NotAllowedError') {
                console.warn('Audio: Playback was blocked by the browser. User interaction is required first.');
                isAudioUnlocked = false;
            }
        });
    } catch (error) {
        console.error(`Audio: Error in playSound for "${sound}":`, error);
    }
}; 