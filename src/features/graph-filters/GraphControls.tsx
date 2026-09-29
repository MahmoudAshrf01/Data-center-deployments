import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

import type {
  Device,
  DeviceId,
  DeviceStatus,
  DeviceType,
} from '@/entities/device/device.schema'
import { AppSelect } from '@/shared/ui/AppSelect'
import type { GraphLayout } from '@/store/graph-view.store'

interface GraphControlsProps {
  readonly devices: readonly Device[]
  readonly searchQuery: string
  readonly statusFilter: DeviceStatus | 'all'
  readonly typeFilter: DeviceType | 'all'
  readonly activeLayout: GraphLayout
  readonly datasetSize: string
  readonly onSearchQueryChange: (query: string) => void
  readonly onSearchSelect: (deviceId: DeviceId) => void
  readonly onStatusFilterChange: (status: DeviceStatus | 'all') => void
  readonly onTypeFilterChange: (type: DeviceType | 'all') => void
  readonly onLayoutChange: (layout: GraphLayout) => void
  readonly onDatasetSizeChange: (size: string) => void
  readonly onClearFilters: () => void
  readonly onAddConnection: () => void
}

const statusOptions: readonly {
  value: DeviceStatus | 'all'
  label: string
}[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'deploying', label: 'Deploying' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'failed', label: 'Failed' },
  { value: 'decommissioning', label: 'Decommissioning' },
]
const typeOptions: readonly { value: DeviceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'server', label: 'Server' },
  { value: 'switch', label: 'Switch' },
  { value: 'storage', label: 'Storage' },
  { value: 'rack', label: 'Rack' },
]
const layoutOptions: readonly { value: GraphLayout; label: string }[] = [
  { value: 'dagre', label: 'Dagre flow' },
  { value: 'grid', label: 'Grid' },
  { value: 'avsdf', label: 'AVSDF network' },
  { value: 'concentric', label: 'Concentric' },
  { value: 'circle', label: 'Circle' },
  { value: 'breadthfirst', label: 'Breadth first' },
  { value: 'cose', label: 'Cose' },
]
const datasetOptions = [100, 500, 1000].map((size) => ({
  value: String(size),
  label: `${size.toLocaleString()} devices`,
}))

export function GraphControls({
  devices,
  searchQuery,
  statusFilter,
  typeFilter,
  activeLayout,
  datasetSize,
  onSearchQueryChange,
  onSearchSelect,
  onStatusFilterChange,
  onTypeFilterChange,
  onLayoutChange,
  onDatasetSizeChange,
  onClearFilters,
  onAddConnection,
}: GraphControlsProps) {
  const searchContainerRef = useRef<HTMLFormElement>(null)
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const matches = normalizedQuery
    ? devices
        .filter(
          (device) =>
            device.name.toLowerCase().includes(normalizedQuery) ||
            device.id.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, 6)
    : []

  useEffect(() => {
    function closeSearchResults(event: MouseEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        onSearchQueryChange('')
      }
    }

    document.addEventListener('click', closeSearchResults)
    return () => document.removeEventListener('click', closeSearchResults)
  }, [onSearchQueryChange])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const firstMatch = matches[0]
    if (firstMatch) onSearchSelect(firstMatch.id)
  }

  return (
    <section className="ui-card p-5" aria-label="Graph controls">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Explore topology</h2>
          <p className="mt-0.5 text-sm text-mute">
            Search, filter, and rearrange the visible infrastructure.
          </p>
        </div>
        <button
          className="ui-button ui-button-primary whitespace-nowrap"
          type="button"
          onClick={onAddConnection}
        >
          <PlusIcon size={18} weight="bold" aria-hidden="true" />
          Add connection
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(12rem,1fr)_11rem_11rem_11rem_11rem]">
        <form
          ref={searchContainerRef}
          className="relative"
          onSubmit={submitSearch}
        >
          <label
            htmlFor="device-search"
            className="mb-1.5 block text-xs font-semibold text-mute"
          >
            Search devices
          </label>
          <div className="relative">
            <MagnifyingGlassIcon
              size={17}
              weight="bold"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute"
            />
            <input
              id="device-search"
              className="ui-input !pl-9"
              type="search"
              value={searchQuery}
              placeholder="Search by name or ID"
              autoComplete="off"
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </div>
          {normalizedQuery && (
            <div className="ui-panel absolute top-[calc(100%+0.5rem)] right-0 left-0 z-30 overflow-hidden">
              {matches.length > 0 ? (
                <ul aria-label="Search results" className="py-1">
                  {matches.map((device) => (
                    <li key={device.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => onSearchSelect(device.id)}
                      >
                        <span className="font-semibold">{device.name}</span>
                        <span className="text-xs text-mute">{device.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-3 text-sm text-mute">No devices found.</p>
              )}
            </div>
          )}
        </form>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-mute">Status</p>
          <AppSelect
            ariaLabel="Status filter"
            value={statusFilter}
            options={statusOptions}
            onChange={onStatusFilterChange}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-mute">Device type</p>
          <AppSelect
            ariaLabel="Device type filter"
            value={typeFilter}
            options={typeOptions}
            onChange={onTypeFilterChange}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-mute">
            Canvas layout
          </p>
          <AppSelect
            ariaLabel="Graph layout"
            value={activeLayout}
            options={layoutOptions}
            onChange={onLayoutChange}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-mute">Dataset size</p>
          <AppSelect
            ariaLabel="Dataset size"
            value={datasetSize}
            options={datasetOptions}
            onChange={onDatasetSizeChange}
          />
        </div>
      </div>

      {(statusFilter !== 'all' || typeFilter !== 'all') && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-mute">
            Filters affect the graph and list.
          </p>
          <button
            className="text-xs font-bold text-mute hover:text-ink"
            type="button"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
