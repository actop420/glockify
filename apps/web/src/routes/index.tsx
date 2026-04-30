import { createFileRoute } from "@tanstack/react-router"

import { TimeTrackerPage } from "@/components/time-entries/time-tracker-page"

export const Route = createFileRoute("/")({ component: TimeTrackerPage })
