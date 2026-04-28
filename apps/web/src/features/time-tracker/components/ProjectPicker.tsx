import * as React from "react"
import {
  GlobeIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import type { Project } from "../types/time-entry"

const FALLBACK_PROJECT_COLORS = [
  "#E39B31",
  "#7669E8",
  "#46B980",
  "#D94F91",
  "#E5922F",
  "#845AE1",
  "#64748B",
  "#3E9BDC",
]

type ProjectPickerVariant = "timer" | "row"

type ProjectPickerProps = {
  projects: Array<Project>
  value: string | null
  onValueChange: (projectId: string | null) => void
  onCreateProject?: (project: Project) => void
  variant?: ProjectPickerVariant
}

export function ProjectPicker({
  projects,
  value,
  onValueChange,
  onCreateProject,
  variant = "timer",
}: ProjectPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedProject = projects.find((project) => project.id === value) ?? null
  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase()
    if (!query) return true

    return `${project.name} ${project.clientName ?? ""}`.toLowerCase().includes(query)
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setSearch("")
  }

  function selectProject(projectId: string | null) {
    onValueChange(projectId)
    handleOpenChange(false)
  }

  function createProject() {
    const name = window.prompt("Project name")
    const trimmed = name?.trim()
    if (!trimmed || !onCreateProject) return

    const project = {
      id: crypto.randomUUID(),
      name: trimmed,
      color: FALLBACK_PROJECT_COLORS[projects.length % FALLBACK_PROJECT_COLORS.length],
    }
    onCreateProject(project)
    selectProject(project.id)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-md text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[popup-open]:bg-muted",
          variant === "timer"
            ? "ml-auto h-10 max-w-[360px] shrink-0 justify-start px-3"
            : "shrink px-2 py-1 leading-5",
          selectedProject ? "text-foreground" : variant === "timer" ? "text-primary" : "text-muted-foreground"
        )}
      >
        {selectedProject ? (
          <>
            <span className="size-2 rounded-full" style={{ backgroundColor: selectedProject.color }} />
            <span className={cn("truncate", variant === "timer" ? "min-w-0" : "max-w-[180px]")}>
              {selectedProject.name}
            </span>
          </>
        ) : (
          <>
            <GlobeIcon className="size-4" />
            <span>{variant === "timer" ? "Project" : "No project"}</span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent sideOffset={8} className="w-[300px] p-2 shadow-xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="h-8 pl-9 text-sm shadow-none"
          />
        </div>
        <div className="mt-2 max-h-64 overflow-y-auto pr-1">
          {selectedProject && (
            <button
              type="button"
              onClick={() => selectProject(null)}
              className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              No project
            </button>
          )}
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => selectProject(project.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                project.id === value && "bg-muted"
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
        {onCreateProject && (
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
        )}
      </PopoverContent>
    </Popover>
  )
}
