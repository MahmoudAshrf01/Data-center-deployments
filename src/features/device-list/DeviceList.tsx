import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft'
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight'
import { useMemo, useState } from 'react'

import type { Device, DeviceId } from '@/entities/device/device.schema'
import { AppSelect } from '@/shared/ui/AppSelect'
import { StatusTag } from '@/shared/ui/StatusTag'

const pageSizeOptions = [15, 30, 60, 120].map((size) => ({
  value: String(size),
  label: `${size} rows`,
}))
const deviceTypeOrder = { server: 0, storage: 1, switch: 2, rack: 3 } as const
const viewOptions = [
  { value: 'table', label: 'Table view' },
  { value: 'cards', label: 'Card view' },
] as const

interface DeviceListProps {
  readonly devices: readonly Device[]
  readonly selectedDeviceId: DeviceId | null
  readonly onSelectDevice: (deviceId: DeviceId) => void
}

export function DeviceList({
  devices,
  selectedDeviceId,
  onSelectDevice,
}: DeviceListProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState('15')
  const [viewMode, setViewMode] =
    useState<(typeof viewOptions)[number]['value']>('table')
  const rowsPerPage = Number(pageSize)
  const pageCount = Math.max(1, Math.ceil(devices.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const orderedDevices = useMemo(
    () =>
      [...devices].sort(
        (left, right) =>
          deviceTypeOrder[left.type] - deviceTypeOrder[right.type] ||
          left.name.localeCompare(right.name),
      ),
    [devices],
  )
  const visibleDevices = useMemo(
    () =>
      orderedDevices.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
      ),
    [currentPage, orderedDevices, rowsPerPage],
  )

  const firstVisible =
    devices.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const lastVisible = Math.min(currentPage * rowsPerPage, devices.length)

  return (
    <section
      className="ui-card overflow-hidden"
      aria-labelledby="device-list-title"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 id="device-list-title" className="font-bold">
            Devices
          </h2>
          <p className="text-xs text-mute">Accessible graph alternative</p>
        </div>
        <span className="ui-tag ui-tag-neutral">{devices.length} loaded</span>
      </div>
      <div className="flex items-center justify-end gap-2 border-b border-line px-5 py-3">
        <span className="text-xs font-semibold text-mute">View</span>
        <div className="w-36">
          <AppSelect
            ariaLabel="Device view"
            value={viewMode}
            options={viewOptions}
            onChange={setViewMode}
          />
        </div>
      </div>
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[18%]" />
              <col className="w-[27%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-muted text-xs text-mute">
              <tr>
                <th className="px-5 py-3 font-semibold">Device</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {visibleDevices.map((device) => {
                const isSelected = device.id === selectedDeviceId
                return (
                  <tr
                    key={device.id}
                    className={`border-t border-line first:border-t-0 ${
                      isSelected ? 'bg-brand-50' : 'hover:bg-muted/60'
                    }`}
                  >
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        className="text-left font-bold hover:underline"
                        aria-pressed={isSelected}
                        onClick={() => onSelectDevice(device.id)}
                      >
                        {device.name}
                      </button>
                      <p className="text-xs text-mute">{device.id}</p>
                    </td>
                    <td className="px-5 py-3 capitalize">{device.type}</td>
                    <td className="px-5 py-3">
                      <StatusTag status={device.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {device.progress}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDevices.map((device) => {
            const isSelected = device.id === selectedDeviceId
            return (
              <button
                key={device.id}
                type="button"
                className={`rounded-control border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-line bg-card hover:bg-muted/60'
                }`}
                aria-pressed={isSelected}
                onClick={() => onSelectDevice(device.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{device.name}</p>
                    <p className="mt-0.5 truncate text-xs text-mute">
                      {device.id}
                    </p>
                  </div>
                  <StatusTag status={device.status} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-mute">
                  <span className="capitalize">{device.type}</span>
                  <span className="font-bold tabular-nums">
                    {device.progress}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-mute">
            Showing {firstVisible}–{lastVisible} of {devices.length} devices
          </p>
          <div className="w-28">
            <AppSelect
              ariaLabel="Rows per page"
              value={pageSize}
              options={pageSizeOptions}
              onChange={(value) => {
                setPageSize(value)
                setPage(1)
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ui-button ui-button-secondary min-h-8 px-2.5"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span className="sr-only">Previous</span>
          </button>
          <span className="min-w-16 text-center text-xs font-semibold text-mute">
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            className="ui-button ui-button-secondary min-h-8 px-2.5"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
          >
            <CaretRightIcon size={16} weight="bold" aria-hidden="true" />
            <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
    </section>
  )
}
