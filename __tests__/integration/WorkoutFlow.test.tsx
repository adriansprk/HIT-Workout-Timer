import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all audio functions needed
jest.mock('@/lib/audio', () => ({
    initAudio: jest.fn(),
    unlockAudioForMobile: jest.fn().mockResolvedValue(true),
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined),
    playExerciseStart: jest.fn(),
    playExerciseEnd: jest.fn(),
    playCountdown: jest.fn(),
    playWorkoutComplete: jest.fn(),
    getAudioUnlockStatus: jest.fn().mockReturnValue(true),
    setAudioUnlocked: jest.fn(),
    forceUnlockAudio: jest.fn().mockResolvedValue(undefined),
    cleanupAudio: jest.fn()
}));

// Mock settings module with streak data and workout params functions
jest.mock('@/lib/settings', () => {
    const workoutParams = {
        exerciseTime: 5,
        restTime: 2,
        roundRestTime: 3,
        exercises: 1,
        rounds: 1,
    };

    return {
        loadSettings: jest.fn(() => ({
            muted: false,
            darkMode: false,
            audioUnlocked: true,
            notifications: false,
            workoutParams,
            streakData: { currentStreak: 5, lastWorkout: new Date().toISOString() }
        })),
        saveSettings: jest.fn(),
        updateWorkoutStreak: jest.fn().mockReturnValue({
            currentStreak: 6,
            lastWorkout: new Date().toISOString()
        }),
        getAudioUnlockStatus: jest.fn().mockReturnValue(true),
        saveAudioUnlockStatus: jest.fn(),
        loadWorkoutParams: jest.fn().mockReturnValue(workoutParams),
        updateWorkoutParams: jest.fn(),
        saveWorkoutParams: jest.fn()
    };
});

// Mock window.matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
}));

// Import providers and page component
import App from '@/app/page';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AudioProvider } from '@/contexts/AudioContext';

describe('Workout Flow', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    it('should complete the workout and show completion screen', async () => {
        await act(async () => {
            render(
                <ThemeProvider>
                    <AudioProvider>
                        <App />
                    </AudioProvider>
                </ThemeProvider>
            );
        });

        // Click Start button
        await act(async () => {
            const startButton = screen.getByText('Start Workout');
            startButton.click();
        });

        // Skip initial countdown (5 seconds)
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Skip exercise (5 seconds)
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Skip rest (2 seconds)
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        // Buffer time to ensure completion
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        // Verify completion screen
        await waitFor(() => {
            expect(screen.getByText(/Workout Complete/i)).toBeInTheDocument();
        });
    });
});