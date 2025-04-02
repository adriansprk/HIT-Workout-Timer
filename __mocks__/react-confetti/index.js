import React from 'react';

const ReactConfetti = jest.fn().mockImplementation(props => {
    return <div data-testid="mock-confetti" {...props} />;
});

export default ReactConfetti; 