"use client"

import { useState } from "react"
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
        bgColor: "bg-purple-100 hover:bg-purple-200",
        textColor: "text-purple-600"
      }
    } else if (title.toLowerCase().includes("rounds")) {
      return {
        bgColor: "bg-orange-100 hover:bg-orange-200",
        textColor: "text-orange-600"
      }
    } else {
      return {
        bgColor: "bg-indigo-100 hover:bg-indigo-200",
        textColor: "text-indigo-600"
      }
    }
  }

  const { bgColor, textColor } = getButtonColor()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9 hover:bg-gray-100">
            <X className="h-5 w-5" />
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
              className={`h-20 w-20 rounded-full ${bgColor} border-none shadow-sm`}
            >
              <Minus className={`h-8 w-8 ${textColor}`} />
              <span className="sr-only">Decrease</span>
            </Button>

            <span className="text-7xl font-bold tabular-nums">{count}</span>

            <Button
              variant="outline"
              size="icon"
              onClick={increment}
              disabled={count >= max}
              className={`h-20 w-20 rounded-full ${bgColor} border-none shadow-sm`}
            >
              <Plus className={`h-8 w-8 ${textColor}`} />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
          <Button variant="outline" onClick={onClose} className="py-6 text-lg font-medium rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="py-6 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

