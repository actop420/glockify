import * as React from "react"
import { SearchIcon, TagIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { useElapsedTime } from "../hooks/useElapsedTime"
import { useEntriesStore } from "../stores/entriesStore"
import { useTimerStore } from "../stores/timerStore"
import { formatDuration, formatTime, parseTimeToEpoch } from "../utils/time"
import { filterTags, getTagNames } from "../utils/tags"
import { ProjectPicker } from "./ProjectPicker"

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
  const isRunning = useTimerStore((state) => state.isRunning)
  const startedAt = useTimerStore((state) => state.startedAt)
  const manualStartTime = useTimerStore((state) => state.manualStartTime)
  const description = useTimerStore((state) => state.description)
  const projectId = useTimerStore((state) => state.projectId)
  const tags = useTimerStore((state) => state.tags)
  const startTimer = useTimerStore((state) => state.startTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)
  const startManual = useTimerStore((state) => state.startManual)
  const reset = useTimerStore((state) => state.reset)
  const setStartedAt = useTimerStore((state) => state.setStartedAt)
  const setManualStartTime = useTimerStore((state) => state.setManualStartTime)
  const setDescription = useTimerStore((state) => state.setDescription)
  const setProjectId = useTimerStore((state) => state.setProjectId)
  const toggleTag = useTimerStore((state) => state.toggleTag)

  const projects = useEntriesStore((state) => state.projects)
  const allTags = useEntriesStore((state) => state.tags)
  const addEntry = useEntriesStore((state) => state.addEntry)
  const addProject = useEntriesStore((state) => state.addProject)


  const elapsed = useElapsedTime(isRunning ? startedAt : manualStartTime)
  const displayDuration = formatDuration(elapsed)


  const [startTimeInput, setStartTimeInput] = React.useState("")
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

  const hasTagSelection = tags.length > 0
  const selectedTagNames = getTagNames(tags, allTags)
  const selectedTagLabel = selectedTagNames.join(", ")
  const filteredTags = filterTags(allTags, tagSearch)

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
          className="min-w-0 border-transparent bg-transparent text-base shadow-none hover:border-border focus-visible:border-ring"
        />
        {/* Project picker */}
        <ProjectPicker
          projects={projects}
          value={projectId}
          onValueChange={setProjectId}
          onCreateProject={addProject}
        />
      </div>

      <div className="flex shrink-0 items-center border-l border-border px-2">
        {/* Tag picker */}
        <Popover>
          <PopoverTrigger
            aria-label={selectedTagLabel ? `Tags: ${selectedTagLabel}` : "Tags"}
            title={selectedTagLabel || undefined}
            className={cn(
              "flex h-10 min-w-12 max-w-80 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[popup-open]:bg-muted",
              hasTagSelection
                ? "overflow-hidden text-foreground"
                : "text-muted-foreground"
            )}
          >
            {selectedTagNames.length > 0 ? (
              <Badge
                variant="secondary"
                className="max-w-full rounded-md px-2 py-0 text-left text-xs font-normal leading-5"
              >
                <span className="truncate">{selectedTagLabel}</span>
              </Badge>
            ) : (
              <TagIcon className="size-4 shrink-0" />
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

      {/* Duration display - start-time edits are only available after the timer starts */}
      <Popover>
        <PopoverTrigger
          disabled={!isRunning}
          className={cn(
            "flex w-32 shrink-0 items-center justify-center rounded-md px-2 text-center text-2xl font-medium tabular-nums transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
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
              className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
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
            "h-12 w-36 cursor-pointer rounded-lg text-base font-semibold tracking-wide shadow-md shadow-primary/20",
            isRunning && "bg-destructive text-white hover:bg-destructive/90"
          )}
        >
          {isRunning ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  )
}
