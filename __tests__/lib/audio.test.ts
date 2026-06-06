import { cleanupAudio, forceUnlockAudio, playSound } from '@/lib/audio';
import { saveAudioUnlockStatus } from '@/lib/settings';

jest.mock('@/lib/settings', () => ({
    saveAudioUnlockStatus: jest.fn(),
    getAudioUnlockStatus: jest.fn(() => false)
}));

type MockSource = {
    buffer: AudioBuffer | null;
    connect: jest.Mock;
    start: jest.Mock;
    onended: (() => void) | null;
};

class MockAudioContext {
    state: AudioContextState = 'running';
    destination = {} as AudioDestinationNode;
    sources: MockSource[] = [];
    createBuffer = jest.fn(() => ({}) as AudioBuffer);
    createGain = jest.fn(() => ({
        gain: { value: 0 },
        connect: jest.fn()
    }) as unknown as GainNode);
    decodeAudioData = jest.fn(async () => ({}) as AudioBuffer);
    resume = jest.fn(async () => {
        this.state = 'running';
    });
    close = jest.fn(async () => {
        this.state = 'closed';
    });
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    createBufferSource = jest.fn(() => {
        const source: MockSource = {
            buffer: null,
            connect: jest.fn(),
            start: jest.fn(),
            onended: null
        };
        this.sources.push(source);
        return source as unknown as AudioBufferSourceNode;
    });
}

describe('audio module', () => {
    let audioContexts: MockAudioContext[];

    beforeEach(() => {
        audioContexts = [];
        Object.defineProperty(window, 'AudioContext', {
            configurable: true,
            writable: true,
            value: jest.fn(() => {
                const context = new MockAudioContext();
                audioContexts.push(context);
                return context;
            })
        });
        Object.defineProperty(window, 'webkitAudioContext', {
            configurable: true,
            writable: true,
            value: undefined
        });
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            arrayBuffer: jest.fn(async () => new ArrayBuffer(8))
        }) as unknown as typeof fetch;
    });

    afterEach(() => {
        cleanupAudio();
    });

    test('does not initialize or fetch audio when muted', async () => {
        await playSound('go', true);

        expect(window.AudioContext).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('loads and starts a buffer source when unmuted', async () => {
        await playSound('go', false);

        expect(window.AudioContext).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/audio/go.mp3?v='));
        expect(audioContexts[0].decodeAudioData).toHaveBeenCalled();
        expect(audioContexts[0].createBufferSource).toHaveBeenCalledTimes(1);
        expect(audioContexts[0].sources[0].start).toHaveBeenCalledWith(0);
    });

    test('suppresses duplicate sound playback while a sound is already active', async () => {
        await playSound('go', false);
        await playSound('go', false);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(audioContexts[0].createBufferSource).toHaveBeenCalledTimes(1);
    });

    test('force unlock plays a silent buffer and persists unlock status', async () => {
        await expect(forceUnlockAudio()).resolves.toBe(true);

        expect(audioContexts[0].createBuffer).toHaveBeenCalledWith(1, 1, 22050);
        expect(audioContexts[0].sources[0].start).toHaveBeenCalledWith(0);
        expect(saveAudioUnlockStatus).toHaveBeenCalledWith(true);
    });
});
