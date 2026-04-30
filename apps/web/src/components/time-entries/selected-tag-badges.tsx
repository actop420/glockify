type SelectedTagBadgesProps = {
  tagNames: Array<string>
}

export function SelectedTagBadges({ tagNames }: SelectedTagBadgesProps) {
  const visibleTagNames = tagNames.slice(0, 2)
  const hiddenTagCount = Math.max(tagNames.length - visibleTagNames.length, 0)

  return (
    <>
      {visibleTagNames.map((tagName) => (
        <span
          key={tagName}
          className="inline-flex h-9 max-w-24 items-center rounded-md border border-border/70 bg-muted/30 px-3 text-xs leading-5 font-normal text-muted-foreground shadow-xs"
        >
          <span className="truncate">{tagName}</span>
        </span>
      ))}
      {hiddenTagCount > 0 && (
        <span className="inline-flex h-9 items-center rounded-md border border-border/70 bg-muted/30 px-3 text-xs leading-5 font-normal text-muted-foreground shadow-xs">
          +{hiddenTagCount}
        </span>
      )}
    </>
  )
}
