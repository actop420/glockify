import { useEntriesTable } from "../lib/table"
import { formatDuration } from "../utils/time"
import { EntryRow } from "./EntryRow"
import type { DayGroup as DayGroupData } from "../utils/time"

type Props = {
  group: DayGroupData
}

export function DayGroup({ group }: Props) {
  const table = useEntriesTable(group.entries)

  return (
    <section className="border-b border-border last:border-b-0">
      {/* Day header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
        <span className="text-sm font-medium text-muted-foreground">{group.label}</span>
        <span className="inline-flex items-baseline gap-2 text-sm text-muted-foreground">
          Total:
          <span className="text-base font-semibold tabular-nums text-foreground">
            {formatDuration(group.total)}
          </span>
        </span>
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
