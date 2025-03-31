"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../lib/utils';
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { X, Trophy, ChevronRight, Clock, Flame, RotateCcw, Dumbbell } from "lucide-react"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"
import Confetti from 'react-confetti';
import { updateWorkoutStreak } from "../lib/settings";

// Custom progress component with explicit indigo indicator color
const CustomProgress = ({ value }: { value: number }) => {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-600"
        style={{ width: `${value}%`, transition: "width 0.5s ease" }}
      ></div>
    </div>
  )
}

interface WorkoutTimerProps {
  exerciseTime: number;
  restTime: number;
  roundRestTime: number;
  exercises: number;
  rounds: number;
  onEnd: () => void;
}

type TimerState = "exercise" | "rest" | "roundRest" | "complete"

// Array of motivational quotes for the completion screen
const MOTIVATIONAL_QUOTES = [
  "Success is what comes after you stop making excuses.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Strength does not come from the body. It comes from the will.",
  "The difference between try and triumph is a little umph.",
  "The only way to define your limits is by going beyond them.",
  "What seems impossible today will one day become your warm-up.",
];

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  exerciseTime,
  restTime,
  roundRestTime,
  exercises,
  rounds,
  onEnd,
}) => {
  // Validate input parameters
  const validExercises = Math.max(1, exercises);
  const validRounds = Math.max(1, rounds);

  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(1)
  const [timerState, setTimerState] = useState<TimerState>("exercise")
  const [timeRemaining, setTimeRemaining] = useState(exerciseTime)
  const [isPaused, setIsPaused] = useState(false)
  const { playCountdownSound, isMuted } = useAudio()

  // Track the previous timer state to detect transitions
  const [prevTimerState, setPrevTimerState] = useState<TimerState | null>(null)

  // Set up state for completion screen to avoid conditional hooks
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [streakCount, setStreakCount] = useState(0);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  // Refs
  const streakUpdatedRef = useRef(false);

  // Store timer reference to access latest state in intervals
  const timerRef = useRef({
    timeRemaining,
    timerState,
    isPaused,
    currentRound,
    currentExercise
  });

  // Keep the ref updated with the latest state values
  useEffect(() => {
    timerRef.current = {
      timeRemaining,
      timerState,
      isPaused,
      currentRound,
      currentExercise
    };

    // Safeguard against potential infinite loops
    if (currentExercise > validExercises * 2) {
      console.error("Exercise counter exceeded expected maximum. Forcing workout completion.");
      setTimerState("complete");
    }

    // Safeguard against excessive rounds
    if (currentRound > validRounds) {
      console.error("Round counter exceeded maximum. Forcing workout completion.");
      setTimerState("complete");
    }
  }, [timeRemaining, timerState, isPaused, currentRound, currentExercise, validExercises, validRounds]);

  const getTimerColor = () => {
    switch (timerState) {
      case "exercise":
        return "text-red-600"
      case "rest":
        return "text-green-600"
      case "roundRest":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getMaxTime = () => {
    switch (timerState) {
      case "exercise":
        return exerciseTime
      case "rest":
        return restTime
      case "roundRest":
        return roundRestTime
      default:
        return 0
    }
  }

  const progressPercentage = (timeRemaining / getMaxTime()) * 100

  const moveToNextPhase = useCallback(() => {
    setPrevTimerState(timerState);

    if (timerState === "exercise") {
      // If we're at the last exercise of the round
      if (currentExercise >= validExercises) {
        // If we're at the last round, complete the workout
        if (currentRound >= validRounds) {
          setTimerState("complete")
          return
        }
        // Otherwise move to round rest
        setTimerState("roundRest")
        setTimeRemaining(roundRestTime)
        // Don't increment round count here, do it after round rest is complete
      } else {
        // Move to rest period
        setTimerState("rest")
        setTimeRemaining(restTime)
      }
    } else if (timerState === "rest") {
      // Move to next exercise
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      setCurrentExercise((prev) => Math.min(prev + 1, validExercises))
    } else if (timerState === "roundRest") {
      // Move to first exercise of next round
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      // Increment round counter after round rest is complete, ensuring it doesn't exceed max rounds
      setCurrentRound((prev) => {
        const nextRound = prev + 1;
        return Math.min(nextRound, validRounds);
      });
      setCurrentExercise(1)
    }
  }, [timerState, currentExercise, currentRound, validExercises, validRounds, restTime, exerciseTime, roundRestTime])

  // Main timer effect with stable interval
  useEffect(() => {
    if (timerState === "complete") return;

    // Initialize time from the beginning
    let currentTime = timeRemaining;
    let intervalId: NodeJS.Timeout | null = null;

    // Function to handle countdown logic and sound
    const tickAndUpdateDisplay = () => {
      // Skip if paused
      if (timerRef.current.isPaused) {
        return;
      }

      // Display current time
      setTimeRemaining(currentTime);

      // Play appropriate sound based on the time we just set to display
      if (currentTime === 3) {
        playCountdownSound('three');
      }
      else if (currentTime === 2) {
        playCountdownSound('two');
      }
      else if (currentTime === 1) {
        playCountdownSound('one');
      }
      else if (currentTime === 0) {
        // Play end of interval sound
        if (timerRef.current.timerState === "exercise") {
          playCountdownSound('rest');
        }
        else if (timerRef.current.timerState === "rest" || timerRef.current.timerState === "roundRest") {
          playCountdownSound('go');
        }

        // At 0, move to next stage after allowing sound to play
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Small delay to allow sound to play before changing state
        setTimeout(() => {
          moveToNextPhase();
        }, 200);

        return;
      }

      // Decrement for next tick
      currentTime -= 1;
    };

    // Start immediately with current value
    tickAndUpdateDisplay();

    // Then continue on interval
    intervalId = setInterval(tickAndUpdateDisplay, 1000);

    // Clean up on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerState, timeRemaining, moveToNextPhase, playCountdownSound]);

  // When the workout is complete - initialize completion screen data
  useEffect(() => {
    if (timerState === "complete") {
      console.log("Workout completed with rounds:", validRounds, "and exercises:", validExercises);

      // Set motivational quote
      setMotivationalQuote(getRandomQuote());

      // Get updated streak count only once
      if (!streakUpdatedRef.current) {
        const streak = updateWorkoutStreak();
        setStreakCount(streak.count);
        streakUpdatedRef.current = true;
      }
    }
  }, [timerState, validRounds, validExercises]);

  // Handle window resize for confetti
  useEffect(() => {
    if (timerState === "complete") {
      // Function to update dimensions
      const updateWindowDimensions = () => {
        setWindowDimension({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Set initial dimensions
      updateWindowDimensions();

      // Add event listener for resize
      window.addEventListener('resize', updateWindowDimensions);

      // Clean up event listener
      return () => window.removeEventListener('resize', updateWindowDimensions);
    }
  }, [timerState]);

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  // Random quote selection function
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  };

  // Calculate total workout duration in seconds
  const calculateTotalDuration = (exerciseTime: number, restTime: number, roundRestTime: number, exercises: number, rounds: number) => {
    // Exercise time for all exercises in all rounds
    const totalExerciseTime = exerciseTime * exercises * rounds;

    // Rest time between exercises (not needed after last exercise in each round)
    const totalRestTime = restTime * (exercises - 1) * rounds;

    // Round rest time between rounds (not needed after last round)
    const totalRoundRestTime = roundRestTime * (rounds - 1);

    return totalExerciseTime + totalRestTime + totalRoundRestTime;
  };

  // Calculate total active exercise time (excluding rest periods)
  const calculateActiveTime = (exerciseTime: number, exercises: number, rounds: number) => {
    return exerciseTime * exercises * rounds;
  };

  if (timerState === "complete") {
    // Calculate total workout duration
    const totalDuration = calculateTotalDuration(exerciseTime, restTime, roundRestTime, validExercises, validRounds);

    // Calculate total exercise time (without rest periods)
    const totalExerciseTime = calculateActiveTime(exerciseTime, validExercises, validRounds);

    return (
      <div className="mx-auto p-4 max-w-md relative">
        {/* Confetti effect */}
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          tweenDuration={10000}
          colors={['#4F46E5', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
        />

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {/* Header with trophy icon */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold">Workout Complete!</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={onEnd}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Streak counter */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">
                {streakCount > 1 ? `${streakCount} day streak!` : 'First workout!'}
              </span>
            </div>
            <h2 className="text-lg font-medium text-gray-800">
              Amazing work! You've crushed your HIIT workout.
            </h2>
          </div>

          {/* Workout stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600 text-sm">Rounds</span>
              </div>
              <p className="text-xl font-bold">{validRounds}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600 text-sm">Exercises</span>
              </div>
              <p className="text-xl font-bold">{validExercises * validRounds}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600 text-sm">Total Time</span>
              </div>
              <p className="text-xl font-bold">{formatTime(totalDuration)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600 text-sm">Active Time</span>
              </div>
              <p className="text-xl font-bold">{formatTime(totalExerciseTime)}</p>
            </div>
          </div>

          {/* Motivational quote */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-indigo-800 italic text-center">
              "{motivationalQuote}"
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onEnd}
            className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700"
          >
            <span>New Workout</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Return to settings to start a new workout
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-md">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Workout</h1>
          <div className="flex items-center gap-2">
            <MuteButton />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={togglePause}
            >
              {isPaused ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        <div className={`text-5xl font-bold text-center mb-4 ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>

        <CustomProgress value={progressPercentage} />

        <div className="my-6 text-center">
          <span className="text-xl font-semibold">
            {timerState === "exercise"
              ? "Exercise"
              : timerState === "rest"
                ? "Rest"
                : "Recovery Time"}
          </span>
          {timerState === "roundRest" && (
            <p className="text-sm text-gray-600 mt-1">
              Get ready for Round {currentRound + 1}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Round</div>
            <div className="text-xl font-semibold">
              {currentRound} / {validRounds}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Exercise</div>
            <div className="text-xl font-semibold">
              {Math.min(currentExercise, validExercises)} / {validExercises}
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full"
          onClick={onEnd}
        >
          End Workout
        </Button>
      </div>
    </div>
  )
}

export default WorkoutTimer

