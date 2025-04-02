import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number of seconds into a MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Test-aware logging utility that suppresses logs during test execution
 * @param message The message to log
 * @param type The type of log ('log', 'warn', 'error')
 */
export const log = (message: string, type: 'log' | 'warn' | 'error' = 'log'): void => {
  // Skip logging in test environment
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
    return;
  }

  // Log to console based on type
  switch (type) {
    case 'warn':
      console.warn(message);
      break;
    case 'error':
      console.error(message);
      break;
    default:
      console.log(message);
  }
};
