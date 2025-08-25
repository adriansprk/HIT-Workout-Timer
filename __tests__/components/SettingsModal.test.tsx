import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SettingsModal from '../../components/settings-modal';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AudioProvider } from '../../contexts/AudioContext';

// Mock the audio module
jest.mock('../../lib/audio', () => ({
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

// Mock the settings module
jest.mock('../../lib/settings', () => ({
    loadSettings: jest.fn(() => ({
        muted: false,
        darkMode: false,
        audioUnlocked: true,
        notifications: false,
        workoutParams: {
            exerciseTime: 45,
            restTime: 15,
            roundRestTime: 60,
            exercises: 5,
            rounds: 4,
        },
        streakData: { currentStreak: 0, lastWorkout: null }
    })),
    saveSettings: jest.fn(),
    setDarkMode: jest.fn(),
    getDarkMode: jest.fn().mockReturnValue(false)
}));

describe('SettingsModal Component', () => {
    it('renders settings form with theme and audio controls', async () => {
        await act(async () => {
            render(
                <ThemeProvider>
                    <AudioProvider>
                        <SettingsModal onClose={() => { }} />
                    </AudioProvider>
                </ThemeProvider>
            );
        });

        // Check that the component renders with basic elements
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
        expect(screen.getByText('Audio Announcements')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
        const onCloseMock = jest.fn();

        await act(async () => {
            render(
                <ThemeProvider>
                    <AudioProvider>
                        <SettingsModal onClose={onCloseMock} />
                    </AudioProvider>
                </ThemeProvider>
            );
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /close/i }));
        });

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('closes modal when Done button is clicked', async () => {
        const onCloseMock = jest.fn();

        await act(async () => {
            render(
                <ThemeProvider>
                    <AudioProvider>
                        <SettingsModal onClose={onCloseMock} />
                    </AudioProvider>
                </ThemeProvider>
            );
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Done/i }));
        });

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});