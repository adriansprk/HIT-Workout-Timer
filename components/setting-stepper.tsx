"use client"

import type { ReactNode } from "react"
import { Minus, Plus } from "lucide-react"

interface SettingStepperProps {
    icon: ReactNode
    iconClassName: string
    label: string
    value: number
    unit?: string
    min: number
    max: number
    step?: number
    onChange: (value: number) => void
    onEdit: () => void
}

export default function SettingStepper({
    icon,
    iconClassName,
    label,
    value,
    unit,
    min,
    max,
    step = 1,
    onChange,
    onEdit,
}: SettingStepperProps) {
    const decrement = () => onChange(Math.max(min, value - step))
    const increment = () => onChange(Math.min(max, value + step))

    const atMin = value <= min
    const atMax = value >= max

    return (
        <div className="card-item">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`icon-container ${iconClassName}`}>{icon}</div>
                <span className="text-label truncate">{label}</span>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={decrement}
                    disabled={atMin}
                    aria-label={`Decrease ${label}`}
                    className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 dark:focus:ring-primary-dark"
                >
                    <Minus className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={onEdit}
                    aria-label={`Edit ${label} precisely. Current value ${value}${unit ? " " + unit : ""}`}
                    className="min-w-[3.25rem] px-1 py-1 rounded-lg text-center tabular-nums font-bold text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:hover:bg-slate-600 dark:focus:ring-primary-dark"
                >
                    {value}
                    {unit === "seconds" ? <span className="text-sm font-medium text-gray-500 dark:text-gray-400">s</span> : null}
                </button>

                <button
                    type="button"
                    onClick={increment}
                    disabled={atMax}
                    aria-label={`Increase ${label}`}
                    className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 dark:focus:ring-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
