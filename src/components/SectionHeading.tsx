export function SectionHeading({
  eyebrow,
  title,
  center = false,
}: {
  eyebrow: string
  title: React.ReactNode
  center?: boolean
}) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}>
      <p
        className={`reveal mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-accent uppercase ${
          center ? 'justify-center' : ''
        }`}
      >
        <span className="h-px w-8 bg-accent" />
        {eyebrow}
        {center && <span className="h-px w-8 bg-accent" />}
      </p>
      <h2 className="reveal text-3xl leading-tight font-semibold md:text-5xl" style={{ '--d': '80ms' } as React.CSSProperties}>
        {title}
      </h2>
    </div>
  )
}
