import { DefaultLoadingManager } from 'three'

/**
 * Startup diagnostics — active only in development builds (`vite dev`).
 * `import.meta.env.DEV` is statically replaced at build time, so in
 * production these calls compile away and no instrumentation ships to users.
 */
const ENABLED = import.meta.env.DEV

export function logLoad(message: string): void {
  if (!ENABLED) return
  console.log(`[load ${Math.round(performance.now())}ms] ${message}`)
}

/**
 * Logs the start and end of every asset the preloader waits on. Wraps the
 * handlers that drei's useProgress has already installed on the default
 * manager, so the progress bar keeps working. No-op outside dev builds.
 */
export function installLoadingLogger(): void {
  if (!ENABLED) return
  const manager = DefaultLoadingManager

  const previousStart = manager.onStart
  manager.onStart = (url, loaded, total) => {
    logLoad(`start ${url} (${loaded + 1}/${total})`)
    previousStart?.(url, loaded, total)
  }

  const previousProgress = manager.onProgress
  manager.onProgress = (url, loaded, total) => {
    logLoad(`done ${url} (${loaded}/${total})`)
    previousProgress?.(url, loaded, total)
  }

  const previousError = manager.onError
  manager.onError = (url) => {
    logLoad(`ERROR loading ${url}`)
    previousError?.(url)
  }

  const previousLoad = manager.onLoad
  manager.onLoad = () => {
    logLoad('all assets loaded')
    previousLoad?.()
  }

  logLoad('asset logger installed')
}
