import { http, HttpResponse } from 'msw'

import { mockGraphSnapshot } from '@/mocks/fixtures/graph'

export const handlers = [
  http.get('/api/graph', () => HttpResponse.json(mockGraphSnapshot)),
]
