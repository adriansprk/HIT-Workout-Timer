import { render, screen, act } from '@testing-library/react';
import WorkoutTimer from '@/components/workout-timer';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
    });

    it('completes workout and shows completion screen', async () => {
        render(
            <ThemeProvider>
                <AudioProvider>
                    <WorkoutTimer
                        exerciseTime={1}
                        restTime={1}
                        roundRestTime={1}
                        exercises={1}
                        rounds={1}
                        onEnd={jest.fn()}
                    />
                </AudioProvider>
            </ThemeProvider>
        );

        // Advance through the workout
        // Exercise (1 second)
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Wait for completion screen to render
        await act(async () => {
            // Add a small delay for state updates and animations
            jest.advanceTimersByTime(500);
        });

        // Check if completion screen is shown
        expect(screen.getByText(/Workout Complete!/i)).toBeInTheDocument();
    });
});