import * as React from "react"

/**
 * Returns elapsed time in ms since `startedAt`.
 * Updates every second while running; resets to 0 when startedAt is null.
 */
export function useElapsedTime(startedAt: number | null): number {
  const [elapsed, setElapsed] = React.useState(() =>
    startedAt !== null ? Date.now() - startedAt : 0
  )

  React.useEffect(() => {
    if (startedAt === null) {
      setElapsed(0)
      return
    }

    // Snap to current elapsed immediately (handles resuming after refresh)
    setElapsed(Date.now() - startedAt)

    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt)
    }, 1000)

    return () => clearInterval(id)
  }, [startedAt])

  return elapsed
}
