'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#12B76A]"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-[#12B76A] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">BCT</span>
              </div>
              <span className="text-[#0C3D2E] font-bold text-4xl font-inter">
                Bem Concreto Token
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#0C3D2E] mb-6">
              O Futuro dos
              <span className="text-[#12B76A]"> Investimentos</span>
            </h1>
            <p className="text-xl text-[#111827]/70 mb-8 max-w-3xl mx-auto">
              Compre e venda tokens BCT de forma simples e segura. 
              PIX instantâneo, cartão de crédito e tecnologia blockchain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/cadastro">
              <Button 
                size="lg" 
                className="bg-[#12B76A] hover:bg-[#0F9A5A] text-white px-8 py-4 text-lg font-medium"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg"
                className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white px-8 py-4 text-lg font-medium"
              >
                Fazer Login
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#12B76A] mb-2">R$ 2,50</div>
              <div className="text-[#111827]/60">Cotação Atual BCT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#12B76A] mb-2">+5.2%</div>
              <div className="text-[#111827]/60">Valorização 24h</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#12B76A] mb-2">1M+</div>
              <div className="text-[#111827]/60">Tokens Negociados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0C3D2E] mb-4">
              Por que escolher BCT?
            </h2>
            <p className="text-xl text-[#111827]/70 max-w-2xl mx-auto">
              Tecnologia avançada, segurança máxima e facilidade de uso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-[#12B76A]" />
                </div>
                <CardTitle className="text-[#0C3D2E]">PIX Instantâneo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Compre e venda tokens com PIX. Transações em segundos, 24/7.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-[#12B76A]" />
                </div>
                <CardTitle className="text-[#0C3D2E]">Segurança Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Blockchain Polygon, criptografia avançada e auditoria contínua.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-[#12B76A]" />
                </div>
                <CardTitle className="text-[#0C3D2E]">Global</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Acesse de qualquer lugar do mundo. Sem fronteiras, sem limites.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-[#12B76A]" />
                </div>
                <CardTitle className="text-[#0C3D2E]">Rentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Token com potencial de valorização e liquidez garantida.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F3F4F6] to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0C3D2E] mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-[#111827]/70 max-w-2xl mx-auto">
              Em 3 passos simples você já está investindo em BCT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#12B76A] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-[#0C3D2E] mb-4">Cadastre-se</h3>
              <p className="text-[#111827]/70">
                Crie sua conta em menos de 2 minutos. Verificação automática e segura.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#12B76A] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-[#0C3D2E] mb-4">Deposite</h3>
              <p className="text-[#111827]/70">
                Adicione fundos via PIX instantâneo ou cartão de crédito.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#12B76A] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-[#0C3D2E] mb-4">Invista</h3>
              <p className="text-[#111827]/70">
                Compre tokens BCT e acompanhe sua carteira em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0C3D2E]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a milhares de investidores que já confiam no BCT
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/cadastro">
              <Button 
                size="lg" 
                className="bg-[#12B76A] hover:bg-[#0F9A5A] text-white px-8 py-4 text-lg font-medium"
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-center space-x-3 text-white/90">
              <CheckCircle className="h-5 w-5 text-[#12B76A] flex-shrink-0" />
              <span>Sem taxas de cadastro</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <CheckCircle className="h-5 w-5 text-[#12B76A] flex-shrink-0" />
              <span>Suporte 24/7</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <CheckCircle className="h-5 w-5 text-[#12B76A] flex-shrink-0" />
              <span>100% seguro</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
