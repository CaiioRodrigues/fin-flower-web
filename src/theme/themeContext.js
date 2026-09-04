import { createContext, useContext } from 'react'

export const ThemeContext = createContext({ theme: 'system', resolved: 'light', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}
