import { saveAudioUnlockStatus, getAudioUnlockStatus as getSavedAudioUnlockStatus } from './settings';

export type CountdownSound = 'three' | 'two' | 'one' | 'rest' | 'go' | 'halfway-there' | 'round-complete' | 'workout-complete';

// Flag to track if audio has been unlocked for mobile
let isAudioUnlocked = false;

// Keep track of currently playing sounds to avoid duplicates
const playingSounds = new Set<string>();

// Create a single master audio context for all sounds
let audioContext: AudioContext | null = null;

// Audio buffer cache
const audioBuffers: { [key: string]: AudioBuffer } = {};

// Track if tab visibility listeners are set up
let visibilityListenersInitialized = false;

/**
 * Set the audio unlock status
 */
export const setAudioUnlocked = (value: boolean): void => {
    isAudioUnlocked = value;
    // Also save to localStorage for persistence
    saveAudioUnlockStatus(value);
    if (value) {
        console.log('Audio: Unlock status set to true');
        initAudioContext();
    }
};

/**
 * Get the current audio unlock status
 */
export const getAudioUnlockStatus = (): boolean => {
    return isAudioUnlocked;
};

/**
 * Resume AudioContext with retry logic
 */
const resumeAudioContext = async (retries = 3): Promise<boolean> => {
    if (!audioContext) {
        return false;
    }

    // Check if context is already running
    if (audioContext.state === 'running') {
        return true;
    }

    // Handle closed state - recreate the context (can happen on iOS under memory pressure)
    if (audioContext.state === 'closed') {
        console.log('Audio: AudioContext is closed, reinitializing...');
        // Clear cached buffers as they're tied to the old context
        Object.keys(audioBuffers).forEach(key => {
            delete audioBuffers[key];
        });
        audioContext = null;
        initAudioContext();
        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        return audioContext?.state === 'running' ?? false;
    }

    // Try to resume suspended context
    for (let i = 0; i < retries; i++) {
        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
                // Give Safari a moment to fully transition (Safari's resume() can resolve before state fully transitions)
                await new Promise(resolve => setTimeout(resolve, 50));
                
                if (audioContext.state === 'running') {
                    console.log('Audio: AudioContext resumed successfully');
                    return true;
                }
            } else if (audioContext.state === 'running') {
                return true;
            }
        } catch (e) {
            console.warn(`Audio: Resume attempt ${i + 1} failed:`, e);
            if (i < retries - 1) {
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
            }
        }
    }

    console.error('Audio: Failed to resume AudioContext after all retries');
    return false;
};

/**
 * Handle tab visibility changes to resume AudioContext when tab becomes active
 */
const handleVisibilityChange = (): void => {
    if (document.hidden) {
        console.log('Audio: Tab became hidden, AudioContext will be suspended by browser');
    } else {
        console.log('Audio: Tab became visible, attempting to resume AudioContext');
        resumeAudioContext().catch(e => {
            console.error('Audio: Uncaught error in handleVisibilityChange:', e);
        });
    }
};

/**
 * Handle window focus events (catches app switching on mobile)
 */
const handleWindowFocus = (): void => {
    console.log('Audio: Window gained focus, ensuring AudioContext is active');
    resumeAudioContext().catch(e => {
        console.error('Audio: Uncaught error in handleWindowFocus:', e);
    });
};

/**
 * Handle window blur events
 */
const handleWindowBlur = (): void => {
    console.log('Audio: Window lost focus, AudioContext may be suspended');
};

/**
 * Handle AudioContext state changes
 */
const handleAudioContextStateChange = (): void => {
    if (audioContext) {
        console.log(`Audio: AudioContext state changed to: ${audioContext.state}`);
        
        // If context becomes suspended and the tab/window is active, try to resume
        if (audioContext.state === 'suspended' && !document.hidden && document.hasFocus()) {
            console.log('Audio: AudioContext suspended while active, attempting to resume');
            resumeAudioContext().catch(e => {
                console.error('Audio: Uncaught error in handleAudioContextStateChange:', e);
            });
        }
    }
};

/**
 * Set up event listeners for tab visibility and AudioContext state changes
 */
const setupAudioContextListeners = (): void => {
    if (visibilityListenersInitialized || typeof window === 'undefined') {
        return;
    }

    console.log('Audio: Setting up AudioContext event listeners');
    
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window focus/blur (catches app switching on mobile)
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    // Listen for AudioContext state changes
    if (audioContext) {
        audioContext.addEventListener('statechange', handleAudioContextStateChange);
    }
    
    visibilityListenersInitialized = true;
};

/**
 * Initialize the Web Audio API context
 */
const initAudioContext = (): void => {
    try {
        if (!audioContext) {
            // Create new audio context
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContext = new AudioContextClass();
                console.log('Audio: AudioContext initialized successfully');

                // Set up event listeners for this new context
                setupAudioContextListeners();
                
                // Always attach statechange listener to new context (setupAudioContextListeners may return early if already initialized)
                audioContext.addEventListener('statechange', handleAudioContextStateChange);

                // Resume context if it's suspended (newer browsers require this)
                resumeAudioContext().catch(e => {
                    console.error('Audio: Error resuming context during init:', e);
                });
            } else {
                console.error('Audio: Web Audio API not supported in this browser');
            }
        } else {
            // Ensure existing context is resumed
            resumeAudioContext();
        }
    } catch (error) {
        console.error('Audio: Error initializing AudioContext:', error);
    }
};

/**
 * Completely unlock audio playback on mobile devices
 * This will play a silent sound to unlock the Audio API
 */
export const forceUnlockAudio = async (): Promise<boolean> => {
    try {
        console.log('Audio: Attempting to force unlock audio playback');

        // Initialize audio context first
        initAudioContext();

        if (!audioContext) {
            console.error('Audio: Cannot unlock, no AudioContext available');
            return false;
        }

        // Create and play a silent buffer
        const silentBuffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(audioContext.destination);

        // Play the silent sound
        if (source.start) {
            source.start(0);
        } else {
            (source as any).noteOn(0);
        }

        console.log('Audio: Successfully played silent buffer to unlock audio');

        // Resume the audio context if it's suspended
        if (audioContext.state === 'suspended') {
            try {
                await audioContext.resume();
                console.log('Audio: AudioContext resumed successfully');
            } catch (e) {
                console.error('Audio: Failed to resume AudioContext:', e);
            }
        }

        // Set and save the unlocked status
        isAudioUnlocked = true;
        saveAudioUnlockStatus(true);

        return true;
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
            initAudioContext();
        }
    } catch (error) {
        console.error('Audio: Error loading audio unlock status:', error);
    }
};

/**
 * Preload an individual sound file
 */
const preloadSound = async (sound: CountdownSound): Promise<AudioBuffer | null> => {
    if (!audioContext) {
        console.error(`Audio: Cannot preload ${sound}, no AudioContext available`);
        return null;
    }

    try {
        const url = `/audio/${sound}.mp3?v=${Date.now()}`;
        console.log(`Audio: Fetching ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Audio: Failed to fetch ${sound}.mp3 - Status: ${response.status}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Store in cache
        audioBuffers[sound] = audioBuffer;
        console.log(`Audio: Successfully loaded ${sound}.mp3`);

        return audioBuffer;
    } catch (error) {
        console.error(`Audio: Error preloading ${sound}.mp3:`, error);
        return null;
    }
};

/**
 * Preload all sound files
 */
export const preloadSounds = async (): Promise<void> => {
    // Initialize audio context if needed
    initAudioContext();

    if (!audioContext) {
        console.error('Audio: Cannot preload sounds, no AudioContext available');
        return;
    }

    const sounds: CountdownSound[] = ['three', 'two', 'one', 'rest', 'go', 'halfway-there', 'round-complete', 'workout-complete'];

    try {
        // Load all sounds in parallel
        const loadPromises = sounds.map(sound => preloadSound(sound));
        await Promise.all(loadPromises);

        console.log('Audio: All audio files preloaded successfully');
    } catch (error) {
        console.error('Audio: Error during preloadSounds:', error);
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
            initAudioContext();
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
        initAudioContext();
        return true;
    }

    // For mobile, we'll just initialize the audio context
    // The actual unlock happens with user interaction
    initAudioContext();
    return false;
};

/**
 * Play a sound using Web Audio API
 */
export const playSound = async (sound: CountdownSound, isMuted: boolean): Promise<void> => {
    if (isMuted) {
        console.log(`Audio: Skipping ${sound} (muted)`);
        return;
    }

    // Don't allow multiple plays of the same sound
    if (playingSounds.has(sound)) {
        console.log(`Audio: Already playing ${sound}, not playing again`);
        return;
    }

    // Check for audio context
    if (!audioContext) {
        console.log('Audio: No AudioContext, initializing...');
        initAudioContext();

        if (!audioContext) {
            console.error('Audio: Failed to create AudioContext, cannot play sound');
            return;
        }
    }

    // Ensure AudioContext is running before playing sound
    const resumed = await resumeAudioContext();
    if (!resumed && audioContext.state === 'suspended') {
        console.warn(`Audio: AudioContext still suspended before playing ${sound}, attempting anyway`);
    }

    // Try to unlock audio on mobile if needed
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    if (isMobile && !isAudioUnlocked) {
        console.log(`Audio: Attempting to unlock audio before playing ${sound}`);
        await forceUnlockAudio();
    }

    try {
        // Mark as playing
        playingSounds.add(sound);

        // Get audio buffer from cache or load it
        let buffer = audioBuffers[sound];
        if (!buffer) {
            console.log(`Audio: ${sound} not in cache, loading now...`);
            const loadedBuffer = await preloadSound(sound);
            if (!loadedBuffer) {
                console.error(`Audio: Failed to load ${sound}`);
                playingSounds.delete(sound);
                return;
            }
            buffer = loadedBuffer; // Now buffer is guaranteed to be AudioBuffer, not null
        }

        // Create audio source
        const source = audioContext.createBufferSource();

        // Buffer is guaranteed to be non-null at this point
        source.buffer = buffer;

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Full volume

        // Connect nodes: source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set up cleanup
        source.onended = () => {
            console.log(`Audio: Finished playing ${sound}`);
            playingSounds.delete(sound);
        };

        // Failsafe cleanup after max duration
        setTimeout(() => {
            playingSounds.delete(sound);
        }, 3000);

        // Play the sound
        console.log(`Audio: Starting playback of ${sound}`);
        source.start(0);

    } catch (error) {
        console.error(`Audio: Error playing ${sound}:`, error);
        playingSounds.delete(sound);
    }
};

/**
 * Check if audio files exist and are accessible
 */
export const checkAudioFiles = async (): Promise<Record<CountdownSound, boolean>> => {
    const sounds: CountdownSound[] = ['three', 'two', 'one', 'rest', 'go', 'halfway-there', 'round-complete', 'workout-complete'];
    const results: Record<CountdownSound, boolean> = {
        three: false,
        two: false,
        one: false,
        rest: false,
        go: false,
        'halfway-there': false,
        'round-complete': false,
        'workout-complete': false
    };

    console.log('Audio: Starting file accessibility check');

    const checkPromises = sounds.map(async (sound) => {
        const url = `/audio/${sound}.mp3?v=${Date.now()}`;
        try {
            const response = await fetch(url, { method: 'HEAD' });
            results[sound] = response.ok;
            console.log(`Audio: ${sound}.mp3 - ${response.status} ${response.statusText} (${response.ok ? 'OK' : 'FAILED'})`);

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

/**
 * Clean up audio resources and event listeners
 * Should be called when the app is unmounting
 */
export const cleanupAudio = (): void => {
    console.log('Audio: Cleaning up audio resources');
    
    // Remove event listeners
    if (visibilityListenersInitialized) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('blur', handleWindowBlur);
        
        if (audioContext) {
            audioContext.removeEventListener('statechange', handleAudioContextStateChange);
        }
        
        visibilityListenersInitialized = false;
    }
    
    // Close AudioContext if it exists
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().then(() => {
            console.log('Audio: AudioContext closed successfully');
        }).catch(e => {
            console.error('Audio: Error closing AudioContext:', e);
        });
        audioContext = null;
    }
    
    // Clear audio buffers
    Object.keys(audioBuffers).forEach(key => {
        delete audioBuffers[key];
    });
    
    // Clear playing sounds
    playingSounds.clear();
}; 