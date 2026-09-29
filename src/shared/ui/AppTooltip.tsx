import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'

interface AppTooltipProps {
  readonly children: ReactElement
  readonly label: string
}

export function AppTooltip({ children, label }: AppTooltipProps) {
  return <Tooltip title={label}>{children}</Tooltip>
}
