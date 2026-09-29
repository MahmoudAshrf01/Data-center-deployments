import { describe, expect, it } from 'vitest'

import { calculateDeploymentSummary } from '@/domain/graph/calculateDeploymentSummary'
import { mockGraphSnapshot } from '@/mocks/fixtures/graph'

describe('calculateDeploymentSummary', () => {
  it('calculates counts and average progress', () => {
    const summary = calculateDeploymentSummary(mockGraphSnapshot.devices)

    expect(summary.total).toBe(1000)
    expect(
      Object.values(summary.counts).reduce((total, count) => total + count, 0),
    ).toBe(1000)
    expect(summary.overallProgress).toBeGreaterThan(0)
    expect(summary.overallProgress).toBeLessThan(100)
  })
})
