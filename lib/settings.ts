export interface UserSettings {
    muted: boolean;
    workoutParams: WorkoutParams;
    audioUnlocked: boolean;
}

export interface WorkoutParams {
    exerciseTime: number;
    restTime: number;
    roundRestTime: number;
    exercises: number;
    rounds: number;
}

const SETTINGS_KEY = 'hiit-timer-settings';

// Default settings for first-time users
const DEFAULT_SETTINGS: UserSettings = {
    muted: false,
    audioUnlocked: false,
    workoutParams: {
        exerciseTime: 30,
        restTime: 10,
        roundRestTime: 30,
        exercises: 4,
        rounds: 3
    }
};

/**
 * Loads user settings from localStorage
 */
export const loadSettings = (): UserSettings => {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }

    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (!savedSettings) {
            return DEFAULT_SETTINGS;
        }

        // Merge saved settings with defaults to ensure all properties exist
        const parsed = JSON.parse(savedSettings);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            workoutParams: {
                ...DEFAULT_SETTINGS.workoutParams,
                ...(parsed.workoutParams || {})
            }
        };
    } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Saves user settings to localStorage
 */
export const saveSettings = (settings: UserSettings): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
    }
};

/**
 * Load workout parameters from settings
 */
export const loadWorkoutParams = (): WorkoutParams => {
    return loadSettings().workoutParams;
};

/**
 * Save workout parameters to localStorage
 */
export const saveWorkoutParams = (params: WorkoutParams): void => {
    const currentSettings = loadSettings();
    saveSettings({
        ...currentSettings,
        workoutParams: params
    });
};

/**
 * Update specific workout parameters
 */
export const updateWorkoutParams = (params: Partial<WorkoutParams>): void => {
    const currentSettings = loadSettings();
    saveSettings({
        ...currentSettings,
        workoutParams: {
            ...currentSettings.workoutParams,
            ...params
        }
    });
};

/**
 * Update the audio unlock status in localStorage
 */
export const saveAudioUnlockStatus = (isUnlocked: boolean): void => {
    const currentSettings = loadSettings();
    saveSettings({
        ...currentSettings,
        audioUnlocked: isUnlocked
    });
};

/**
 * Get the audio unlock status from localStorage
 */
export const getAudioUnlockStatus = (): boolean => {
    return loadSettings().audioUnlocked;
}; 