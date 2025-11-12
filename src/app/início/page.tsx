'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  History,
  RefreshCw,
  Eye,
  EyeOff,
  ShoppingCart,
  Building2,
  CreditCard,
  Receipt,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

import { useBCTPrice } from '@/hooks/useBCTPrice'

export default function DashboardPage() {
  const { user, signOut } = useAuthContext()

  // 🔥 Aqui pegamos o preço REAL vindo do hook
  const priceUSD = useBCTPrice()
  const usdToBRL = 5.20
  const priceBRL = priceUSD ? (priceUSD * usdToBRL) : null

  const [showBalance, setShowBalance] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const saldoBCT = 3240

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-[#0C3D2E] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#12B76A] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">BCT</span>
          </div>
          <span className="text-white font-bold text-lg">Bem Concreto Token</span>
        </div>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* MENU MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-[#0C3D2E] p-6">
            <button className="text-white mb-6" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-4">
              <Link href="/início" className="text-white flex items-center space-x-2 text-lg">
                <TrendingUp /> <span>Início</span>
              </Link>
              <Link href="/imoveis" className="text-white flex items-center space-x-2 text-lg">
                <Building2 /> <span>Imóveis</span>
              </Link>
              <Link href="/comprar" className="text-white flex items-center space-x-2 text-lg">
                <ShoppingCart /> <span>Comprar</span>
              </Link>
              <Link href="/vender" className="text-white flex items-center space-x-2 text-lg">
                <ArrowUpRight /> <span>Vender</span>
              </Link>
              <Link href="/extrato" className="text-white flex items-center space-x-2 text-lg">
                <History /> <span>Extrato</span>
              </Link>
              <button onClick={signOut} className="text-white flex items-center space-x-2 text-lg">
                <LogOut /> <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER DESKTOP */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0C3D2E]">Início</h1>
          <Button className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>

        {/* CARD PRINCIPAL — SALDO */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#12B76A] to-[#0F9A5A] text-white mb-8">
          <CardContent className="p-6">
            <p className="text-sm opacity-90">Saldo disponível</p>

            <div className="flex items-center space-x-3 mt-1">
              <span className="text-3xl font-bold">
                {showBalance ? `${saldoBCT} BCT` : '•••••'}
              </span>

              <button onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye /> : <EyeOff />}
              </button>
            </div>

            <p className="text-lg opacity-90 mt-1">
              {priceBRL && showBalance
                ? formatCurrency(saldoBCT * priceBRL)
                : '••••••'}
            </p>

            <div className="flex space-x-3 mt-4">
              <Link href="/comprar">
                <Button className="bg-white/20 text-white">Comprar BCT</Button>
              </Link>
              <Link href="/vender">
                <Button className="bg-white/20 text-white">Vender BCT</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CARDS DE COTAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* COTAÇÃO USD */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cotação BCT/USD</CardTitle>
              <DollarSign className="text-[#12B76A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {priceUSD ? `$${priceUSD.toFixed(4)}` : 'Carregando...'}
              </div>
            </CardContent>
          </Card>

          {/* COTAÇÃO BRL */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cotação BCT/BRL</CardTitle>
              <TrendingUp className="text-[#12B76A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {priceBRL ? formatCurrency(priceBRL) : 'Carregando...'}
              </div>
            </CardContent>
          </Card>

          {/* VARIAÇÃO (FAKE) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Variação 24h</CardTitle>
              <TrendingUp className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +5.2%
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}