import { useEffect, useState } from 'react'

const query = '(pointer: coarse)'

/** True on touch devices (phones/tablets), where we show the in-app keypad */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setCoarse(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return coarse
}
