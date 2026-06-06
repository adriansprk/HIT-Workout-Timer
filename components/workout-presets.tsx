"use client"

import { Zap } from "lucide-react"
import { WORKOUT_PRESETS } from "../lib/presets"
import type { WorkoutParams } from "../lib/settings"

interface WorkoutPresetsProps {
    activePresetId: string | null
    onSelect: (params: WorkoutParams) => void
}

export default function WorkoutPresets({ activePresetId, onSelect }: WorkoutPresetsProps) {
    return (
        <section className="mb-6" aria-label="Quick start workout presets">
            <div className="flex items-center gap-1.5 mb-3 px-1">
                <Zap className="h-4 w-4 text-primary dark:text-primary-dark" />
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Quick Start</h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {WORKOUT_PRESETS.map((preset) => {
                    const isActive = preset.id === activePresetId
                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onSelect(preset.params)}
                            aria-pressed={isActive}
                            className={[
                                "snap-start shrink-0 min-w-[8.5rem] text-left rounded-2xl px-4 py-3 border transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark",
                                isActive
                                    ? "bg-primary text-white border-primary shadow-lg dark:bg-primary-dark dark:border-primary-dark"
                                    : "bg-white text-gray-900 border-gray-100 shadow-md hover:shadow-lg dark:bg-slate-700 dark:text-white dark:border-slate-600",
                            ].join(" ")}
                        >
                            <span className="block font-bold text-base leading-tight">{preset.name}</span>
                            <span
                                className={[
                                    "block text-xs mt-1 leading-snug",
                                    isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400",
                                ].join(" ")}
                            >
                                {preset.description}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
