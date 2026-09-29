import { useEffect } from 'react'

import { useGraphStore } from '@/store/graph.store'

const UPDATE_INTERVAL_MS = 1_500
const PROGRESS_INCREMENT = 7

export function useDeploymentSimulation() {
  const advanceDeployments = useGraphStore((state) => state.advanceDeployments)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceDeployments(PROGRESS_INCREMENT)
    }, UPDATE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [advanceDeployments])
}
