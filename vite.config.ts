/* eslint-disable @typescript-eslint/no-explicit-any -- untyped babel visitor */
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import * as fs from 'fs'

// In-sandbox bridge for Bob-AI's post-commit render check.
//
// On every HMR update (and on first mount) the iframed app POSTs a JSON
// payload to `/__webild/render-status` describing whether the page actually
// rendered (`{ok:true, rootChildren, bodyTextLen}`) or failed
// (`{ok:false, reason, error, stack, ...}`). This middleware is the dev-only
// receiver: it writes the latest payload to `/tmp/webild-render-status-<port>.json`
// inside the sandbox filesystem.
//
// Bob-AI does NOT receive these POSTs directly — it reads the file from the
// sandbox via the E2B SDK after each commit. This avoids needing a public
// callback endpoint and keeps the probe a no-op on production deploys (the
// app is never iframed there, so reportRenderStatus short-circuits).
//
// `apply: 'serve'` keeps this out of `vite build`. Endpoint paths intentionally
// short-circuit before any 404/SPA handler kicks in.
function webildRenderStatusPlugin(): Plugin {
  return {
    name: 'webild-render-status',
    apply: 'serve',
    configureServer(server) {
      const port = server.config.server?.port ?? 3000
      const statusFile = `/tmp/webild-render-status-${port}.json`
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/__webild/render-status')) return next()
        try {
          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer) => {
              chunks.push(chunk)
              // hard cap to avoid unbounded memory if a probe goes haywire
              if (chunks.reduce((n, c) => n + c.length, 0) > 64 * 1024) {
                res.statusCode = 413
                res.end('payload too large')
                req.destroy()
              }
            })
            req.on('end', () => {
              try {
                const body = Buffer.concat(chunks).toString('utf8').trim() || '{}'
                const incoming = JSON.parse(body) as { ok?: boolean }
                // Preserve ok:false against ok:true overwrites. The probe
                // emits multiple POSTs per HMR cycle: a section-level
                // boundary fires synchronously when its child throws (with
                // ok:false), and the App-level useRenderProbe fires ~1.5s
                // later checking body text length (with ok:true if text is
                // present — and a section-error placeholder DOES have
                // visible text). Without this guard, the late ok:true
                // would overwrite the early ok:false, and Bob-AI's
                // post-commit poll would see "everything fine" while a
                // section is actually broken. ok:false ALWAYS overwrites
                // (later failure replaces earlier failure with fresher
                // info); ok:true only overwrites if existing payload is
                // also ok:true or absent. DELETE clears the file
                // regardless — that's how Bob-AI resets state per commit.
                let shouldWrite = true
                if (incoming.ok !== false) {
                  try {
                    const existingRaw = fs.readFileSync(statusFile, 'utf8')
                    const existing = JSON.parse(existingRaw) as { ok?: boolean }
                    if (existing.ok === false) shouldWrite = false
                  } catch {
                    // file missing or unreadable — go ahead and write
                  }
                }
                if (shouldWrite) {
                  fs.writeFileSync(statusFile, body, 'utf8')
                }
                res.statusCode = 204
                res.end()
              } catch (err) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'text/plain')
                res.end(String((err as Error)?.message || err))
              }
            })
            req.on('error', () => {
              if (!res.headersSent) {
                res.statusCode = 500
                res.end()
              }
            })
            return
          }
          if (req.method === 'GET') {
            try {
              const content = fs.readFileSync(statusFile, 'utf8')
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(content)
            } catch {
              res.statusCode = 404
              res.end()
            }
            return
          }
          if (req.method === 'DELETE') {
            try {
              fs.unlinkSync(statusFile)
            } catch {
              // already absent
            }
            res.statusCode = 204
            res.end()
            return
          }
          res.statusCode = 405
          res.end()
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 500
            res.end(String((err as Error)?.message || err))
          }
        }
      })
    },
  }
}

// Babel plugin (dev/serve only) — stamp every intrinsic JSX element (and
// motion.<tag>) with `data-webild-source="<relpath>:<line>:<col>"`, where
// line/col is the element's ORIGINAL source position (babel keeps original loc
// even after inserting the attribute, so every element gets its own true
// position, and the backend — which parses the untransformed committed source —
// resolves the SAME position). This is the stable anchor the visual editor
// forwards so edits apply by exact source location instead of text matching.
// col is emitted 1-based to match the backend's TS resolver (character + 1).
// Only under `command === 'serve'`: the published static build stays clean.
function webildSourceAnchorBabel(root: string) {
  return function ({ types: t }: { types: any }) {
    return {
      name: 'webild-source-anchor',
      visitor: {
        JSXOpeningElement(nodePath: any, state: any) {
          const node = nodePath.node
          const name = node.name
          const isIntrinsic = name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name)
          const isMotion =
            name.type === 'JSXMemberExpression' && name.object?.name === 'motion'
          if (!isIntrinsic && !isMotion) return
          if (
            node.attributes.some(
              (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'data-webild-source',
            )
          )
            return
          const loc = node.name.loc || node.loc
          if (!loc?.start) return
          const filename: string =
            state.filename || (state.file && state.file.opts && state.file.opts.filename) || ''
          if (!filename || filename.includes('node_modules')) return
          if (!/\.(tsx|jsx)$/.test(filename)) return
          const rel = path.relative(root, filename).split(path.sep).join('/')
          const anchor = `${rel}:${loc.start.line}:${loc.start.column + 1}`
          node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier('data-webild-source'), t.stringLiteral(anchor)),
          )
        },
      },
    }
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: command === 'serve' ? [webildSourceAnchorBabel(__dirname)] : [],
      },
    } as Parameters<typeof react>[0]),
    tailwindcss(),
    webildRenderStatusPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // CRITICAL for the e2b shared pool: forbid Vite's default behaviour of
    // auto-picking another port on EADDRINUSE. The pool maps each port to a
    // specific projectSlug; if Vite for project A silently lands on the slot
    // belonging to project B, /webild-ready.json on the e2b host responds
    // with B's project id and the frontend sanity check fails (slugMismatch),
    // or worse, the iframe loads B's preview instead of A's. Better to crash
    // loudly so the outer while-loop + stop-sentinel can clean up.
    strictPort: true,
    // E2B exposes each port on `<port>-<sandboxId>.sandbox.webild.io`. Vite 8's
    // leading-dot wildcard (`.sandbox.webild.io`) refuses some patterns like
    // `<port>-<sandboxId>.sandbox.webild.io` with 403. These are dev-only
    // sandboxes — host check has no security value, so disable it entirely.
    allowedHosts: true,
    hmr: {
      // Browser connects via the same e2b-proxied https host on port 443,
      // but the dev server itself listens on raw `port`. Without this Vite
      // tells the client to open `wss://localhost:3000` and HMR fails.
      clientPort: 443,
      protocol: 'wss',
      // Suppress Vite's default red full-screen error overlay inside the
      // sandbox iframe. The iframe is what the END user sees in the Webild
      // editor — they should never see a stack trace or `Failed to resolve
      // import` panel from Vite internals. When a transient broken state
      // lands (e.g. an edit that introduces a typo), the Bob-AI auto-fix
      // loop catches the build error and pushes a corrected commit within
      // seconds; until then the iframe simply renders nothing (or the
      // previous successful build's content if HMR can't apply the bad
      // patch). The frontend has its own loader UI around the iframe; the
      // raw Vite overlay only adds noise.
      overlay: false,
    },
  },
}))
