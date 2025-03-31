"use client";

import { useAudio } from "../../contexts/AudioContext";
import { MuteButton } from "../../components/MuteButton";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AudioTestPage() {
    const { playCountdownSound, isMuted } = useAudio();
    const [activeSound, setActiveSound] = useState<string | null>(null);

    const playSoundWithVisualFeedback = async (sound: 'three' | 'two' | 'one' | 'rest' | 'go') => {
        setActiveSound(sound);
        await playCountdownSound(sound);
        setTimeout(() => setActiveSound(null), 500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Audio Test</h1>
                    <MuteButton />
                </div>

                <p className="mb-6 text-gray-600">
                    Test the audio countdown sounds for the HIIT timer.
                    {isMuted && (
                        <span className="block mt-2 text-red-500 font-semibold">
                            Currently muted! Click the speaker icon to unmute.
                        </span>
                    )}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Button
                        onClick={() => playSoundWithVisualFeedback('three')}
                        className={`p-6 ${activeSound === 'three' ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700`}
                    >
                        Play "Three"
                    </Button>

                    <Button
                        onClick={() => playSoundWithVisualFeedback('two')}
                        className={`p-6 ${activeSound === 'two' ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700`}
                    >
                        Play "Two"
                    </Button>

                    <Button
                        onClick={() => playSoundWithVisualFeedback('one')}
                        className={`p-6 ${activeSound === 'one' ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700`}
                    >
                        Play "One"
                    </Button>

                    <Button
                        onClick={() => playSoundWithVisualFeedback('rest')}
                        className={`p-6 ${activeSound === 'rest' ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700`}
                    >
                        Play "Rest"
                    </Button>

                    <Button
                        onClick={() => playSoundWithVisualFeedback('go')}
                        className={`p-6 ${activeSound === 'go' ? 'bg-indigo-700' : 'bg-indigo-600'} hover:bg-indigo-700`}
                    >
                        Play "Go"
                    </Button>
                </div>

                <div className="flex justify-center">
                    <Link href="/">
                        <Button variant="outline">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 