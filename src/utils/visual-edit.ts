import { getVisualEditScript, getVisualEditScriptRaw } from './visual-edit-script'

export { getVisualEditScript }

export function initVisualEdit() {
  // Inside iframe we must actually run the editor code so it can
  // attach listeners and interact with the DOM.
  if (window.self !== window.top) {
    const script = document.createElement('script')
    script.id = 'webild-visual-edit'
    script.textContent = getVisualEditScriptRaw()
    document.head.appendChild(script)
    return
  }

  // Expose helper for parent tools/dev.
  if (import.meta.env.DEV) {
    window.__getVisualEditScript = getVisualEditScript
  }
}
