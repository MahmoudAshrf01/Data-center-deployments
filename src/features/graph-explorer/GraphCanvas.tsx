import { ArrowsOutIcon } from '@phosphor-icons/react/dist/csr/ArrowsOut'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import cytoscape, {
  type Core,
  type ElementDefinition,
  type EventObjectNode,
} from 'cytoscape'
import avsdf from 'cytoscape-avsdf'
import dagre from 'cytoscape-dagre'
import { useEffect, useMemo, useRef } from 'react'

import type { Connection } from '@/entities/connection/connection.schema'
import type { Device, DeviceId } from '@/entities/device/device.schema'
import { graphStyles } from '@/features/graph-explorer/graph-adapter/graphStyles'
import type { GraphLayout } from '@/store/graph-view.store'
import { AppTooltip } from '@/shared/ui/AppTooltip'

cytoscape.use(dagre)
cytoscape.use(avsdf)

interface FocusRequest {
  readonly deviceId: DeviceId
  readonly sequence: number
}

interface GraphCanvasProps {
  readonly devices: readonly Device[]
  readonly connections: readonly Connection[]
  readonly selectedDeviceId: DeviceId | null
  readonly activeLayout: GraphLayout
  readonly focusRequest: FocusRequest | null
  readonly onSelectDevice: (deviceId: DeviceId | null) => void
}

function toElements(
  devices: readonly Device[],
  connections: readonly Connection[],
): ElementDefinition[] {
  return [
    ...devices.map((device) => ({
      group: 'nodes' as const,
      data: {
        id: device.id,
        name: device.name,
        status: device.status,
        type: device.type,
      },
    })),
    ...connections.map((connection) => ({
      group: 'edges' as const,
      data: {
        id: connection.id,
        source: connection.sourceId,
        target: connection.targetId,
        type: connection.type,
      },
    })),
  ]
}

function layoutOptions(name: GraphLayout, elementCount = 0) {
  const isLarge = elementCount > 250
  return {
    // Each mode has a distinct spatial model while remaining deterministic at scale.
    name: isLarge && name === 'cose' ? 'dagre' : name,
    animate: false,
    fit: true,
    padding: isLarge ? 40 : 64,
    minNodeSpacing: isLarge ? 2 : 8,
    spacingFactor: isLarge ? 0.8 : 1,
    equidistant: false,
    avoidOverlap: true,
    ...(name === 'dagre'
      ? {
          rankDir: 'LR',
          rankSep: isLarge ? 35 : 60,
          nodeSep: isLarge ? 12 : 24,
        }
      : {}),
    ...(name === 'grid'
      ? { rows: isLarge ? Math.ceil(Math.sqrt(elementCount)) : undefined }
      : {}),
    ...(name === 'avsdf' ? { nodeSeparation: isLarge ? 10 : 30 } : {}),
  }
}

export function GraphCanvas({
  devices,
  connections,
  selectedDeviceId,
  activeLayout,
  focusRequest,
  onSelectDevice,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<Core | null>(null)
  const initialElementsRef = useRef(toElements(devices, connections))
  const initialLayoutRef = useRef(activeLayout)
  const topologySignature = useMemo(
    () =>
      `${devices.map(({ id }) => id).join('|')}::${connections
        .map(({ id }) => id)
        .join('|')}`,
    [connections, devices],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const core = cytoscape({
      container,
      elements: initialElementsRef.current,
      style: graphStyles,
      layout: layoutOptions(
        initialLayoutRef.current,
        initialElementsRef.current.length,
      ),
      minZoom: 0.35,
      maxZoom: 2.5,
      pixelRatio: 1,
    })
    if (initialElementsRef.current.length > 250) {
      core.nodes().addClass('dense')
    }

    core.on('tap', 'node', (event: EventObjectNode) => {
      onSelectDevice(event.target.id())
    })
    core.on('tap', (event) => {
      if (event.target === core) onSelectDevice(null)
    })

    const resizeObserver = new ResizeObserver(() => {
      core.resize()
    })
    resizeObserver.observe(container)
    coreRef.current = core
    const animationFrame = requestAnimationFrame(() => {
      core.resize()
      core.fit(undefined, 64)
    })

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      core.destroy()
      coreRef.current = null
    }
  }, [onSelectDevice])

  useEffect(() => {
    const core = coreRef.current
    if (!core) return

    const nextDeviceIds = new Set(devices.map(({ id }) => id))
    const nextConnectionIds = new Set(connections.map(({ id }) => id))
    core.batch(() => {
      core
        .edges()
        .filter((edge) => !nextConnectionIds.has(edge.id()))
        .remove()
      core
        .nodes()
        .filter((node) => !nextDeviceIds.has(node.id()))
        .remove()

      for (const device of devices) {
        const existing = core.getElementById(device.id)
        const data = {
          id: device.id,
          name: device.name,
          status: device.status,
          type: device.type,
        }
        if (existing.empty()) core.add({ group: 'nodes', data })
        else existing.data(data)
      }

      if (devices.length > 250) core.nodes().addClass('dense')
      else {
        core.nodes().removeClass('dense')
      }

      for (const connection of connections) {
        const existing = core.getElementById(connection.id)
        const data = {
          id: connection.id,
          source: connection.sourceId,
          target: connection.targetId,
          type: connection.type,
        }
        if (existing.empty()) core.add({ group: 'edges', data })
        else existing.data(data)
      }
    })
  }, [connections, devices])

  useEffect(() => {
    const core = coreRef.current
    if (!core || core.nodes().empty()) return
    core.layout(layoutOptions(activeLayout, core.nodes().length)).run()
  }, [activeLayout, topologySignature])

  useEffect(() => {
    const core = coreRef.current
    if (!core) return

    core.batch(() => {
      const elements = core.elements()
      elements.removeClass('related dimmed')
      if (!selectedDeviceId) return

      const selectedNode = core.getElementById(selectedDeviceId)
      if (selectedNode.empty()) return
      const neighborhood = selectedNode.closedNeighborhood()
      neighborhood.addClass('related')
      elements.difference(neighborhood).addClass('dimmed')
    })
  }, [selectedDeviceId, topologySignature])

  useEffect(() => {
    const core = coreRef.current
    if (!core || !focusRequest) return
    const node = core.getElementById(focusRequest.deviceId)
    if (node.empty()) return
    core.animate({ center: { eles: node }, zoom: 1.35 }, { duration: 350 })
  }, [focusRequest, topologySignature])

  return (
    <section className="ui-card relative min-h-[34rem] overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0 min-h-[34rem]"
        role="img"
        aria-label={`Data center topology with ${devices.length} visible devices and ${connections.length} visible connections`}
      />
      {devices.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="rounded-control bg-card/90 px-4 py-3 text-sm font-semibold text-mute shadow-card">
            No devices match the active filters.
          </p>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <AppTooltip label="Zoom out">
          <button
            className="ui-button ui-button-secondary size-10 p-0 shadow-card"
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              const core = coreRef.current
              if (!core) return
              core.zoom(Math.max(core.zoom() / 1.25, 0.35))
            }}
          >
            <MinusIcon size={17} weight="bold" aria-hidden="true" />
          </button>
        </AppTooltip>
        <AppTooltip label="Zoom in">
          <button
            className="ui-button ui-button-secondary size-10 p-0 shadow-card"
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              const core = coreRef.current
              if (!core) return
              core.zoom(Math.min(core.zoom() * 1.25, 2.5))
            }}
          >
            <PlusIcon size={17} weight="bold" aria-hidden="true" />
          </button>
        </AppTooltip>
        <AppTooltip label="Fit all visible devices">
          <button
            className="ui-button ui-button-secondary shadow-card"
            type="button"
            onClick={() => coreRef.current?.fit(undefined, 64)}
          >
            <ArrowsOutIcon size={17} weight="bold" aria-hidden="true" />
            Fit graph
          </button>
        </AppTooltip>
      </div>
    </section>
  )
}
