import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { Project, Tag, TimeEntry } from "@/lib/time-entries/types"

type EntriesState = {
  entries: Array<TimeEntry>
  projects: Array<Project>
  tags: Array<Tag>

  addEntry: (entry: TimeEntry) => void
  updateEntry: (id: string, patch: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  duplicateEntry: (id: string) => void
  toggleEntryTag: (entryId: string, tagId: string) => void
  addProject: (project: Project) => void
  addTag: (tag: Tag) => void
}

const SEED_PROJECTS: Array<Project> = [
  { id: "p1", name: "Northwind Portal", clientName: "Northwind Co.", color: "#5B5CE2" },
  { id: "p2", name: "Helix Mobile App", clientName: "Helix Health", color: "#2F9D6A" },
  { id: "p3", name: "Brand Refresh 2026", color: "#D93B7B" },
  { id: "p4", name: "Internal Tools", color: "#D97920" },
  { id: "p5", name: "Kodiak Analytics", clientName: "Kodiak Capital", color: "#2D8DCC" },
  { id: "p6", name: "Meridian Onboarding", clientName: "Meridian Bank", color: "#7C4DDE" },
  { id: "p7", name: "Atlas Dashboard", clientName: "Atlas Logistics", color: "#2C94AF" },
  { id: "p8", name: "Vega CMS", clientName: "Vega Media", color: "#2EA44F" },
  { id: "p9", name: "Polaris Checkout", clientName: "Polaris Retail", color: "#D93254" },
]

const SEED_TAGS: Array<Tag> = [
  { id: "t1", name: "overtime", color: "#E39B31" },
  { id: "t2", name: "meeting", color: "#7669E8" },
  { id: "t3", name: "development", color: "#46B980" },
  { id: "t4", name: "design", color: "#D94F91" },
  { id: "t5", name: "review", color: "#E5922F" },
  { id: "t6", name: "research", color: "#845AE1" },
  { id: "t7", name: "ops", color: "#64748B" },
  { id: "t8", name: "admin", color: "#3E9BDC" },
]

export const useEntriesStore = create<EntriesState>()(
  persist(
    (set, get) => ({
      entries: [],
      projects: SEED_PROJECTS,
      tags: SEED_TAGS,

      addEntry: (entry) =>
        set((s) => ({ entries: [entry, ...s.entries] })),

      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      duplicateEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id)
        if (!entry) return
        const now = Date.now()
        const duration = entry.endTime - entry.startTime
        const duplicate: TimeEntry = {
          ...entry,
          id: crypto.randomUUID(),
          startTime: now - duration,
          endTime: now,
        }
        set((s) => ({ entries: [duplicate, ...s.entries] }))
      },

      toggleEntryTag: (entryId, tagId) =>
        set((s) => ({
          entries: s.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: entry.tags.includes(tagId)
                    ? entry.tags.filter((id) => id !== tagId)
                    : [...entry.tags, tagId],
                }
              : entry
          ),
        })),

      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, project] })),

      addTag: (tag) =>
        set((s) => ({ tags: [...s.tags, tag] })),
    }),
    {
      name: "glockify-entries",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
