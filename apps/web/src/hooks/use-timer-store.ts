import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { TimeEntry } from "@/lib/time-entries/types"

type TimerState = {
  isRunning: boolean
  startedAt: number | null
  manualStartTime: number | null
  description: string
  projectId: string | null
  tags: Array<string>
  isBillable: boolean

  startTimer: () => void
  stopTimer: () => Omit<TimeEntry, "id"> | null
  startManual: () => Omit<TimeEntry, "id"> | null
  reset: () => void
  setStartedAt: (ts: number) => void
  setManualStartTime: (ts: number | null) => void
  setDescription: (v: string) => void
  setProjectId: (v: string | null) => void
  setTags: (v: Array<string>) => void
  toggleBillable: () => void
  toggleTag: (tagId: string) => void
  prefill: (
    values: Pick<TimeEntry, "description" | "projectId" | "tags" | "isBillable">
  ) => void
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
      isBillable: false,

      startTimer: () => {
        if (get().isRunning) return
        set({ isRunning: true, startedAt: Date.now(), manualStartTime: null })
      },

      stopTimer: () => {
        const {
          isRunning,
          startedAt,
          description,
          projectId,
          tags,
          isBillable,
        } = get()
        if (!isRunning || startedAt === null) return null
        const endTime = Date.now()
        set({ isRunning: false, startedAt: null })
        return {
          description,
          projectId,
          tags,
          isBillable,
          startTime: startedAt,
          endTime,
          isOvertime: false,
        }
      },

      startManual: () => {
        const { description, projectId, tags, isBillable, manualStartTime } =
          get()
        if (manualStartTime === null) return null
        const endTime = Date.now()
        if (manualStartTime >= endTime) return null
        return {
          description,
          projectId,
          tags,
          isBillable,
          startTime: manualStartTime,
          endTime,
          isOvertime: false,
        }
      },

      reset: () =>
        set({
          description: "",
          projectId: null,
          tags: [],
          isBillable: false,
          manualStartTime: null,
        }),

      setStartedAt: (ts) => set({ startedAt: ts }),
      setManualStartTime: (ts) => set({ manualStartTime: ts }),
      setDescription: (v) => set({ description: v }),
      setProjectId: (v) => set({ projectId: v }),
      setTags: (v) => set({ tags: v }),
      toggleBillable: () => set((s) => ({ isBillable: !s.isBillable })),
      toggleTag: (tagId) =>
        set((s) => ({
          tags: s.tags.includes(tagId)
            ? s.tags.filter((id) => id !== tagId)
            : [...s.tags, tagId],
        })),

      prefill: (values) =>
        set({
          description: values.description,
          projectId: values.projectId,
          tags: values.tags,
          isBillable: values.isBillable,
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
        isBillable: s.isBillable,
      }),
    }
  )
)
