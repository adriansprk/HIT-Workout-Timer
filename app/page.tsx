"use client"

import { useState, useEffect } from "react"
import { Settings, Timer, Dumbbell, RotateCcw, Clock, RefreshCw } from "lucide-react"
import { Button } from "../components/ui/button"
import WorkoutTimer from "../components/workout-timer"
import EditSliderModal from "../components/edit-slider-modal"
import EditCounterModal from "../components/edit-counter-modal"
import SettingsModal from "../components/settings-modal"
import { loadWorkoutParams, updateWorkoutParams } from "../lib/settings"
import { forceUnlockAudio } from "../lib/audio"
import { useTheme } from "../contexts/ThemeContext"
import Link from "next/link"

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
  const { isDarkMode, toggleDarkMode } = useTheme()

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

  // Calculate total workout time in seconds
  const calculateTotalTime = () => {
    const exerciseAndRestTime = (exerciseTime + restTime) * exercises * rounds
    const cooldownTime = roundRestTime * (rounds - 1)
    return exerciseAndRestTime + cooldownTime
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const totalTimeInSeconds = calculateTotalTime()

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
    <main className="min-h-screen bg-white dark:bg-gray-900">
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
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HIIT Workout</h1>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={openSettings}>
              <Settings className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Workout Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Timer className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Exercise Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{exerciseTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    onClick={() => openModal("exerciseTime")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Timer className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Rest Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{restTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    onClick={() => openModal("restTime")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{exercises}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    onClick={() => openModal("exercises")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{rounds}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    onClick={() => openModal("rounds")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Round Rest Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{roundRestTime}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    onClick={() => openModal("roundRestTime")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 mb-4 text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">Total Workout Time:</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatTime(totalTimeInSeconds)}</span>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <Button
              className="w-full py-6 text-xl font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl text-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900 transition-colors"
              onClick={startWorkout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
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
          min={0}
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

