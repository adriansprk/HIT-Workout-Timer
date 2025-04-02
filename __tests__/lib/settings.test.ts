import {
    loadSettings,
    saveSettings,
    loadWorkoutParams,
    saveWorkoutParams,
    updateWorkoutParams,
    saveAudioUnlockStatus,
    getAudioUnlockStatus,
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

    test('should handle error when localStorage is corrupted', () => {
        // Set invalid JSON in localStorage that will cause parsing errors
        localStorage.setItem('hiit-timer-settings', '{invalid:json}');

        // Spy on console.error to verify it's called with an error
        const consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => { });

        // Should revert to default settings
        const settings = loadSettings();

        // Verify console.error was called and contains 'Failed to load settings'
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toContain('Failed to load settings');

        // Verify default settings were returned
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

        // Restore console.error
        consoleSpy.mockRestore();
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

    test('should handle localStorage error when saving settings', () => {
        // Use spyOn instead of direct assignment
        const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
        mockSetItem.mockImplementation(() => {
            throw new Error('Storage error');
        });

        // This should not throw, just log an error
        expect(() => {
            saveSettings({
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
            });
        }).not.toThrow();

        // Restore original
        mockSetItem.mockRestore();
    });

    test('should load workout params', () => {
        const settings = {
            muted: false,
            audioUnlocked: false,
            darkMode: true,
            workoutParams: {
                exerciseTime: 60,
                restTime: 20,
                roundRestTime: 45,
                exercises: 6,
                rounds: 5,
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null,
            },
        };

        saveSettings(settings);
        const params = loadWorkoutParams();
        expect(params).toEqual(settings.workoutParams);
    });

    test('should save workout params', () => {
        const newParams = {
            exerciseTime: 75,
            restTime: 25,
            roundRestTime: 90,
            exercises: 8,
            rounds: 3,
        };

        saveWorkoutParams(newParams);
        const loadedSettings = loadSettings();
        expect(loadedSettings.workoutParams).toEqual(newParams);
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

    test('should save and get audio unlock status', () => {
        expect(getAudioUnlockStatus()).toBe(false); // Default

        saveAudioUnlockStatus(true);
        expect(getAudioUnlockStatus()).toBe(true);

        saveAudioUnlockStatus(false);
        expect(getAudioUnlockStatus()).toBe(false);
    });

    test('should get workout streak', () => {
        const streak = getWorkoutStreak();
        expect(streak).toEqual({
            count: 0,
            lastWorkoutDate: null,
        });

        // Save a custom streak
        const settings = loadSettings();
        settings.workoutStreak = {
            count: 5,
            lastWorkoutDate: '2023-05-01',
        };
        saveSettings(settings);

        const updatedStreak = getWorkoutStreak();
        expect(updatedStreak).toEqual({
            count: 5,
            lastWorkoutDate: '2023-05-01',
        });
    });

    test('should calculate workout streak correctly', () => {
        // Mock current date to 2023-04-01
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-04-01'));

        // Initial streak
        const initialStreak = updateWorkoutStreak();
        expect(initialStreak.count).toBe(1);
        expect(initialStreak.lastWorkoutDate).toBe('2023-04-01');

        // Same day workout (shouldn't increase)
        const sameDayStreak = updateWorkoutStreak();
        expect(sameDayStreak.count).toBe(1);
        expect(sameDayStreak.lastWorkoutDate).toBe('2023-04-01');

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