import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkoutTimer from '../../components/workout-timer';
import { AudioProvider } from '../../contexts/AudioContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Define mock streak before mocking
const mockStreak = { count: 5, lastWorkoutDate: new Date().toISOString() };

// Mock audio module
jest.mock('../../lib/audio', () => ({
    initAudio: jest.fn().mockResolvedValue(undefined),
    unlockAudioForMobile: jest.fn().mockResolvedValue(undefined),
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined)
}));

// Mock settings module with minimal workout params for quick testing
jest.mock('../../lib/settings', () => {
    const settingsModule = {
        loadSettings: jest.fn().mockReturnValue({
            muted: false,
            darkMode: false,
            workoutParams: {
                exerciseTime: 1,
                restTime: 1,
                roundRestTime: 1,
                exercises: 1,
                rounds: 1
            },
            workoutStreak: {
                count: 4,
                lastWorkoutDate: new Date().toISOString()
            },
            audioUnlocked: true
        }),
        saveSettings: jest.fn(),
        updateWorkoutStreak: jest.fn().mockReturnValue(mockStreak),
        saveWorkoutParams: jest.fn()
    };
    return settingsModule;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('Workout Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should complete workout and show completion screen', async () => {
        // Create a mock function to track when the workout ends
        const onEndMock = jest.fn();

        // Render with act to handle React state updates
        await act(async () => {
            render(
                <AudioProvider>
                    <ThemeProvider>
                        <WorkoutTimer
                            exerciseTime={1}
                            restTime={1}
                            roundRestTime={1}
                            exercises={1}
                            rounds={1}
                            onEnd={onEndMock}
                        />
                    </ThemeProvider>
                </AudioProvider>
            );
        });

        // Wait for initial render to stabilize
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        // Skip countdown (3 seconds) and a bit more
        await act(async () => {
            jest.advanceTimersByTime(4000);
        });

        // First and only exercise (1 second) plus extra
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        // Add buffer time for transitions and state updates
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Verify that either onEnd was called or we can see completion indicators
        const completionIndicators = [
            screen.queryByText(/Workout Complete!/i) !== null,
            screen.queryByTestId('workout-complete') !== null,
            screen.queryByRole('button', { name: /share/i }) !== null,
            onEndMock.mock.calls.length > 0
        ];

        // Test passes if any completion indicator is true
        expect(completionIndicators.some(indicator => indicator)).toBe(true);
    });
});