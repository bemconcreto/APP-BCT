'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError('Email ou senha incorretos')
    } else {
      router.push('/inicio')
    }
    
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    const { error } = await signInWithGoogle()
    
    if (error) {
      setError('Erro ao fazer login com Google')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-[#12B76A] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">BCT</span>
            </div>
            <span className="text-[#0C3D2E] font-bold text-2xl font-inter">
              Bem Concreto Token
            </span>
          </div>
          <p className="text-[#111827]/60 text-sm">
            Faça login para acessar sua carteira
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-[#0C3D2E] text-2xl font-bold">
              Entrar
            </CardTitle>
            <CardDescription className="text-[#111827]/60">
              Acesse sua conta BCT
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0C3D2E] font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#111827]/40" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 border-[#12B76A]/20 focus:border-[#12B76A] focus:ring-[#12B76A]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0C3D2E] font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#111827]/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 pr-10 border-[#12B76A]/20 focus:border-[#12B76A] focus:ring-[#12B76A]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#111827]/40 hover:text-[#12B76A]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#12B76A] hover:bg-[#0F9A5A] text-white font-medium py-3 transition-all duration-200"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#111827]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#111827]/60">Ou continue com</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full border-[#111827]/20 hover:bg-[#F3F4F6] py-3"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>

            <div className="text-center space-y-2">
              <Link
                href="/recuperar-senha"
                className="text-[#12B76A] hover:text-[#0F9A5A] text-sm font-medium"
              >
                Esqueceu sua senha?
              </Link>
              <p className="text-[#111827]/60 text-sm">
                Não tem uma conta?{' '}
                <Link
                  href="/cadastro"
                  className="text-[#12B76A] hover:text-[#0F9A5A] font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}