import { useEffect, useRef, useState } from 'react'

// Lightweight scroll-entry reveal for the homepage showcase. AOS (used
// elsewhere on the site) only toggles opacity/transform — this adds a blur
// resolve too, and fires once via IntersectionObserver so it's cheap and
// doesn't touch `window.scroll` listeners.
export function useReveal({ threshold = 0.2, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, visible]
}
