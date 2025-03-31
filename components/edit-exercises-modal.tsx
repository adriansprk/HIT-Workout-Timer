"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Trash2 } from "lucide-react"

interface EditExercisesModalProps {
  title: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
  min?: number
  max?: number
}

export default function EditExercisesModal({
  title,
  value,
  onChange,
  onClose,
  min = 1,
  max = 20,
}: EditExercisesModalProps) {
  // For a more advanced version, we could store exercise names here
  const [exerciseCount, setExerciseCount] = useState(value)

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

  const handleSave = () => {
    // Ensure value is within bounds
    const newValue = Math.max(min, Math.min(max, exerciseCount))
    onChange(newValue)
    onClose()
  }

  const incrementExercises = () => {
    if (exerciseCount < max) {
      setExerciseCount((prev) => prev + 1)
    }
  }

  const decrementExercises = () => {
    if (exerciseCount > min) {
      setExerciseCount((prev) => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={decrementExercises} disabled={exerciseCount <= min}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove exercise</span>
            </Button>

            <span className="text-xl font-bold">{exerciseCount} Exercises</span>

            <Button variant="outline" size="icon" onClick={incrementExercises} disabled={exerciseCount >= max}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add exercise</span>
            </Button>
          </div>

          {/* In a more advanced version, we could list exercise names here */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-500">Exercise names can be customized in a future version</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          <Button variant="outline" onClick={onClose} className="py-6">
            Cancel
          </Button>
          <Button onClick={handleSave} className="py-6 bg-indigo-600 hover:bg-indigo-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

