import type { WorkoutParams } from "./settings"

export interface WorkoutPreset {
    id: string
    name: string
    description: string
    params: WorkoutParams
}

/**
 * Curated quick-start workout templates. Each preset fills every
 * parameter in a single tap so users don't have to dial in 5 values.
 */
export const WORKOUT_PRESETS: WorkoutPreset[] = [
    {
        id: "tabata",
        name: "Tabata",
        description: "20s on / 10s off, 8 rounds",
        params: {
            exerciseTime: 20,
            restTime: 10,
            roundRestTime: 0,
            exercises: 1,
            rounds: 8,
        },
    },
    {
        id: "classic",
        name: "Classic HIIT",
        description: "45s on / 15s off, 4 exercises, 3 rounds",
        params: {
            exerciseTime: 45,
            restTime: 15,
            roundRestTime: 60,
            exercises: 4,
            rounds: 3,
        },
    },
    {
        id: "emom",
        name: "EMOM",
        description: "Every minute on the minute, 10 rounds",
        params: {
            exerciseTime: 60,
            restTime: 0,
            roundRestTime: 0,
            exercises: 1,
            rounds: 10,
        },
    },
    {
        id: "quick",
        name: "Quick Burn",
        description: "30s on / 10s off, 4 exercises, 2 rounds",
        params: {
            exerciseTime: 30,
            restTime: 10,
            roundRestTime: 30,
            exercises: 4,
            rounds: 2,
        },
    },
    {
        id: "endurance",
        name: "Endurance",
        description: "60s on / 20s off, 5 exercises, 4 rounds",
        params: {
            exerciseTime: 60,
            restTime: 20,
            roundRestTime: 90,
            exercises: 5,
            rounds: 4,
        },
    },
]

/**
 * Returns the id of the preset whose params exactly match the given
 * params, or null if the current config is custom.
 */
export const matchPreset = (params: WorkoutParams): string | null => {
    const match = WORKOUT_PRESETS.find(
        (preset) =>
            preset.params.exerciseTime === params.exerciseTime &&
            preset.params.restTime === params.restTime &&
            preset.params.roundRestTime === params.roundRestTime &&
            preset.params.exercises === params.exercises &&
            preset.params.rounds === params.rounds,
    )

    return match ? match.id : null
}
