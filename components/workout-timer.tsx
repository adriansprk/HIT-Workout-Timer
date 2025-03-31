"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { X } from "lucide-react"
import { useAudio } from "../contexts/AudioContext"
import { MuteButton } from "./MuteButton"

// Custom progress component with explicit indigo indicator color
const CustomProgress = ({ value }: { value: number }) => {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

interface WorkoutTimerProps {
  exerciseTime: number
  restTime: number
  roundRestTime: number // New prop for round rest time
  exercises: number
  rounds: number
  onEnd: () => void
}

type TimerState = "exercise" | "rest" | "roundRest" | "complete" // Changed 'cooldown' to 'roundRest'

export default function WorkoutTimer({
  exerciseTime,
  restTime,
  roundRestTime, // Add the new prop
  exercises,
  rounds,
  onEnd,
}: WorkoutTimerProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(1)
  const [timerState, setTimerState] = useState<TimerState>("exercise")
  const [timeRemaining, setTimeRemaining] = useState(exerciseTime)
  const [isPaused, setIsPaused] = useState(false)
  const { playCountdownSound } = useAudio()

  // Track the previous timer state to detect transitions
  const [prevTimerState, setPrevTimerState] = useState<TimerState>(timerState)

  const getTimerColor = () => {
    return "bg-indigo-500"
  }

  const getTimerLabel = () => {
    switch (timerState) {
      case "exercise":
        return "Exercise"
      case "rest":
        return "Rest"
      case "roundRest":
        return "Round Rest" // Changed label from 'Cooldown' to 'Round Rest'
      default:
        return "Complete"
    }
  }

  const getMaxTime = () => {
    switch (timerState) {
      case "exercise":
        return exerciseTime
      case "rest":
        return restTime
      case "roundRest":
        return roundRestTime // Use the new roundRestTime instead of fixed 60
      default:
        return 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = (timeRemaining / getMaxTime()) * 100

  const moveToNextPhase = useCallback(() => {
    if (timerState === "exercise") {
      // If we're at the last exercise of the round
      if (currentExercise === exercises) {
        // If we're at the last round, end the workout
        if (currentRound === rounds) {
          setTimerState("complete")
          return
        }
        // Otherwise, move to round rest between rounds
        setTimerState("roundRest")
        setTimeRemaining(roundRestTime) // Use roundRestTime instead of fixed 60
        setCurrentRound((prev) => prev + 1)
        setCurrentExercise(1)
      } else {
        // Move to rest period
        setTimerState("rest")
        setTimeRemaining(restTime)
      }
    } else if (timerState === "rest") {
      // Move to next exercise
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
      setCurrentExercise((prev) => prev + 1)
    } else if (timerState === "roundRest") {
      // Move to first exercise of next round
      setTimerState("exercise")
      setTimeRemaining(exerciseTime)
    }
  }, [timerState, currentExercise, currentRound, exercises, rounds, restTime, exerciseTime, roundRestTime])

  useEffect(() => {
    if (timerState === "complete") return
    if (isPaused) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          moveToNextPhase()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerState, isPaused, moveToNextPhase])

  // Track timer state changes
  useEffect(() => {
    if (prevTimerState !== timerState) {
      setPrevTimerState(timerState);
    }
  }, [timerState, prevTimerState]);

  // Audio countdown effect for both exercise and rest periods
  useEffect(() => {
    if (isPaused) return;

    // Handle the 3,2,1 countdown for any timer state
    if (timeRemaining <= 3 && timeRemaining > 0) {
      if (timeRemaining === 3) playCountdownSound('three');
      else if (timeRemaining === 2) playCountdownSound('two');
      else if (timeRemaining === 1) playCountdownSound('one');
    }
  }, [timeRemaining, isPaused, playCountdownSound]);

  // Play transition sounds between states
  useEffect(() => {
    if (isPaused) return;

    // Play sounds on state transitions
    if (prevTimerState !== timerState) {
      console.log(`Transition: ${prevTimerState} -> ${timerState}`);

      // Play 'rest' when transitioning to rest periods
      if (timerState === "rest" || timerState === "roundRest") {
        playCountdownSound('rest');
      }

      // Play 'go' when transitioning to exercise (but not at very beginning)
      if (timerState === "exercise" && (prevTimerState === "rest" || prevTimerState === "roundRest")) {
        playCountdownSound('go');
      }
    }
  }, [timerState, prevTimerState, isPaused, playCountdownSound]);

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">HIIT Workout</h1>
          <Button variant="ghost" size="icon" onClick={onEnd}>
            <X className="h-6 w-6" />
            <span className="sr-only">Exit workout</span>
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getTimerColor()}`}></div>
              <span className="font-medium">{getTimerLabel()}</span>
            </div>
            <span className="text-sm text-gray-500">
              Round {currentRound}/{rounds} • Exercise {currentExercise}/{exercises}
            </span>
          </div>

          <div className="text-center my-12 relative">
            <div className="flex items-center justify-center">
              <span className="text-7xl font-bold tabular-nums">{formatTime(timeRemaining)}</span>
              <div className="ml-3">
                <MuteButton />
              </div>
            </div>
          </div>

          <CustomProgress value={progressPercentage} />
        </div>

        <div className="flex gap-4 items-center">
          <Button variant="outline" className="flex-1 py-6" onClick={togglePause}>
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700" onClick={onEnd}>
            End Workout
          </Button>
        </div>
      </div>
    </div>
  )
}

