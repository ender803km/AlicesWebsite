import { useCallback, useRef, useState } from 'react'

// Lightweight scroll-entry reveal used sitewide (replaced AOS). Toggles
// opacity/transform plus a blur resolve, and fires once via
// IntersectionObserver so it's cheap and doesn't touch `window.scroll`
// listeners.
//
// `ref` is a callback ref rather than a plain useRef on purpose: several
// pages (Dashboard, DevDashboard) render a "loading" branch first — one
// that doesn't attach this ref to anything — before swapping in the real
// content that does. A plain useRef + effect only wires up the observer
// once, on mount; if the ref's target didn't exist yet at that point, it
// would silently never attach and `visible` would stay false forever. A
// callback ref re-fires every time the DOM node it's attached to changes
// (including from null to a real element on a later render), so the
// observer always gets set up against whatever element ends up mounted.
export function useReveal({ threshold = 0.2, rootMargin = '0px 0px -10% 0px' } = {}) {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef(null)

  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
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
    observerRef.current = observer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin])

  return [ref, visible]
}
