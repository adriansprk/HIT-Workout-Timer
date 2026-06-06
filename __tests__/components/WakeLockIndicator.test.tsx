import React from 'react';
import { render, screen } from '@testing-library/react';
import { WakeLockIndicator } from '@/components/WakeLockIndicator';

describe('WakeLockIndicator Component', () => {
    test('renders when wake lock is active', () => {
        render(<WakeLockIndicator isActive={true} isIOSDevice={false} />);

        // Check if component is rendered
        expect(screen.getByText('Screen On')).toBeInTheDocument();
        expect(screen.getByLabelText('Screen wake lock is active')).toBeInTheDocument();
    });

    test('renders when on iOS device', () => {
        render(<WakeLockIndicator isActive={false} isIOSDevice={true} />);

        // Check if component is rendered despite wake lock being inactive
        expect(screen.getByText('Screen On')).toBeInTheDocument();
    });

    test('does not render when wake lock is inactive and not on iOS', () => {
        const { container } = render(<WakeLockIndicator isActive={false} isIOSDevice={false} />);

        // Component should not render anything
        expect(container).toBeEmptyDOMElement();
    });

    test('applies custom class name', () => {
        render(<WakeLockIndicator isActive={true} isIOSDevice={false} className="custom-class" />);

        // Check if the custom class is applied
        const container = screen.getByLabelText('Screen wake lock is active');
        expect(container).toHaveClass('custom-class');
    });
});
