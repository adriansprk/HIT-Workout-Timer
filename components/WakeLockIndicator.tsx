'use client'

import { type FC } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { type WakeLockStatus } from '../lib/wakeLock';

interface WakeLockIndicatorProps {
    /** Current wake lock status */
    status: WakeLockStatus;
    /** Optional class name for styling */
    className?: string;
}

/**
 * A component that displays the current wake lock status
 * Shows an open eye when wake lock is active, closed eye when inactive
 */
export const WakeLockIndicator: FC<WakeLockIndicatorProps> = ({
    status,
    className = ''
}) => {
    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                } ${className}`}
            aria-live="polite"
        >
            {status.active ? (
                <>
                    <Eye className="h-3 w-3" />
                    <span>Screen active</span>
                </>
            ) : (
                <>
                    <EyeOff className="h-3 w-3" />
                    <span>Screen may sleep</span>
                </>
            )}
        </div>
    );
}; 