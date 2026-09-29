import { CssBaseline, ThemeProvider } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { appTheme } from '@/app/theme/createAppTheme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
