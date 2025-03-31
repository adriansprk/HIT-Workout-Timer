declare module 'nosleep.js' {
    export default class NoSleep {
        constructor();

        /**
         * Enable the wake lock
         */
        enable(): void;

        /**
         * Disable the wake lock
         */
        disable(): void;

        /**
         * Returns true if the wake lock is currently enabled
         */
        isEnabled: boolean;
    }
} 