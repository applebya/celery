import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  formatter: (n: number) => string
  className?: string
}

export function AnimatedNumber({ value, formatter, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return

    let frameId: number
    const start = prevValue.current
    const end = value
    const duration = 300 // ms
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased

      setDisplayValue(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      prevValue.current = value // Update to final value on cleanup
    }
  }, [value])

  return <span className={className}>{formatter(displayValue)}</span>
}
