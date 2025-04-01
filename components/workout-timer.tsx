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
        return "#22C55E"; // green-500 - was previously red-500
      case "rest":
        return "#F59E0B"; // amber-500 - was previously green-500
      case "roundRest":
        return "#3B82F6"; // blue-500 - unchanged
      default:
        return "#818CF8"; // indigo-400 - unchanged
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

  // Wake lock hook to prevent screen from sleeping
  const { isActive, request, release } = useWakeLock();

  // Auto-request wake lock when component mounts
  useEffect(() => {
    // Try to request wake lock when timer starts
    const enableWakeLock = async () => {
      try {
        await request();
        console.log('Wake lock automatically requested');
      } catch (err) {
        console.warn('Could not automatically request wake lock:', err);
      }
    };

    enableWakeLock();

    // Release wake lock when component unmounts
    return () => {
      release();
    };
  }, [request, release]);

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

      // Calculate the halfway point of exercise (only during exercise state)
      const isHalfwayPoint = timerRef.current.timerState === "exercise" &&
        currentTime === Math.floor(exerciseTime / 2);

      // Check if this is the last exercise of a round
      const isLastExerciseOfRound = timerRef.current.timerState === "exercise" &&
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

        <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm mt-4 mb-4">
          {/* Header with trophy icon */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Complete!</h1>
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
              Amazing work! You've crushed your HIIT workout.
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
              "{motivationalQuote}"
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onEnd}
            className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
          >
            <span>New Workout</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Get state indicator styles
  const getStateIndicator = () => {
    switch (timerState) {
      case "exercise":
        return {
          text: "EXERCISE",
          bg: "bg-green-600",
          textColor: "text-white",
        }
      case "rest":
        return {
          text: "REST",
          bg: "bg-amber-500",
          textColor: "text-white",
        }
      case "roundRest":
        return {
          text: "RECOVERY",
          bg: "bg-blue-600",
          textColor: "text-white",
        }
      default:
        return {
          text: "READY",
          bg: "bg-gray-600",
          textColor: "text-white",
        }
    }
  }

  const stateIndicator = getStateIndicator();

  return (
    <div
      ref={timerContainerRef}
      className="mx-auto fixed inset-0 flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 dark:bg-slate-950 overflow-hidden"
      style={{
        height: '100dvh',
        width: '100%',
      }}
    >
      {/* Exit button - positioned at top corner */}
      <div className="fixed top-4 left-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEnd}
          aria-label="End workout"
          className="h-12 w-12 rounded-full bg-gray-900/90 hover:bg-gray-800 p-0 flex items-center justify-center border border-gray-800"
        >
          <X className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Wake Lock indicator - centered at top */}
      <div className="fixed top-4 left-0 right-0 z-20 flex justify-center">
        <WakeLockIndicator className="mx-auto" />
      </div>

      {/* Mute button - positioned at top right corner, aligned with circle */}
      <div className="fixed top-4 right-4 z-20">
        <MuteButton />
      </div>

      {/* Main timer section - takes most of the screen */}
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

              <div className="text-8xl font-bold text-white">
                {formatTime(timeRemaining)}
              </div>

              {/* Status badge overlaid on timer */}
              <div className={`px-4 py-1 rounded-full ${stateIndicator.bg} ${stateIndicator.textColor} font-semibold text-sm mt-4`}>
                {stateIndicator.text}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons - positioned at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/80">
        <div className="flex justify-center items-center gap-3 px-4 mb-6">
          {/* Skip backward button */}
          <button
            className="rounded-xl bg-gray-800 w-14 h-14 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-slate-950 transition-colors hover:bg-gray-700 border border-gray-700"
            onClick={() => {
              // Skip to previous exercise logic would go here
              alert("Skip to previous exercise not implemented");
            }}
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
            className="rounded-full bg-gray-800 border border-gray-700 px-8 py-4 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-slate-950 transition-colors hover:bg-gray-700 shadow-md"
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
            className="rounded-xl bg-gray-800 w-14 h-14 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-slate-950 transition-colors hover:bg-gray-700 border border-gray-700"
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

