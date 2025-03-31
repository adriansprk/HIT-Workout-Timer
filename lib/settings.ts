export interface UserSettings {
    muted: boolean;
    workoutParams: WorkoutParams;
    audioUnlocked: boolean;
    workoutStreak: WorkoutStreak;
    darkMode: boolean;
}

export interface WorkoutParams {
    exerciseTime: number;
    restTime: number;
    roundRestTime: number;
    exercises: number;
    rounds: number;
}

export interface WorkoutStreak {
    count: number;
    lastWorkoutDate: string | null;
}

const SETTINGS_KEY = 'hiit-timer-settings';

// Default settings for first-time users
const DEFAULT_SETTINGS: UserSettings = {
    muted: false,
    audioUnlocked: false,
    darkMode: true,
    workoutParams: {
        exerciseTime: 30,
        restTime: 10,
        roundRestTime: 30,
        exercises: 4,
        rounds: 3
    },
    workoutStreak: {
        count: 0,
        lastWorkoutDate: null
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

/**
 * Get the current workout streak
 */
export const getWorkoutStreak = (): WorkoutStreak => {
    const settings = loadSettings();
    return settings.workoutStreak;
};

/**
 * Update the workout streak after completing a workout
 */
export const updateWorkoutStreak = (): WorkoutStreak => {
    const settings = loadSettings();
    const { workoutStreak } = settings;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // If there's no previous workout, start the streak
    if (!workoutStreak.lastWorkoutDate) {
        const newStreak = {
            count: 1,
            lastWorkoutDate: today
        };

        saveSettings({
            ...settings,
            workoutStreak: newStreak
        });

        return newStreak;
    }

    const lastWorkoutDate = new Date(workoutStreak.lastWorkoutDate);
    const lastWorkoutDay = new Date(lastWorkoutDate).toISOString().split('T')[0];

    // If the last workout was today, don't increment streak
    if (lastWorkoutDay === today) {
        return workoutStreak;
    }

    // Calculate days between workouts
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const yesterdayDate = new Date(Date.now() - oneDayInMs).toISOString().split('T')[0];

    // If the last workout was yesterday, increment streak
    // If it was earlier, reset streak to 1
    const newCount = lastWorkoutDay === yesterdayDate
        ? workoutStreak.count + 1
        : 1;

    const newStreak = {
        count: newCount,
        lastWorkoutDate: today
    };

    saveSettings({
        ...settings,
        workoutStreak: newStreak
    });

    return newStreak;
};

/**
 * Get the current dark mode setting
 */
export const getDarkMode = (): boolean => {
    return loadSettings().darkMode;
};

/**
 * Toggle or set dark mode
 */
export const setDarkMode = (enabled: boolean): void => {
    const currentSettings = loadSettings();
    saveSettings({
        ...currentSettings,
        darkMode: enabled
    });
}; 