import type { WorkoutParams } from "./settings";

type WorkoutTiming = Pick<
  WorkoutParams,
  "exerciseTime" | "restTime" | "roundRestTime" | "exercises" | "rounds"
>;

export const calculateWorkoutDuration = ({
  exerciseTime,
  restTime,
  roundRestTime,
  exercises,
  rounds,
}: WorkoutTiming): number => {
  const validExercises = Math.max(1, exercises);
  const validRounds = Math.max(1, rounds);

  const exerciseDuration = exerciseTime * validExercises * validRounds;
  const restBetweenExercises = restTime * Math.max(0, validExercises - 1) * validRounds;
  const restBetweenRounds = roundRestTime * Math.max(0, validRounds - 1);

  return exerciseDuration + restBetweenExercises + restBetweenRounds;
};

export const calculateActiveDuration = ({
  exerciseTime,
  exercises,
  rounds,
}: Pick<WorkoutTiming, "exerciseTime" | "exercises" | "rounds">): number => {
  return exerciseTime * Math.max(1, exercises) * Math.max(1, rounds);
};
