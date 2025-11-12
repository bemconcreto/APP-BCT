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
        // 🔹 1. Tenta obter sessão Supabase (login via Google)
        const { data } = await supabase.auth.getSession()
        const sessionUser = data?.session?.user

        if (sessionUser) {
          setUser(sessionUser)
          setLoading(false)
          return
        }

        // 🔹 2. Caso não exista sessão, tenta buscar Web3Auth no localStorage
        const storedUser = localStorage.getItem('web3auth_user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)

          // Cria um objeto "fake" de User compatível com o Supabase
          const fakeUser = {
            id: parsed.sub || 'web3auth',
            email: parsed.email || 'web3auth@bemconcreto.com',
            role: 'authenticated',
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: parsed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User

          setUser(fakeUser)
        }

        setLoading(false)
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Escuta eventos de login/logout do Supabase
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
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