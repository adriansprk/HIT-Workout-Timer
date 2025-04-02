// Add the jest-dom matchers
import '@testing-library/jest-dom';
// Add jest-localstorage-mock
import 'jest-localstorage-mock';
import 'jest-canvas-mock';

// Mock Window APIs that might not be available in Jest
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();

// Mock the Wake Lock API
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

// Mock react-confetti
jest.mock('react-confetti', () => {
    return jest.fn(() => null);
});

// Mock Web Audio API
const mockAudioContext = {
    state: 'running',
    resume: jest.fn().mockResolvedValue(undefined),
    createOscillator: jest.fn(),
    createGain: jest.fn(),
    destination: {},
};

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })
);

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
} as Storage;

global.localStorage = localStorageMock;