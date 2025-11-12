'use client'

import { useBCTPrice } from '@/hooks/useBCTPrice'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const price = useBCTPrice()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-extrabold text-[#0C3D2E] mb-4">
          Bem Concreto Token
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Compre e venda tokens BCT de forma simples e segura.<br />
          PIX instantâneo, cartão de crédito e tecnologia blockchain.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link href="/cadastro">
            <Button className="bg-[#12B76A] hover:bg-[#0C3D2E] text-white text-lg px-6 py-3 rounded-lg">
              Começar Agora →
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="text-[#0C3D2E] border-[#12B76A] text-lg px-6 py-3 rounded-lg">
              Fazer Login
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mt-8">
          <div>
            <h2 className="text-3xl font-bold text-[#12B76A]">
              {price !== null && !isNaN(Number(price))
                ? `R$ ${(Number(price) * 5.2).toFixed(2)}`
                : 'Carregando...'}
            </h2>
            <p className="text-gray-600 mt-2">Cotação Atual BCT</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-green-500">+5.2%</h2>
            <p className="text-gray-600 mt-2">Valorização 24h</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#0C3D2E]">1M+</h2>
            <p className="text-gray-600 mt-2">Tokens Negociados</p>
          </div>
        </div>
      </div>
    </div>
  )
}