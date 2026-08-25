import { useReveal } from '../hooks/useReveal'
import '../styles/homepage.css'

export default function Contact() {
  const [ref, visible] = useReveal({ threshold: 0.1 })

  return (
    <main id="main-content" className="home-page home-content">
      <div className="home-mesh" aria-hidden="true" />
      <div className="home-blueprint" aria-hidden="true" />
      <div className="home-spotlight" aria-hidden="true" />
      <div className="home-grain" aria-hidden="true" />
      <div ref={ref} className={`home-wrap home-reveal ${visible ? 'is-visible' : ''}`} style={{ maxWidth: 760 }}>
        <div className="home-page-eyebrow-row">
          <div className="home-eyebrow"><span className="home-dot" aria-hidden="true" /> Get in touch</div>
        </div>
        <h1>Contact</h1>
        <p className="home-lede">
          Have a question or need support? Reach out through any of the options below.
        </p>
        <div className="home-cta-row">
          <a href="https://discord.gg/Rtnrd5G38a" className="home-btn home-btn-outline" target="_blank" rel="noopener">
            Discord Support Server
          </a>
          <a href="https://github.com/ender803km" className="home-btn home-btn-outline" target="_blank" rel="noopener">
            GitHub
          </a>
          <a href="https://heylink.me/A.L.I.C.E_Bot/" className="home-btn home-btn-outline" target="_blank" rel="noopener">
            Discord Links
          </a>
        </div>
      </div>
    </main>
  )
}
