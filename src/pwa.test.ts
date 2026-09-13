import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectPwa } from './pwa'

class Worker extends EventTarget {
  state: ServiceWorkerState = 'activated'
  cached = true
  respond = true
  postMessage = vi.fn((message: { type: string }, ports?: MessagePort[]) => {
    if (message.type === 'CHECK_OFFLINE' && this.respond) {
      ports?.[0].postMessage({ ready: this.cached })
    }
  })
  change(state: ServiceWorkerState) {
    this.state = state
    this.dispatchEvent(new Event('statechange'))
  }
}

class Registration extends EventTarget {
  active: Worker | null = new Worker()
  waiting: Worker | null = null
  installing: Worker | null = null
  update = vi.fn().mockResolvedValue(undefined)
}

// A paired message port keeps cache checks asynchronous, like the browser.
class Channel {
  port1 = {
    onmessage: null as null | ((event: { data: unknown }) => void),
    close: vi.fn(),
  }
  port2 = {
    postMessage: (data: unknown) =>
      queueMicrotask(() => this.port1.onmessage?.({ data })),
  }
}

let registration: Registration
let register: ReturnType<typeof vi.fn>
const connections: Array<ReturnType<typeof connectPwa>> = []

function connect() {
  const publish = vi.fn()
  const reload = vi.fn()
  const connection = connectPwa(publish, reload)
  connections.push(connection)
  return { ...connection, publish, reload }
}

beforeEach(() => {
  registration = new Registration()
  register = vi.fn().mockResolvedValue(registration)
  vi.stubGlobal('navigator', { serviceWorker: { register }, onLine: true })
  vi.stubGlobal('MessageChannel', Channel)
})

afterEach(() => {
  connections.splice(0).forEach((connection) => connection.dispose())
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('offline cache and safe updates', () => {
  it('checks the cache on a returning visit instead of assuming an active worker is ready', async () => {
    registration.active!.cached = false
    const app = connect()
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({
          offlineReady: false,
          error: expect.any(String),
        }),
      ),
    )
    registration.active!.cached = true
    await app.check()
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ offlineReady: true, error: null }),
      ),
    )
    expect(register).toHaveBeenCalledWith('/sw.js', { updateViaCache: 'none' })
  })

  it('waits for a first installation and a successful cache check', async () => {
    registration.active = null
    const worker = new Worker()
    worker.state = 'installing'
    registration.installing = worker
    const app = connect()
    await vi.waitFor(() => expect(app.publish).toHaveBeenCalled())
    expect(app.publish).toHaveBeenLastCalledWith(
      expect.objectContaining({ offlineReady: false }),
    )
    registration.active = worker
    registration.installing = null
    worker.change('activated')
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ offlineReady: true }),
      ),
    )
    expect(app.reload).not.toHaveBeenCalled()
  })

  it('keeps an installed update waiting until requested, then reloads only the requesting tab', async () => {
    const next = new Worker()
    next.state = 'installed'
    registration.waiting = next
    const homeTab = connect()
    const studyTab = connect()
    await vi.waitFor(() =>
      expect(homeTab.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ updateReady: true }),
      ),
    )
    expect(next.postMessage).not.toHaveBeenCalled()
    homeTab.applyUpdate()
    homeTab.applyUpdate()
    expect(next.postMessage).toHaveBeenCalledExactlyOnceWith({
      type: 'SKIP_WAITING',
    })
    expect(homeTab.reload).not.toHaveBeenCalled()
    registration.active = next
    registration.waiting = null
    next.change('activated')
    expect(homeTab.reload).toHaveBeenCalledOnce()
    expect(studyTab.reload).not.toHaveBeenCalled()
    await vi.waitFor(() =>
      expect(studyTab.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ updateReady: false, offlineReady: true }),
      ),
    )
  })

  it('detects an update downloaded after the app is already open', async () => {
    const app = connect()
    await vi.waitFor(() => expect(app.publish).toHaveBeenCalled())
    const next = new Worker()
    next.state = 'installing'
    registration.installing = next
    registration.dispatchEvent(new Event('updatefound'))
    registration.waiting = next
    next.change('installed')
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ updateReady: true }),
      ),
    )
    expect(app.reload).not.toHaveBeenCalled()
  })

  it('keeps the previous offline copy usable when an update download fails', async () => {
    const app = connect()
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({ offlineReady: true }),
      ),
    )
    const next = new Worker()
    registration.installing = next
    registration.dispatchEvent(new Event('updatefound'))
    next.change('redundant')
    expect(app.publish).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offlineReady: true,
        updating: false,
        error: expect.stringContaining('still available'),
      }),
    )
    expect(app.reload).not.toHaveBeenCalled()
    registration.update.mockRejectedValue(new Error('offline'))
    await app.check()
    expect(app.reload).not.toHaveBeenCalled()
  })

  it('reports registration failure without claiming offline readiness', async () => {
    register.mockRejectedValue(new Error('download failed'))
    const app = connect()
    await vi.waitFor(() =>
      expect(app.publish).toHaveBeenLastCalledWith(
        expect.objectContaining({
          offlineReady: false,
          error: expect.any(String),
        }),
      ),
    )
  })

  it('does not claim readiness when a worker fails to answer the cache check', async () => {
    vi.useFakeTimers()
    registration.active!.respond = false
    const app = connect()
    await vi.advanceTimersByTimeAsync(5001)
    expect(app.publish).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offlineReady: false,
        error: expect.any(String),
      }),
    )
  })

  it('does not reload a disposed page when a previously requested update activates', async () => {
    const next = new Worker()
    next.state = 'installed'
    registration.waiting = next
    const app = connect()
    await vi.waitFor(() => expect(app.publish).toHaveBeenCalled())
    app.applyUpdate()
    app.dispose()
    next.change('activated')
    expect(app.reload).not.toHaveBeenCalled()
  })
})
