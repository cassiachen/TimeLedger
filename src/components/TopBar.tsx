interface TopBarProps {
  title: string
  right?: React.ReactNode
}

export function TopBar({ title, right }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-14 bg-surface-container-lowest/95 backdrop-blur-md pt-safe max-w-md mx-auto right-0">
      <h1 className="font-semibold text-lg tracking-tight text-primary">{title}</h1>
      <div className="flex items-center gap-1">{right}</div>
    </header>
  )
}
