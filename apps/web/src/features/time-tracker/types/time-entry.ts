export type TimeEntry = {
  id: string
  description: string
  projectId: string | null
  tags: Array<string>
  startTime: number
  endTime: number
  isOvertime: boolean
}

export type Project = {
  id: string
  name: string
  clientName?: string
  color: string
}

export type Tag = {
  id: string
  name: string
  color?: string
}
