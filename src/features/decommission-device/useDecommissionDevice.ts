import { useEffect, useRef } from 'react'

import type { DeviceId } from '@/entities/device/device.schema'
import { useGraphStore, type GraphMutationResult } from '@/store/graph.store'

const DECOMMISSION_DURATION_MS = 2_500

export function useDecommissionDevice() {
  const beginDecommission = useGraphStore((state) => state.beginDecommission)
  const completeDecommission = useGraphStore(
    (state) => state.completeDecommission,
  )
  const timeoutsRef = useRef(new Set<number>())

  useEffect(
    () => () => {
      for (const timeoutId of timeoutsRef.current) {
        window.clearTimeout(timeoutId)
      }
    },
    [],
  )

  function decommission(
    deviceId: DeviceId,
    onComplete?: () => void,
  ): GraphMutationResult {
    const result = beginDecommission(deviceId)
    if (!result.ok) return result

    const timeoutId = window.setTimeout(() => {
      completeDecommission(deviceId)
      onComplete?.()
      timeoutsRef.current.delete(timeoutId)
    }, DECOMMISSION_DURATION_MS)
    timeoutsRef.current.add(timeoutId)
    return result
  }

  return decommission
}
