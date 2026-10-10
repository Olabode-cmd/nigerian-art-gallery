import { DefaultLoadingManager } from 'three'

/**
 * Temporary loading diagnostics — every log shares the "[load Xms]" prefix so
 * the console can be filtered and copied as one block. Remove after the
 * startup investigation.
 */
export function logLoad(message: string): void {
  console.log(`[load ${Math.round(performance.now())}ms] ${message}`)
}

/**
 * Logs the start and end of every asset the preloader waits on. Wraps the
 * handlers that drei's useProgress has already installed on the default
 * manager, so the progress bar keeps working.
 */
export function installLoadingLogger(): void {
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
