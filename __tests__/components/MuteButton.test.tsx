import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MuteButton } from '@/components/MuteButton';
import { AudioProvider } from '@/contexts/AudioContext';

// Mock the audio functions
jest.mock('../../lib/audio', () => ({
    preloadSounds: jest.fn().mockResolvedValue(undefined),
    playSound: jest.fn().mockResolvedValue(undefined),
    unlockAudioForMobile: jest.fn().mockResolvedValue(true),
    initAudio: jest.fn(),
    cleanupAudio: jest.fn()
}));

// Mock localStorage to check if muted state is persisted
jest.mock('../../lib/settings', () => {
    const originalModule = jest.requireActual('../../lib/settings');
    return {
        ...originalModule,
        loadSettings: jest.fn().mockReturnValue({ muted: false }),
        saveSettings: jest.fn()
    };
});

describe('MuteButton Component', () => {
    test('renders icon variant by default', () => {
        render(
            <AudioProvider>
                <MuteButton />
            </AudioProvider>
        );

        // Should render as a button with an aria-label
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Mute audio announcements');
    });

    test('renders toggle variant when specified', () => {
        render(
            <AudioProvider>
                <MuteButton variant="toggle" />
            </AudioProvider>
        );

        // Should render as a checkbox
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });

    test('toggles mute state when clicked (icon variant)', () => {
        render(
            <AudioProvider>
                <MuteButton />
            </AudioProvider>
        );

        const button = screen.getByRole('button');

        // Initially unmuted
        expect(button).toHaveAttribute('aria-label', 'Mute audio announcements');

        // Click to mute
        fireEvent.click(button);

        // Should now be muted
        expect(button).toHaveAttribute('aria-label', 'Unmute audio announcements');

        // Click to unmute
        fireEvent.click(button);

        // Should be unmuted again
        expect(button).toHaveAttribute('aria-label', 'Mute audio announcements');
    });

    test('toggles mute state when clicked (toggle variant)', () => {
        render(
            <AudioProvider>
                <MuteButton variant="toggle" />
            </AudioProvider>
        );

        const checkbox = screen.getByRole('checkbox');

        // Initially checked (unmuted)
        expect(checkbox).toBeChecked();

        // Click to mute
        fireEvent.click(checkbox);

        // Should now be unchecked (muted)
        expect(checkbox).not.toBeChecked();

        // Click to unmute
        fireEvent.click(checkbox);

        // Should be checked again (unmuted)
        expect(checkbox).toBeChecked();
    });
}); 