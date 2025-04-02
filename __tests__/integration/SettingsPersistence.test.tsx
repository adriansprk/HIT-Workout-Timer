import { render, screen, fireEvent, act } from '@testing-library/react';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SettingsModal from '@/components/settings-modal';

// Mock audio module
jest.mock('@/lib/audio', () => ({
    initAudio: jest.fn().mockResolvedValue(undefined),
    unlockAudioForMobile: jest.fn().mockResolvedValue(undefined),
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined),
    getAudioUnlockStatus: jest.fn().mockReturnValue(true),
    saveAudioUnlockStatus: jest.fn()
}));

// Mock settings module
jest.mock('@/lib/settings', () => ({
    loadSettings: jest.fn().mockReturnValue({
        muted: false,
        darkMode: true,
        workoutParams: {
            exerciseTime: 30,
            restTime: 10,
            roundRestTime: 30,
            exercises: 2,
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

// Import directly here to be able to spy on the mock
import { saveSettings } from '@/lib/settings';

describe('Settings Persistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        // Initialize settings in localStorage
        localStorage.setItem('hiit-timer-settings', JSON.stringify({
            muted: false,
            darkMode: true,
            workoutParams: {
                exerciseTime: 30,
                restTime: 10,
                roundRestTime: 30,
                exercises: 2,
                rounds: 3
            },
            workoutStreak: {
                count: 0,
                lastWorkoutDate: null
            },
            audioUnlocked: true
        }));
    });

    test('saves settings when dark mode is toggled', async () => {
        render(
            <AudioProvider>
                <ThemeProvider>
                    <SettingsModal onClose={() => { }} />
                </ThemeProvider>
            </AudioProvider>
        );

        // Get the dark mode checkbox by role
        const darkModeInput = screen.getByRole('checkbox', { name: 'dark mode' });

        // Toggle dark mode with act to handle async updates
        await act(async () => {
            fireEvent.click(darkModeInput);
            // Wait for state updates to complete
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Verify that saveSettings was called
        expect(saveSettings).toHaveBeenCalled();
    });
});