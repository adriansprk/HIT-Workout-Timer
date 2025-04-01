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
 * Only appears on mobile devices when wake lock is active
 */
export function WakeLockIndicator({ className = '' }: WakeLockIndicatorProps) {
    const { isActive } = useWakeLock();
    const [isMobile, setIsMobile] = useState(false);

    // Check if the device is likely mobile based on user agent and screen size
    useEffect(() => {
        const checkMobile = () => {
            // Check if user agent indicates mobile device
            const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            );

            // Or check if screen size is typical of mobile
            const mobileSize = window.innerWidth < 768;

            setIsMobile(mobileUA || mobileSize);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Only show on mobile devices and when wake lock is active
    if (!isActive || !isMobile) return null;

    return (
        <div
            className={`h-8 px-4 rounded-full flex items-center justify-center gap-2 bg-gray-800/90 border border-gray-700 ${className}`}
            aria-label="Screen wake lock is active"
        >
            <Eye className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">Screen On</span>
        </div>
    );
} 