'use client'

import React from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { Eye } from 'lucide-react';

interface WakeLockIndicatorProps {
    /** Optional class name for styling */
    className?: string;
}

/**
 * A component that displays the current wake lock status
 * Visual indicator only - not interactive
 */
export function WakeLockIndicator({ className = '' }: WakeLockIndicatorProps) {
    // We still use the hook to know if wake lock is active, but don't expose controls
    const { isActive } = useWakeLock();

    // Only render if wake lock is active
    if (!isActive) return null;

    return (
        <div
            className={`h-8 px-4 rounded-full flex items-center justify-center gap-2 bg-purple-950 border border-purple-800/50 ${className}`}
            aria-label="Screen wake lock is active"
        >
            <Eye className="h-4 w-4 text-purple-300" />
            <span className="text-sm font-medium text-purple-300">Screen On</span>
        </div>
    );
} 