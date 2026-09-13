import { useEffect, useRef, useState } from 'react'
import { connectPwa, initialPwaState } from './pwa'

export function usePwa(isHome: boolean) {
  const [state, setState] = useState(initialPwaState)
  const connection = useRef<ReturnType<typeof connectPwa> | null>(null)
  const supported = 'serviceWorker' in navigator && window.isSecureContext

  useEffect(() => {
    if (!import.meta.env.PROD || !supported) return
    connection.current = connectPwa(setState)
    return () => connection.current?.dispose()
  }, [supported])

  useEffect(() => {
    if (isHome) void connection.current?.check()
  }, [isHome])

  return {
    ...state,
    enabled: import.meta.env.PROD,
    supported,
    applyUpdate() {
      if (isHome) connection.current?.applyUpdate()
    },
  }
}
