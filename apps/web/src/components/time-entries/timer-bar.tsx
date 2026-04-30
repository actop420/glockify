import * as React from "react"
import { DollarSignIcon, SearchIcon, TagIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { useElapsedTime } from "@/hooks/use-elapsed-time"
import { useEntriesStore } from "@/hooks/use-entries-store"
import { useTimerStore } from "@/hooks/use-timer-store"
import { formatDuration, formatTime, parseTimeToEpoch } from "@/lib/time-entries/time"
import { filterTags, getTagNames } from "@/lib/time-entries/tags"
import { ProjectPicker } from "@/components/time-entries/project-picker"
import { SelectedTagBadges } from "@/components/time-entries/selected-tag-badges"

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
  const isBillable = useTimerStore((state) => state.isBillable)
  const startTimer = useTimerStore((state) => state.startTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)
  const startManual = useTimerStore((state) => state.startManual)
  const reset = useTimerStore((state) => state.reset)
  const setStartedAt = useTimerStore((state) => state.setStartedAt)
  const setManualStartTime = useTimerStore((state) => state.setManualStartTime)
  const setDescription = useTimerStore((state) => state.setDescription)
  const setProjectId = useTimerStore((state) => state.setProjectId)
  const toggleBillable = useTimerStore((state) => state.toggleBillable)
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
        "flex h-14 items-stretch overflow-hidden rounded-lg border border-border/80 bg-white shadow-sm transition-all duration-300 dark:bg-card",
        isRunning &&
          "border-primary/60 shadow-[0_0_0_0.0625rem_color-mix(in_srgb,var(--primary)_28%,transparent),0_0_1.75rem_color-mix(in_srgb,var(--primary)_22%,transparent)]"
      )}
    >
      {/* Description */}
      <div className="flex min-w-0 flex-1 items-center">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="h-full min-w-0 rounded-none border-0 bg-transparent px-4 text-sm shadow-none placeholder:text-muted-foreground/60 focus-visible:border-0 focus-visible:ring-0 sm:px-5"
        />
      </div>

      {/* Project picker */}
      <div className="flex shrink-0 items-center border-l border-border/80 px-4">
        <ProjectPicker
          projects={projects}
          value={projectId}
          onValueChange={setProjectId}
          onCreateProject={addProject}
        />
      </div>

      <div className="flex shrink-0 items-center gap-4 border-l border-border/80 px-4">
        {/* Tag picker */}
        <Popover>
          <PopoverTrigger
            aria-label={selectedTagLabel ? `Tags: ${selectedTagLabel}` : "Tags"}
            title={selectedTagLabel || undefined}
            className={cn(
              "flex h-9 max-w-72 min-w-9 cursor-pointer items-center justify-center text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none",
              hasTagSelection
                ? "gap-2 overflow-hidden text-foreground"
                : "rounded-md border border-border/70 bg-muted/30 px-2 text-muted-foreground shadow-xs hover:bg-muted/50 data-[popup-open]:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/30"
            )}
          >
            {selectedTagNames.length > 0 ? (
              <SelectedTagBadges tagNames={selectedTagNames} />
            ) : (
              <TagIcon className="size-4 shrink-0 stroke-[1.8]" />
            )}
          </PopoverTrigger>
          <PopoverContent sideOffset={8} className="w-60 p-2 shadow-xl">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
                        tag.color ??
                        FALLBACK_TAG_COLORS[index % FALLBACK_TAG_COLORS.length],
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

        <button
          type="button"
          aria-label={isBillable ? "Mark as non-billable" : "Mark as billable"}
          aria-pressed={isBillable}
          title={isBillable ? "Billable" : "Non-billable"}
          onClick={toggleBillable}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-md border border-border/70 bg-muted/30 text-muted-foreground shadow-xs transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none dark:bg-muted/20 dark:hover:bg-muted/30",
            isBillable &&
              "border-border/70 bg-muted/40 text-primary hover:bg-muted/60 dark:bg-muted/30"
          )}
        >
          <DollarSignIcon className="size-4 stroke-[1.9]" />
        </button>
      </div>

      {/* Duration display - start-time edits are only available after the timer starts */}
      <Popover>
        <PopoverTrigger
          disabled={!isRunning}
          className={cn(
            "flex w-32 shrink-0 items-center justify-center px-4 text-center text-xl font-semibold tabular-nums transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none",
            isRunning
              ? "cursor-pointer text-primary"
              : "cursor-default text-foreground hover:bg-transparent"
          )}
        >
          {displayDuration}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" sideOffset={6}>
          <div className="flex items-center gap-3">
            <span className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
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
      <div className="flex shrink-0 items-center pr-3">
        <Button
          onClick={handleStartStop}
          className={cn(
            "h-10 w-[6rem] cursor-pointer rounded-md text-xs font-semibold tracking-wide shadow-sm shadow-primary/20",
            isRunning && "bg-destructive text-white hover:bg-destructive/90"
          )}
        >
          {isRunning ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  )
}
