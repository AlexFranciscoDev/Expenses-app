import { useCallback, useEffect, useRef, useState } from 'react'

/** Runs an async loader whenever deps change. Keeps previous data while reloading. */
export function useAsync(loader, deps) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setLoading(true)
    return loader()
      .then((result) => {
        if (id !== requestId.current) return
        setData(result)
        setError(null)
      })
      .catch((e) => id === requestId.current && setError(e))
      .finally(() => id === requestId.current && setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, reload: run }
}
