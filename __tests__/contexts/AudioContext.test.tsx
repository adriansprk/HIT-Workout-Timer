import { render, screen, act, waitFor } from '@testing-library/react';
import { AudioProvider, useAudio } from '../../contexts/AudioContext';
import { loadSettings } from '../../lib/settings';
import { playSound, restoreAudioPlayback } from '../../lib/audio';

// Mock audio module
jest.mock('../../lib/audio', () => ({
    initAudio: jest.fn().mockResolvedValue(undefined),
    unlockAudioForMobile: jest.fn().mockResolvedValue(undefined),
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined),
    restoreAudioPlayback: jest.fn().mockResolvedValue(true),
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
    const { isMuted, toggleMute, needsAudioRestore, restoreAudio, playCountdownSound } = useAudio();
    return (
        <div>
            <div data-testid="muted-status">{isMuted ? 'muted' : 'unmuted'}</div>
            <div data-testid="restore-status">{needsAudioRestore ? 'restore-needed' : 'restore-not-needed'}</div>
            <button onClick={toggleMute}>Toggle Mute</button>
            <button onClick={() => void restoreAudio()}>Restore Audio</button>
            <button onClick={() => void playCountdownSound('go')}>Play Go</button>
        </div>
    );
}

describe('AudioContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        (loadSettings as jest.Mock).mockReturnValue({
            muted: false,
            darkMode: false,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 4,
                rounds: 3
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null
            },
            audioUnlocked: true
        });
        (restoreAudioPlayback as jest.Mock).mockResolvedValue(true);
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0',
            configurable: true
        });
        Object.defineProperty(document, 'hidden', {
            value: false,
            configurable: true
        });
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

    test('should play countdown sounds when unmuted', async () => {
        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        await act(async () => {
            screen.getByText('Play Go').click();
        });

        expect(playSound).toHaveBeenCalledWith('go', false);
    });

    test('should initialize from persisted muted setting', async () => {
        (loadSettings as jest.Mock).mockReturnValueOnce({
            muted: true,
            darkMode: false,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 4,
                rounds: 3
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null
            },
            audioUnlocked: true
        });

        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('muted-status')).toHaveTextContent('muted');
        });
    });

    test('should pass muted state when playing countdown sounds', async () => {
        (loadSettings as jest.Mock).mockReturnValueOnce({
            muted: true,
            darkMode: false,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 4,
                rounds: 3
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null
            },
            audioUnlocked: true
        });

        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('muted-status')).toHaveTextContent('muted');
        });

        await act(async () => {
            screen.getByText('Play Go').click();
        });

        expect(playSound).toHaveBeenCalledWith('go', true);
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

    test('should restore audio when unmuting from a user gesture', async () => {
        (loadSettings as jest.Mock).mockReturnValue({
            muted: true,
            darkMode: false,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 4,
                rounds: 3
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null
            },
            audioUnlocked: true
        });

        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('muted-status')).toHaveTextContent('muted');
        });

        await act(async () => {
            screen.getByText('Toggle Mute').click();
        });

        expect(restoreAudioPlayback).toHaveBeenCalled();
        expect(screen.getByTestId('muted-status')).toHaveTextContent('unmuted');
    });

    test('should request user audio restore after returning to an unlocked mobile session', async () => {
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            configurable: true
        });

        await act(async () => {
            render(
                <AudioProvider>
                    <TestComponent />
                </AudioProvider>
            );
        });

        expect(screen.getByTestId('restore-status')).toHaveTextContent('restore-not-needed');

        await act(async () => {
            Object.defineProperty(document, 'hidden', {
                value: true,
                configurable: true
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        await act(async () => {
            Object.defineProperty(document, 'hidden', {
                value: false,
                configurable: true
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(screen.getByTestId('restore-status')).toHaveTextContent('restore-needed');

        await act(async () => {
            screen.getByText('Restore Audio').click();
        });

        expect(restoreAudioPlayback).toHaveBeenCalled();
        expect(screen.getByTestId('restore-status')).toHaveTextContent('restore-not-needed');
    });
});
