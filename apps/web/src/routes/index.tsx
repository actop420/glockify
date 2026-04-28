import { createFileRoute } from "@tanstack/react-router"

import { TimeTrackerPage } from "@/features/time-tracker/pages/TimeTrackerPage"

export const Route = createFileRoute("/")({ component: TimeTrackerPage })
