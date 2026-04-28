import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { TimeEntry } from "@/lib/types/time-entry"

type TimerState = {
  isRunning: boolean
  startedAt: number | null     // epoch ms — set when live timer is running
  manualStartTime: number | null  // epoch ms — set when user picks a manual start time
  description: string
  projectId: string | null
  tags: Array<string>

  startTimer: () => void
  stopTimer: () => Omit<TimeEntry, "id"> | null
  startManual: () => Omit<TimeEntry, "id"> | null
  reset: () => void
  setStartedAt: (ts: number) => void
  setManualStartTime: (ts: number | null) => void
  setDescription: (v: string) => void
  setProjectId: (v: string | null) => void
  setTags: (v: Array<string>) => void
  prefill: (values: Pick<TimeEntry, "description" | "projectId" | "tags">) => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startedAt: null,
      manualStartTime: null,
      description: "",
      projectId: null,
      tags: [],

      startTimer: () => {
        if (get().isRunning) return
        set({ isRunning: true, startedAt: Date.now(), manualStartTime: null })
      },

      stopTimer: () => {
        const { isRunning, startedAt, description, projectId, tags } = get()
        if (!isRunning || startedAt === null) return null
        const endTime = Date.now()
        set({ isRunning: false, startedAt: null })
        return { description, projectId, tags, startTime: startedAt, endTime, isOvertime: false }
      },

      startManual: () => {
        const { description, projectId, tags, manualStartTime } = get()
        if (manualStartTime === null) return null
        const endTime = Date.now()
        if (manualStartTime >= endTime) return null
        return { description, projectId, tags, startTime: manualStartTime, endTime, isOvertime: false }
      },

      reset: () =>
        set({ description: "", projectId: null, tags: [], manualStartTime: null }),

      setStartedAt: (ts) => set({ startedAt: ts }),
      setManualStartTime: (ts) => set({ manualStartTime: ts }),
      setDescription: (v) => set({ description: v }),
      setProjectId: (v) => set({ projectId: v }),
      setTags: (v) => set({ tags: v }),

      prefill: (values) =>
        set({
          description: values.description,
          projectId: values.projectId,
          tags: values.tags,
        }),
    }),
    {
      name: "glockify-timer",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isRunning: s.isRunning,
        startedAt: s.startedAt,
        manualStartTime: s.manualStartTime,
        description: s.description,
        projectId: s.projectId,
        tags: s.tags,
      }),
    }
  )
)
