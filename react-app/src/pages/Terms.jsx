import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

export default function Terms() {
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 760 }}>
        <div className="home-page-eyebrow-row">
          <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Legal</div>
        </div>
        <h1>Terms of Service</h1>
        <p className="home-lede">
          Using A.L.I.C.E means you agree to follow Discord&rsquo;s Terms of Service.
          Do not abuse, exploit, or intentionally interfere with the bot.
          The bot is provided &ldquo;as is&rdquo; without warranty.
          Features may change without notice.
        </p>
      </div>
    </main>
  )
}
