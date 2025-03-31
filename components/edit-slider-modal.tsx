"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface EditSliderModalProps {
  title: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
  min?: number
  max: number
  step?: number
  snapPoints: number[]
  unit: string
  type?: "exercise" | "rest" | "roundRest" // Type prop still used for label text only
}

export default function EditSliderModal({
  title,
  value,
  onChange,
  onClose,
  min = 0,
  max,
  step = 1,
  snapPoints,
  unit,
  type = "exercise", // Default to exercise type
}: EditSliderModalProps) {
  const [sliderValue, setSliderValue] = useState(value)
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const sliderAreaRef = useRef<HTMLDivElement>(null)
  const snapThreshold = 2 // +/- 2 seconds snap threshold

  // Check if the current value is snapped to any snap point
  useEffect(() => {
    let isSnapped = false
    let closestPoint = null
    let minDistance = Number.POSITIVE_INFINITY

    // Find the closest snap point and check if we're within threshold
    snapPoints.forEach((point) => {
      const distance = Math.abs(sliderValue - point)
      if (distance <= snapThreshold && distance < minDistance) {
        isSnapped = true
        closestPoint = point
        minDistance = distance
      }
    })

    if (isSnapped && closestPoint !== null) {
      setActiveSnapPoint(closestPoint)
      // Snap the slider value to the closest point
      setSliderValue(closestPoint)
    } else {
      setActiveSnapPoint(null)
    }
  }, [sliderValue, snapPoints, snapThreshold])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    // Save original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';

    // Restore original body style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSliderChange = (newValue: number[]) => {
    setSliderValue(newValue[0])
  }

  const handleSave = () => {
    onChange(sliderValue)
    onClose()
  }

  // Get the label text based on type
  const getLabelText = () => {
    switch (type) {
      case "exercise":
        return "Exercise Time"
      case "rest":
        return "Rest Time"
      case "roundRest":
        return "Round Rest Time"
      default:
        return "Duration"
    }
  }

  // Prevent default touch move behavior when dragging
  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Prevent page scrolling when dragging the slider
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault()
      }
    }

    if (sliderAreaRef.current) {
      sliderAreaRef.current.addEventListener('touchmove', preventScroll, { passive: false })
    }

    return () => {
      if (sliderAreaRef.current) {
        sliderAreaRef.current.removeEventListener('touchmove', preventScroll)
      }
    }
  }, [isDragging])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="py-16 px-10">
          {/* Simplified description label - plain text in black */}
          <div className="mb-8">
            <span className="font-medium text-gray-900 dark:text-white text-2xl">{getLabelText()}</span>
          </div>

          {/* Custom slider implementation with cleaner layering */}
          <div
            ref={sliderAreaRef}
            className="relative h-12 mb-20"
            style={{ touchAction: "pan-x" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Base track */}
            <div className="absolute top-5 h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full"></div>

            {/* Filled track */}
            <div
              className="absolute top-5 h-2 rounded-l-full bg-indigo-600 dark:bg-indigo-600"
              style={{
                width: `${((sliderValue - min) / (max - min)) * 100}%`,
                maxWidth: "100%",
              }}
            ></div>

            {/* Snap markers */}
            {snapPoints.map((point) => {
              const position = ((point - min) / (max - min)) * 100
              const isActive = activeSnapPoint === point
              const isPassed = sliderValue >= point

              return (
                <div
                  key={point}
                  className={`absolute top-3 h-6 w-0.5 transition-colors duration-150 ${isActive || isPassed ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  style={{ left: `${position}%` }}
                ></div>
              )
            })}

            {/* Slider handle */}
            <div
              className="absolute top-3 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-md transform -translate-x-1/2 transition-colors duration-150 bg-indigo-600 dark:bg-indigo-500"
              style={{
                left: `${((sliderValue - min) / (max - min)) * 100}%`,
              }}
            ></div>

            {/* Invisible slider for interaction */}
            <Slider
              value={[sliderValue]}
              min={min}
              max={max}
              step={step}
              onValueChange={handleSliderChange}
              className="absolute inset-0 opacity-0 cursor-pointer [&>.SliderTrack]:dark:bg-gray-600 [&>.SliderRange]:dark:bg-indigo-500 [&>.SliderThumb]:dark:border-indigo-400 [&>.SliderThumb]:focus-visible:ring-indigo-400"
            />
          </div>

          <div className="text-center">
            <span className="text-7xl font-bold tabular-nums text-gray-900 dark:text-white">{sliderValue}</span>
            <span className="text-3xl font-medium text-gray-500 dark:text-gray-400 ml-2">s</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="py-6 text-lg font-medium rounded-xl border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900">
            Cancel
          </Button>
          <Button onClick={handleSave} className="py-6 text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:ring-2 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

