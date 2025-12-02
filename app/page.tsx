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
    if (!loading && user) {
      router.push('/inicio')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#8D6E63]"></div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* CONTEÚDO CENTRAL */}
      <section className="pt-24 pb-16 px-6 text-center">

        {/* LOGO CENTRAL */}
        <div className="flex justify-center">
          <Image
            src="/logo-bct2.png"
            alt="Logo BCT"
            width={130}
            height={130}
            priority
          />
        </div>

        {/* TÍTULO */}
        <h1 className="mt-8 text-3xl font-bold text-[#8D6E63] leading-tight">
          O FUTURO DOS <br /> INVESTIMENTOS IMOBILIÁRIOS <br /> NA PALMA DA SUA MÃO
        </h1>

        {/* TEXTO */}
        <p className="mt-6 text-gray-700 text-lg max-w-md mx-auto">
          Você está prestes a acessar o melhor do mercado imobiliário,
          chega de burocracia, falta de liquidez e acessos restritos!!
        </p>

        {/* BOTÕES */}
        <div className="mt-10 flex flex-col gap-4 max-w-xs mx-auto">

          <Link href="/cadastro">
            <button
              className="w-full bg-[#8D6E63] hover:bg-[#72594F] text-white font-medium py-3 rounded-lg text-lg"
            >
              Começar Agora
            </button>
          </Link>

          <Link href="/login">
            <button
              className="w-full border border-[#8D6E63] text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white font-medium py-3 rounded-lg text-lg transition"
            >
              Fazer Login
            </button>
          </Link>

        </div>

      </section>

    </div>
  )
}