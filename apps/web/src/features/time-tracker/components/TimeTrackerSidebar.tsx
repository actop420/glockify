import * as React from "react"
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TimerIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

type TimeTrackerSidebarProps = {
  isCollapsed: boolean
  onToggle: () => void
}

export function TimeTrackerSidebar({ isCollapsed, onToggle }: TimeTrackerSidebarProps) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false)

  return (
    <aside
      className={cn(
        "relative hidden min-h-svh shrink-0 border-r border-border bg-card px-3 py-6 transition-[width] duration-300 ease-in-out lg:flex lg:flex-col",
        isCollapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-[82px] border-b border-border" />

      {!isWorkspaceMenuOpen ? (
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-4 top-28 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="size-4" />
          ) : (
            <ChevronLeftIcon className="size-4" />
          )}
        </button>
      ) : null}

      <DropdownMenu open={isWorkspaceMenuOpen} onOpenChange={setIsWorkspaceMenuOpen}>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full cursor-pointer items-center rounded-xl py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[popup-open]:bg-muted",
            isCollapsed ? "justify-center px-0" : "justify-between px-3"
          )}
          aria-label="Workspace menu"
        >
          <div
            className={cn(
              "flex min-w-0 items-center transition-[gap] duration-300 ease-in-out",
              isCollapsed ? "justify-center gap-0" : "gap-3"
            )}
          >
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-background">
              <img src="/avinto.png" alt="" className="size-full object-contain" />
            </div>
            <div
              className={cn(
                "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
                isCollapsed
                  ? "max-w-0 -translate-x-2 opacity-0"
                  : "max-w-36 translate-x-0 opacity-100"
              )}
              aria-hidden={isCollapsed}
            >
              <div className="text-lg font-semibold leading-none text-foreground">Glockify</div>
              <div className="mt-1 text-xs text-muted-foreground">Admin Console</div>
            </div>
          </div>
          <ChevronDownIcon
            className={cn(
              "h-4 shrink-0 text-muted-foreground transition-[width,opacity,transform] duration-300 ease-in-out",
              isCollapsed ? "w-0 scale-75 opacity-0" : "w-4 scale-100 opacity-100"
            )}
            aria-hidden={isCollapsed}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} className="w-80 p-2 shadow-xl">
          <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
              <img src="/avinto.png" alt="" className="size-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Glockify</p>
              <p className="text-xs text-muted-foreground">Time Tracking</p>
            </div>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Open</span>
          </div>

          <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Avinto's Workspace
          </p>
          <a
            href="https://leavemgmt.avinto.no/employee"
            target="_blank"
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-base font-semibold text-white">
              L
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">Leave Management System</p>
              <p className="text-xs text-muted-foreground">Leave Management</p>
            </div>
            <ArrowUpRightIcon className="size-4 text-muted-foreground" />
          </a>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className={cn("mt-10 transition-all duration-300 ease-in-out", isCollapsed && "flex flex-col items-center")}>
        <p
          className={cn(
            "overflow-hidden whitespace-nowrap px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-[max-height,opacity] duration-300 ease-in-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-4 opacity-100"
          )}
          aria-hidden={isCollapsed}
        >
          Track
        </p>
        <a
          href="/"
          aria-current="page"
          className={cn(
            "mt-3 flex cursor-pointer items-center overflow-hidden rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all duration-300 ease-in-out",
            isCollapsed ? "size-11 justify-center gap-0 px-0 py-0" : "w-full justify-start gap-3 px-4 py-3"
          )}
          title="Time Tracker"
        >
          <TimerIcon className="size-5 shrink-0" />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
              isCollapsed
                ? "max-w-0 -translate-x-2 opacity-0"
                : "max-w-28 translate-x-0 opacity-100"
            )}
            aria-hidden={isCollapsed}
          >
            Time Tracker
          </span>
        </a>
      </nav>
    </aside>
  )
}
