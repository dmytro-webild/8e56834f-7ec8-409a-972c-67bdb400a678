import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'
import { routes } from './routes'
import Layout from './components/Layout'

const pages = import.meta.glob('./pages/*.tsx')

function getPageComponent(pageFile: string) {
  const key = `./pages/${pageFile}.tsx`
  const loader = pages[key]
  if (!loader) return null
  return lazy(loader as () => Promise<{ default: React.ComponentType }>)
}

// ─── Render-state probe ────────────────────────────────────────────────────
// After every HMR (and on first mount) the iframe reports back to a Vite
// dev-only middleware whether the page actually rendered. Bob-AI reads the
// resulting file from inside the sandbox after each commit and uses it to
// detect "blank preview" / "React threw on mount" failures that escape the
// pre-commit gate (esbuild + tsc see only static errors). Sandbox-only —
// public deploys never iframe themselves so the probe stays silent.
const RENDER_STATUS_URL = '/__webild/render-status'
const RENDER_PROBE_DELAY_MS = 1500
const RENDER_PROBE_MIN_TEXT_LEN = 30

interface RenderStatusPayload {
  ok: boolean
  reason?: string
  error?: string
  stack?: string
  componentStack?: string
  filename?: string
  lineno?: number
  colno?: number
  rootChildren?: number
  bodyTextLen?: number
}

function reportRenderStatus(payload: RenderStatusPayload) {
  if (typeof window === 'undefined') return
  if (window.parent === window) return
  try {
    window.parent.postMessage(
      { type: 'webild-render-status', data: { ok: payload.ok, reason: payload.reason ?? null } },
      '*',
    )
  } catch {
    // ignore
  }
  try {
    fetch(RENDER_STATUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, t: Date.now() }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}

function probeRenderState() {
  if (typeof document === 'undefined') return
  const root = document.getElementById('root')
  const text = (document.body?.innerText || '').trim()
  if (!root || root.children.length === 0) {
    reportRenderStatus({
      ok: false,
      reason: 'empty_root',
      rootChildren: 0,
      bodyTextLen: text.length,
    })
    return
  }
  if (text.length < RENDER_PROBE_MIN_TEXT_LEN) {
    reportRenderStatus({
      ok: false,
      reason: 'blank_render',
      rootChildren: root.children.length,
      bodyTextLen: text.length,
    })
    return
  }
  reportRenderStatus({
    ok: true,
    rootChildren: root.children.length,
    bodyTextLen: text.length,
  })
}

declare global {
  interface Window {
    __webildRenderProbeInstalled__?: boolean
  }
}

if (typeof window !== 'undefined' && window.parent !== window && !window.__webildRenderProbeInstalled__) {
  window.__webildRenderProbeInstalled__ = true
  window.addEventListener('error', (e) => {
    reportRenderStatus({
      ok: false,
      reason: 'window_error',
      error: String(e?.message || (e as ErrorEvent)?.error?.message || 'unknown'),
      stack: String((e as ErrorEvent)?.error?.stack || '').slice(0, 4000),
      filename: String((e as ErrorEvent)?.filename || ''),
      lineno: (e as ErrorEvent)?.lineno,
      colno: (e as ErrorEvent)?.colno,
    })
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = (e as PromiseRejectionEvent).reason
    reportRenderStatus({
      ok: false,
      reason: 'unhandled_rejection',
      error: String(reason?.message || reason || 'unknown'),
      stack: String(reason?.stack || '').slice(0, 4000),
    })
  })
  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      setTimeout(probeRenderState, RENDER_PROBE_DELAY_MS)
    })
  }
}

class RenderErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    reportRenderStatus({
      ok: false,
      reason: 'react_error_boundary',
      error: String(error?.message || error || 'unknown'),
      stack: String(error?.stack || '').slice(0, 4000),
      componentStack: String(info?.componentStack || '').slice(0, 4000),
    })
  }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

function useRenderProbe() {
  useEffect(() => {
    const id = setTimeout(probeRenderState, RENDER_PROBE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])
}

// Selection bridge: Alt+click on a `[data-webild-section]` block posts the
// section name to the parent (Webild editor) so the next /edit request can
// be scoped surgically. Sandbox-only — the Webild editor is the parent;
// public visitors hitting the deployed site never trigger this.
function useWebildSelectionBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return
    const handler = (e: MouseEvent) => {
      if (!e.altKey) return
      let el = e.target as HTMLElement | null
      while (el && el !== document.body) {
        const name = el.getAttribute?.('data-webild-section')
        if (name) {
          e.preventDefault()
          window.parent.postMessage(
            { type: 'webild:section-click', sectionName: name },
            '*',
          )
          return
        }
        el = el.parentElement
      }
    }
    window.addEventListener('click', handler, true)
    return () => window.removeEventListener('click', handler, true)
  }, [])
}

// Open external links in a new tab. Generated content (and AI edits) frequently
// add raw `<a href="https://other-site">` anchors; without this they'd navigate
// the user's own site away in the same tab. A capture-phase delegate sets
// target/rel on any cross-origin http(s) anchor right before navigation, so the
// browser opens it in a new tab. Same-origin links and in-page anchors are left
// untouched; CTAs routed through useButtonClick already handle this themselves.
function useExternalLinksNewTab() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href]') as
        | HTMLAnchorElement
        | null
      if (!anchor || anchor.target === '_blank') return
      const raw = anchor.getAttribute('href') || ''
      if (!/^(https?:)?\/\//i.test(raw)) return
      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.origin !== window.location.origin) {
          anchor.target = '_blank'
          anchor.rel = 'noopener noreferrer'
        }
      } catch {
        // ignore malformed URLs
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}

function App() {
  useWebildSelectionBridge()
  useExternalLinksNewTab()
  useRenderProbe()
  return (
    <ReactLenis root options={{ naiveDimensions: true }}>
      <RenderErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-svh bg-background">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              {routes.map((route) => {
                const Page = getPageComponent(route.pageFile)
                if (!Page) return null
                return <Route key={route.path} path={route.path} element={<Page />} />
              })}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </RenderErrorBoundary>
    </ReactLenis>
  )
}

export default App
