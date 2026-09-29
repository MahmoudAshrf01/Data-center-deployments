import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle'
import { useEffect } from 'react'

interface AppToastProps {
  readonly message: string
  readonly tone: 'success' | 'error'
  readonly onClose: () => void
}

export function AppToast({ message, tone, onClose }: AppToastProps) {
  const Icon = tone === 'success' ? CheckCircleIcon : WarningCircleIcon

  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [message, onClose])

  return (
    <div
      className="fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-control border border-line bg-card px-4 py-3 text-ink shadow-popover sm:right-4 sm:left-auto sm:w-auto sm:max-w-[28rem] sm:translate-x-0"
      role="status"
      aria-live="polite"
    >
      <Icon
        className={
          tone === 'success'
            ? 'shrink-0 text-emerald-600'
            : 'shrink-0 text-rose-600'
        }
        size={20}
        weight="fill"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 text-sm font-semibold">{message}</span>
      <button
        type="button"
        className="grid size-7 shrink-0 place-items-center rounded-md text-mute hover:bg-muted hover:text-ink"
        aria-label="Close notification"
        onClick={onClose}
      >
        <XIcon size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}
