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

    // On iOS, limit concurrent sound playback and prevent duplicate play calls
    if (playingSounds.has(sound)) {
        console.log(`Audio: Already playing ${sound}, not playing again`);
        return;
    }

    try {
        // Add to playing set
        playingSounds.add(sound);

        // Get or create audio element
        let audioToPlay: HTMLAudioElement;

        const audio = audioCache[sound];
        if (!audio) {
            console.warn(`Audio: Sound "${sound}" not found in cache. Creating new instance.`);
            audioToPlay = new Audio(`/audio/${sound}.mp3?v=${Date.now()}`);

            // Important for iOS: set preload to auto
            audioToPlay.preload = 'auto';

            audioToPlay.onerror = (e) => {
                console.error(`Audio: Error loading ${sound}.mp3 on demand:`, e);
                playingSounds.delete(sound);
            };

            audioToPlay.load();

            // Save to cache for future use
            audioCache[sound] = audioToPlay;
        } else {
            // Use fresh copy to avoid issues with concurrent playback
            audioToPlay = audio.cloneNode() as HTMLAudioElement;
        }

        // Reset playback position to ensure it plays from the start
        audioToPlay.currentTime = 0;

        // Add event listener to know when it's done playing
        audioToPlay.addEventListener('ended', () => {
            console.log(`Audio: Finished playing ${sound}`);
            playingSounds.delete(sound);
        }, { once: true });

        // Fail-safe to remove from playing after max duration
        setTimeout(() => {
            playingSounds.delete(sound);
        }, 3000);

        console.log(`Audio: Playing ${sound}.mp3`);

        // Play the sound
        await audioToPlay.play().catch(err => {
            console.error(`Audio: Error playing sound ${sound}:`, err);
            playingSounds.delete(sound);

            // Handle browsers with autoplay restrictions
            if (err.name === 'NotAllowedError') {
                console.warn('Audio: Playback was blocked by the browser. User interaction is required first.');
                isAudioUnlocked = false;
            }
        });
    } catch (error) {
        console.error(`Audio: Error in playSound for "${sound}":`, error);
        playingSounds.delete(sound);
    }
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