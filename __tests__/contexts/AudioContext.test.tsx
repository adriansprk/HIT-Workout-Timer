import { render, screen, act } from '@testing-library/react';
import { AudioProvider, useAudio } from '../../contexts/AudioContext';

// Mock audio module
jest.mock('../../lib/audio', () => ({
    initAudio: jest.fn().mockResolvedValue(undefined),
    unlockAudioForMobile: jest.fn().mockResolvedValue(undefined),
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined),
    cleanupAudio: jest.fn()
}));

// Mock settings module
jest.mock('../../lib/settings', () => ({
    loadSettings: jest.fn().mockReturnValue({
        muted: false,
        darkMode: false,
        workoutParams: {
            exerciseTime: 30,
            restTime: 10,
            roundRestTime: 30,
            exercises: ['Exercise 1'],
            rounds: 3
        },
        workoutStreak: {
            count: 0,
            lastWorkoutDate: null
        },
        audioUnlocked: true
    }),
    saveSettings: jest.fn()
}));

// Test component
function TestComponent() {
    const { isMuted, toggleMute } = useAudio();
    return (
        <div>
            <div data-testid="muted-status">{isMuted ? 'muted' : 'unmuted'}</div>
            <button onClick={toggleMute}>Toggle Mute</button>
        </div>
    );
}

describe('AudioContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('should initialize audio context and load settings', async () => {
        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        expect(screen.getByTestId('muted-status')).toHaveTextContent('unmuted');
    });

    test('should toggle mute state', async () => {
        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        expect(screen.getByTestId('muted-status')).toHaveTextContent('unmuted');

        await act(async () => {
            screen.getByText('Toggle Mute').click();
        });

        expect(screen.getByTestId('muted-status')).toHaveTextContent('muted');
    });
});