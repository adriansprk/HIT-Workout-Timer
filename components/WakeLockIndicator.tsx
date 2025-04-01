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
    const { isActive } = useWakeLock();

    // Only show when wake lock is active
    if (!isActive) return null;

    return (
        <div
            className={`h-10 px-4 rounded-full flex items-center justify-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 ${className}`}
            aria-label="Screen wake lock is active"
        >
            <Eye className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Screen On</span>
        </div>
    );
} 