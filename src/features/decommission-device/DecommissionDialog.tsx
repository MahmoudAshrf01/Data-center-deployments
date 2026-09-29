import type { Connection } from '@/entities/connection/connection.schema'
import type { Device } from '@/entities/device/device.schema'
import { AppDialog } from '@/shared/ui/AppDialog'

interface DecommissionDialogProps {
  readonly device: Device
  readonly connections: readonly Connection[]
  readonly deviceNamesById: Readonly<Record<string, string>>
  readonly onConfirm: () => void
  readonly onClose: () => void
}

export function DecommissionDialog({
  device,
  connections,
  deviceNamesById,
  onConfirm,
  onClose,
}: DecommissionDialogProps) {
  return (
    <AppDialog
      open
      title={`Decommission ${device.name}?`}
      description={`This device has ${connections.length} active connection${connections.length === 1 ? '' : 's'}. These relationships may be affected.`}
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
            className="ui-button ui-button-danger"
            type="button"
            onClick={onConfirm}
          >
            Confirm decommission
          </button>
        </>
      }
    >
      {connections.length > 0 ? (
        <ul className="space-y-2">
          {connections.map((connection) => {
            const neighborId =
              connection.sourceId === device.id
                ? connection.targetId
                : connection.sourceId
            return (
              <li
                key={connection.id}
                className="flex justify-between rounded-control bg-warning-50 px-3 py-2 text-sm text-warning-800"
              >
                <span className="font-semibold">
                  {deviceNamesById[neighborId] ?? neighborId}
                </span>
                <span className="capitalize">{connection.type}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-mute">
          This device has no active connections.
        </p>
      )}
    </AppDialog>
  )
}
