import { lazy, Suspense, useMemo, useState } from 'react'

import { calculateDeploymentSummary } from '@/domain/graph/calculateDeploymentSummary'
import type { Connection } from '@/entities/connection/connection.schema'
import type {
  Device,
  DeviceStatus,
  DeviceType,
} from '@/entities/device/device.schema'
import { AddConnectionDialog } from '@/features/connection-management/AddConnectionDialog'
import { DecommissionDialog } from '@/features/decommission-device/DecommissionDialog'
import { useDecommissionDevice } from '@/features/decommission-device/useDecommissionDevice'
import { DeploymentSummary } from '@/features/deployment-summary/DeploymentSummary'
import { useDeploymentSimulation } from '@/features/deployment-simulation/useDeploymentSimulation'
import { DeviceDetails } from '@/features/device-details/DeviceDetails'
import { DeviceList } from '@/features/device-list/DeviceList'
import { GraphControls } from '@/features/graph-filters/GraphControls'
import { AppToast } from '@/shared/ui/AppToast'
import { useGraphStore, type AddConnectionInput } from '@/store/graph.store'
import { useGraphViewStore, type GraphLayout } from '@/store/graph-view.store'

const GraphCanvas = lazy(async () => {
  const module = await import('@/features/graph-explorer/GraphCanvas')
  return { default: module.GraphCanvas }
})

export function App() {
  useDeploymentSimulation()
  const decommission = useDecommissionDevice()
  const graph = useGraphStore((state) => state.graph)
  const addConnection = useGraphStore((state) => state.addConnection)
  const removeConnection = useGraphStore((state) => state.removeConnection)

  const selectedDeviceId = useGraphViewStore((state) => state.selectedDeviceId)
  const searchQuery = useGraphViewStore((state) => state.searchQuery)
  const statusFilter = useGraphViewStore((state) => state.statusFilter)
  const typeFilter = useGraphViewStore((state) => state.typeFilter)
  const activeLayout = useGraphViewStore((state) => state.activeLayout)
  const focusRequest = useGraphViewStore((state) => state.focusRequest)
  const selectDevice = useGraphViewStore((state) => state.selectDevice)
  const focusDevice = useGraphViewStore((state) => state.focusDevice)
  const setSearchQuery = useGraphViewStore((state) => state.setSearchQuery)
  const setStatusFilter = useGraphViewStore((state) => state.setStatusFilter)
  const setTypeFilter = useGraphViewStore((state) => state.setTypeFilter)
  const setActiveLayout = useGraphViewStore((state) => state.setActiveLayout)
  const clearFilters = useGraphViewStore((state) => state.clearFilters)

  const [isAddConnectionOpen, setAddConnectionOpen] = useState(false)
  const [datasetSize, setDatasetSize] = useState('100')
  const [decommissionTarget, setDecommissionTarget] = useState<Device | null>(
    null,
  )
  const [toast, setToast] = useState<{
    message: string
    tone: 'success' | 'error'
  } | null>(null)

  function showToast(message: string, tone: 'success' | 'error' = 'success') {
    setToast({ message, tone })
  }

  const devices = useMemo(
    () =>
      selectRepresentativeDevices(
        Object.values(graph.devicesById),
        Number(datasetSize),
      ),
    [datasetSize, graph],
  )
  const connections = useMemo(
    () => Object.values(graph.connectionsById),
    [graph],
  )
  const visibleDevices = useMemo(
    () =>
      devices.filter(
        (device) =>
          (statusFilter === 'all' || device.status === statusFilter) &&
          (typeFilter === 'all' || device.type === typeFilter),
      ),
    [devices, statusFilter, typeFilter],
  )
  const visibleDeviceIds = useMemo(
    () => new Set(visibleDevices.map(({ id }) => id)),
    [visibleDevices],
  )
  const visibleConnections = useMemo(
    () =>
      connections.filter(
        (connection) =>
          visibleDeviceIds.has(connection.sourceId) &&
          visibleDeviceIds.has(connection.targetId),
      ),
    [connections, visibleDeviceIds],
  )
  const summary = useMemo(() => calculateDeploymentSummary(devices), [devices])
  const selectedDevice = selectedDeviceId
    ? (graph.devicesById[selectedDeviceId] ?? null)
    : null
  const selectedConnections = getDeviceConnections(
    selectedDeviceId,
    graph.connectionIdsByDeviceId,
    graph.connectionsById,
  )
  const decommissionConnections = getDeviceConnections(
    decommissionTarget?.id ?? null,
    graph.connectionIdsByDeviceId,
    graph.connectionsById,
  )
  const deviceNamesById = useMemo(
    () =>
      Object.fromEntries(
        devices.map((device) => [device.id, device.name] as const),
      ),
    [devices],
  )

  function searchAndFocus(deviceId: string) {
    clearFilters()
    setSearchQuery('')
    focusDevice(deviceId)
  }

  function changeStatusFilter(status: DeviceStatus | 'all') {
    selectDevice(null)
    setStatusFilter(status)
  }

  function changeTypeFilter(type: DeviceType | 'all') {
    selectDevice(null)
    setTypeFilter(type)
  }

  function changeLayout(layout: GraphLayout) {
    setActiveLayout(layout)
  }

  function submitConnection(input: AddConnectionInput) {
    const result = addConnection(input)
    if (!result.ok) return result.message
    setAddConnectionOpen(false)
    focusDevice(input.targetId)
    showToast('Connection added successfully.')
    return null
  }

  function removeSelectedConnection(connection: Connection) {
    const result = removeConnection(connection.id)
    showToast(
      result.ok
        ? 'Connection removed.'
        : `Could not remove connection: ${result.message}`,
      result.ok ? 'success' : 'error',
    )
  }

  function confirmDecommission() {
    if (!decommissionTarget) return
    const targetName = decommissionTarget.name
    const result = decommission(decommissionTarget.id, () => {
      selectDevice(null)
      showToast(`${targetName} was removed from the active graph.`)
    })
    setDecommissionTarget(null)
    showToast(
      result.ok
        ? `${targetName} is decommissioning.`
        : `Could not decommission device: ${result.message}`,
      result.ok ? 'success' : 'error',
    )
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[96rem] space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-brand-700">
            Infrastructure operations
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Data center deployments
          </h1>
          <p className="mt-2 text-base text-mute">
            Monitor device rollout, inspect topology, and understand impact
            before changing infrastructure.
          </p>
        </header>

        <DeploymentSummary summary={summary} />
        <GraphControls
          devices={devices}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          activeLayout={activeLayout}
          datasetSize={datasetSize}
          onSearchQueryChange={setSearchQuery}
          onSearchSelect={searchAndFocus}
          onStatusFilterChange={changeStatusFilter}
          onTypeFilterChange={changeTypeFilter}
          onLayoutChange={changeLayout}
          onDatasetSizeChange={(size) => {
            selectDevice(null)
            setDatasetSize(size)
          }}
          onClearFilters={() => {
            selectDevice(null)
            clearFilters()
          }}
          onAddConnection={() => setAddConnectionOpen(true)}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Suspense
            fallback={
              <div className="ui-card grid min-h-[34rem] place-items-center">
                <p className="text-sm font-semibold text-mute">
                  Loading topology…
                </p>
              </div>
            }
          >
            <GraphCanvas
              devices={visibleDevices}
              connections={visibleConnections}
              selectedDeviceId={selectedDeviceId}
              activeLayout={activeLayout}
              focusRequest={focusRequest}
              onSelectDevice={selectDevice}
            />
          </Suspense>
          <DeviceDetails
            device={selectedDevice}
            connections={selectedConnections}
            deviceNamesById={deviceNamesById}
            onRemoveConnection={removeSelectedConnection}
            onDecommission={setDecommissionTarget}
          />
        </div>

        <DeviceList
          devices={visibleDevices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={focusDevice}
        />
      </main>

      {isAddConnectionOpen && (
        <AddConnectionDialog
          devices={devices}
          initialSourceId={selectedDeviceId}
          onSubmit={submitConnection}
          onClose={() => setAddConnectionOpen(false)}
        />
      )}
      {decommissionTarget && (
        <DecommissionDialog
          device={decommissionTarget}
          connections={decommissionConnections}
          deviceNamesById={deviceNamesById}
          onConfirm={confirmDecommission}
          onClose={() => setDecommissionTarget(null)}
        />
      )}
      {toast && (
        <AppToast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

function getDeviceConnections(
  deviceId: string | null,
  connectionIdsByDeviceId: Readonly<Record<string, readonly string[]>>,
  connectionsById: Readonly<Record<string, Connection>>,
) {
  if (!deviceId) return []
  return (connectionIdsByDeviceId[deviceId] ?? [])
    .map((connectionId) => connectionsById[connectionId])
    .filter((connection) => connection !== undefined)
}

function selectRepresentativeDevices(
  allDevices: readonly Device[],
  limit: number,
) {
  if (allDevices.length <= limit) return allDevices
  const quotas: Record<DeviceType, number> = {
    rack: Math.max(1, Math.round(limit * 0.05)),
    switch: Math.max(1, Math.round(limit * 0.05)),
    server: Math.max(1, Math.round(limit * 0.8)),
    storage: Math.max(1, Math.round(limit * 0.1)),
  }
  const selected = (Object.keys(quotas) as DeviceType[]).flatMap((type) =>
    allDevices.filter((device) => device.type === type).slice(0, quotas[type]),
  )
  return selected.slice(0, limit)
}
