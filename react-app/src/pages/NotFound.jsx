import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page-section text-center">
      <div className="container" data-aos="zoom-in">
        <h1 className="display-1 fw-bold" style={{ color: '#4ea5ff' }}>404</h1>
        <p className="lead mb-4">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg px-4">Back to Home</Link>
      </div>
    </main>
  )
}
