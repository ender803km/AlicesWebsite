export default function Contact() {
  return (
    <main className="page-section">
      <div className="container" style={{ maxWidth: 800 }} data-aos="fade-up">
        <h1 className="display-5 fw-bold">Contact</h1>
        <p className="lead mb-4">
          Have a question or need support? Reach out through any of the options below.
        </p>
        <div className="d-flex flex-column flex-sm-row gap-3 contact-links">
          <a href="https://discord.gg/Rtnrd5G38a" className="btn btn-outline-primary btn-lg" target="_blank" rel="noopener">
            Discord Support Server
          </a>
          <a href="https://github.com/ender803km" className="btn btn-outline-primary btn-lg" target="_blank" rel="noopener">
            GitHub
          </a>
          <a href="https://heylink.me/A.L.I.C.E_Bot/" className="btn btn-outline-primary btn-lg" target="_blank" rel="noopener">
            Discord Links
          </a>
        </div>
      </div>
    </main>
  )
}
