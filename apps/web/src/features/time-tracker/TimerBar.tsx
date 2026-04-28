import * as React from "react"
import {
  GlobeIcon,
  PlusIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { useTimerStore } from "@/lib/store/timerStore"
import { useEntriesStore } from "@/lib/store/entriesStore"
import { useElapsedTime } from "@/lib/hooks/useElapsedTime"
import { formatDuration, formatTime, parseTimeToEpoch } from "@/lib/utils/time"

const FALLBACK_TAG_COLORS = [
  "#E39B31",
  "#7669E8",
  "#46B980",
  "#D94F91",
  "#E5922F",
  "#845AE1",
  "#64748B",
  "#3E9BDC",
]

export function TimerBar() {
  const {
    isRunning, startedAt, manualStartTime,
    description, projectId, tags,
    startTimer, stopTimer, startManual, reset,
    setStartedAt, setManualStartTime,
    setDescription, setProjectId, setTags,
  } = useTimerStore()

  const { projects, tags: allTags, addEntry, addProject } = useEntriesStore()


  const elapsed = useElapsedTime(isRunning ? startedAt : manualStartTime)
  const displayDuration = formatDuration(elapsed)


  const [startTimeInput, setStartTimeInput] = React.useState("")
  const [projectPickerOpen, setProjectPickerOpen] = React.useState(false)
  const [projectSearch, setProjectSearch] = React.useState("")
  const [tagSearch, setTagSearch] = React.useState("")

  React.useEffect(() => {
    if (isRunning && startedAt !== null) {
      setStartTimeInput(formatTime(startedAt))
    } else if (manualStartTime !== null) {
      setStartTimeInput(formatTime(manualStartTime))
    } else {
      setStartTimeInput("")
    }
  }, [isRunning, startedAt, manualStartTime])

  function applyStartTime() {
    const ts = parseTimeToEpoch(startTimeInput, Date.now())
    if (ts === null) return
    if (isRunning) {
      setStartedAt(ts)
    } else {
      setManualStartTime(ts)
    }
  }

  function handleStartStop() {
    if (isRunning) {
      const partial = stopTimer()
      if (partial) {
        addEntry({ ...partial, id: crypto.randomUUID() })
        reset()
      }
    } else if (manualStartTime !== null) {
      const partial = startManual()
      if (partial) {
        addEntry({ ...partial, id: crypto.randomUUID() })
        reset()
      }
    } else {
      startTimer()
    }
  }

  function toggleTag(tagId: string) {
    setTags(tags.includes(tagId) ? tags.filter((t) => t !== tagId) : [...tags, tagId])
  }

  function createProject() {
    const name = window.prompt("Project name")
    const trimmed = name?.trim()
    if (!trimmed) return

    const project = {
      id: crypto.randomUUID(),
      name: trimmed,
      color: FALLBACK_TAG_COLORS[projects.length % FALLBACK_TAG_COLORS.length],
    }
    addProject(project)
    setProjectId(project.id)
    setProjectPickerOpen(false)
  }

  const selectedProject = projects.find((p) => p.id === projectId) ?? null
  const hasTagSelection = tags.length > 0
  const filteredProjects = projects.filter((project) => {
    const query = projectSearch.trim().toLowerCase()
    if (!query) return true

    return `${project.name} ${project.clientName ?? ""}`.toLowerCase().includes(query)
  })
  const filteredTags = allTags.filter((tag) => {
    const query = tagSearch.trim().toLowerCase()
    if (!query) return true

    return tag.name.toLowerCase().includes(query)
  })

  return (
    <div
      className={cn(
        "flex min-h-14 items-stretch rounded-xl border border-border bg-card shadow-sm transition-all duration-300",
        isRunning && "border-primary/60 shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_28%,transparent),0_0_28px_color-mix(in_srgb,var(--primary)_22%,transparent)]"
      )}
    >
      {/* Description + project */}
      <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-5">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="min-w-0 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        />
        {/* Project picker */}
        <Popover open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
          <PopoverTrigger
            className={cn(
              "ml-auto flex h-10 min-w-0 max-w-[360px] shrink-0 items-center justify-start gap-2 rounded-md px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[popup-open]:bg-muted",
              selectedProject ? "text-foreground" : "text-primary"
            )}
          >
            {selectedProject ? (
              <>
                <span className="size-2 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                <span className="min-w-0 truncate">{selectedProject.name}</span>
              </>
            ) : (
              <>
                <GlobeIcon className="size-4" />
                <span>Project</span>
              </>
            )}
          </PopoverTrigger>
          <PopoverContent sideOffset={8} className="w-[300px] p-2 shadow-xl">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="h-8 pl-9 text-sm shadow-none"
              />
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto pr-1">
              {selectedProject && (
                <button
                  type="button"
                  onClick={() => {
                    setProjectId(null)
                    setProjectPickerOpen(false)
                  }}
                  className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                >
                  No project
                </button>
              )}
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setProjectId(project.id)
                    setProjectPickerOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                    project.id === projectId && "bg-muted"
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  {project.clientName && (
                    <span className="max-w-24 shrink-0 truncate text-xs text-muted-foreground">
                      {project.clientName}
                    </span>
                  )}
                </button>
              ))}
              {filteredProjects.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No projects found
                </p>
              )}
            </div>
            <div className="-mx-2 mt-2 border-t border-border px-2 pt-2">
              <button
                type="button"
                onClick={createProject}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-primary hover:bg-muted"
              >
                <PlusIcon className="size-4" />
                Create new project
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex shrink-0 items-center border-l border-border px-3">
        {/* Tag picker */}
        <Popover>
          <PopoverTrigger
            className={cn(
              "relative flex h-10 min-w-12 items-center justify-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[popup-open]:bg-muted",
              hasTagSelection ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <TagIcon className="size-4" />
            {hasTagSelection && (
              <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
                {tags.length}
              </Badge>
            )}
          </PopoverTrigger>
          <PopoverContent sideOffset={8} className="w-60 p-2 shadow-xl">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="h-8 pl-9 text-sm shadow-none"
              />
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto pr-1">
              {filteredTags.map((tag, index) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={tags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        tag.color ?? FALLBACK_TAG_COLORS[index % FALLBACK_TAG_COLORS.length],
                    }}
                  />
                  {tag.name}
                </label>
              ))}
              {filteredTags.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No tags found
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Duration display — start-time edits are only available after the timer starts */}
      <Popover>
        <PopoverTrigger
          disabled={!isRunning}
          className={cn(
            "mx-2 flex w-36 shrink-0 items-center justify-center rounded-md px-3 text-center font-mono text-2xl font-medium tabular-nums transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
            isRunning ? "cursor-pointer text-primary" : "cursor-default text-foreground hover:bg-transparent"
          )}
        >
          {displayDuration}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" sideOffset={6}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Start time
            </span>
            <input
              autoFocus
              type="text"
              value={startTimeInput}
              onChange={(e) => setStartTimeInput(e.target.value)}
              onBlur={applyStartTime}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyStartTime()
                  e.currentTarget.blur()
                }
                if (e.key === "Escape") e.currentTarget.blur()
              }}
              placeholder="HH:MM"
              className="w-16 rounded border border-border bg-background px-2 py-1 text-center font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
        </PopoverContent>
      </Popover>

      {/* Start / Stop */}
      <div className="flex shrink-0 items-center pl-1 pr-1.5">
        <Button
          onClick={handleStartStop}
          className={cn(
            "h-12 w-36 rounded-lg text-base font-semibold tracking-wide shadow-md shadow-primary/20",
            isRunning && "bg-destructive text-white hover:bg-destructive/90"
          )}
        >
          {isRunning ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  )
}
