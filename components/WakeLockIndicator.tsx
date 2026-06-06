'use client'

import { Eye } from 'lucide-react';

interface WakeLockIndicatorProps {
    isActive: boolean;
    isIOSDevice: boolean;
    /** Optional class name for styling */
    className?: string;
}

/**
 * A component that displays the current wake lock status
 * Visual indicator only - not interactive
 * Will always show on iOS devices when in the timer screen
 */
export function WakeLockIndicator({ isActive, isIOSDevice, className = '' }: WakeLockIndicatorProps) {
    // Show the indicator if wake lock is active OR we're on iOS (since iOS wake lock is unreliable)
    if (!isActive && !isIOSDevice) return null;

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
