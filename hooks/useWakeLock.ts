import { useState, useEffect, useCallback } from 'react';
import {
    requestWakeLock,
    releaseWakeLock,
    handleVisibilityChange,
    type WakeLockStatus
} from '../lib/wakeLock';

/**
 * Interface for the return value of the useWakeLock hook
 */
interface UseWakeLockReturn {
    /** Current wake lock status */
    wakeLockStatus: WakeLockStatus;
    /** Request a wake lock */
    requestLock: () => Promise<void>;
    /** Release the current wake lock */
    releaseLock: () => Promise<void>;
    /** Whether an error occurred during wake lock operations */
    hasError: boolean;
    /** Error message if an error occurred */
    errorMessage: string | null;
}

/**
 * Hook for managing screen wake lock in React components
 * 
 * @param options.autoRelease - Whether to automatically release the wake lock on component unmount
 * @returns Wake lock controls and status
 * 
 * @example
 * ```tsx
 * const { wakeLockStatus, requestLock, releaseLock } = useWakeLock();
 * 
 * // Request wake lock when workout starts
 * const startWorkout = () => {
 *   requestLock();
 *   // other workout start logic
 * };
 * 
 * // Release wake lock when workout ends
 * const endWorkout = () => {
 *   releaseLock();
 *   // other workout end logic
 * };
 * ```
 */
export function useWakeLock({
    autoRelease = true
}: {
    autoRelease?: boolean
} = {}): UseWakeLockReturn {
    // State for tracking wake lock status
    const [wakeLockStatus, setWakeLockStatus] = useState<WakeLockStatus>({
        active: false,
        wakeLock: null
    });

    // Error state
    const [error, setError] = useState<{
        hasError: boolean;
        message: string | null
    }>({
        hasError: false,
        message: null
    });

    /**
     * Request a screen wake lock
     */
    const requestLock = useCallback(async (): Promise<void> => {
        try {
            const status = await requestWakeLock();
            setWakeLockStatus(status);

            // Reset any previous errors
            if (error.hasError) {
                setError({ hasError: false, message: null });
            }
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to request wake lock';

            setError({ hasError: true, message: errorMessage });
            console.error('Wake lock request failed:', err);
        }
    }, [error.hasError]);

    /**
     * Release the current wake lock
     */
    const releaseLock = useCallback(async (): Promise<void> => {
        try {
            const status = await releaseWakeLock(wakeLockStatus);
            setWakeLockStatus(status);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to release wake lock';

            setError({ hasError: true, message: errorMessage });
            console.error('Wake lock release failed:', err);
        }
    }, [wakeLockStatus]);

    /**
     * Handle document visibility changes
     */
    useEffect(() => {
        // Only set up visibility change handler if wake lock is active
        if (wakeLockStatus.active) {
            const handleVisibilityChangeWrapper = (): void => {
                handleVisibilityChange(wakeLockStatus, async (isVisible) => {
                    // If document becomes visible again and we had an active lock,
                    // request a new one as the old one would have been released
                    if (isVisible && wakeLockStatus.active) {
                        await requestLock();
                    }
                });
            };

            // Add event listener for visibility change
            document.addEventListener('visibilitychange', handleVisibilityChangeWrapper);

            // Clean up event listener
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChangeWrapper);
            };
        }

        return undefined;
    }, [wakeLockStatus, requestLock]);

    /**
     * Clean up wake lock on component unmount
     */
    useEffect(() => {
        // Release wake lock when component unmounts if autoRelease is enabled
        return () => {
            if (autoRelease && wakeLockStatus.active) {
                void releaseWakeLock(wakeLockStatus)
                    .catch(err => console.error('Error releasing wake lock on unmount:', err));
            }
        };
    }, [autoRelease, wakeLockStatus]);

    return {
        wakeLockStatus,
        requestLock,
        releaseLock,
        hasError: error.hasError,
        errorMessage: error.message
    };
} 