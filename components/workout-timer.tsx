"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../lib/utils';
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { X } from "lucide-react"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"

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

type TimerState = "exercise" | "rest" | "roundRest" | "complete" // Changed 'cooldown' to 'roundRest'

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  exerciseTime,
  restTime,
  roundRestTime,
  exercises,
  rounds,
  onEnd,
}) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(1)
  const [timerState, setTimerState] = useState<TimerState>("exercise")
  const [timeRemaining, setTimeRemaining] = useState(exerciseTime)
  const [isPaused, setIsPaused] = useState(false)
  const { playCountdownSound, isMuted } = useAudio()

  // Track the previous timer state to detect transitions
  const [prevTimerState, setPrevTimerState] = useState<TimerState | null>(null)
  // Keep track of already played sounds to avoid duplicates
  const playedSoundsRef = useRef(new Set<string>());

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
      if (currentExercise === exercises) {
        // If we're at the last round, complete the workout
        if (currentRound === rounds) {
          setTimerState("complete")
          return
        }
        // Otherwise move to round rest
        setTimerState("roundRest")
        setTimeRemaining(roundRestTime)
        setCurrentRound((prev) => prev + 1)
        setCurrentExercise(1)
        playCountdownSound('rest');
      } else {
        // Move to rest period
        setTimerState("rest")
        setTimeRemaining(restTime)
        playCountdownSound('rest');
      }
    } else if (timerState === "rest") {
      // Move to next exercise
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      setCurrentExercise((prev) => prev + 1)
      playCountdownSound('go');
    } else if (timerState === "roundRest") {
      // Move to first exercise of next round
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      playCountdownSound('go');
    }
  }, [timerState, currentExercise, currentRound, exercises, rounds, restTime, exerciseTime, roundRestTime, playCountdownSound])

  useEffect(() => {
    if (timerState === "complete" || isPaused) return

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        // Play countdown sounds (3,2,1) immediately when we reach these values
        // rather than waiting until after decrementing the counter
        if (prev <= 3 && prev > 0) {
          const countdownSound = prev === 3 ? 'three' : prev === 2 ? 'two' : 'one';
          const soundKey = `${timerState}-${countdownSound}-${currentRound}-${currentExercise}`;

          // Only play the sound if we haven't played it for this specific countdown instance
          if (!playedSoundsRef.current.has(soundKey)) {
            playedSoundsRef.current.add(soundKey);
            // Play the sound immediately before reducing the timer
            playCountdownSound(countdownSound);
            console.log(`Playing ${countdownSound} at time ${prev}`);
          }
        }

        if (prev <= 1) {
          clearInterval(intervalId)
          moveToNextPhase()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timerState, isPaused, moveToNextPhase, playCountdownSound, currentRound, currentExercise])

  // Clear played sounds when starting a new interval
  useEffect(() => {
    playedSoundsRef.current.clear();
  }, [timerState, currentExercise, currentRound]);

  // Play sounds on state transitions
  useEffect(() => {
    if (prevTimerState !== timerState) {
      console.log(`Timer state changed from ${prevTimerState} to ${timerState}`);
    }
  }, [timerState, prevTimerState, isPaused, playCountdownSound]);

  // When the workout is complete
  useEffect(() => {
    if (timerState === "complete") {
      onEnd();
    }
  }, [timerState, onEnd]);

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  if (timerState === "complete") {
    return (
      <div className="mx-auto p-6 max-w-md">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Workout Complete!</h1>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={onEnd}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center">
            <p className="mb-4">
              You've completed {rounds} rounds of {exercises} exercises. Great work!
            </p>
            <Button onClick={onEnd} className="w-full">
              Return to Setup
            </Button>
          </div>
        </div>
      </div>
    )
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
                : "Round Rest"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Round</div>
            <div className="text-xl font-semibold">
              {currentRound} / {rounds}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Exercise</div>
            <div className="text-xl font-semibold">
              {currentExercise} / {exercises}
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

