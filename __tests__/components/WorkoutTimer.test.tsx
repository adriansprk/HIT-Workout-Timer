import { render, screen, act, waitFor } from '@testing-library/react';
import WorkoutTimer from '@/components/workout-timer';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock react-confetti automatically via the __mocks__ directory

// Mock settings with more precise values
jest.mock('@/lib/settings', () => ({
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
            count: 0,
            lastWorkoutDate: null
        }
    }),
    saveSettings: jest.fn(),
    updateWorkoutStreak: jest.fn().mockReturnValue({
        count: 1,
        lastWorkoutDate: new Date().toISOString()
    })
}));

// Mock audio functions to prevent actual audio playback
jest.mock('@/lib/audio', () => ({
    initAudio: jest.fn(),
    unlockAudioForMobile: jest.fn(),
    preloadSounds: jest.fn(),
    playSound: jest.fn()
}));

describe('WorkoutTimer Component', () => {
    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('completes workout and shows completion screen', async () => {
        const onEndMock = jest.fn();

        render(
            <ThemeProvider>
                <AudioProvider>
                    <WorkoutTimer
                        exerciseTime={1}
                        restTime={1}
                        roundRestTime={1}
                        exercises={1}
                        rounds={1}
                        onEnd={onEndMock}
                    />
                </AudioProvider>
            </ThemeProvider>
        );

        // Skip the initial countdown (which is usually 3 seconds)
        await act(async () => {
            jest.advanceTimersByTime(4000); // Add extra time to ensure countdown completes
        });

        // Complete one exercise (1 second)
        await act(async () => {
            jest.advanceTimersByTime(2000); // Add extra time to ensure exercise completes
        });

        // Add buffer time for transitions and state updates
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        // Now check for the completion screen with a wait
        try {
            await waitFor(() => {
                const completionText = screen.queryByText(/Workout Complete!/i);
                if (!completionText) {
                    throw new Error('Completion screen not found');
                }
            }, { timeout: 1000 });
        } catch (error) {
            // If we can't find the completion text, run more time and check again
            await act(async () => {
                jest.advanceTimersByTime(5000); // Add significant buffer time
            });

            // Final check for completion screen
            expect(screen.getByText(/Workout Complete!/i)).toBeInTheDocument();
        }

        // Verify onEnd was called
        expect(onEndMock).toHaveBeenCalled();
    });
});