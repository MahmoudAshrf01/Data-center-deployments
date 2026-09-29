import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { normalizeGraph } from '@/domain/graph/normalizeGraph'
import { mockGraphSnapshot } from '@/mocks/fixtures/graph'
import { useGraphStore } from '@/store/graph.store'
import { useGraphViewStore } from '@/store/graph-view.store'

vi.mock('@/features/graph-explorer/GraphCanvas', () => ({
  GraphCanvas: () => <div aria-label="Data center device topology" />,
}))

describe('App', () => {
  beforeEach(() => {
    useGraphStore.setState({ graph: normalizeGraph(mockGraphSnapshot) })
    useGraphViewStore.setState({
      selectedDeviceId: null,
      searchQuery: '',
      statusFilter: 'all',
      typeFilter: 'all',
      activeLayout: 'dagre',
      focusRequest: null,
    })
  })

  it('shows validated fixture data and synchronizes list selection', async () => {
    const user = userEvent.setup()
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(
      screen.getByRole('heading', { name: 'Data center deployments' }),
    ).toBeInTheDocument()
    const serverButton = screen.getByRole('button', { name: 'Server 02' })
    await user.click(serverButton)

    expect(
      screen.getByRole('heading', { name: 'Server 02' }),
    ).toBeInTheDocument()
    expect(serverButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('searches for a device and opens its details', async () => {
    const user = userEvent.setup()
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    await user.type(
      screen.getByRole('searchbox', { name: 'Search devices' }),
      'storage',
    )
    const results = screen.getByRole('list', { name: 'Search results' })
    await user.click(
      within(results).getByRole('button', { name: /storage 01/i }),
    )

    expect(
      screen.getByRole('heading', { name: 'Storage 01' }),
    ).toBeInTheDocument()
  })

  it('filters the accessible device list by status', async () => {
    const user = userEvent.setup()
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    await user.click(screen.getByRole('combobox', { name: 'Status filter' }))
    await user.click(screen.getByRole('option', { name: 'Failed' }))

    expect(
      screen.getByRole('button', { name: 'Storage 01' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Server 01' }),
    ).not.toBeInTheDocument()
  })
})
