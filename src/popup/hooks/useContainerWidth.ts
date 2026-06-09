import { useEffect, useRef, useState } from 'react'
import { POPUP_WIDTH } from '@/popup/design/constants'

export function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(POPUP_WIDTH)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setWidth(el.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
