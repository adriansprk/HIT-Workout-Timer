import { useState, useEffect, useCallback } from 'react';
import { requestWakeLock, releaseWakeLock, WakeLockStatus } from '../lib/wakeLock';

interface UseWakeLockResult {
    isActive: boolean;
    error: Error | null;
    request: () => Promise<void>;
    release: () => void;
}

export function useWakeLock(): UseWakeLockResult {
    const [status, setStatus] = useState<WakeLockStatus>({ isActive: false, type: null });
    const [error, setError] = useState<Error | null>(null);

    const request = useCallback(async () => {
        try {
            const result = await requestWakeLock();
            setStatus({ isActive: true, type: result.type });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to request wake lock'));
            console.error('Wake lock request failed:', err);
        }
    }, []);

    const release = useCallback(() => {
        try {
            releaseWakeLock();
            setStatus({ isActive: false, type: null });
        } catch (err) {
            console.error('Wake lock release failed:', err);
        }
    }, []);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && status.isActive) {
                request();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [request, status.isActive]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (status.isActive) {
                releaseWakeLock();
            }
        };
    }, [status.isActive]);

    return {
        isActive: status.isActive,
        error,
        request,
        release
    };
} 