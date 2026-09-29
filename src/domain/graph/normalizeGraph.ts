import type { Connection } from '@/entities/connection/connection.schema'
import type { Device } from '@/entities/device/device.schema'
import type { GraphSnapshot } from '@/entities/graph/graph.schema'

export interface NormalizedGraph {
  readonly devicesById: Readonly<Record<string, Device>>
  readonly connectionsById: Readonly<Record<string, Connection>>
  readonly connectionIdsByDeviceId: Readonly<Record<string, readonly string[]>>
}

export function normalizeGraph(snapshot: GraphSnapshot): NormalizedGraph {
  const devicesById: Record<string, Device> = {}
  const connectionsById: Record<string, Connection> = {}
  const connectionIdsByDeviceId: Record<string, string[]> = {}

  for (const device of snapshot.devices) {
    devicesById[device.id] = device
    connectionIdsByDeviceId[device.id] = []
  }

  for (const connection of snapshot.connections) {
    connectionsById[connection.id] = connection
    connectionIdsByDeviceId[connection.sourceId]?.push(connection.id)
    connectionIdsByDeviceId[connection.targetId]?.push(connection.id)
  }

  return { devicesById, connectionsById, connectionIdsByDeviceId }
}
