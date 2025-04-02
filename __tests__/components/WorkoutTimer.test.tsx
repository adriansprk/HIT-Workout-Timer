import { render, screen, act, waitFor } from '@testing-library/react';
import WorkoutTimer from '@/components/workout-timer';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock react-confetti automatically via the __mocks__ directory

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

jest.mock('@/lib/audio', () => ({
    initAudio: jest.fn(),
    unlockAudioForMobile: jest.fn(),
    preloadSounds: jest.fn(),
    playSound: jest.fn()
}));

describe('WorkoutTimer Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
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

        // Skip countdown (3 seconds)
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // First exercise (1 second)
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        // Wait for completion screen to render
        // Add a buffer for any animations and state updates
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        // Check if completion screen is shown
        await waitFor(() => {
            expect(screen.getByText(/Workout Complete!/i)).toBeInTheDocument();
        });
    });
});