import { useEffect, useRef } from 'react'

// A lightweight ambient background for the homepage hero: nodes drifting
// inside the canvas, linked by faint lines when they pass close together.
// Runs on plain 2D canvas instead of WebGL, so it never needs the ~800kB
// three.js dependency the old hero background pulled in.
export default function NeuralCanvas({ className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas.parentElement
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const NODE_COUNT = 46
    const LINK_DIST = 150

    let W = 0
    let H = 0
    let nodes = []
    let running = true
    let rafId = null
    let resizeTimer = null

    function size() {
      const rect = host.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function makeNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        violet: Math.random() > 0.6,
      }))
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(143, 208, 255, 0.5)'
      nodes.forEach((n) => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function frame() {
      if (!running) return
      ctx.clearRect(0, 0, W, H)

      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DIST) {
            const o = (1 - dist / LINK_DIST) * 0.35
            ctx.strokeStyle = `rgba(139, 123, 255, ${o})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach((n) => {
        ctx.fillStyle = n.violet ? 'rgba(139, 123, 255, 0.75)' : 'rgba(143, 208, 255, 0.85)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      })

      rafId = requestAnimationFrame(frame)
    }

    function handleVisibility() {
      running = !document.hidden
      if (running && !reduceMotion) rafId = requestAnimationFrame(frame)
    }

    function handleResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        size()
        makeNodes()
        if (reduceMotion) drawStatic()
      }, 150)
    }

    size()
    makeNodes()
    if (reduceMotion) {
      drawStatic()
    } else {
      rafId = requestAnimationFrame(frame)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('resize', handleResize)

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(resizeTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
