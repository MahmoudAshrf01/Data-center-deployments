import { create } from 'zustand'

import {
  normalizeGraph,
  type NormalizedGraph,
} from '@/domain/graph/normalizeGraph'
import type {
  Connection,
  ConnectionId,
} from '@/entities/connection/connection.schema'
import type { DeviceId } from '@/entities/device/device.schema'
import { mockGraphSnapshot } from '@/mocks/fixtures/graph'

export interface AddConnectionInput {
  readonly sourceId: DeviceId
  readonly targetId: DeviceId
  readonly type: Connection['type']
}

export type GraphMutationResult =
  { readonly ok: true } | { readonly ok: false; readonly message: string }

interface GraphStore {
  readonly graph: NormalizedGraph
  readonly addConnection: (input: AddConnectionInput) => GraphMutationResult
  readonly removeConnection: (connectionId: ConnectionId) => GraphMutationResult
  readonly advanceDeployments: (increment: number) => void
  readonly beginDecommission: (deviceId: DeviceId) => GraphMutationResult
  readonly completeDecommission: (deviceId: DeviceId) => void
}

function createConnectionId(input: AddConnectionInput) {
  const normalizedEndpoints = [input.sourceId, input.targetId].sort().join('-')
  return `${input.type}-${normalizedEndpoints}-${Date.now()}`
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  graph: normalizeGraph(mockGraphSnapshot),

  addConnection: (input) => {
    const { graph } = get()
    if (input.sourceId === input.targetId) {
      return { ok: false, message: 'Choose two different devices.' }
    }
    if (
      !graph.devicesById[input.sourceId] ||
      !graph.devicesById[input.targetId]
    ) {
      return {
        ok: false,
        message: 'One of the selected devices no longer exists.',
      }
    }

    const duplicate = Object.values(graph.connectionsById).some(
      (connection) =>
        connection.type === input.type &&
        ((connection.sourceId === input.sourceId &&
          connection.targetId === input.targetId) ||
          (connection.sourceId === input.targetId &&
            connection.targetId === input.sourceId)),
    )
    if (duplicate) {
      return { ok: false, message: 'That connection already exists.' }
    }

    const connection: Connection = {
      ...input,
      id: createConnectionId(input),
      status: 'active',
    }
    set({
      graph: {
        ...graph,
        connectionsById: {
          ...graph.connectionsById,
          [connection.id]: connection,
        },
        connectionIdsByDeviceId: {
          ...graph.connectionIdsByDeviceId,
          [connection.sourceId]: [
            ...(graph.connectionIdsByDeviceId[connection.sourceId] ?? []),
            connection.id,
          ],
          [connection.targetId]: [
            ...(graph.connectionIdsByDeviceId[connection.targetId] ?? []),
            connection.id,
          ],
        },
      },
    })
    return { ok: true }
  },

  removeConnection: (connectionId) => {
    const { graph } = get()
    const connection = graph.connectionsById[connectionId]
    if (!connection) {
      return { ok: false, message: 'The connection no longer exists.' }
    }

    const connectionsById = { ...graph.connectionsById }
    delete connectionsById[connectionId]
    set({
      graph: {
        ...graph,
        connectionsById,
        connectionIdsByDeviceId: {
          ...graph.connectionIdsByDeviceId,
          [connection.sourceId]: (
            graph.connectionIdsByDeviceId[connection.sourceId] ?? []
          ).filter((id) => id !== connectionId),
          [connection.targetId]: (
            graph.connectionIdsByDeviceId[connection.targetId] ?? []
          ).filter((id) => id !== connectionId),
        },
      },
    })
    return { ok: true }
  },

  advanceDeployments: (increment) => {
    const { graph } = get()
    let changed = false
    const devicesById = { ...graph.devicesById }

    for (const device of Object.values(graph.devicesById)) {
      if (device.status !== 'deploying') continue
      const progress = Math.min(100, device.progress + increment)
      devicesById[device.id] = {
        ...device,
        progress,
        status: progress === 100 ? 'deployed' : 'deploying',
      }
      changed = true
    }

    if (changed) set({ graph: { ...graph, devicesById } })
  },

  beginDecommission: (deviceId) => {
    const { graph } = get()
    const device = graph.devicesById[deviceId]
    if (!device) return { ok: false, message: 'The device no longer exists.' }
    if (device.status === 'decommissioning') {
      return { ok: false, message: 'The device is already decommissioning.' }
    }

    set({
      graph: {
        ...graph,
        devicesById: {
          ...graph.devicesById,
          [deviceId]: { ...device, status: 'decommissioning' },
        },
      },
    })
    return { ok: true }
  },

  completeDecommission: (deviceId) => {
    const { graph } = get()
    if (!graph.devicesById[deviceId]) return

    const attachedConnectionIds = new Set(
      graph.connectionIdsByDeviceId[deviceId] ?? [],
    )
    const devicesById = { ...graph.devicesById }
    const connectionsById = { ...graph.connectionsById }
    const connectionIdsByDeviceId = { ...graph.connectionIdsByDeviceId }
    delete devicesById[deviceId]
    delete connectionIdsByDeviceId[deviceId]

    for (const connectionId of attachedConnectionIds) {
      const connection = connectionsById[connectionId]
      if (!connection) continue
      const neighborId =
        connection.sourceId === deviceId
          ? connection.targetId
          : connection.sourceId
      connectionIdsByDeviceId[neighborId] = (
        connectionIdsByDeviceId[neighborId] ?? []
      ).filter((id) => id !== connectionId)
      delete connectionsById[connectionId]
    }

    set({
      graph: { devicesById, connectionsById, connectionIdsByDeviceId },
    })
  },
}))
