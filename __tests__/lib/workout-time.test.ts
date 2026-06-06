import { calculateActiveDuration, calculateWorkoutDuration } from '@/lib/workout-time';

describe('Workout time calculations', () => {
    test('calculates total duration without rest after the last exercise in each round', () => {
        expect(calculateWorkoutDuration({
            exerciseTime: 30,
            restTime: 10,
            roundRestTime: 60,
            exercises: 4,
            rounds: 3
        })).toBe(30 * 4 * 3 + 10 * 3 * 3 + 60 * 2);
    });

    test('does not add rest or round rest for a single exercise single round workout', () => {
        expect(calculateWorkoutDuration({
            exerciseTime: 45,
            restTime: 15,
            roundRestTime: 60,
            exercises: 1,
            rounds: 1
        })).toBe(45);
    });

    test('calculates active exercise duration only', () => {
        expect(calculateActiveDuration({
            exerciseTime: 45,
            exercises: 4,
            rounds: 3
        })).toBe(540);
    });
});
