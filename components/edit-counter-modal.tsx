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
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-10 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-16 my-8">
            <Button
              variant="outline"
              size="icon"
              onClick={decrement}
              disabled={count <= min}
              className={`h-20 w-20 rounded-full ${bgColor} border-none shadow-sm ${count <= min ? 'opacity-50' : ''}`}
            >
              <Minus className={`h-8 w-8 ${textColor}`} />
              <span className="sr-only">Decrease</span>
            </Button>

            <span className="text-7xl font-bold tabular-nums text-gray-900 dark:text-white">{count}</span>

            <Button
              variant="outline"
              size="icon"
              onClick={increment}
              disabled={count >= max}
              className={`h-20 w-20 rounded-full ${bgColor} border-none shadow-sm ${count >= max ? 'opacity-50' : ''}`}
            >
              <Plus className={`h-8 w-8 ${textColor}`} />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="py-6 text-lg font-medium rounded-xl border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="py-6 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 rounded-xl text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

