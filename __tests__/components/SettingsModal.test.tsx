import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from '@/components/settings-modal';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('@/lib/settings', () => ({
    loadSettings: jest.fn().mockReturnValue({
        muted: false,
        darkMode: false,
        workoutParams: {
            exerciseTime: 30,
            restTime: 10,
            roundRestTime: 30,
            exercises: 8,
            rounds: 3
        },
        workoutStreak: {
            count: 0,
            lastWorkoutDate: null
        }
    }),
    saveSettings: jest.fn(),
    updateWorkoutStreak: jest.fn()
}));

jest.mock('@/lib/audio', () => ({
    initAudio: jest.fn(),
    unlockAudioForMobile: jest.fn(),
    preloadSounds: jest.fn(),
    playSound: jest.fn()
}));

describe('SettingsModal Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders settings form with theme and audio controls', () => {
        render(
            <ThemeProvider>
                <AudioProvider>
                    <SettingsModal onClose={mockOnClose} />
                </AudioProvider>
            </ThemeProvider>
        );

        // Check if theme toggle is rendered
        expect(screen.getByLabelText(/dark mode/i)).toBeInTheDocument();

        // Check if audio toggle is rendered
        expect(screen.getByRole('heading', { name: /Audio Announcements/i })).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
        render(
            <ThemeProvider>
                <AudioProvider>
                    <SettingsModal onClose={mockOnClose} />
                </AudioProvider>
            </ThemeProvider>
        );

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes modal when Done button is clicked', () => {
        render(
            <ThemeProvider>
                <AudioProvider>
                    <SettingsModal onClose={mockOnClose} />
                </AudioProvider>
            </ThemeProvider>
        );

        const doneButton = screen.getByRole('button', { name: /done/i });
        fireEvent.click(doneButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});