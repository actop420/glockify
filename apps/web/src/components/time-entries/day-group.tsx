import type { DayGroup as DayGroupData } from "@/lib/time-entries/time"
import { EntryRow } from "@/components/time-entries/entry-row"
import { useEntriesTable } from "@/hooks/use-entries-table"
import { formatDuration } from "@/lib/time-entries/time"

type Props = {
  group: DayGroupData
}

export function DayGroup({ group }: Props) {
  const table = useEntriesTable(group.entries)

  return (
    <section className="border-b border-border last:border-b-0">
      {/* Day header */}
      <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-6 pr-6">
          <span className="flex min-w-0 flex-1 text-sm font-medium text-muted-foreground">
            {group.label}
          </span>
          <span className="w-44 shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Project
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <span className="w-9 text-center">Tags</span>
          <span className="w-9 text-center">Bill</span>
          <span className="w-40 text-center">Time</span>
          <span className="w-9 text-center">Date</span>
          <span className="w-9" aria-hidden="true" />
          <span className="w-9" aria-hidden="true" />
          <span className="inline-flex w-28 items-baseline justify-end gap-1.5 text-right">
            Total:
            <span className="text-base font-semibold text-foreground tabular-nums">
              {formatDuration(group.total)}
            </span>
          </span>
        </div>
      </div>

      {/* Entry rows */}
      <div>
        {table.getRowModel().rows.map((row) => (
          <EntryRow key={row.id} entry={row.original} />
        ))}
      </div>
    </section>
  )
}
