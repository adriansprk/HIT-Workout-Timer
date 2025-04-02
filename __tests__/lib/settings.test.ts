import {
    loadSettings,
    saveSettings,
    updateWorkoutParams,
    getWorkoutStreak,
    updateWorkoutStreak,
    setDarkMode,
    getDarkMode
} from '@/lib/settings';

describe('Settings Module', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('should return default settings when nothing is saved', () => {
        const settings = loadSettings();
        expect(settings).toEqual({
            muted: false,
            audioUnlocked: false,
            darkMode: true,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 4,
                rounds: 3,
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null,
            },
        });
    });

    test('should save and load settings', () => {
        const settings = {
            muted: true,
            audioUnlocked: true,
            darkMode: false,
            workoutParams: {
                exerciseTime: 45,
                restTime: 15,
                roundRestTime: 60,
                exercises: 5,
                rounds: 4,
            },
            workoutStreak: {
                count: 1,
                lastWorkoutDate: '2023-04-01',
            },
        };

        saveSettings(settings);
        const loadedSettings = loadSettings();
        expect(loadedSettings).toEqual(settings);
    });

    test('should update partial workout params', () => {
        const initialParams = loadSettings().workoutParams;

        updateWorkoutParams({ exerciseTime: 50 });
        const updatedParams = loadSettings().workoutParams;

        expect(updatedParams.exerciseTime).toBe(50);
        expect(updatedParams.restTime).toBe(initialParams.restTime);
        expect(updatedParams.roundRestTime).toBe(initialParams.roundRestTime);
        expect(updatedParams.exercises).toBe(initialParams.exercises);
        expect(updatedParams.rounds).toBe(initialParams.rounds);
    });

    test('should calculate workout streak correctly', () => {
        // Mock current date to 2023-04-01
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-04-01'));

        // Initial streak
        const initialStreak = updateWorkoutStreak();
        expect(initialStreak.count).toBe(1);
        expect(initialStreak.lastWorkoutDate).toBe('2023-04-01');

        // Next day workout
        jest.setSystemTime(new Date('2023-04-02'));
        const nextDayStreak = updateWorkoutStreak();
        expect(nextDayStreak.count).toBe(2);
        expect(nextDayStreak.lastWorkoutDate).toBe('2023-04-02');

        // Skip a day
        jest.setSystemTime(new Date('2023-04-04'));
        const brokenStreak = updateWorkoutStreak();
        expect(brokenStreak.count).toBe(1);
        expect(brokenStreak.lastWorkoutDate).toBe('2023-04-04');

        jest.useRealTimers();
    });

    test('should toggle dark mode', () => {
        // Default is dark mode: true
        expect(getDarkMode()).toBe(true);

        // Set to light mode
        setDarkMode(false);
        expect(getDarkMode()).toBe(false);

        // Set back to dark mode
        setDarkMode(true);
        expect(getDarkMode()).toBe(true);
    });
}); 