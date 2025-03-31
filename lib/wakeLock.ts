/**
 * Screen Wake Lock utility for preventing device screens from sleeping
 * Uses Wake Lock API when available, with NoSleep.js fallback for iOS/Safari
 */

import NoSleep from 'nosleep.js';

/**
 * Type definition for a WakeLock instance
 */
export interface WakeLockInstance {
    /** Release the wake lock */
    release: () => Promise<void>;
    /** Type of wake lock */
    type: 'screen';
}

/**
 * Status of a wake lock request
 */
export type WakeLockStatus =
    | { active: true; wakeLock: WakeLockInstance }
    | { active: false; wakeLock: null };

// Instance of NoSleep for fallback
let noSleepInstance: NoSleep | null = null;

/**
 * Requests a screen wake lock using the Wake Lock API with NoSleep.js fallback
 * @returns A wake lock instance and status
 */
export async function requestWakeLock(): Promise<WakeLockStatus> {
    // Use Wake Lock API if available
    if ('wakeLock' in navigator) {
        try {
            // Request the screen wake lock
            const wakeLock = await navigator.wakeLock.request('screen');

            // Create a wrapper around the native wake lock
            const wakeLockInstance: WakeLockInstance = {
                release: async () => {
                    if (wakeLock) {
                        await wakeLock.release();
                    }
                },
                type: 'screen'
            };

            return { active: true, wakeLock: wakeLockInstance };
        } catch (error) {
            console.warn('Wake Lock API error:', error);
            // Fall back to NoSleep.js
            return useNoSleepFallback();
        }
    } else {
        // Wake Lock API not available, use NoSleep.js fallback
        return useNoSleepFallback();
    }
}

/**
 * NoSleep.js fallback implementation for browsers without Wake Lock API
 * @returns A wake lock instance and status using NoSleep.js
 */
function useNoSleepFallback(): WakeLockStatus {
    try {
        // Create NoSleep instance if it doesn't exist
        if (!noSleepInstance) {
            noSleepInstance = new NoSleep();
        }

        // Enable NoSleep
        noSleepInstance.enable();

        // Create a wrapper object that mimics the Wake Lock API
        const noSleepWrapper: WakeLockInstance = {
            release: async () => {
                if (noSleepInstance) {
                    noSleepInstance.disable();
                }
            },
            type: 'screen'
        };

        return { active: true, wakeLock: noSleepWrapper };
    } catch (error) {
        console.error('NoSleep fallback error:', error);
        return { active: false, wakeLock: null };
    }
}

/**
 * Release an active wake lock
 * @param wakeLockStatus The current wake lock status
 * @returns Updated wake lock status (always inactive)
 */
export async function releaseWakeLock(wakeLockStatus: WakeLockStatus): Promise<WakeLockStatus> {
    if (wakeLockStatus.active && wakeLockStatus.wakeLock) {
        await wakeLockStatus.wakeLock.release();
    }
    return { active: false, wakeLock: null };
}

/**
 * Hook for reacquiring wake lock when page visibility changes
 * @param wakeLockStatus Current wake lock status
 * @param onVisibilityChange Optional callback for visibility changes
 */
export function handleVisibilityChange(
    wakeLockStatus: WakeLockStatus,
    onVisibilityChange?: (isVisible: boolean) => void
): void {
    // When page becomes visible again
    if (document.visibilityState === 'visible') {
        onVisibilityChange?.(true);
    } else {
        onVisibilityChange?.(false);
    }
} 