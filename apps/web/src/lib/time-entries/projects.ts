import type { Project } from "@/lib/time-entries/types"

export function findProjectById(projects: Array<Project>, projectId: string | null): Project | null {
  if (projectId === null) return null

  return projects.find((project) => project.id === projectId) ?? null
}

export function filterProjects(projects: Array<Project>, search: string): Array<Project> {
  const query = search.trim().toLowerCase()
  if (!query) return projects

  return projects.filter((project) =>
    `${project.name} ${project.clientName ?? ""}`.toLowerCase().includes(query)
  )
}
