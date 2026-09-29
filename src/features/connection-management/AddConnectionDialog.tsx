import { useState } from 'react'

import type { AddConnectionInput } from '@/store/graph.store'
import type { Device, DeviceId } from '@/entities/device/device.schema'
import { AppDialog } from '@/shared/ui/AppDialog'
import { AppSearchSelect } from '@/shared/ui/AppSearchSelect'
import { AppSelect } from '@/shared/ui/AppSelect'

interface AddConnectionDialogProps {
  readonly devices: readonly Device[]
  readonly initialSourceId: DeviceId | null
  readonly onSubmit: (input: AddConnectionInput) => string | null
  readonly onClose: () => void
}

export function AddConnectionDialog({
  devices,
  initialSourceId,
  onSubmit,
  onClose,
}: AddConnectionDialogProps) {
  const [sourceId, setSourceId] = useState(
    initialSourceId ?? devices[0]?.id ?? '',
  )
  const [targetId, setTargetId] = useState(
    devices.find((device) => device.id !== initialSourceId)?.id ?? '',
  )
  const [type, setType] = useState<AddConnectionInput['type']>('network')
  const [error, setError] = useState<string | null>(null)
  const deviceOptions = devices.map((device) => ({
    value: device.id,
    label: device.name,
  }))
  const connectionTypeOptions: readonly {
    value: AddConnectionInput['type']
    label: string
  }[] = [
    { value: 'network', label: 'Network' },
    { value: 'storage', label: 'Storage' },
    { value: 'contains', label: 'Contains' },
  ]

  function submit() {
    const message = onSubmit({ sourceId, targetId, type })
    if (message) setError(message)
  }

  return (
    <AppDialog
      open
      title="Add connection"
      description="Create a relationship between two devices. It will appear on the graph immediately."
      onClose={onClose}
      actions={
        <>
          <button
            className="ui-button ui-button-ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="ui-button ui-button-primary"
            type="button"
            onClick={submit}
          >
            Add connection
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-sm font-semibold">Source device</p>
          <AppSearchSelect
            ariaLabel="Source device"
            value={sourceId}
            options={deviceOptions}
            onChange={setSourceId}
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Target device</p>
          <AppSearchSelect
            ariaLabel="Target device"
            value={targetId}
            options={deviceOptions}
            onChange={setTargetId}
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-1.5 text-sm font-semibold">Connection type</p>
        <AppSelect
          ariaLabel="Connection type"
          value={type}
          options={connectionTypeOptions}
          onChange={setType}
        />
      </div>
      {error && (
        <p
          className="mt-4 rounded-control bg-destructive-50 px-3 py-2 text-sm font-semibold text-destructive-700"
          role="alert"
        >
          {error}
        </p>
      )}
    </AppDialog>
  )
}
