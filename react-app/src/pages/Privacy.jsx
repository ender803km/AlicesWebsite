export default function Privacy() {
  return (
    <main className="page-section">
      <div className="container" style={{ maxWidth: 800 }} data-aos="fade-up">
        <h1 className="display-5 fw-bold">Privacy Policy</h1>
        <p className="lead mb-4">
          We only store information necessary for the bot to function.
          Stored information may include:
        </p>
        <ul className="list-group list-group-flush mb-4">
          <li className="list-group-item">Discord User IDs</li>
          <li className="list-group-item">Server IDs</li>
          <li className="list-group-item">Channel IDs</li>
          <li className="list-group-item">Moderation logs</li>
          <li className="list-group-item">Economy balances</li>
        </ul>
        <p className="lead">We never sell or share user information.</p>
      </div>
    </main>
  )
}
