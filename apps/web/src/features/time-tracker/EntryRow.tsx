import * as React from "react"
import {
  CalendarIcon,
  CircleDotIcon,
  EllipsisVerticalIcon,
  GlobeIcon,
  PlayIcon,
  TagIcon,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import type { TimeEntry } from "@/lib/types/time-entry"
import { useEntriesStore } from "@/lib/store/entriesStore"
import { useTimerStore } from "@/lib/store/timerStore"
import {
  formatDuration,
  formatTime,
  parseDuration,
  parseTimeToEpoch,
  toDayKey,
} from "@/lib/utils/time"

type EditingField = "description" | "startTime" | "endTime" | "duration" | null

type Props = {
  entry: TimeEntry
}

export function EntryRow({ entry }: Props) {
  const { projects, tags: allTags, updateEntry, deleteEntry, duplicateEntry } =
    useEntriesStore()
  const { prefill, startTimer } = useTimerStore()

  const [editingField, setEditingField] = React.useState<EditingField>(null)
  const [fieldValue, setFieldValue] = React.useState("")

  const project = projects.find((p) => p.id === entry.projectId) ?? null
  const duration = entry.endTime - entry.startTime

  function startEdit(field: EditingField, initial: string) {
    setEditingField(field)
    setFieldValue(initial)
  }

  function cancelEdit() {
    setEditingField(null)
    setFieldValue("")
  }

  function commitEdit(field: EditingField, val: string) {
    switch (field) {
      case "description":
        updateEntry(entry.id, { description: val })
        break
      case "startTime": {
        const ts = parseTimeToEpoch(val, entry.startTime)
        if (ts !== null) updateEntry(entry.id, { startTime: ts })
        break
      }
      case "endTime": {
        const ts = parseTimeToEpoch(val, entry.endTime)
        if (ts !== null) updateEntry(entry.id, { endTime: ts })
        break
      }
      case "duration": {
        const ms = parseDuration(val)
        if (ms > 0) updateEntry(entry.id, { endTime: entry.startTime + ms })
        break
      }
    }
    cancelEdit()
  }

  function handleKeyDown(e: React.KeyboardEvent, field: EditingField) {
    if (e.key === "Enter") commitEdit(field, fieldValue)
    if (e.key === "Escape") cancelEdit()
  }

  function toggleTag(tagId: string) {
    const next = entry.tags.includes(tagId)
      ? entry.tags.filter((t) => t !== tagId)
      : [...entry.tags, tagId]
    updateEntry(entry.id, { tags: next })
  }

  function handlePlayClick() {
    prefill({
      description: entry.description,
      projectId: entry.projectId,
      tags: entry.tags,
    })
    startTimer()
  }

  const inlineInputCls =
    "w-full rounded border border-ring bg-background px-2 py-1 text-base outline-none ring-2 ring-ring/20"

  return (
    <div
      className={cn(
        "group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-card px-4 transition-colors hover:bg-muted/25 last:border-0 sm:px-5",
        entry.isOvertime && "border-l-2 border-l-amber-400 pl-[18px] sm:pl-[18px]"
      )}
    >
      {/* Left: description + project */}
      <div className="flex min-w-0 items-center gap-5 pr-6">
        <div className="flex min-w-0 flex-[0_1_320px] items-center gap-3">
          {entry.isOvertime && (
            <Badge className="shrink-0 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              OVERTIME
            </Badge>
          )}
          {editingField === "description" ? (
            <input
              autoFocus
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => commitEdit("description", fieldValue)}
              onKeyDown={(e) => handleKeyDown(e, "description")}
              className={inlineInputCls}
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEdit("description", entry.description)}
              onKeyDown={(e) => e.key === "Enter" && startEdit("description", entry.description)}
              className={cn(
                "block cursor-text truncate text-base leading-6 text-foreground",
                entry.description ? "font-medium" : "italic text-muted-foreground"
              )}
            >
              {entry.description || "No description"}
            </span>
          )}
        </div>

        {/* Project inline */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex min-w-0 shrink items-center gap-2 rounded px-2 py-1 text-sm leading-5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
              project ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {project ? (
              <>
                <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="max-w-[180px] truncate">{project.name}</span>
              </>
            ) : (
              <>
                <GlobeIcon className="size-4" />
                <span>No project</span>
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {entry.projectId && (
              <>
                <DropdownMenuItem onClick={() => updateEntry(entry.id, { projectId: null })}>
                  <span className="text-muted-foreground">No project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => updateEntry(entry.id, { projectId: p.id })}
              >
                <CircleDotIcon className="size-3.5" style={{ color: p.color }} />
                {p.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: tag, time range, calendar, duration, play, kebab */}
      <div className="flex shrink-0 items-center gap-5">
        {/* Tags */}
        <Popover>
          <PopoverTrigger
            className={cn(
              "relative flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
              entry.tags.length > 0 ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <TagIcon className="size-4.5" />
            {entry.tags.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                {entry.tags.length}
              </Badge>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Tags</p>
            <div className="flex flex-col gap-1.5">
              {allTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={entry.tags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="accent-primary"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Time range */}
        <div className="flex w-40 items-center justify-center gap-1.5 text-base text-muted-foreground">
          {editingField === "startTime" ? (
            <input
              autoFocus
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => commitEdit("startTime", fieldValue)}
              onKeyDown={(e) => handleKeyDown(e, "startTime")}
              className="w-16 rounded border border-ring bg-background px-1.5 text-center text-base outline-none ring-2 ring-ring/20"
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEdit("startTime", formatTime(entry.startTime))}
              onKeyDown={(e) => e.key === "Enter" && startEdit("startTime", formatTime(entry.startTime))}
              className="cursor-text rounded px-2 py-1 hover:bg-muted"
            >
              {formatTime(entry.startTime)}
            </span>
          )}

          <span className="text-muted-foreground/40">—</span>

          {editingField === "endTime" ? (
            <input
              autoFocus
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => commitEdit("endTime", fieldValue)}
              onKeyDown={(e) => handleKeyDown(e, "endTime")}
              className="w-16 rounded border border-ring bg-background px-1.5 text-center text-base outline-none ring-2 ring-ring/20"
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEdit("endTime", formatTime(entry.endTime))}
              onKeyDown={(e) => e.key === "Enter" && startEdit("endTime", formatTime(entry.endTime))}
              className="cursor-text rounded px-2 py-1 hover:bg-muted"
            >
              {formatTime(entry.endTime)}
            </span>
          )}
        </div>

        {/* Calendar */}
        <button
          type="button"
          title={toDayKey(entry.startTime)}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <CalendarIcon className="size-4.5" />
        </button>

        {/* Duration */}
        <div className="w-28 shrink-0 text-right">
          {editingField === "duration" ? (
            <input
              autoFocus
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => commitEdit("duration", fieldValue)}
              onKeyDown={(e) => handleKeyDown(e, "duration")}
              className="w-full rounded border border-ring bg-background px-1.5 text-right font-mono text-base outline-none ring-2 ring-ring/20"
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEdit("duration", formatDuration(duration))}
              onKeyDown={(e) => e.key === "Enter" && startEdit("duration", formatDuration(duration))}
              className="cursor-text rounded px-2 py-1 font-mono text-base font-bold tabular-nums text-foreground hover:bg-muted"
            >
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={handlePlayClick}
          title="Start timer with this entry"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <PlayIcon className="size-4.5" />
        </button>

        {/* Kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="More actions"
          >
            <EllipsisVerticalIcon className="size-4.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => duplicateEntry(entry.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteEntry(entry.id)}
              className="text-destructive focus:text-destructive data-[highlighted]:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
