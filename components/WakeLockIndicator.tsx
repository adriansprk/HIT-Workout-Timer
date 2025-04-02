'use client'

import React, { useEffect, useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { Eye } from 'lucide-react';

interface WakeLockIndicatorProps {
    /** Optional class name for styling */
    className?: string;
}

/**
 * A component that displays the current wake lock status
 * Visual indicator only - not interactive
 * Will always show on iOS devices when in the timer screen
 */
export function WakeLockIndicator({ className = '' }: WakeLockIndicatorProps) {
    const { isActive, error } = useWakeLock();
    const [isIOS, setIsIOS] = useState(false);

    // Detect iOS device once on mount
    useEffect(() => {
        const detectIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        setIsIOS(detectIOS());
    }, []);

    // Show the indicator if wake lock is active OR we're on iOS (since iOS wake lock is unreliable)
    if (!isActive && !isIOS) return null;

    return (
        <div
            className={`flex items-center justify-center gap-1.5 ${className}`}
            aria-label="Screen wake lock is active"
        >
            <Eye className="h-4 w-4 text-white opacity-80" />
            <span className="text-xs font-medium text-white opacity-80">Screen On</span>
        </div>
    );
} 