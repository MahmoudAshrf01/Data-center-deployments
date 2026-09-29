import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import '@/styles/index.css'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return
  }

  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

async function bootstrap() {
  await enableMocking()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Application root element was not found')
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  )
}

void bootstrap()
