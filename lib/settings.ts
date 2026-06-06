import { z } from 'zod';

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

const cloneDefaultSettings = (): UserSettings => ({
    ...DEFAULT_SETTINGS,
    workoutParams: {
        ...DEFAULT_SETTINGS.workoutParams
    },
    workoutStreak: {
        ...DEFAULT_SETTINGS.workoutStreak
    }
});

const boundedInteger = (fallback: number, min: number, max: number) =>
    z.preprocess((value) => {
        const numericValue = typeof value === 'number' ? value : Number(value);

        if (!Number.isFinite(numericValue)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, Math.trunc(numericValue)));
    }, z.number().int());

const booleanWithDefault = (fallback: boolean) =>
    z.preprocess((value) => typeof value === 'boolean' ? value : fallback, z.boolean());

const dateStringOrNull = z.preprocess((value) => {
    if (value === null || value === undefined) {
        return null;
    }

    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}, z.string().nullable());

const workoutParamsSchema = z.object({
    exerciseTime: boundedInteger(DEFAULT_SETTINGS.workoutParams.exerciseTime, 1, 120),
    restTime: boundedInteger(DEFAULT_SETTINGS.workoutParams.restTime, 0, 60),
    roundRestTime: boundedInteger(DEFAULT_SETTINGS.workoutParams.roundRestTime, 0, 120),
    exercises: boundedInteger(DEFAULT_SETTINGS.workoutParams.exercises, 1, 20),
    rounds: boundedInteger(DEFAULT_SETTINGS.workoutParams.rounds, 1, 10)
});

const workoutStreakSchema = z.object({
    count: boundedInteger(DEFAULT_SETTINGS.workoutStreak.count, 0, 36500),
    lastWorkoutDate: dateStringOrNull
});

const userSettingsSchema = z.object({
    muted: booleanWithDefault(DEFAULT_SETTINGS.muted),
    workoutParams: z.preprocess(
        (value) => value && typeof value === 'object' ? value : {},
        workoutParamsSchema
    ),
    audioUnlocked: booleanWithDefault(DEFAULT_SETTINGS.audioUnlocked),
    workoutStreak: z.preprocess(
        (value) => value && typeof value === 'object' ? value : {},
        workoutStreakSchema
    ),
    darkMode: booleanWithDefault(DEFAULT_SETTINGS.darkMode)
});

const parseSettings = (value: unknown): UserSettings => {
    const parsed = userSettingsSchema.safeParse(value);
    return parsed.success ? parsed.data : cloneDefaultSettings();
};

/**
 * Loads user settings from localStorage
 */
export const loadSettings = (): UserSettings => {
    if (typeof window === 'undefined') {
        return cloneDefaultSettings();
    }

    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (!savedSettings) {
            return cloneDefaultSettings();
        }

        return parseSettings(JSON.parse(savedSettings));
    } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
        return cloneDefaultSettings();
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
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parseSettings(settings)));
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
