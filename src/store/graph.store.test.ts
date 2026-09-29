import { beforeEach, describe, expect, it } from 'vitest'

import { normalizeGraph } from '@/domain/graph/normalizeGraph'
import { mockGraphSnapshot } from '@/mocks/fixtures/graph'
import { useGraphStore } from '@/store/graph.store'

describe('graph store', () => {
  beforeEach(() => {
    useGraphStore.setState({ graph: normalizeGraph(mockGraphSnapshot) })
  })

  it('adds and removes a connection while keeping adjacency indexes consistent', () => {
    const result = useGraphStore.getState().addConnection({
      sourceId: 'server-01',
      targetId: 'storage-02',
      type: 'storage',
    })

    expect(result.ok).toBe(true)
    const graphAfterAdd = useGraphStore.getState().graph
    const addedConnection = Object.values(graphAfterAdd.connectionsById).find(
      (connection) =>
        connection.sourceId === 'server-01' &&
        connection.targetId === 'storage-02',
    )
    expect(addedConnection).toBeDefined()
    expect(graphAfterAdd.connectionIdsByDeviceId['server-01']).toContain(
      addedConnection?.id,
    )
    expect(graphAfterAdd.connectionIdsByDeviceId['storage-02']).toContain(
      addedConnection?.id,
    )

    const removeResult = useGraphStore
      .getState()
      .removeConnection(addedConnection?.id ?? '')
    expect(removeResult.ok).toBe(true)
    expect(
      useGraphStore.getState().graph.connectionsById[addedConnection?.id ?? ''],
    ).toBeUndefined()
  })

  it('rejects duplicate relationships', () => {
    const result = useGraphStore.getState().addConnection({
      sourceId: 'server-02',
      targetId: 'switch-01',
      type: 'network',
    })

    expect(result).toEqual({
      ok: false,
      message: 'That connection already exists.',
    })
  })

  it('completes deployment progress and changes status', () => {
    useGraphStore.getState().advanceDeployments(40)

    expect(
      useGraphStore.getState().graph.devicesById['server-02'],
    ).toMatchObject({ progress: 100, status: 'deployed' })
  })

  it('decommissions a device without leaving orphan connections', () => {
    const beginResult = useGraphStore.getState().beginDecommission('server-02')
    expect(beginResult.ok).toBe(true)
    expect(
      useGraphStore.getState().graph.devicesById['server-02']?.status,
    ).toBe('decommissioning')

    useGraphStore.getState().completeDecommission('server-02')
    const graph = useGraphStore.getState().graph
    expect(graph.devicesById['server-02']).toBeUndefined()
    expect(graph.connectionIdsByDeviceId['server-02']).toBeUndefined()
    expect(
      Object.values(graph.connectionsById).some(
        (connection) =>
          connection.sourceId === 'server-02' ||
          connection.targetId === 'server-02',
      ),
    ).toBe(false)
  })
})
