import type { ColumnDef } from "@tanstack/react-table"

import type { TimeEntry } from "@/lib/time-entries/types"

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
    id: "billable",
    accessorKey: "isBillable",
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
