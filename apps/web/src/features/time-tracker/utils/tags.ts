import type { Tag } from "../types/time-entry"

export function getTagNames(tagIds: Array<string>, tags: Array<Tag>): Array<string> {
  const tagNameById = new Map(tags.map((tag) => [tag.id, tag.name]))
  const names: Array<string> = []

  for (const tagId of tagIds) {
    const name = tagNameById.get(tagId)
    if (name) names.push(name)
  }

  return names
}

export function filterTags(tags: Array<Tag>, search: string): Array<Tag> {
  const query = search.trim().toLowerCase()
  if (!query) return tags

  return tags.filter((tag) => tag.name.toLowerCase().includes(query))
}
