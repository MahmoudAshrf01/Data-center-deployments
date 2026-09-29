import { z } from 'zod'

import { connectionSchema } from '@/entities/connection/connection.schema'
import { deviceSchema } from '@/entities/device/device.schema'

export const graphSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    devices: z.array(deviceSchema),
    connections: z.array(connectionSchema),
  })
  .superRefine((snapshot, context) => {
    const deviceIds = new Set(snapshot.devices.map((device) => device.id))
    const connectionIds = new Set<string>()

    snapshot.devices.forEach((device, index) => {
      if (
        snapshot.devices.findIndex(
          (candidate) => candidate.id === device.id,
        ) !== index
      ) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate device ID ${device.id}`,
          path: ['devices', index, 'id'],
        })
      }

      if (device.rackId && !deviceIds.has(device.rackId)) {
        context.addIssue({
          code: 'custom',
          message: `Rack ${device.rackId} does not exist`,
          path: ['devices', index, 'rackId'],
        })
      }
    })

    snapshot.connections.forEach((connection, index) => {
      if (connectionIds.has(connection.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate connection ID ${connection.id}`,
          path: ['connections', index, 'id'],
        })
      }
      connectionIds.add(connection.id)

      for (const [field, id] of [
        ['sourceId', connection.sourceId],
        ['targetId', connection.targetId],
      ] as const) {
        if (!deviceIds.has(id)) {
          context.addIssue({
            code: 'custom',
            message: `Connection endpoint ${id} does not exist`,
            path: ['connections', index, field],
          })
        }
      }
    })
  })

export type GraphSnapshot = z.infer<typeof graphSnapshotSchema>
