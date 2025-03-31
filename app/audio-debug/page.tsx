"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { checkAudioFiles } from '../../lib/audio';

// List of audio files to test
const SOUNDS = [
    { name: 'three', path: `/audio/three.mp3?v=${Date.now()}` },
    { name: 'two', path: `/audio/two.mp3?v=${Date.now()}` },
    { name: 'one', path: `/audio/one.mp3?v=${Date.now()}` },
    { name: 'rest', path: `/audio/rest.mp3?v=${Date.now()}` },
    { name: 'go', path: `/audio/go.mp3?v=${Date.now()}` },
];

export default function AudioDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
    const audioElements = useRef<Record<string, HTMLAudioElement>>({});
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // Log function for debugging
    const log = (message: string) => {
        setLogs(prev => [message, ...prev.slice(0, 19)]);
        console.log('Audio Debug:', message);
    };

    // Initialize audio elements
    useEffect(() => {
        SOUNDS.forEach(sound => {
            try {
                const audio = new Audio(sound.path);
                audio.preload = 'auto';
                audio.load();
                audioElements.current[sound.name] = audio;
                log(`Created audio element for ${sound.name}`);
            } catch (err) {
                log(`Error creating audio element for ${sound.name}: ${err}`);
            }
        });

        return () => {
            // Cleanup audio elements
            Object.values(audioElements.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            audioElements.current = {};
        };
    }, []);

    // Method 1: Direct Audio element
    const playSound = (name: string) => {
        try {
            log(`Attempting to play ${name} directly`);

            const audio = audioElements.current[name];
            if (!audio) {
                log(`Audio element for ${name} not found!`);
                return;
            }

            // Create a fresh copy
            const newAudio = new Audio(audio.src);
            newAudio.volume = 1.0;

            newAudio.play()
                .then(() => {
                    log(`Successfully started playing ${name}`);
                    setAudioUnlocked(true);
                })
                .catch(err => {
                    log(`Error playing ${name}: ${err.message}`);
                });
        } catch (err: any) {
            log(`Exception playing ${name}: ${err.message}`);
        }
    };

    // Method 2: Using iOS hack with base64 encoded silent sound
    const unlockAudio = async () => {
        try {
            log('Attempting to unlock audio');

            // iOS hack: play a silent base64-encoded MP3
            const silentAudio = new Audio("data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
            silentAudio.volume = 0;

            await silentAudio.play();
            log('Successfully unlocked audio');
            setAudioUnlocked(true);

            // Now try to play each sound
            for (const sound of SOUNDS) {
                try {
                    const audio = audioElements.current[sound.name];
                    if (audio) {
                        // Just a quick play and pause to unlock
                        await audio.play();
                        audio.pause();
                        audio.currentTime = 0;
                        log(`Unlocked ${sound.name}`);
                    }
                } catch (err: any) {
                    log(`Error unlocking ${sound.name}: ${err.message}`);
                }
            }
        } catch (err: any) {
            log(`Error unlocking audio: ${err.message}`);
        }
    };

    // Method 3: Audio Context API
    const playWithContext = async (name: string) => {
        try {
            log(`Attempting to play ${name} with AudioContext`);

            // Feature detection
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) {
                log('AudioContext not supported');
                return;
            }

            const context = new AudioContext();

            // First try to resume the context in case it's suspended
            if (context.state === 'suspended') {
                await context.resume();
                log('AudioContext resumed');
            }

            // Fetch the audio file with cache busting
            const soundPath = SOUNDS.find(s => s.name === name)?.path || '';
            const response = await fetch(soundPath);

            if (!response.ok) {
                log(`Network error: ${response.status} ${response.statusText}`);
                return;
            }

            const arrayBuffer = await response.arrayBuffer();

            // Decode the audio data
            context.decodeAudioData(
                arrayBuffer,
                (buffer) => {
                    // Create a source node
                    const source = context.createBufferSource();
                    source.buffer = buffer;

                    // Connect to the output
                    source.connect(context.destination);

                    // Play the sound
                    source.start(0);
                    log(`Successfully playing ${name} with AudioContext`);
                    setAudioUnlocked(true);
                },
                (err) => log(`Error decoding audio data: ${err}`)
            );
        } catch (err: any) {
            log(`Exception with AudioContext for ${name}: ${err.message}`);
        }
    };

    // Check audio file accessibility
    const checkFiles = async () => {
        try {
            log('Checking audio file accessibility...');
            const results = await checkAudioFiles();
            setFileStatus(results);

            // Generate status for each file
            Object.entries(results).forEach(([file, status]) => {
                log(`File ${file}.mp3: ${status ? '✅ ACCESSIBLE' : '❌ NOT FOUND'}`);
            });

            // Overall status
            const allAccessible = Object.values(results).every(Boolean);
            log(`Overall status: ${allAccessible ? '✅ ALL FILES ACCESSIBLE' : '❌ SOME FILES MISSING'}`);
        } catch (err: any) {
            log(`Error checking files: ${err.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <h1 className="text-2xl font-bold mb-4">Audio Debug Page</h1>

                <div className="mb-4">
                    <p className="text-sm mb-2">User Agent: </p>
                    <div className="bg-gray-100 p-2 rounded text-xs break-all">
                        {userAgent}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    <Button onClick={checkFiles} variant="default" size="lg" className="w-full bg-green-600 hover:bg-green-700">
                        Check Audio Files
                    </Button>

                    {Object.keys(fileStatus).length > 0 && (
                        <div className="bg-gray-100 p-3 rounded-md mb-2">
                            <h3 className="font-medium mb-2">File Status:</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(fileStatus).map(([file, status]) => (
                                    <div key={file} className={`text-sm p-2 rounded ${status ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        {file}.mp3: {status ? '✅' : '❌'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button onClick={unlockAudio} variant="outline" size="lg" className="w-full">
                        1. Unlock Audio (iOS)
                    </Button>

                    <div className="text-center text-sm">Audio Status: {audioUnlocked ? "🟢 Unlocked" : "🔴 Locked"}</div>

                    <div className="grid grid-cols-3 gap-2">
                        {SOUNDS.map(sound => (
                            <Button
                                key={sound.name}
                                onClick={() => playSound(sound.name)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Play {sound.name}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {SOUNDS.map(sound => (
                            <Button
                                key={sound.name}
                                onClick={() => playWithContext(sound.name)}
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                                Context {sound.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="font-semibold mb-2">Debug Logs:</h2>
                    <div className="bg-gray-900 text-green-400 p-2 rounded-md h-48 overflow-y-auto text-xs font-mono">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">&gt; {log}</div>
                        ))}
                    </div>
                </div>

                <Link href="/" className="text-blue-600 hover:underline inline-block mt-4">
                    Back to Home
                </Link>
            </div>
        </div>
    );
} 