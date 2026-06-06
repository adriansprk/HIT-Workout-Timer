import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';

const mockWakeLockRequest = jest.fn();
const mockWakeLockRelease = jest.fn();

// Mock the react-confetti component
jest.mock('react-confetti', () => {
    return jest.fn(() => <div data-testid="mock-confetti" />);
});

jest.mock('@/hooks/useWakeLock', () => ({
    useWakeLock: jest.fn(() => ({
        isActive: true,
        error: null,
        request: mockWakeLockRequest,
        release: mockWakeLockRelease,
        isIOSDevice: false
    }))
}));

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
        count: 1,
        lastWorkoutDate: new Date().toISOString()
    }),
    getAudioUnlockStatus: jest.fn().mockReturnValue(true),
    saveAudioUnlockStatus: jest.fn()
}));

// Import after mocks
import WorkoutTimer from '@/components/workout-timer';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWorkoutTimer = (props: {
    exerciseTime?: number;
    restTime?: number;
    roundRestTime?: number;
    exercises?: number;
    rounds?: number;
    onEnd?: () => void;
} = {}) => render(
    <ThemeProvider>
        <AudioProvider>
            <WorkoutTimer
                exerciseTime={props.exerciseTime ?? 5}
                restTime={props.restTime ?? 3}
                roundRestTime={props.roundRestTime ?? 2}
                exercises={props.exercises ?? 1}
                rounds={props.rounds ?? 1}
                onEnd={props.onEnd ?? jest.fn()}
            />
        </AudioProvider>
    </ThemeProvider>
);

const advanceTimers = async (milliseconds: number) => {
    await act(async () => {
        jest.advanceTimersByTime(milliseconds);
    });
};

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

        renderWorkoutTimer({
            exerciseTime,
            restTime,
            roundRestTime,
            exercises,
            rounds,
            onEnd: onEndMock
        });

        // We'll skip the intitial countdown
        await advanceTimers(5000);

        // Skip through exercise
        await advanceTimers(5000);

        // Skip rest period 
        await advanceTimers(3000);

        // Add buffer time to ensure completion
        await advanceTimers(1000);

        // Check if completion screen is displayed
        await waitFor(() => {
            expect(screen.getByText(/Workout Complete/i)).toBeInTheDocument();
        });
    });

    it('should normalize zero exercise time to one second without invalid progress math', () => {
        const { container } = renderWorkoutTimer({
            exerciseTime: 0,
            restTime: 0,
            roundRestTime: 0,
            exercises: 1,
            rounds: 1
        });

        expect(container.querySelector('[data-test="timer-display"]')).toHaveTextContent('0:01');
        expect(container.querySelector('circle[stroke-dashoffset="NaN"]')).not.toBeInTheDocument();
    });

    it('should skip zero rest and continue to the next exercise', async () => {
        renderWorkoutTimer({
            exerciseTime: 1,
            restTime: 0,
            roundRestTime: 0,
            exercises: 2,
            rounds: 1
        });

        await advanceTimers(1200);

        await waitFor(() => {
            expect(screen.getByText('2/2')).toBeInTheDocument();
        });
        expect(screen.getByText('EXERCISE')).toBeInTheDocument();
        expect(screen.queryByText('REST')).not.toBeInTheDocument();
    });

    it('should skip zero round rest and continue to the next round', async () => {
        renderWorkoutTimer({
            exerciseTime: 1,
            restTime: 0,
            roundRestTime: 0,
            exercises: 1,
            rounds: 2
        });

        await advanceTimers(1200);

        await waitFor(() => {
            expect(screen.getByText('Round 2/2')).toBeInTheDocument();
        });
        expect(screen.getByText('EXERCISE')).toBeInTheDocument();
        expect(screen.queryByText('RECOVERY')).not.toBeInTheDocument();
    });
});
