import { useReveal } from '../hooks/useReveal'
import '../styles/system.css'

export default function Privacy() {
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-wrap-narrow home-reveal ${visible ? 'is-visible' : ''}`}>
        <span className="home-eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
        <p className="home-lede">
          We only store information necessary for the bot to function.
          Stored information may include:
        </p>
        <ul className="home-list">
          <li>Discord User IDs</li>
          <li>Server IDs</li>
          <li>Channel IDs</li>
          <li>Moderation logs</li>
          <li>Economy balances</li>
        </ul>
        <p>We never sell or share user information.</p>
      </div>
    </main>
  )
}
