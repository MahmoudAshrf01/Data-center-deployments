import { create } from 'zustand'

import type {
  DeviceId,
  DeviceStatus,
  DeviceType,
} from '@/entities/device/device.schema'

export type GraphLayout =
  'grid' | 'circle' | 'concentric' | 'breadthfirst' | 'cose' | 'dagre' | 'avsdf'

interface FocusRequest {
  readonly deviceId: DeviceId
  readonly sequence: number
}

interface GraphViewStore {
  readonly selectedDeviceId: DeviceId | null
  readonly searchQuery: string
  readonly statusFilter: DeviceStatus | 'all'
  readonly typeFilter: DeviceType | 'all'
  readonly activeLayout: GraphLayout
  readonly focusRequest: FocusRequest | null
  readonly selectDevice: (deviceId: DeviceId | null) => void
  readonly focusDevice: (deviceId: DeviceId) => void
  readonly setSearchQuery: (query: string) => void
  readonly setStatusFilter: (status: DeviceStatus | 'all') => void
  readonly setTypeFilter: (type: DeviceType | 'all') => void
  readonly setActiveLayout: (layout: GraphLayout) => void
  readonly clearFilters: () => void
}

export const useGraphViewStore = create<GraphViewStore>((set, get) => ({
  selectedDeviceId: null,
  searchQuery: '',
  statusFilter: 'all',
  typeFilter: 'all',
  activeLayout: 'cose',
  focusRequest: null,
  selectDevice: (selectedDeviceId) => set({ selectedDeviceId }),
  focusDevice: (deviceId) =>
    set({
      selectedDeviceId: deviceId,
      focusRequest: {
        deviceId,
        sequence: (get().focusRequest?.sequence ?? 0) + 1,
      },
    }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setActiveLayout: (activeLayout) => set({ activeLayout }),
  clearFilters: () => set({ statusFilter: 'all', typeFilter: 'all' }),
}))
