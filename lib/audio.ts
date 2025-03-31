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
 * Plays the specified countdown sound if not muted
 */
export const playSound = async (sound: CountdownSound, isMuted: boolean): Promise<void> => {
    if (isMuted) {
        console.log(`Audio: Skipping ${sound} (muted)`);
        return;
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
            }
        });
    } catch (error) {
        console.error(`Audio: Error in playSound for "${sound}":`, error);
    }
}; 