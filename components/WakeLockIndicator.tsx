'use client'

import React from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { Eye, EyeOff } from 'lucide-react';

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

    return (
        <div
            className={`h-8 px-4 rounded-full flex items-center justify-center gap-2 ${isActive
                    ? 'bg-gray-800/90 border border-gray-700'
                    : 'bg-gray-800/80 border border-gray-700'
                } ${className}`}
            aria-label={isActive ? "Screen wake lock is active" : "Screen may sleep"}
        >
            {isActive ? (
                <>
                    <Eye className="h-4 w-4 text-gray-300" />
                    <span className="text-sm font-medium text-gray-300">Screen On</span>
                </>
            ) : (
                <>
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-400">Screen Auto</span>
                </>
            )}
        </div>
    );
} 