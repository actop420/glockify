import type { ColumnDef } from "@tanstack/react-table"
import type { TimeEntry } from "@/lib/types/time-entry"

export const entryColumns: Array<ColumnDef<TimeEntry>> = [
  {
    id: "description",
    accessorKey: "description",
  },
  {
    id: "project",
    accessorKey: "projectId",
  },
  {
    id: "tags",
    accessorKey: "tags",
  },
  {
    id: "timeRange",
    accessorFn: (row) => ({ startTime: row.startTime, endTime: row.endTime }),
  },
  {
    id: "duration",
    accessorFn: (row) => row.endTime - row.startTime,
  },
]
