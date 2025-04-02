import React from 'react';
import { render, screen } from '@testing-library/react';
import { WakeLockIndicator } from '@/components/WakeLockIndicator';

// Mock the useWakeLock hook
jest.mock('../../hooks/useWakeLock', () => ({
    useWakeLock: jest.fn()
}));

// Import the mocked module to control its behavior
import { useWakeLock } from '@/hooks/useWakeLock';

describe('WakeLockIndicator Component', () => {
    // Restore mocks after tests
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders when wake lock is active', () => {
        // Mock the hook to return active state
        (useWakeLock as jest.Mock).mockReturnValue({
            isActive: true,
            error: null
        });

        render(<WakeLockIndicator />);

        // Check if component is rendered
        expect(screen.getByText('Screen On')).toBeInTheDocument();
        expect(screen.getByLabelText('Screen wake lock is active')).toBeInTheDocument();
    });

    test('renders when on iOS device', () => {
        // Mock the hook to return inactive state
        (useWakeLock as jest.Mock).mockReturnValue({
            isActive: false,
            error: null
        });

        // Mock navigator userAgent to simulate iOS
        const originalUserAgent = navigator.userAgent;
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            configurable: true
        });

        render(<WakeLockIndicator />);

        // Check if component is rendered despite wake lock being inactive
        expect(screen.getByText('Screen On')).toBeInTheDocument();

        // Restore original userAgent
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
        });
    });

    test('does not render when wake lock is inactive and not on iOS', () => {
        // Mock the hook to return inactive state
        (useWakeLock as jest.Mock).mockReturnValue({
            isActive: false,
            error: null
        });

        // Mock navigator userAgent to simulate non-iOS device
        const originalUserAgent = navigator.userAgent;
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            configurable: true
        });

        const { container } = render(<WakeLockIndicator />);

        // Component should not render anything
        expect(container).toBeEmptyDOMElement();

        // Restore original userAgent
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
        });
    });

    test('applies custom class name', () => {
        // Mock the hook to return active state
        (useWakeLock as jest.Mock).mockReturnValue({
            isActive: true,
            error: null
        });

        render(<WakeLockIndicator className="custom-class" />);

        // Check if the custom class is applied
        const container = screen.getByLabelText('Screen wake lock is active');
        expect(container).toHaveClass('custom-class');
    });
}); 