"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../lib/utils';
import { Button } from "./ui/button"
import { X, Trophy, ChevronRight, Clock, Flame, RotateCcw, Dumbbell, Maximize, Minimize } from "lucide-react"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"
import Confetti from 'react-confetti';
import { updateWorkoutStreak } from "../lib/settings";
import { useWakeLock } from "../hooks/useWakeLock";
import { WakeLockIndicator } from "./WakeLockIndicator";

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

interface WorkoutTimerProps {
  exerciseTime: number;
  restTime: number;
  roundRestTime: number;
  exercises: number;
  rounds: number;
  onEnd: () => void;
}

type TimerState = "exercise" | "rest" | "roundRest" | "complete"

// Circular progress component specifically for timer
const CircularProgress = ({ value, size = 300, strokeWidth = 14, timerState }: {
  value: number,
  size?: number,
  strokeWidth?: number,
  timerState: TimerState
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Color based on timer state
  const getColor = () => {
    switch (timerState) {
      case "exercise":
        return "var(--color-exercise)"; // Using CSS variables instead of hard-coded colors
      case "rest":
        return "var(--color-rest)";
      case "roundRest":
        return "var(--color-recovery)";
      default:
        return "#818CF8"; // indigo-400
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB" // gray-200
          className="dark:stroke-gray-600"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
    </div>
  );
};

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { playCountdownSound, isMuted } = useAudio()

  // Track the previous timer state to detect transitions
  const [prevTimerState, setPrevTimerState] = useState<TimerState | null>(null)

  // Set up state for completion screen to avoid conditional hooks
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [streakCount, setStreakCount] = useState(0);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  // Refs
  const streakUpdatedRef = useRef(false);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Store timer reference to access latest state in intervals
  const timerRef = useRef({
    timeRemaining,
    timerState,
    isPaused,
    currentRound,
    currentExercise
  });

  // Debounce ref to prevent rapid successive calls to moveToNextPhase
  const lastMoveToNextPhaseTime = useRef(0);

  // Wake lock hook to prevent screen from sleeping
  const { isActive, request, release } = useWakeLock();

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
    // Debounce to prevent rapid successive calls (300ms cooldown)
    const now = Date.now();
    if (now - lastMoveToNextPhaseTime.current < 300) {
      return;
    }
    lastMoveToNextPhaseTime.current = now;
    setPrevTimerState(timerState);

    if (timerState === "exercise") {
      // Always move to rest period after exercise
      setTimerState("rest")
      setTimeRemaining(restTime)
    } else if (timerState === "rest") {
      // Check if we just completed the last exercise of the round
      if (currentExercise >= validExercises) {
        // If we're at the last round, complete the workout
        if (currentRound >= validRounds) {
          setTimerState("complete")
          return
        }
        // Otherwise move to round rest
        setTimerState("roundRest")
        setTimeRemaining(roundRestTime)
      } else {
        // Move to next exercise and increment exercise counter
        setTimerState("exercise")
        setTimeRemaining(exerciseTime)
        setCurrentExercise((prev) => prev + 1)
      }
    } else if (timerState === "roundRest") {
      // Move to first exercise of next round
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      // Increment round counter after round rest is complete, ensuring it doesn't exceed max rounds
      setCurrentRound((prev) => prev + 1);
      setCurrentExercise(1)
    }
  }, [timerState, currentExercise, currentRound, validExercises, validRounds, restTime, exerciseTime, roundRestTime])

  const moveToPreviousPhase = useCallback(() => {
    setPrevTimerState(timerState);

    if (timerState === "exercise") {
      // If we're at the first exercise of the first round, stay where we are
      if (currentExercise === 1 && currentRound === 1) {
        // Restart current exercise
        setTimeRemaining(exerciseTime);
        return;
      }

      // If we're at the first exercise of any round after the first
      if (currentExercise === 1 && currentRound > 1) {
        // Go back to the last exercise of the previous round
        setTimerState("exercise");
        setCurrentRound(prev => Math.max(prev - 1, 1));
        setCurrentExercise(validExercises);
        setTimeRemaining(exerciseTime);
      } else {
        // Go back to the previous exercise (after its rest period)
        setTimerState("exercise");
        setCurrentExercise(prev => Math.max(prev - 1, 1));
        setTimeRemaining(exerciseTime);
      }
    } else if (timerState === "rest") {
      // Go back to the exercise before this rest
      setTimerState("exercise");
      setTimeRemaining(exerciseTime);
    } else if (timerState === "roundRest") {
      // Go back to the last exercise of the current round
      setTimerState("exercise");
      setCurrentExercise(validExercises);
      setTimeRemaining(exerciseTime);
    }
  }, [timerState, currentExercise, currentRound, validExercises, exerciseTime]);

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

      // Calculate the halfway point of exercise (only during exercise state)
      const isHalfwayPoint = timerRef.current.timerState === "exercise" &&
        currentTime === Math.floor(exerciseTime / 2);

      // Check if this is the last exercise of a round (during rest phase)
      const isLastExerciseOfRound = timerRef.current.timerState === "rest" &&
        timerRef.current.currentExercise >= validExercises;

      // Check if this is the last exercise of the last round
      const isLastExerciseOfWorkout = isLastExerciseOfRound &&
        timerRef.current.currentRound >= validRounds;

      // Play halfway announcement if at halfway point
      if (isHalfwayPoint) {
        playCountdownSound('halfway-there');
      }

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
          // Always play rest sound at end of exercise
          playCountdownSound('rest');
        }
        else if (timerRef.current.timerState === "rest") {
          if (isLastExerciseOfWorkout) {
            // Play workout complete sound for the last rest of the workout
            playCountdownSound('workout-complete');
          } else if (isLastExerciseOfRound) {
            // Play round complete sound for the last rest of a round 
            playCountdownSound('round-complete');
          } else {
            // Normal go sound for regular rest end
            playCountdownSound('go');
          }
        }
        else if (timerRef.current.timerState === "roundRest") {
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
  }, [timerState, timeRemaining, moveToNextPhase, playCountdownSound, exerciseTime, validExercises, validRounds]);

  // When the workout is complete - initialize completion screen data
  useEffect(() => {
    if (timerState === "complete") {
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

  // Handle fullscreen logic
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Enable wake lock when timer starts, and disable on completion or pause
  useEffect(() => {
    if (timerState !== "complete" && !isPaused) {
      request();
    } else {
      release();
    }
  }, [timerState, isPaused, request, release]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && timerContainerRef.current) {
      timerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
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
      <div className="mx-auto p-4 max-w-md fixed inset-0 z-50 overflow-y-auto bg-black/90" style={{ height: '100dvh' }}>
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

        <div className="card mt-4 mb-4">
          {/* Header with trophy icon */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <h1 className="text-title">Workout Complete!</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={onEnd}
            >
              <X className="h-4 w-4 text-gray-700 dark:text-white" />
            </Button>
          </div>

          {/* Streak counter */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-200 dark:bg-amber-900/40 rounded-full mb-2">
              <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-700 dark:text-amber-300">
                {streakCount > 1 ? `${streakCount} day streak!` : 'First workout!'}
              </span>
            </div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Amazing work! You&apos;ve crushed your HIIT workout.
            </h2>
          </div>

          {/* Workout stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Rounds</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{validRounds}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Exercises</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{validExercises * validRounds}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Total Time</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(totalDuration)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Active Time</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(totalExerciseTime)}</p>
            </div>
          </div>

          {/* Motivational quote */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
            <p className="text-indigo-800 dark:text-indigo-300 italic text-center">
              &ldquo;{motivationalQuote}&rdquo;
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onEnd}
            className="w-full py-6 text-lg btn-primary"
          >
            <span>New Workout</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Get state indicator badge class
  const getStateBadgeClass = () => {
    switch (timerState) {
      case "exercise":
        return "badge-exercise";
      case "rest":
        return "badge-rest";
      case "roundRest":
        return "badge-recovery";
      default:
        return "badge bg-gray-600 text-white";
    }
  }

  // Get state indicator text
  const getStateText = () => {
    switch (timerState) {
      case "exercise":
        return "EXERCISE";
      case "rest":
        return "REST";
      case "roundRest":
        return "RECOVERY";
      default:
        return "READY";
    }
  }

  const stateBadgeClass = getStateBadgeClass();
  const stateText = getStateText();

  return (
    <div
      ref={timerContainerRef}
      className="timer-container"
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      {/* Controls positioned at top */}
      <div className="fixed top-4 w-full flex justify-between items-center px-4 z-20">
        {/* Exit button */}
        <button
          onClick={onEnd}
          aria-label="End workout"
          className="control-button h-12 w-12 rounded-full"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Center the WakeLock indicator */}
        <WakeLockIndicator />

        {/* Right side control */}
        <MuteButton />
      </div>

      {/* Main timer content */}
      <div className="flex-1 flex flex-col justify-center items-center mt-16 mb-32">
        <div className="relative flex flex-col items-center">
          {/* Timer circle */}
          <div className="relative">
            <CircularProgress value={progressPercentage} timerState={timerState} />

            {/* Time display centered in circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Round info at top of circle */}
              <div className="whitespace-nowrap mb-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-300">
                    Round {currentRound}/{validRounds}
                  </span>
                  <span className="text-xs text-gray-500 mx-2">•</span>
                  <span className="text-sm font-medium text-gray-300">
                    {Math.min(currentExercise, validExercises)}/{validExercises}
                  </span>
                </div>
              </div>

              <div className="text-8xl font-bold text-white" data-test="timer-display">
                {formatTime(timeRemaining)}
              </div>

              {/* Status badge overlaid on timer */}
              <div className={`${stateBadgeClass} mt-4 font-semibold`}>
                {stateText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons - positioned at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-0 z-20">
        <div className="flex justify-center items-center gap-3 px-4 mb-4">
          {/* Skip backward button */}
          <button
            className="control-button w-14 h-14"
            onClick={moveToPreviousPhase}
            aria-label="Previous exercise"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>

          {/* Pause/Play button */}
          <button
            className="control-button rounded-full px-8 py-3"
            onClick={togglePause}
            aria-label={isPaused ? "Play workout" : "Pause workout"}
          >
            <span className="font-semibold text-lg flex items-center text-white">
              {isPaused ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Play
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Pause
                </>
              )}
            </span>
          </button>

          {/* Skip forward button */}
          <button
            className="control-button w-14 h-14"
            onClick={moveToNextPhase}
            aria-label="Next exercise"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutTimer

