import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getToken, clearToken, fetchMe, fetchGuilds, loginUrl } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [guilds, setGuilds] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setGuilds([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [me, guildData] = await Promise.all([fetchMe(), fetchGuilds()])
      setUser(me)
      setGuilds(guildData.guilds)
    } catch {
      setUser(null)
      setGuilds([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setGuilds([])
  }, [])

  return (
    <AuthContext.Provider value={{ user, guilds, loading, refresh, logout, loginUrl: loginUrl() }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
