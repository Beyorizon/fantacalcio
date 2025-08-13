import { useEffect, useState } from 'react'

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return deferred
}


