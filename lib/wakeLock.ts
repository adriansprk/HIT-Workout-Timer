'use client';

/**
 * Screen Wake Lock utility for preventing device screens from sleeping
 * Uses Wake Lock API when available, with video element fallback for iOS/Safari
 */

/**
 * Type definition for a WakeLock instance
 */
export interface WakeLockInstance {
    /** Release the wake lock */
    release: () => Promise<void>;
    /** Type of wake lock */
    type: string;
}

/**
 * Status of a wake lock request
 */
export interface WakeLockStatus {
    isActive: boolean;
    type: string | null;
}

// Global references for fallback method
let activeWakeLock: WakeLockInstance | null = null;
let videoElement: HTMLVideoElement | null = null;

/**
 * Check if Wake Lock API is supported
 */
const isWakeLockSupported = (): boolean => {
    return 'wakeLock' in navigator;
};

/**
 * Requests a screen wake lock using the Wake Lock API with video fallback
 * @returns A wake lock instance and status
 */
export async function requestWakeLock(): Promise<WakeLockInstance> {
    // If we already have an active wake lock, return it
    if (activeWakeLock) {
        return activeWakeLock;
    }

    try {
        if (isWakeLockSupported()) {
            // Use the Wake Lock API
            console.log('Using Wake Lock API');
            const wakeLock = await (navigator as any).wakeLock.request('screen');

            activeWakeLock = {
                release: async () => {
                    try {
                        await wakeLock.release();
                        activeWakeLock = null;
                    } catch (err) {
                        console.error('Error releasing wake lock:', err);
                    }
                },
                type: 'api'
            };

            return activeWakeLock;
        } else {
            // Fall back to video element for iOS
            console.log('Using video fallback for wake lock');
            return useVideoFallback();
        }
    } catch (err) {
        console.error('Error requesting wake lock:', err);
        // Fall back to video if Wake Lock API fails
        console.log('Falling back to video due to error');
        return useVideoFallback();
    }
}

/**
 * Video element fallback implementation for browsers without Wake Lock API
 * This works for iOS Safari and other browsers that keep screen on during video playback
 * @returns A wake lock instance and status using a hidden video element
 */
function useVideoFallback(): WakeLockInstance {
    if (!videoElement) {
        // Create a silent video element if it doesn't exist
        videoElement = document.createElement('video');
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('muted', '');
        videoElement.setAttribute('loop', '');
        videoElement.style.width = '1px';
        videoElement.style.height = '1px';
        videoElement.style.position = 'absolute';
        videoElement.style.opacity = '0.01';
        videoElement.style.pointerEvents = 'none';
        document.body.appendChild(videoElement);

        // Create a simple source using a data URI with a 1x1 transparent video
        const source = document.createElement('source');
        source.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAxttZGF0AAACrAYF//+43EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyBmMGM3YzY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PWluZmluaXRlIGtleWludF9taW49Mjkgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAABVoZYiEAC///vau/MoCqX+5iAAAQ9HPHFojbGFZbmNwUl9oRUFBQ2tRQUVmQWpIQUVBZEFCR2tBQUFDampnR0FCQUI1bGtnU0FJQUFBRUJDb0JyQUFuRWdBQUFwWVJiR1lBVkFBQUFDRWNwZENBZ0xKWVFBQUFBQUFBQUFCQUFBQUFBQUFBQUFBQUFBQUFBRUFBQUJzS0FBQWdBQUFCQkJLSlJRUUFDT1BUQUFBR1hFZ0lKVHVBQUFBQUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJBQUFDUkZhQUFCQUFBQUFJeFJzU1lBQkFBQUFBQUhJQUdnQUJBQUFBQUI4QllBZ0FBQUFBQUFCQUFBQUFBQUFBQUFBQUFBQUJBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUdaQUFBQTZFQUFBQURBUG9RZ0NBQUFBQXB0dWIwbEFJOTZQZ0FBQUFJQU1Da0JBQUFBQUFBQUFBQUFBQUFBQUFBQW1KREFBQUFBQUVmL3Y3eDBBQUFBQVFhQUNnQUFBQUZDLzRPTHNnQUFBQUlBQUlBQUFBQUFFd0FBQUFJbnVpRzJ0cWJHczE4cnVGaVoyUmxjZ0FBQUFCb1RRQjRkV2RkeUlvQXRpeWt1OFg1UzJHaGJnQUFBQUVBQUFBQXZ3QUFBQmxXdS95QlJjZFh5cTc5QnA5UDNrN3RBQUFBQUFFQUFBQW9QZ0FBWndnZ2NrRUl3WFRMMzZzSGdMdlZLY3pqTHFLM3JvQUFBQUJBQUFBQUFBQUFBQUFBQUFBQkFBQUFBQUVBQUFBQUFBQWZBQUFBQUFBQUFBQUFZUUFBQUFBQUFBQUFBQUFBQUFBRUFBRnhBQUFBQUFBQUFBQUE=';
        source.type = 'video/mp4';
        videoElement.appendChild(source);
    }

    // Ensure the video is playing
    videoElement.muted = true;
    const playPromise = videoElement.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error('Video play failed:', error);
        });
    }

    // Create a wake lock instance for the video fallback
    activeWakeLock = {
        release: async () => {
            if (videoElement) {
                videoElement.pause();
                try {
                    if (document.body.contains(videoElement)) {
                        document.body.removeChild(videoElement);
                    }
                    videoElement = null;
                    activeWakeLock = null;
                } catch (err) {
                    console.error('Error removing video element:', err);
                }
            }
        },
        type: 'video'
    };

    return activeWakeLock;
}

/**
 * Release an active wake lock
 */
export function releaseWakeLock(): void {
    if (activeWakeLock) {
        activeWakeLock.release().catch(err => {
            console.error('Error releasing wake lock:', err);
        });
        activeWakeLock = null;
    }
}

/**
 * Add visibility change listener to handle browser tab changes
 */
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && activeWakeLock === null) {
            // If the page becomes visible again and we had an active wake lock, try to reacquire it
            console.log('Document became visible, attempting to reacquire wake lock');
            requestWakeLock().catch(err => {
                console.error('Failed to reacquire wake lock on visibility change:', err);
            });
        }
    });
} 