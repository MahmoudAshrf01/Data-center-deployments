import { graphSnapshotSchema } from '@/entities/graph/graph.schema'

const RACK_COUNT = 50
const SERVERS_PER_RACK = 16
const STORAGE_PER_RACK = 2

const racks = Array.from({ length: RACK_COUNT }, (_, index) => ({
  id: `rack-${String(index + 1).padStart(2, '0')}`,
  name: `Rack ${String(index + 1).padStart(2, '0')}`,
  type: 'rack' as const,
  status: 'deployed' as const,
  rackId: null,
  progress: 100,
}))

const switches = racks.map((rack, index) => ({
  id: `switch-${String(index + 1).padStart(2, '0')}`,
  name: `Switch ${String(index + 1).padStart(2, '0')}`,
  type: 'switch' as const,
  status: 'deployed' as const,
  rackId: rack.id,
  progress: 100,
}))

const statusForServer = (index: number) => {
  if (index % 100 === 0) return 'failed' as const
  if (index % 19 === 0) return 'decommissioning' as const
  if (index % 7 === 0) return 'pending' as const
  if (index % 5 === 0) return 'deploying' as const
  return 'deployed' as const
}

const servers = Array.from(
  { length: RACK_COUNT * SERVERS_PER_RACK },
  (_, index) => {
    const rackIndex = Math.floor(index / SERVERS_PER_RACK)
    const status = statusForServer(index + 1)
    return {
      id: `server-${String(index + 1).padStart(2, '0')}`,
      name: `Server ${String(index + 1).padStart(2, '0')}`,
      type: 'server' as const,
      status,
      rackId: racks[rackIndex]!.id,
      progress:
        status === 'deployed'
          ? 100
          : status === 'deploying'
            ? 65
            : status === 'failed'
              ? 42
              : 0,
    }
  },
)

const storage = Array.from(
  { length: RACK_COUNT * STORAGE_PER_RACK },
  (_, index) => {
    const rackIndex = Math.floor(index / STORAGE_PER_RACK)
    const status =
      index % 11 === 0
        ? ('failed' as const)
        : index % 4 === 0
          ? ('deploying' as const)
          : ('deployed' as const)
    return {
      id: `storage-${String(index + 1).padStart(2, '0')}`,
      name: `Storage ${String(index + 1).padStart(2, '0')}`,
      type: 'storage' as const,
      status,
      rackId: racks[rackIndex]!.id,
      progress: status === 'deployed' ? 100 : status === 'deploying' ? 58 : 42,
    }
  },
)

const connections = switches.flatMap((switchDevice, rackIndex) => {
  const serverConnections = Array.from(
    { length: SERVERS_PER_RACK },
    (_, offset) => {
      const number = rackIndex * SERVERS_PER_RACK + offset + 1
      const serverId = `server-${String(number).padStart(2, '0')}`
      return {
        id: `${switchDevice.id}-${serverId}`,
        sourceId: switchDevice.id,
        targetId: serverId,
        type: 'network' as const,
        status: 'active' as const,
      }
    },
  )
  const storageConnections = Array.from(
    { length: STORAGE_PER_RACK },
    (_, offset) => {
      const number = rackIndex * STORAGE_PER_RACK + offset + 1
      const serverNumber = rackIndex * SERVERS_PER_RACK + offset + 1
      return {
        id: `${`server-${String(serverNumber).padStart(2, '0')}`}-storage-${String(number).padStart(2, '0')}`,
        sourceId: `server-${String(serverNumber).padStart(2, '0')}`,
        targetId: `storage-${String(number).padStart(2, '0')}`,
        type: 'storage' as const,
        status: 'active' as const,
      }
    },
  )
  return [...serverConnections, ...storageConnections]
})

export const mockGraphSnapshot = graphSnapshotSchema.parse({
  schemaVersion: 1,
  devices: [...racks, ...switches, ...servers, ...storage],
  connections,
})
