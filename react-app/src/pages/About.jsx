import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

export default function About() {
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 760 }}>
        <h1>About A.L.I.C.E</h1>
        <p className="home-lede">
          A.L.I.C.E is a Discord management bot designed to make moderation,
          automation, and community engagement effortless. Built using Discord.js
          and Node.js, A.L.I.C.E combines modern moderation tools, logging,
          statistics, economy systems, and future AI-powered features into one
          platform.
        </p>
      </div>
    </main>
  )
}
