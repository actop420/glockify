import * as React from "react"
import {
  CalendarIcon,
  EllipsisVerticalIcon,
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

import { useEntriesStore } from "../stores/entriesStore"
import { useTimerStore } from "../stores/timerStore"
import {
  formatDuration,
  formatTime,
  parseDuration,
  parseTimeToEpoch,
  toDayKey,
} from "../utils/time"
import { getTagNames } from "../utils/tags"
import { ProjectPicker } from "./ProjectPicker"
import type { TimeEntry } from "../types/time-entry"

type EditingField = "description" | "startTime" | "endTime" | "duration" | null

type Props = {
  entry: TimeEntry
}

export function EntryRow({ entry }: Props) {
  const projects = useEntriesStore((state) => state.projects)
  const allTags = useEntriesStore((state) => state.tags)
  const updateEntry = useEntriesStore((state) => state.updateEntry)
  const deleteEntry = useEntriesStore((state) => state.deleteEntry)
  const duplicateEntry = useEntriesStore((state) => state.duplicateEntry)
  const toggleEntryTag = useEntriesStore((state) => state.toggleEntryTag)
  const addProject = useEntriesStore((state) => state.addProject)
  const prefill = useTimerStore((state) => state.prefill)
  const startTimer = useTimerStore((state) => state.startTimer)

  const [editingField, setEditingField] = React.useState<EditingField>(null)
  const [fieldValue, setFieldValue] = React.useState("")

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
  const selectedTagNames = getTagNames(entry.tags, allTags)
  const selectedTagLabel = selectedTagNames.join(", ")

  return (
    <div
      className={cn(
        "group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-card px-4 transition-colors hover:bg-muted/25 last:border-0 sm:px-5",
        entry.isOvertime && "border-l-2 border-l-amber-400 pl-[18px] sm:pl-[18px]"
      )}
    >
      {/* Left: description + project */}
      <div className="flex min-w-0 items-center gap-6 pr-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
                !entry.description && "italic text-muted-foreground"
              )}
            >
              {entry.description || "No description"}
            </span>
          )}
        </div>

        {/* Project inline */}
        <div className="w-44 shrink-0">
          <ProjectPicker
            projects={projects}
            value={entry.projectId}
            onValueChange={(projectId) => updateEntry(entry.id, { projectId })}
            onCreateProject={addProject}
            variant="row"
          />
        </div>
      </div>

      {/* Right: tag, time range, calendar, duration, play, kebab */}
      <div className="flex shrink-0 items-center gap-5">
        {/* Tags */}
        <Popover>
          <PopoverTrigger
            aria-label={selectedTagLabel ? `Tags: ${selectedTagLabel}` : "Tags"}
            title={selectedTagLabel || undefined}
            className={cn(
              "flex h-9 min-w-9 cursor-pointer items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
              selectedTagNames.length > 0
                ? "justify-start text-foreground"
                : "justify-center text-muted-foreground"
            )}
          >
            {selectedTagNames.length > 0 ? (
              <Badge
                variant="secondary"
                className="rounded-md px-2 py-0 text-xs font-normal leading-5"
              >
                {selectedTagLabel}
              </Badge>
            ) : (
              <TagIcon className="size-4.5 shrink-0" />
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
                    onChange={() => toggleEntryTag(entry.id, tag.id)}
                    className="accent-primary"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Time range */}
        <div className="flex w-40 items-center justify-center gap-1.5 text-base text-foreground">
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

          <span className="text-muted-foreground/40">-</span>

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
          className="flex size-9 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
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
              className="w-full rounded border border-ring bg-background px-1.5 text-right text-base outline-none ring-2 ring-ring/20"
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEdit("duration", formatDuration(duration))}
              onKeyDown={(e) => e.key === "Enter" && startEdit("duration", formatDuration(duration))}
              className="cursor-text rounded px-2 py-1 text-base font-semibold tabular-nums text-foreground hover:bg-muted"
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
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <PlayIcon className="size-4.5" />
        </button>

        {/* Kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="More actions"
          >
            <EllipsisVerticalIcon className="size-4.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => duplicateEntry(entry.id)}
              className="cursor-pointer"
            >
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteEntry(entry.id)}
              className="cursor-pointer text-destructive focus:text-destructive data-[highlighted]:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
