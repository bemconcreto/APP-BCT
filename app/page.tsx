'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/inicio')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#8D6E63]" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8F9] to-white">
      {/* HERO */}
      <header className="pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* central logo */}
          <div className="flex justify-center mt-[20px]">
            <Image src="/logo-bct2.png" alt="Logo BCT" width={180} height={180} priority />
          </div>

          <h1 className="mt-8 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#8D6E63] leading-tight">
            O FUTURO DOS INVESTIMENTOS IMOBILIÁRIOS<br />NA PALMA DA SUA MÃO
          </h1>

          <p className="mt-6 text-gray-700 text-base md:text-lg max-w-2xl mx-auto">
            Você está prestes a acessar o melhor do mercado imobiliário — chega de burocracia, falta de liquidez e acessos restritos!!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <button className="px-8 py-3 rounded-lg bg-[#8D6E63] hover:bg-[#72594F] text-white font-semibold">
                Começar Agora
              </button>
            </Link>

            <Link href="/login">
              <button className="px-8 py-3 rounded-lg border border-[#8D6E63] text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition">
                Fazer Login
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* WHY CHOOSE */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#8D6E63]">Por que escolher BCT?</h2>
          <p className="mt-3 text-gray-700 max-w-2xl mx-auto">Tecnologia, segurança e liquidez — fracionamento de ativos imobiliários para investidores de todos os tamanhos.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-[#0C3D2E]">PIX Instantâneo</h3>
              <p className="mt-2 text-gray-600">Transfira e invista em segundos.</p>
            </div>
            <div className="p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-[#0C3D2E]">Segurança</h3>
              <p className="mt-2 text-gray-600">Blockchain + auditoria contínua.</p>
            </div>
            <div className="p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-[#0C3D2E]">Acessível</h3>
              <p className="mt-2 text-gray-600">Investimento fracionado para todos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-12 bg-gradient-to-br from-[#F7F8F9] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#8D6E63]">Como Funciona</h2>
          <p className="mt-2 text-gray-700">Em 3 passos simples você começa</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#8D6E63]/10 flex items-center justify-center mx-auto">1</div>
              <h4 className="mt-4 font-semibold">Cadastre-se</h4>
              <p className="mt-2 text-gray-600">Crie sua conta em minutos.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#8D6E63]/10 flex items-center justify-center mx-auto">2</div>
              <h4 className="mt-4 font-semibold">Deposite</h4>
              <p className="mt-2 text-gray-600">PIX ou cartão.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#8D6E63]/10 flex items-center justify-center mx-auto">3</div>
              <h4 className="mt-4 font-semibold">Invista</h4>
              <p className="mt-2 text-gray-600">Compre tokens e acompanhe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12 bg-[#101820] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold">Pronto para começar?</h3>
          <p className="mt-3 text-white/80">Junte-se a milhares de investidores que confiam no BCT.</p>

          <div className="mt-6 flex justify-center gap-4">
            <Link href="/cadastro">
              <button className="px-6 py-3 bg-[#8D6E63] hover:bg-[#72594F] rounded-lg font-semibold">Criar Conta Grátis</button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-3 border border-white/30 rounded-lg">Fazer Login</button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bem Concreto Token
      </footer>
    </div>
  )
}