import * as React from "react"
import { BellIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

import { DayGroup } from "@/components/time-entries/day-group"
import { TimeTrackerSidebar } from "@/components/time-entries/time-tracker-sidebar"
import { TimerBar } from "@/components/time-entries/timer-bar"
import { useEntriesStore } from "@/hooks/use-entries-store"
import { formatDuration, groupEntriesByDay } from "@/lib/time-entries/time"

export function TimeTrackerPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const entries = useEntriesStore((s) => s.entries)

  const groups = groupEntriesByDay(entries)
  const weekTotal = groups.reduce((sum, g) => sum + g.total, 0)

  return (
    <div className="flex min-h-svh bg-background">
      <TimeTrackerSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Page header */}
        <header className="border-b border-border bg-white dark:bg-card">
          <div className="flex w-full items-center justify-between px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Time Tracker</h1>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Start a timer or log what you just did
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Notifications" disabled>
                <BellIcon className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Timer bar */}
        <div className="border-b border-border bg-background">
          <div className="w-full px-6 py-5 sm:px-8">
            <TimerBar />
          </div>
        </div>

        {/* Recent time logs */}
        <main className="flex-1 px-6 py-5 sm:px-8">
          <div className="w-full">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <p className="text-base">No time entries yet.</p>
                <p className="mt-1 text-sm">Start a timer or log what you just did.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between px-0.5">
                  <span className="text-base font-medium text-muted-foreground">Last week</span>
                  <span className="inline-flex items-baseline gap-2 text-base text-muted-foreground">
                    Week total:
                    <span className="text-lg font-semibold tabular-nums text-foreground">
                      {formatDuration(weekTotal)}
                    </span>
                  </span>
                </div>

                <div className="overflow-hidden border border-border bg-card shadow-sm">
                  {groups.map((group) => (
                    <DayGroup key={group.dayKey} group={group} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
