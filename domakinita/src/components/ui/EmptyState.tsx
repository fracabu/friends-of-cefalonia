export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-surface px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
