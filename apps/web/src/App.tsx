import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AuthPage } from './components/AuthPage'
import { MainPage } from './components/MainPage'
import { supabase } from './lib/supabaseClient'

const AUTH_PATH = '/auth'
const HOME_PATH = '/'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [path, setPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : HOME_PATH))
  const navigate = useCallback((to: string, { replace = false }: { replace?: boolean } = {}) => {
    if (typeof window === 'undefined') return

    if (replace) {
      window.history.replaceState(null, '', to)
    } else {
      window.history.pushState(null, '', to)
    }

    setPath(to)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      setSessionInitialized(true)
      return
    }

    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return

        setSession(data.session)
        setSessionInitialized(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionInitialized(true)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!sessionInitialized) return

    if (path !== AUTH_PATH && path !== HOME_PATH) {
      navigate(session ? HOME_PATH : AUTH_PATH, { replace: true })
      return
    }

    if (session && path === AUTH_PATH) {
      navigate(HOME_PATH, { replace: true })
    }

    if (!session && path !== AUTH_PATH) {
      navigate(AUTH_PATH, { replace: true })
    }
  }, [navigate, path, session, sessionInitialized])

  if (!sessionInitialized) {
    return null
  }

  if (path === AUTH_PATH || !session) {
    return <AuthPage />
  }

  return <MainPage session={session} />
}

export default App
