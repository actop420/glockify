export type TimeEntry = {
  id: string
  description: string
  projectId: string | null
  tags: Array<string>
  startTime: number  // epoch ms
  endTime: number    // epoch ms
  isOvertime: boolean
}

export type Project = {
  id: string
  name: string
  clientName?: string
  color: string  // hex
}

export type Tag = {
  id: string
  name: string
  color?: string
}
