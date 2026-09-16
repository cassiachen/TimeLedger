interface StatCardProps {
  label: string
  value: string
  valueClassName?: string
}

export function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <div className="bg-surface-container-low rounded-xl px-3 py-3 text-center flex flex-col gap-1">
      <div className="text-[11px] text-outline uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold text-primary ${valueClassName || ''}`}>{value}</div>
    </div>
  )
}
