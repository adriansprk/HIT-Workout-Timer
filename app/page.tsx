"use client"

import { useState, useEffect } from "react"
import { Settings, Timer, Dumbbell, RotateCcw, Clock, RefreshCw, Play, Pencil } from "lucide-react"
import { Button } from "../components/ui/button"
import WorkoutTimer from "../components/workout-timer"
import EditSliderModal from "../components/edit-slider-modal"
import EditCounterModal from "../components/edit-counter-modal"
import SettingsModal from "../components/settings-modal"
import { loadWorkoutParams, updateWorkoutParams } from "../lib/settings"
import { forceUnlockAudio } from "../lib/audio"
import { formatTime } from "../lib/utils"
import { calculateWorkoutDuration } from "../lib/workout-time"

export default function Home() {
  // Initialize state with default values
  const [exerciseTime, setExerciseTime] = useState(45)
  const [restTime, setRestTime] = useState(15)
  const [roundRestTime, setRoundRestTime] = useState(60)
  const [exercises, setExercises] = useState(4)
  const [rounds, setRounds] = useState(3)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  // Load saved workout params from localStorage on component mount
  useEffect(() => {
    const savedParams = loadWorkoutParams()
    setExerciseTime(savedParams.exerciseTime)
    setRestTime(savedParams.restTime)
    setRoundRestTime(savedParams.roundRestTime)
    setExercises(savedParams.exercises)
    setRounds(savedParams.rounds)
  }, [])

  // Create wrapper functions to update both state and localStorage
  const updateExerciseTime = (value: number) => {
    setExerciseTime(value)
    updateWorkoutParams({ exerciseTime: value })
  }

  const updateRestTime = (value: number) => {
    setRestTime(value)
    updateWorkoutParams({ restTime: value })
  }

  const updateRoundRestTime = (value: number) => {
    setRoundRestTime(value)
    updateWorkoutParams({ roundRestTime: value })
  }

  const updateExercises = (value: number) => {
    setExercises(value)
    updateWorkoutParams({ exercises: value })
  }

  const updateRounds = (value: number) => {
    setRounds(value)
    updateWorkoutParams({ rounds: value })
  }

  const totalTimeInSeconds = calculateWorkoutDuration({
    exerciseTime,
    restTime,
    roundRestTime,
    exercises,
    rounds,
  })

  const startWorkout = async () => {
    // Unlock audio first to ensure sounds work throughout the workout
    await forceUnlockAudio();
    setIsWorkoutActive(true);
  }

  const endWorkout = () => {
    setIsWorkoutActive(false)
  }

  const openModal = (modalName: string) => {
    setCurrentModal(modalName)
  }

  const closeModal = () => {
    setCurrentModal(null)
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  return (
    <main className="container-screen bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/70 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-gray-950">
      {isWorkoutActive ? (
        <WorkoutTimer
          exerciseTime={exerciseTime}
          restTime={restTime}
          roundRestTime={roundRestTime}
          exercises={exercises}
          rounds={rounds}
          onEnd={endWorkout}
        />
      ) : (
        <div className="container-main">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-title">Your Workout Timer</h1>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={openSettings} aria-label="Settings">
              <Settings className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>

          <div className="card mb-8">
            <div className="space-y-4">
              <div className="card-item">
                <div className="flex items-center gap-3">
                  <div className="icon-container bg-green-100">
                    <Timer className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-label">Exercise Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label">{exerciseTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="btn-icon"
                    onClick={() => openModal("exerciseTime")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="card-item">
                <div className="flex items-center gap-3">
                  <div className="icon-container bg-blue-100">
                    <Timer className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-label">Rest Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label">{restTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="btn-icon"
                    onClick={() => openModal("restTime")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="card-item">
                <div className="flex items-center gap-3">
                  <div className="icon-container bg-purple-100">
                    <Dumbbell className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-label">Exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label">{exercises}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="btn-icon"
                    onClick={() => openModal("exercises")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="card-item">
                <div className="flex items-center gap-3">
                  <div className="icon-container bg-orange-100">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-label">Rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label">{rounds}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="btn-icon"
                    onClick={() => openModal("rounds")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="card-item">
                <div className="flex items-center gap-3">
                  <div className="icon-container bg-teal-100">
                    <RefreshCw className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="text-label">Round Rest Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label">{roundRestTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="btn-icon"
                    onClick={() => openModal("roundRestTime")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center flex items-center justify-center py-2">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-1.5">Total Workout Time:</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300">{formatTime(totalTimeInSeconds)}</span>
            </div>

            <Button
              className="w-full py-6 text-lg btn-primary mt-4"
              size="lg"
              onClick={startWorkout}
            >
              <Play className="h-5 w-5 mr-2 fill-current" />
              Start Workout
            </Button>
          </div>
        </div>
      )}

      {currentModal === "exerciseTime" && (
        <EditSliderModal
          title="Edit Exercise Time"
          value={exerciseTime}
          onChange={updateExerciseTime}
          onClose={closeModal}
          min={1}
          max={120}
          step={1}
          snapPoints={[15, 30, 45, 60, 90]}
          unit="seconds"
          type="exercise"
        />
      )}

      {currentModal === "restTime" && (
        <EditSliderModal
          title="Edit Rest Time"
          value={restTime}
          onChange={updateRestTime}
          onClose={closeModal}
          min={0}
          max={60}
          step={1}
          snapPoints={[15, 30, 45]}
          unit="seconds"
          type="rest"
        />
      )}

      {currentModal === "roundRestTime" && (
        <EditSliderModal
          title="Edit Round Rest Time"
          value={roundRestTime}
          onChange={updateRoundRestTime}
          onClose={closeModal}
          min={0}
          max={120}
          step={1}
          snapPoints={[30, 60, 90]}
          unit="seconds"
          type="roundRest"
        />
      )}

      {currentModal === "exercises" && (
        <EditCounterModal
          title="Exercises"
          value={exercises}
          onChange={updateExercises}
          onClose={closeModal}
          min={1}
          max={20}
        />
      )}

      {currentModal === "rounds" && (
        <EditCounterModal
          title="Edit Rounds"
          value={rounds}
          onChange={updateRounds}
          onClose={closeModal}
          min={1}
          max={10}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={closeSettings} />
      )}
    </main>
  )
}
