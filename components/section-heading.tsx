export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: string
  lead?: string
}) {
  return (
    <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-warm" />
          {eyebrow}
        </p>
        <h2 className="text-section max-w-[16ch]">{title}</h2>
      </div>
      {lead ? (
        <p className="max-w-sm text-muted-foreground md:text-right">{lead}</p>
      ) : null}
    </div>
  )
}
