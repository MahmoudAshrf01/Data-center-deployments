import { useState } from 'react'

import type { Connection } from '@/entities/connection/connection.schema'
import type { Device } from '@/entities/device/device.schema'
import { StatusTag } from '@/shared/ui/StatusTag'

interface DeviceDetailsProps {
  readonly device: Device | null
  readonly connections: readonly Connection[]
  readonly deviceNamesById: Readonly<Record<string, string>>
  readonly onRemoveConnection: (connection: Connection) => void
  readonly onDecommission: (device: Device) => void
}

export function DeviceDetails({
  device,
  connections,
  deviceNamesById,
  onRemoveConnection,
  onDecommission,
}: DeviceDetailsProps) {
  const [confirmingConnectionId, setConfirmingConnectionId] = useState<
    string | null
  >(null)
  if (!device) {
    return (
      <aside className="ui-card flex min-h-64 items-center justify-center p-6 text-center">
        <div>
          <p className="font-bold">No device selected</p>
          <p className="mt-1 text-sm text-mute">
            Select a graph node or a device in the list.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className="ui-card h-fit p-5 xl:sticky xl:top-6"
      aria-labelledby="device-details-title"
    >
      <div className="rounded-control border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-mute uppercase">
              Device details
            </p>
            <h2 id="device-details-title" className="mt-1 text-xl font-bold">
              {device.name}
            </h2>
            <p className="mt-0.5 text-xs text-mute">{device.id}</p>
          </div>
          <StatusTag status={device.status} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs font-semibold text-mute">Type</dt>
          <dd className="mt-1 font-semibold capitalize">{device.type}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-mute">Progress</dt>
          <dd className="mt-1 font-semibold">{device.progress}%</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-line pt-4">
        <h3 className="text-sm font-bold">Direct connections</h3>
        {connections.length === 0 ? (
          <p className="mt-2 text-sm text-mute">No direct connections.</p>
        ) : (
          <ul className="connections-scroll mt-2 h-[19rem] space-y-2 overflow-y-auto pr-1">
            {connections.map((connection) => {
              const neighborId =
                connection.sourceId === device.id
                  ? connection.targetId
                  : connection.sourceId
              return (
                <li
                  key={connection.id}
                  className="flex items-center justify-between rounded-control bg-muted px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {deviceNamesById[neighborId] ?? neighborId}
                    </p>
                    <p className="text-xs text-mute capitalize">
                      {connection.type}
                    </p>
                  </div>
                  {confirmingConnectionId === connection.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        className="font-bold text-destructive-700 hover:underline"
                        onClick={() => {
                          onRemoveConnection(connection)
                          setConfirmingConnectionId(null)
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-mute hover:text-ink"
                        onClick={() => setConfirmingConnectionId(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className="text-xs font-bold text-destructive-700 hover:underline"
                      type="button"
                      aria-label={`Remove connection to ${deviceNamesById[neighborId] ?? neighborId}`}
                      onClick={() => setConfirmingConnectionId(connection.id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <button
          className="ui-button ui-button-danger w-full"
          type="button"
          disabled={device.status === 'decommissioning'}
          onClick={() => onDecommission(device)}
        >
          {device.status === 'decommissioning'
            ? 'Decommissioning…'
            : 'Decommission device'}
        </button>
      </div>
    </aside>
  )
}
