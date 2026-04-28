import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { entryColumns } from "./columns"
import type { TimeEntry } from "../types/time-entry"

export function useEntriesTable(data: Array<TimeEntry>) {
  return useReactTable({
    data,
    columns: entryColumns,
    getCoreRowModel: getCoreRowModel(),
  })
}
