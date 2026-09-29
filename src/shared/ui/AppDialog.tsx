import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { ReactNode } from 'react'

interface AppDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description?: string
  readonly children: ReactNode
  readonly actions: ReactNode
  readonly onClose: () => void
}

export function AppDialog({
  open,
  title,
  description,
  children,
  actions,
  onClose,
}: AppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="!px-6 !pt-6 !pb-2 !font-sans !text-xl !font-bold">
        {title}
      </DialogTitle>
      <DialogContent className="!px-6 !pt-2">
        {description && <p className="mb-4 text-sm text-mute">{description}</p>}
        {children}
      </DialogContent>
      <DialogActions className="!gap-2 !border-t border-line !px-6 !py-4">
        {actions}
      </DialogActions>
    </Dialog>
  )
}
