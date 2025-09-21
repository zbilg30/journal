import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  )
}
