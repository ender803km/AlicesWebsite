import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AOS from 'aos'

import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Commands from './pages/Commands'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Resets scroll position and re-checks AOS's scroll-triggered animations
// whenever the route changes, since client-side navigation doesn't reload
// the page the way the old static site's links did.
function RouteEffects() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    AOS.refreshHard()
  }, [location.pathname])

  return null
}

export default function App() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true })
  }, [])

  return (
    <AuthProvider>
      <Navbar />
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}
