"use client"

import React from 'react';
import { forceUnlockAudio } from "../lib/audio";
import { Button } from "../components/ui/button";
import { saveWorkoutParams } from "../lib/settings";

// Define WorkoutSettings type
export interface WorkoutSettings {
    exerciseTime: number;
    restTime: number;
    roundRestTime: number;
    exercises: number;
    rounds: number;
}

// Define component props
interface WorkoutSetupProps {
    onStart: (settings: WorkoutSettings) => void;
    exerciseTime: number;
    restTime: number;
    roundRestTime: number;
    exercises: number;
    rounds: number;
    isValid: boolean;
}

const WorkoutSetup: React.FC<WorkoutSetupProps> = ({
    onStart,
    exerciseTime,
    restTime,
    roundRestTime,
    exercises,
    rounds,
    isValid
}) => {
    const startWorkout = async () => {
        // Unlock audio first before starting the workout
        await forceUnlockAudio();

        // Then start the workout with current settings
        onStart({
            exerciseTime,
            restTime,
            roundRestTime,
            exercises,
            rounds,
        });

        // Save settings after starting
        saveWorkoutParams({
            exerciseTime,
            restTime,
            roundRestTime,
            exercises,
            rounds,
        });
    };

    return (
        <Button
            className="w-full mt-6"
            onClick={startWorkout}
            disabled={!isValid}
        >
            Start Workout
        </Button>
    );
}

export default WorkoutSetup; 