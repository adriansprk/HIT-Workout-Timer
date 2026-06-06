"use client"

import { useState, useEffect } from "react"
import { Settings, Timer, Dumbbell, RotateCcw, Clock, RefreshCw, Play } from "lucide-react"
import { Button } from "../components/ui/button"
import WorkoutTimer from "../components/workout-timer"
import SettingStepper from "../components/setting-stepper"
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

          <div className="card mb-8 p-2 sm:p-3">
            <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
              <SettingStepper
                icon={<Timer className="h-5 w-5 text-green-600 dark:text-green-400" />}
                iconClassName="bg-green-100 dark:bg-green-500/15"
                label="Exercise Time"
                value={exerciseTime}
                unit="seconds"
                min={1}
                max={120}
                onChange={updateExerciseTime}
                onEdit={() => openModal("exerciseTime")}
              />

              <SettingStepper
                icon={<Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                iconClassName="bg-blue-100 dark:bg-blue-500/15"
                label="Rest Time"
                value={restTime}
                unit="seconds"
                min={0}
                max={60}
                onChange={updateRestTime}
                onEdit={() => openModal("restTime")}
              />

              <SettingStepper
                icon={<Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                iconClassName="bg-indigo-100 dark:bg-indigo-500/15"
                label="Exercises"
                value={exercises}
                min={1}
                max={20}
                onChange={updateExercises}
                onEdit={() => openModal("exercises")}
              />

              <SettingStepper
                icon={<RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                iconClassName="bg-orange-100 dark:bg-orange-500/15"
                label="Rounds"
                value={rounds}
                min={1}
                max={10}
                onChange={updateRounds}
                onEdit={() => openModal("rounds")}
              />

              <SettingStepper
                icon={<RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
                iconClassName="bg-teal-100 dark:bg-teal-500/15"
                label="Round Rest Time"
                value={roundRestTime}
                unit="seconds"
                min={0}
                max={120}
                onChange={updateRoundRestTime}
                onEdit={() => openModal("roundRestTime")}
              />
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
