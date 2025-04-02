// Import Jest DOM to extend Jest matchers
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';

// Mock window.matchMedia
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

// Mock HTMLMediaElement API
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

// Mock Wake Lock API
Object.defineProperty(navigator, 'wakeLock', {
    value: {
        request: jest.fn().mockImplementation(() => {
            return Promise.resolve({
                release: jest.fn().mockImplementation(() => Promise.resolve())
            });
        })
    },
    configurable: true
});

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Suppress console errors in tests for cleaner output
jest.spyOn(console, 'error').mockImplementation(() => { });

// Clear mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

jest.mock('canvas', () => {
    return {
        createCanvas: () => ({
            getContext: () => ({
                measureText: () => ({
                    width: 0,
                }),
            }),
        }),
    };
}); 