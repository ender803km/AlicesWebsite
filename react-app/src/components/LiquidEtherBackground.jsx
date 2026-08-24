import { useEffect, useRef } from 'react'
import { createLiquidEther } from '../lib/liquid-ether'

// WebGL fluid background used behind the homepage hero. Skips itself
// entirely if the visitor has requested reduced motion.
export default function LiquidEtherBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!container || prefersReducedMotion) return undefined

    const controller = createLiquidEther(container, {
      colors: ['#4ea5ff', '#7cbcff', '#1d2f47'],
      mouseForce: 19,
      cursorSize: 40,
      isViscous: false,
      viscous: 30,
      iterationsViscous: 44,
      iterationsPoisson: 32,
      resolution: 0.5,
      isBounce: false,
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6,
    })

    return () => controller.destroy()
  }, [])

  return <div className="site-hero-bg" ref={containerRef} aria-hidden="true" />
}
