export type CountdownSound = 'three' | 'two' | 'one' | 'rest' | 'go';

interface AudioCache {
    [key: string]: HTMLAudioElement;
}

// Cache for preloaded audio elements
const audioCache: AudioCache = {};

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
                audioCache[sound] = audio;

                // Log successful loads for debugging
                console.log(`Successfully loaded ${sound}.mp3`);
            } catch (err) {
                console.error(`Failed to preload ${sound}.mp3:`, err);
            }
        }

        console.log('Audio files preloaded successfully');
    } catch (error) {
        console.warn('Failed to preload audio files:', error);
    }
};

/**
 * Plays the specified countdown sound if not muted
 */
export const playSound = async (sound: CountdownSound, isMuted: boolean): Promise<void> => {
    if (isMuted) return;

    try {
        const audio = audioCache[sound];

        if (!audio) {
            console.warn(`Sound "${sound}" not found in cache. Attempting to load directly.`);
            const newAudio = new Audio(`/audio/${sound}.mp3`);

            newAudio.onerror = (e) => {
                console.error(`Error loading ${sound}.mp3 on demand:`, e);
            };

            await new Promise((resolve) => {
                newAudio.addEventListener('canplaythrough', resolve, { once: true });
                newAudio.addEventListener('error', () => {
                    console.error(`Failed to load sound: ${sound}`);
                    resolve(null);
                }, { once: true });
                newAudio.load();
            });

            if (newAudio.readyState >= 3) {
                console.log(`Playing ${sound}.mp3 on demand`);
                newAudio.play().catch(err => console.error(`Error playing sound ${sound}:`, err));
            }
            return;
        }

        // If sound is already cached, play it
        console.log(`Playing ${sound}.mp3 from cache`);
        await audio.play().catch(err => {
            console.error(`Error playing sound ${sound}:`, err);

            // Handle browsers with autoplay restrictions
            if (err.name === 'NotAllowedError') {
                console.warn('Audio playback was blocked by the browser. User interaction is required first.');
            }
        });
    } catch (error) {
        console.error(`Error in playSound for "${sound}":`, error);
    }
}; 