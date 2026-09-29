import type { Device, DeviceStatus } from '@/entities/device/device.schema'

export interface DeploymentSummary {
  readonly total: number
  readonly counts: Readonly<Record<DeviceStatus, number>>
  readonly overallProgress: number
}

export function calculateDeploymentSummary(
  devices: readonly Device[],
): DeploymentSummary {
  const counts: Record<DeviceStatus, number> = {
    pending: 0,
    deploying: 0,
    deployed: 0,
    failed: 0,
    decommissioning: 0,
  }

  let progressTotal = 0
  for (const device of devices) {
    counts[device.status] += 1
    progressTotal += device.progress
  }

  return {
    total: devices.length,
    counts,
    overallProgress:
      devices.length === 0 ? 0 : Math.round(progressTotal / devices.length),
  }
}
