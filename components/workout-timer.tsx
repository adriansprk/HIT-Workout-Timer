"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../lib/utils';
import { Button } from "./ui/button"
import { X, Trophy, ChevronRight, Clock, Flame, RotateCcw, Dumbbell } from "lucide-react"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"
import Confetti from 'react-confetti';
import { updateWorkoutStreak } from "../lib/settings";
import { useWakeLock } from "../hooks/useWakeLock";
import { WakeLockIndicator } from "./WakeLockIndicator";
import { calculateActiveDuration, calculateWorkoutDuration } from "../lib/workout-time";

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

const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
};

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

  // Detect a phase reset (value jumps back up) so the ring snaps instead of
  // sweeping backwards. Normal ticks decrease the value and animate smoothly.
  const prevValue = useRef(value);
  const isReset = value > prevValue.current + 0.5;
  useEffect(() => {
    prevValue.current = value;
  }, [value]);

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
          stroke="rgba(255,255,255,0.18)"
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
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: isReset ? "none" : "stroke-dashoffset 1s linear" }}
        />
      </svg>
    </div>
  );
};

// State-driven full-screen background colors for at-a-glance legibility
const STATE_BACKGROUNDS: Record<TimerState, string> = {
  exercise: "#166534", // green-800
  rest: "#9A3412", // orange-800 (warm = pause)
  roundRest: "#1E40AF", // blue-800
  complete: "#0F172A", // slate-900
};

// Fire a haptic pulse where supported (no-op on unsupported devices)
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore — haptics are a progressive enhancement
    }
  }
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
  const validExerciseTime = Math.max(1, exerciseTime);
  const validRestTime = Math.max(0, restTime);
  const validRoundRestTime = Math.max(0, roundRestTime);
  const validExercises = Math.max(1, exercises);
  const validRounds = Math.max(1, rounds);

  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(1)
  const [timerState, setTimerState] = useState<TimerState>("exercise")
  const [timeRemaining, setTimeRemaining] = useState(validExerciseTime)
  const [isPaused, setIsPaused] = useState(false)
  // "Get Ready" countdown shown before the very first exercise (3,2,1)
  const [getReadyCount, setGetReadyCount] = useState(3)
  const [isGettingReady, setIsGettingReady] = useState(true)
  const { playCountdownSound } = useAudio()

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

  // Debounce ref to prevent rapid successive calls to moveToNextPhase
  const lastMoveToNextPhaseTime = useRef(0);

  // Wake lock hook to prevent screen from sleeping
  const { isActive, request, release, isIOSDevice } = useWakeLock();

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

  const getMaxTime = () => {
    switch (timerState) {
      case "exercise":
        return validExerciseTime
      case "rest":
        return validRestTime
      case "roundRest":
        return validRoundRestTime
      default:
        return 0
    }
  }

  const maxTime = getMaxTime()
  const progressPercentage = maxTime > 0 ? (timeRemaining / maxTime) * 100 : 100

  const moveToNextPhase = useCallback(() => {
    // Debounce to prevent rapid successive calls (300ms cooldown)
    const now = Date.now();
    if (now - lastMoveToNextPhaseTime.current < 300) {
      return;
    }
    lastMoveToNextPhaseTime.current = now;

    if (timerState === "exercise") {
      // Check if this is the last exercise of the round
      if (currentExercise >= validExercises) {
        // If we're at the last round, complete the workout (skip rest)
        if (currentRound >= validRounds) {
          setTimerState("complete")
          return
        }
        if (validRoundRestTime <= 0) {
          setTimerState("exercise")
          setTimeRemaining(validExerciseTime)
          setCurrentRound((prev) => prev + 1)
          setCurrentExercise(1)
          return
        }
        // Otherwise skip exercise rest and go directly to round rest
        setTimerState("roundRest")
        setTimeRemaining(validRoundRestTime)
      } else {
        if (validRestTime <= 0) {
          setTimerState("exercise")
          setTimeRemaining(validExerciseTime)
          setCurrentExercise((prev) => prev + 1)
          return
        }
        // Not the last exercise, move to rest period
        setTimerState("rest")
        setTimeRemaining(validRestTime)
      }
    } else if (timerState === "rest") {
      // After rest period, move to next exercise
      setTimerState("exercise")
      setTimeRemaining(validExerciseTime)
      setCurrentExercise((prev) => prev + 1)
    } else if (timerState === "roundRest") {
      // Move to first exercise of next round
      setTimerState("exercise")
      setTimeRemaining(validExerciseTime)
      // Increment round counter after round rest is complete, ensuring it doesn't exceed max rounds
      setCurrentRound((prev) => prev + 1);
      setCurrentExercise(1)
    }
  }, [timerState, currentExercise, currentRound, validExercises, validRounds, validRestTime, validExerciseTime, validRoundRestTime])

  const moveToPreviousPhase = useCallback(() => {
    if (timerState === "exercise") {
      // If we're at the first exercise of the first round, stay where we are
      if (currentExercise === 1 && currentRound === 1) {
        // Restart current exercise
        setTimeRemaining(validExerciseTime);
        return;
      }

      // If we're at the first exercise of any round after the first
      if (currentExercise === 1 && currentRound > 1) {
        // Go back to the last exercise of the previous round
        setTimerState("exercise");
        setCurrentRound(prev => Math.max(prev - 1, 1));
        setCurrentExercise(validExercises);
        setTimeRemaining(validExerciseTime);
      } else {
        // Go back to the previous exercise (after its rest period)
        setTimerState("exercise");
        setCurrentExercise(prev => Math.max(prev - 1, 1));
        setTimeRemaining(validExerciseTime);
      }
    } else if (timerState === "rest") {
      // Go back to the exercise before this rest
      setTimerState("exercise");
      setTimeRemaining(validExerciseTime);
    } else if (timerState === "roundRest") {
      // Go back to the last exercise of the current round
      setTimerState("exercise");
      setCurrentExercise(validExercises);
      setTimeRemaining(validExerciseTime);
    }
  }, [timerState, currentExercise, currentRound, validExercises, validExerciseTime]);

  // Main timer effect with stable interval
  useEffect(() => {
    if (timerState === "complete") return;
    // Hold the workout until the "Get Ready" countdown finishes
    if (isGettingReady) return;

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
        currentTime === Math.floor(validExerciseTime / 2);

      // Check if this is the last exercise of a round (can be during exercise or rest phase)
      const isLastExerciseOfRound = timerRef.current.currentExercise >= validExercises;

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
          // Check if this is the last exercise to play appropriate sound
          if (isLastExerciseOfWorkout) {
            // Play workout complete sound for the last exercise of the workout
            playCountdownSound('workout-complete');
          } else if (isLastExerciseOfRound) {
            // Play round complete sound for the last exercise of a round
            playCountdownSound('round-complete');
          } else {
            // Normal rest sound for regular exercise end
            playCountdownSound('rest');
          }
        }
        else if (timerRef.current.timerState === "rest") {
          // Normal go sound for regular rest end
          playCountdownSound('go');
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
  }, [timerState, timeRemaining, moveToNextPhase, playCountdownSound, validExerciseTime, validExercises, validRounds, isGettingReady]);

  // "Get Ready" 3-2-1 countdown before the first exercise begins
  useEffect(() => {
    if (!isGettingReady) return;
    if (isPaused) return;

    vibrate(40);
    playCountdownSound(getReadyCount === 3 ? "three" : getReadyCount === 2 ? "two" : "one");

    const id = setTimeout(() => {
      if (getReadyCount > 1) {
        setGetReadyCount((c) => c - 1);
      } else {
        // Countdown finished — start the workout
        vibrate([0, 120]);
        playCountdownSound("go");
        setIsGettingReady(false);
      }
    }, 1000);

    return () => clearTimeout(id);
  }, [isGettingReady, getReadyCount, isPaused, playCountdownSound]);

  // Haptic feedback on every phase transition for eyes-free awareness
  const prevPhaseRef = useRef<TimerState>(timerState);
  useEffect(() => {
    if (isGettingReady) return;
    if (prevPhaseRef.current !== timerState) {
      vibrate(timerState === "exercise" ? [0, 80, 60, 80] : 100);
      prevPhaseRef.current = timerState;
    }
  }, [timerState, isGettingReady]);

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

  if (timerState === "complete") {
    const totalDuration = calculateWorkoutDuration({
      exerciseTime: validExerciseTime,
      restTime: validRestTime,
      roundRestTime: validRoundRestTime,
      exercises: validExercises,
      rounds: validRounds,
    });
    const totalExerciseTime = calculateActiveDuration({
      exerciseTime: validExerciseTime,
      exercises: validExercises,
      rounds: validRounds,
    });

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

  const stateText = getStateText();

  // Compute what comes after the current phase, mirroring moveToNextPhase logic
  const getNextUpLabel = (): string => {
    if (timerState === "exercise") {
      if (currentExercise >= validExercises) {
        if (currentRound >= validRounds) return "Finish";
        if (validRoundRestTime > 0) return "Recovery";
        return `Round ${currentRound + 1}`;
      }
      if (validRestTime > 0) return "Rest";
      return `Exercise ${currentExercise + 1}`;
    }
    if (timerState === "rest") return `Exercise ${currentExercise + 1}`;
    if (timerState === "roundRest") return `Round ${currentRound + 1}`;
    return "";
  };
  const nextUpLabel = getNextUpLabel();

  // Full-screen background reflects the current phase for at-a-glance reading
  const backgroundColor = STATE_BACKGROUNDS[timerState];

  return (
    <div
      className="timer-container"
      style={{
        height: '100%',
        width: '100%',
        background: backgroundColor,
        backgroundImage: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.12), transparent 60%)",
        transition: "background-color 0.6s ease",
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
        <WakeLockIndicator isActive={isActive} isIOSDevice={isIOSDevice} />

        {/* Right side control */}
        <MuteButton />
      </div>

      {/* Main timer content */}
      <div className="flex-1 flex flex-col justify-center items-center mt-16 mb-32">
        <div className="relative flex flex-col items-center">
          {/* Phase label above the ring */}
          <div className="mb-5 inline-flex items-center rounded-full bg-white/15 px-5 py-1.5 backdrop-blur-sm">
            <span className="text-base font-bold uppercase tracking-[0.2em] text-white">
              {stateText}
            </span>
          </div>

          {/* Timer circle */}
          <div className="relative">
            <CircularProgress value={progressPercentage} timerState={timerState} />

            {/* Time display centered in circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Round info at top of circle */}
              <div className="whitespace-nowrap mb-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white/70">
                    Round {currentRound}/{validRounds}
                  </span>
                  {timerState !== "roundRest" && (
                    <>
                      <span className="text-xs text-white/40 mx-2">•</span>
                      <span className="text-sm font-medium text-white/70">
                        {Math.min(currentExercise, validExercises)}/{validExercises}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-8xl font-bold text-white tabular-nums" data-test="timer-display">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Next up preview */}
          {nextUpLabel && (
            <div className="mt-6 flex items-center gap-2 text-white/75">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Next
              </span>
              <ChevronRight className="h-4 w-4 text-white/50" />
              <span className="text-base font-semibold text-white">{nextUpLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* "Get Ready" full-screen countdown overlay before the first exercise */}
      {isGettingReady && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm">
          <span className="mb-4 text-lg font-semibold uppercase tracking-[0.3em] text-white/80">
            Get Ready
          </span>
          <span key={getReadyCount} className="get-ready-number text-[10rem] font-bold leading-none text-white tabular-nums">
            {getReadyCount}
          </span>
        </div>
      )}

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
