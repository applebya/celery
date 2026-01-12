import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type Theme } from '@/hooks/useTheme'

const THEME_CONFIG: Record<Theme, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  auto: { icon: Monitor, label: 'Auto' },
}

const THEME_ORDER: Theme[] = ['light', 'dark', 'auto']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme)
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length
    setTheme(THEME_ORDER[nextIndex])
  }

  const { icon: Icon, label } = THEME_CONFIG[theme]

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-8 gap-1.5 px-2"
      aria-label={`Theme: ${label}. Click to change.`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}
