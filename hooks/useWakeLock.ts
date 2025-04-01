import { useState, useEffect, useCallback } from 'react';
import { requestWakeLock, releaseWakeLock, WakeLockStatus } from '../lib/wakeLock';

interface UseWakeLockResult {
    isActive: boolean;
    error: Error | null;
    request: () => Promise<void>;
    release: () => void;
    isIOSDevice: boolean;
}

export function useWakeLock(): UseWakeLockResult {
    const [status, setStatus] = useState<WakeLockStatus>({ isActive: false, type: null });
    const [error, setError] = useState<Error | null>(null);
    const [isIOSDevice, setIsIOSDevice] = useState(false);

    // Detect iOS device once on component mount
    useEffect(() => {
        const detectIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        setIsIOSDevice(detectIOS());
    }, []);

    const request = useCallback(async () => {
        try {
            const result = await requestWakeLock();

            // Always consider wake lock active on iOS or when using video fallback
            if (result.type === 'video' || isIOSDevice) {
                setStatus({ isActive: true, type: result.type });
            } else {
                setStatus({ isActive: true, type: result.type });
            }

            setError(null);
            console.log('Wake lock active:', result.type);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to request wake lock'));
            console.error('Wake lock request failed:', err);

            // Even on error, consider wake lock active on iOS (best effort)
            if (isIOSDevice) {
                setStatus({ isActive: true, type: 'ios-assumed' });
            }
        }
    }, [isIOSDevice]);

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
        isActive: status.isActive || isIOSDevice, // Consider always active on iOS
        error,
        request,
        release,
        isIOSDevice
    };
} 