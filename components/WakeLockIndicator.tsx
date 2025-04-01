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
 * Shows an eye icon when wake lock is active, and eye-off when inactive
 */
export function WakeLockIndicator({ className = '' }: WakeLockIndicatorProps) {
    const { isActive, request, release } = useWakeLock();

    return (
        <button
            onClick={isActive ? release : request}
            className={`h-8 px-4 rounded-full flex items-center justify-center gap-2 ${isActive
                    ? 'bg-purple-950 border border-purple-800/50'
                    : 'bg-gray-800/80 border border-gray-700'
                } ${className}`}
            aria-label={isActive ? "Disable screen wake lock" : "Enable screen wake lock"}
            title={isActive ? "Screen will stay awake" : "Screen may turn off"}
        >
            {isActive ? (
                <>
                    <Eye className="h-4 w-4 text-purple-300" />
                    <span className="text-sm font-medium text-purple-300">Screen On</span>
                </>
            ) : (
                <>
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-400">Screen Auto</span>
                </>
            )}
        </button>
    );
} 