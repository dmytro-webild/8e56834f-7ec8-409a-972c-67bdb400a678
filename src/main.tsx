import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import '@/components/kit/videoPlayback'
import App from './App.tsx'
import { initVisualEdit } from '@/utils/visual-edit'

initVisualEdit()

const THEME_VARS = [
  '--background',
  '--card',
  '--foreground',
  '--primary-cta',
  '--primary-cta-text',
  '--secondary-cta',
  '--secondary-cta-text',
  '--accent',
]

function readTheme() {
  const root = getComputedStyle(document.documentElement)
  const variables: Record<string, string> = {}
  for (const name of THEME_VARS) {
    const value = root.getPropertyValue(name).trim()
    if (value) variables[name] = value
  }
  const heading = document.querySelector('h1') ?? document.querySelector('h2') ?? document.body
  const cta = document.querySelector('a[class*="bg-primary"], button[class*="bg-primary"]')
  const radius = cta ? getComputedStyle(cta).borderRadius : ''
  return {
    variables,
    fonts: {
      heading: getComputedStyle(heading).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
    },
    fontHrefs: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map((link) => link.href)
      .filter((href) => href.includes('fonts.googleapis.com')),
    ...(radius ? { radius } : {}),
  }
}

function postTheme(target: MessageEventSource | null) {
  if (!target || window.parent === window) return
  ;(target as Window).postMessage({ type: 'webild-theme', data: readTheme() }, '*')
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window.parent || event.data?.type !== 'webild-get-theme') return
  postTheme(event.source)
})

document.fonts.ready.then(() => requestAnimationFrame(() => postTheme(window.parent)))

function Root() {
  const [replayKey, setReplayKey] = useState(0)
  const acked = useRef(0)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.type !== 'webild-replay-intro') return
      window.scrollTo(0, 0)
      setReplayKey((k) => k + 1)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (replayKey === acked.current) return
    acked.current = replayKey
    window.parent.postMessage({ type: 'webild-replay-intro-done' }, '*')
  }, [replayKey])

  return <App key={replayKey} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
