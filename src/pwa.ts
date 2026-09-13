export interface PwaState {
  offlineReady: boolean
  updateReady: boolean
  updating: boolean
  error: string | null
}

export const initialPwaState: PwaState = {
  offlineReady: false,
  updateReady: false,
  updating: false,
  error: null,
}

const downloadError =
  'Offline download incomplete. Reconnect and reload to try again.'

function isCached(worker: ServiceWorker): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    const finish = (ready: boolean) => {
      clearTimeout(timeout)
      channel.port1.close()
      resolve(ready)
    }
    const timeout = setTimeout(() => finish(false), 5000)
    channel.port1.onmessage = (event) => finish(event.data?.ready === true)
    try {
      worker.postMessage({ type: 'CHECK_OFFLINE' }, [channel.port2])
    } catch {
      finish(false)
    }
  })
}

// Native registration lets only the tab that requested an update reload.
// Another open tab can keep its Study or Practice session in memory.
export function connectPwa(
  publish: (state: PwaState) => void,
  reload = () => window.location.reload(),
) {
  let state = { ...initialPwaState }
  let registration: ServiceWorkerRegistration | undefined
  let requestedWorker: ServiceWorker | undefined
  let stopped = false
  let lastUpdateCheck = 0
  let updateTimeout: ReturnType<typeof setTimeout> | undefined
  const cleanups: Array<() => void> = []
  const watched = new Set<ServiceWorker>()

  function set(patch: Partial<PwaState>) {
    state = { ...state, ...patch }
    if (!stopped) publish(state)
  }

  async function refreshStatus() {
    const active = registration?.active
    const ready = active?.state === 'activated' ? await isCached(active) : false
    if (stopped) return
    set({
      offlineReady: ready,
      updateReady: Boolean(registration?.waiting),
      error: ready ? null : active ? downloadError : state.error,
    })
  }

  function watch(worker: ServiceWorker | null) {
    if (!worker || watched.has(worker)) return
    watched.add(worker)
    const changed = () => {
      if (stopped) return
      if (worker.state === 'activated') {
        if (worker === requestedWorker) {
          clearTimeout(updateTimeout)
          reload()
        } else {
          void refreshStatus()
        }
      } else if (worker.state === 'installed') {
        void refreshStatus()
      } else if (worker.state === 'redundant') {
        set({
          updating: false,
          error: state.offlineReady
            ? 'Update could not download. Your offline copy is still available.'
            : downloadError,
        })
      }
    }
    worker.addEventListener('statechange', changed)
    cleanups.push(() => worker.removeEventListener('statechange', changed))
  }

  async function check() {
    if (!registration || stopped) return
    void refreshStatus()
    if (!navigator.onLine || Date.now() - lastUpdateCheck < 60_000) return
    lastUpdateCheck = Date.now()
    try {
      await registration.update()
    } catch {
      // Being offline must not replace a working cached copy with an error.
    }
  }

  const visible = () => {
    if (document.visibilityState === 'visible') void check()
  }
  window.addEventListener('online', check)
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', visible)
  const interval = setInterval(check, 60 * 60 * 1000)

  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
    .then((registered) => {
      if (stopped) return
      registration = registered
      const found = () => watch(registered.installing)
      registered.addEventListener('updatefound', found)
      cleanups.push(() => registered.removeEventListener('updatefound', found))
      watch(registered.installing)
      watch(registered.waiting)
      watch(registered.active)
      void refreshStatus()
    })
    .catch(() => set({ error: downloadError }))

  return {
    check,
    applyUpdate() {
      if (stopped || state.updating || !registration?.waiting) return
      requestedWorker = registration.waiting
      watch(requestedWorker)
      set({ updating: true, error: null })
      updateTimeout = setTimeout(() => {
        requestedWorker = undefined
        set({
          updating: false,
          error: 'Update could not finish. Please try again.',
        })
      }, 15_000)
      requestedWorker.postMessage({ type: 'SKIP_WAITING' })
    },
    dispose() {
      stopped = true
      clearTimeout(updateTimeout)
      clearInterval(interval)
      cleanups.forEach((cleanup) => cleanup())
      window.removeEventListener('online', check)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', visible)
    },
  }
}
