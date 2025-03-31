"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface EditDurationModalProps {
  title: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
  min?: number
  max?: number
}

export default function EditDurationModal({
  title,
  value,
  onChange,
  onClose,
  min = 1,
  max = 100,
}: EditDurationModalProps) {
  const [inputValue, setInputValue] = useState(value)

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
    const newValue = Math.max(min, Math.min(max, inputValue))
    onChange(newValue)
    onClose()
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
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number.parseInt(e.target.value) || 0)}
            min={min}
            max={max}
            className="text-center text-xl py-6"
          />
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

