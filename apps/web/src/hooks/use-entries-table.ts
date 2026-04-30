import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import type { TimeEntry } from "@/lib/time-entries/types"
import { entryColumns } from "@/lib/time-entries/columns"

export function useEntriesTable(data: Array<TimeEntry>) {
  return useReactTable({
    data,
    columns: entryColumns,
    getCoreRowModel: getCoreRowModel(),
  })
}
