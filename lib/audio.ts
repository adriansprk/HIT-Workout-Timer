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

// Keep track of currently playing sounds to avoid duplicates
const playingSounds = new Set<string>();

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
        masterAudioElement.volume = 0; // Set volume to 0 to make it silent
        masterAudioElement.autoplay = true;
        masterAudioElement.load();

        // iOS requires a play attempt from a user gesture
        // This would be called from a button click
        await masterAudioElement.play()
            .then(() => {
                console.log('Audio: Successfully unlocked audio with silent sound');
                isAudioUnlocked = true;
                saveAudioUnlockStatus(true);

                // Don't try to play all sounds at once anymore
                // Just unlock the audio context
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
                // Make sure we use the correct path and add version to bypass caching
                const audio = new Audio(`/audio/${sound}.mp3?v=${Date.now()}`);

                // Important for iOS: set preload to auto
                audio.preload = 'auto';

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

    // Detect mobile devices - using a more comprehensive check
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    // Special handling for mobile devices - try to unlock multiple ways
    if (isMobile) {
        if (!isAudioUnlocked) {
            console.log(`Audio: Mobile device detected, ensuring audio is unlocked before playing ${sound}`);
            try {
                await forceUnlockAudio();
                isAudioUnlocked = true;
            } catch (err) {
                console.warn(`Audio: Could not unlock audio: ${err}`);
                // Still continue to try playing
            }
        }

        // On iOS specifically, ensure audio context is running
        const isIOS = /iPhone|iPad|iPod/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        if (isIOS) {
            console.log('Audio: iOS device detected, using additional iOS-specific techniques');
            // iOS often requires multiple attempts
            try {
                const dummyAudio = new Audio();
                dummyAudio.setAttribute('playsinline', '');
                dummyAudio.setAttribute('webkit-playsinline', '');
                dummyAudio.muted = true;
                await dummyAudio.play().catch(() => { });
            } catch (e) {
                // Ignore errors, just trying to wake up the audio context
            }
        }
    }

    // Prevent duplicate sounds
    if (playingSounds.has(sound)) {
        console.log(`Audio: Already playing ${sound}, not playing again`);
        return;
    }

    // Maximum number of retries
    let retries = 0;
    const maxRetries = 3;

    const attemptPlayback = async () => {
        try {
            // Add to playing set
            playingSounds.add(sound);

            // Audio instance to use for playback
            let audioToPlay: HTMLAudioElement;

            // Force reload from server instead of cache for mobile devices
            const cacheBuster = isMobile ? `?v=${Date.now()}` : '';

            // Get or create audio element
            const audio = audioCache[sound];
            if (!audio) {
                console.log(`Audio: Creating new audio instance for ${sound}`);
                audioToPlay = new Audio(`/audio/${sound}.mp3${cacheBuster}`);

                // Important settings for mobile playback
                audioToPlay.preload = 'auto';
                audioToPlay.volume = 1.0;
                audioToPlay.setAttribute('playsinline', '');
                audioToPlay.setAttribute('webkit-playsinline', '');
                audioToPlay.muted = false; // Ensure not muted

                audioToPlay.onerror = (e) => {
                    console.error(`Audio: Error loading ${sound}.mp3 on demand:`, e);
                    playingSounds.delete(sound);
                };

                // Load the audio
                audioToPlay.load();

                // Save to cache for future use, but not on iOS (iOS benefits from fresh instances)
                if (!(/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
                    audioCache[sound] = audioToPlay;
                }
            } else {
                // Use a clone for most reliable playback 
                audioToPlay = audio.cloneNode() as HTMLAudioElement;
                audioToPlay.volume = 1.0;
                audioToPlay.setAttribute('playsinline', '');
                audioToPlay.setAttribute('webkit-playsinline', '');
                audioToPlay.muted = false;
            }

            // Reset playback position to ensure it plays from the start
            audioToPlay.currentTime = 0;

            // Add event listener to know when it's done playing
            audioToPlay.addEventListener('ended', () => {
                console.log(`Audio: Finished playing ${sound}`);
                playingSounds.delete(sound);
            }, { once: true });

            // Fail-safe to remove from playing set after max duration
            setTimeout(() => {
                playingSounds.delete(sound);
            }, 3000);

            console.log(`Audio: Attempting to play ${sound}.mp3 (try ${retries + 1})`);

            // Play the sound - add multiple methods of playing for best compatibility
            try {
                // First, try the standard way (works on most browsers)
                await audioToPlay.play();
                console.log(`Audio: Successfully playing ${sound}`);
            } catch (err: unknown) {
                console.warn(`Audio: Standard play method failed for ${sound}:`, err);

                // Handle browsers with autoplay restrictions
                if (err instanceof Error && err.name === 'NotAllowedError') {
                    console.warn('Audio: Playback was blocked by browser autoplay restrictions');
                    isAudioUnlocked = false;

                    // Try unlocking again and retry
                    if (retries < maxRetries) {
                        retries++;
                        console.log(`Audio: Retrying playback, attempt ${retries} of ${maxRetries}`);

                        // Clear from playing set before retry
                        playingSounds.delete(sound);

                        // Try to unlock audio again
                        await forceUnlockAudio();

                        // Small delay before retry
                        setTimeout(() => attemptPlayback(), 100);
                    }
                }
            }
        } catch (error) {
            console.error(`Audio: General error in playSound for "${sound}":`, error);
            playingSounds.delete(sound);

            // Retry on general errors too
            if (retries < maxRetries) {
                retries++;
                console.log(`Audio: Retrying after error, attempt ${retries} of ${maxRetries}`);
                setTimeout(() => attemptPlayback(), 100);
            }
        }
    };

    // Start the playback attempt
    await attemptPlayback();
};

/**
 * Function to directly check if audio files exist on the server
 * and are accessible through the browser
 */
export const checkAudioFiles = async (): Promise<Record<CountdownSound, boolean>> => {
    const sounds: CountdownSound[] = ['three', 'two', 'one', 'rest', 'go'];
    const results: Record<CountdownSound, boolean> = {
        three: false,
        two: false,
        one: false,
        rest: false,
        go: false
    };

    console.log('Audio: Starting file accessibility check');

    const checkPromises = sounds.map(async (sound) => {
        const url = `/audio/${sound}.mp3?v=${Date.now()}`;
        try {
            // Try to fetch the file to check if it exists
            const response = await fetch(url, { method: 'HEAD' });
            results[sound] = response.ok;

            console.log(`Audio: ${sound}.mp3 - ${response.status} ${response.statusText} (${response.ok ? 'OK' : 'FAILED'})`);

            // Log more detailed info
            if (!response.ok) {
                console.error(`Audio: Failed to fetch ${sound}.mp3 - Status: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Audio: Error checking ${sound}.mp3:`, error);
            results[sound] = false;
        }
    });

    await Promise.all(checkPromises);
    console.log('Audio: File accessibility check complete', results);

    return results;
}; 