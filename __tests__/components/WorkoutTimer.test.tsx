import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';

// Mock the react-confetti component
jest.mock('react-confetti', () => {
    return jest.fn(() => <div data-testid="mock-confetti" />);
});

// Mock audio module with all required functions
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
        cleanupAudio: jest.fn()
}));

// Mock settings module
jest.mock('@/lib/settings', () => ({
    loadSettings: jest.fn(() => {
        return {
            darkMode: false,
            muted: false,
            audioUnlocked: true,
            notifications: false,
            lastWorkout: null,
            streakData: { currentStreak: 0, lastWorkout: null }
        };
    }),
    saveSettings: jest.fn(),
    updateWorkoutStreak: jest.fn().mockReturnValue({
        currentStreak: 1,
        lastWorkout: new Date().toISOString()
    }),
    getAudioUnlockStatus: jest.fn().mockReturnValue(true),
    saveAudioUnlockStatus: jest.fn()
}));

// Import after mocks
import WorkoutTimer from '@/components/workout-timer';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// We only need to test that the final screen appears correctly
describe('WorkoutTimer Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should show the completion screen after workout finishes', async () => {
        // Workout parameters matching the component's interface
        const exerciseTime = 5;
        const restTime = 3;
        const roundRestTime = 2;
        const exercises = 1;
        const rounds = 1;

        // Mock onEnd function
        const onEndMock = jest.fn();

        await act(async () => {
            render(
                <ThemeProvider>
                    <AudioProvider>
                        <WorkoutTimer
                            exerciseTime={exerciseTime}
                            restTime={restTime}
                            roundRestTime={roundRestTime}
                            exercises={exercises}
                            rounds={rounds}
                            onEnd={onEndMock}
                        />
                    </AudioProvider>
                </ThemeProvider>
            );
        });

        // We'll skip the intitial countdown
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Skip through exercise
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Skip rest period 
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        // Add buffer time to ensure completion
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        // Check if completion screen is displayed
        await waitFor(() => {
            expect(screen.getByText(/Workout Complete/i)).toBeInTheDocument();
        });
    });
});