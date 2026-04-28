import { useEntriesTable } from "./table"
import { EntryRow } from "./EntryRow"
import type { DayGroup as DayGroupData } from "@/lib/utils/time"
import { formatDuration } from "@/lib/utils/time"

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
        <span className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-mono text-base font-semibold text-foreground">
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
