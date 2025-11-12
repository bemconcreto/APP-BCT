'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ⚡ Garantia de segurança — se supabase não estiver definido, aborta
        if (!supabase) {
          console.warn('Supabase não configurado corretamente.')
          setLoading(false)
          return
        }

        // 🔹 1. Verifica se há sessão no Supabase
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          return
        }

        // 🔹 2. Caso não tenha, tenta pegar info do Web3Auth (armazenada no localStorage)
        const storedUser = localStorage.getItem('web3auth_user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          setUser({
            id: parsed.id ?? 'web3auth_user',
            email: parsed.email ?? 'web3auth@bemconcreto.com',
            role: 'authenticated',
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: parsed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User)
        }

        setLoading(false)
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        setLoading(false)
      }
    }

    initAuth()

    // 🔹 Escuta eventos de login/logout no Supabase
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    }) ?? { data: { subscription: { unsubscribe: () => {} } } }

    return () => {
      listener.subscription?.unsubscribe?.()
    }
  }, [])

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      localStorage.removeItem('web3auth_user')
      window.location.href = 'https://app-bct.vercel.app'
    } catch (err) {
      console.error('Erro ao sair:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)