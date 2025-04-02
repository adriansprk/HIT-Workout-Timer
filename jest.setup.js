// Import Jest DOM to extend Jest matchers
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';

// Increase Jest's default timeout to account for complex component operations
jest.setTimeout(30000);

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
};

// Mock HTMLMediaElement API for audio/video testing
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();
Object.defineProperty(window.HTMLMediaElement.prototype, 'muted', {
    set: jest.fn(),
    configurable: true
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'volume', {
    set: jest.fn(),
    configurable: true
});

// Mock Wake Lock API for screen-on functionality
Object.defineProperty(navigator, 'wakeLock', {
    value: {
        request: jest.fn().mockImplementation(() => {
            return Promise.resolve({
                release: jest.fn().mockImplementation(() => Promise.resolve())
            });
        })
    },
    configurable: true,
    writable: true
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Mock react-dom's flushSync for components that might use it
jest.mock('react-dom', () => {
    const original = jest.requireActual('react-dom');
    return {
        ...original,
        flushSync: (fn) => fn(),
    };
});

// Mock canvas context for components that use canvas
jest.mock('canvas', () => {
    return {
        createCanvas: () => ({
            getContext: () => ({
                measureText: () => ({
                    width: 0,
                }),
                fillText: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                clearRect: jest.fn(),
            }),
        }),
    };
});

// Setup test environment before each test
beforeEach(() => {
    // Clear all mocks and storage
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Fix for act warnings
    jest.spyOn(console, 'error').mockImplementation((message) => {
        // Allow real errors but suppress act warnings
        if (message && message.includes && message.includes('Warning: ReactDOM.render')) {
            return;
        }
        if (message && message.includes && message.includes('Warning: An update to')) {
            return;
        }
        console.error(message);
    });
});

// Cleanup after each test
afterEach(() => {
    // Restore any mocked functions
    jest.restoreAllMocks();
}); 