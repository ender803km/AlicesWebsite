import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ERROR_MESSAGES = {
  invalid_state: "That login link expired — hit the button below to start over.",
  oauth_failed: "Discord couldn't complete the login. Give it another try.",
  access_denied: 'Login was cancelled.',
}

export default function Login() {
  const { loginUrl } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')

  return (
    <main className="page-section text-center">
      <div className="container" style={{ maxWidth: 480 }} data-aos="fade-up">
        <h1 className="display-5 fw-bold">Log in</h1>
        <p className="lead mb-4">
          Log in with Discord to see the servers you manage where A.L.I.C.E is installed.
        </p>
        {error && (
          <div className="alert alert-danger text-start" role="alert">
            {ERROR_MESSAGES[error] || 'Something went wrong logging in — please try again.'}
          </div>
        )}
        <a href={loginUrl} className="btn btn-primary btn-lg px-4">Login with Discord</a>
      </div>
    </main>
  )
}
