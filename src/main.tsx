import React from 'react'
import { createRoot } from 'react-dom/client'
import IntakeFunnel from './components/IntakeFunnel'
import css from './index.css?inline'

// Inject styles into the document (try head first, fall back to body or script parent)
function injectStyles() {
  if (document.getElementById('intake-funnel-styles')) return
  const style = document.createElement('style')
  style.id = 'intake-funnel-styles'
  style.textContent = css
  const target = document.head || document.querySelector('head') || document.body || document.documentElement
  target.appendChild(style)
}
injectStyles()

interface MountOptions {
  webhookUrl?: string
  onSubmit?: (data: Record<string, unknown>) => void
}

// Mount function for manual initialization
function mount(selector: string | HTMLElement, options: MountOptions = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector

  if (!container) {
    console.error(`IntakeFunnel: Container "${selector}" not found`)
    return
  }

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <IntakeFunnel
        webhookUrl={options.webhookUrl}
        onSubmit={options.onSubmit}
      />
    </React.StrictMode>
  )

  return {
    unmount: () => root.unmount()
  }
}

// Auto-mount if default container exists
function autoMount() {
  const defaultContainer = document.getElementById('intake-funnel')
  if (defaultContainer) {
    // Check for data attributes for config
    const webhookUrl = defaultContainer.dataset.webhookUrl
    mount(defaultContainer, { webhookUrl })
  }
}

// Run auto-mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount)
} else {
  autoMount()
}

// Export for manual usage
;(window as unknown as Record<string, unknown>).IntakeFunnel = { mount }

export { mount }
export default { mount }
