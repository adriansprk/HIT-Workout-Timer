"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus } from "lucide-react"

interface EditCounterModalProps {
  title: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
  min?: number
  max?: number
}

export default function EditCounterModal({
  title,
  value,
  onChange,
  onClose,
  min = 1,
  max = 20,
}: EditCounterModalProps) {
  const [count, setCount] = useState(value)

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

  const increment = () => {
    if (count < max) {
      setCount((prev) => prev + 1)
    }
  }

  const decrement = () => {
    if (count > min) {
      setCount((prev) => prev - 1)
    }
  }

  const handleSave = () => {
    onChange(count)
    onClose()
  }

  // Determine the color based on the title
  const getButtonColor = () => {
    if (title.toLowerCase().includes("exercises")) {
      return {
        bgColor: "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50",
        textColor: "text-purple-600 dark:text-purple-400"
      }
    } else if (title.toLowerCase().includes("rounds")) {
      return {
        bgColor: "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50",
        textColor: "text-orange-600 dark:text-orange-400"
      }
    } else {
      return {
        bgColor: "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50",
        textColor: "text-indigo-600 dark:text-indigo-400"
      }
    }
  }

  const { bgColor, textColor } = getButtonColor()

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

        <div className="py-20 px-8 flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full mt-6">
            <div>
              <button
                className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                onClick={decrement}
                aria-label="Decrease value"
              >
                <Minus className="h-7 w-7 text-gray-700 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 text-center">
              <span className="text-8xl font-bold text-gray-900 dark:text-white">{count}</span>
            </div>
            <div>
              <button
                className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                onClick={increment}
                aria-label="Increase value"
              >
                <Plus className="h-7 w-7 text-gray-700 dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 border-t dark:border-gray-800">
          <Button
            variant="outline"
            className="py-6 text-lg font-medium rounded-xl border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="py-6 text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

