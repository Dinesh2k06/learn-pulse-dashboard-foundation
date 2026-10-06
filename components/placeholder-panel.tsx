interface PlaceholderPanelProps {
  label: string
}

export function PlaceholderPanel({ label }: PlaceholderPanelProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-border-subtle bg-bg-surface p-8">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
    </div>
  )
}
