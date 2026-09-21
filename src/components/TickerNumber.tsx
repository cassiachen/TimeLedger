/** 数字里哪一位变了，哪一位就重新播一次翻动动画（key 带上数字本身） */
export function TickerNumber({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className} aria-label={value}>
      {value.split('').map((ch, i) => (
        <span key={`${i}-${ch}`} className="digit-tick" aria-hidden>
          {ch}
        </span>
      ))}
    </span>
  )
}
