import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock'
import { PowerIcon } from '@phosphor-icons/react/dist/csr/Power'
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap'
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle'

import type { DeviceStatus } from '@/entities/device/device.schema'

const statusClassName: Record<DeviceStatus, string> = {
  pending: 'ui-tag-neutral',
  deploying: 'ui-tag-info',
  deployed: 'ui-tag-success',
  failed: 'ui-tag-danger',
  decommissioning: 'ui-tag-warning',
}

const statusIcon = {
  pending: ClockIcon,
  deploying: SpinnerGapIcon,
  deployed: CheckCircleIcon,
  failed: WarningCircleIcon,
  decommissioning: PowerIcon,
} satisfies Record<DeviceStatus, typeof ClockIcon>

interface StatusTagProps {
  readonly status: DeviceStatus
}

export function StatusTag({ status }: StatusTagProps) {
  const Icon = statusIcon[status]

  return (
    <span className={`ui-tag ${statusClassName[status]}`}>
      <Icon
        size={14}
        weight="fill"
        className={status === 'deploying' ? 'animate-spin' : undefined}
        aria-hidden="true"
      />
      <span className="capitalize">{status}</span>
    </span>
  )
}
