import * as React from "react"

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "glockify-theme"

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null

  try {
    return localStorage.getItem(STORAGE_KEY) as Theme | null
  } catch {
    return null
  }
}

function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable in private browsing or locked-down environments.
  }
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const storedTheme = readStoredTheme()
    return storedTheme ?? defaultTheme
  })

  const resolved = resolveTheme(theme)

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolved)
  }, [resolved])

  // Stay in sync when OS preference changes while theme === "system"
  React.useEffect(() => {
    if (theme !== "system") return
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(getSystemTheme())
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    writeStoredTheme(next)
    setThemeState(next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark")
  }, [resolved, setTheme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme, toggleTheme }),
    [theme, resolved, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>")
  return ctx
}

export { ThemeProvider, useTheme }
