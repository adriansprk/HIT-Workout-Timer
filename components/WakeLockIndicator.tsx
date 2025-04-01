'use client'

import React from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { Monitor, MonitorOff } from 'lucide-react';

interface WakeLockIndicatorProps {
    /** Optional class name for styling */
    className?: string;
}

/**
 * A component that displays the current wake lock status
 * Shows an open eye when wake lock is active, closed eye when inactive
 */
export function WakeLockIndicator({ className = '' }: WakeLockIndicatorProps) {
    const { isActive } = useWakeLock();

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            {isActive ? (
                <Monitor className="h-4 w-4 text-green-500 dark:text-green-400" />
            ) : (
                <MonitorOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                {isActive ? 'Screen active' : 'Screen can sleep'}
            </span>
        </div>
    );
} 