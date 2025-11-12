'use client'

import { useBCTPrice } from '@/hooks/useBCTPrice';
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

interface DashboardData {
  saldoBCT: number
  saldoBRL: number
  cotacaoBCT: {
    usd: number
    brl: number
    variation24h: number
  }
  cotacaoUSD: number
  ultimasTransacoes: Array<{
    id: string
    tipo: 'compra' | 'venda' | 'transferência'
    valor: number
    data: string
    status: 'concluído' | 'pendente' | 'falhou'
  }>
  portfolioImoveis: {
    valorTotal: number
    valorizacao: number
  }
}

export default function DashboardPage() {
  const { user, signOut } = useAuthContext()
  const price = useBCTPrice() // ✅ cotação dinâmica do token
  const [data, setData] = useState<DashboardData>({
    saldoBCT: 3240,
    saldoBRL: 1620.00,
    cotacaoBCT: {
      usd: 0.48,
      brl: 2.50,
      variation24h: 5.2
    },
    cotacaoUSD: 5.20,
    ultimasTransacoes: [
      {
        id: '1',
        tipo: 'compra',
        valor: 500,
        data: '2024-01-15T10:30:00Z',
        status: 'concluído'
      },
      {
        id: '2',
        tipo: 'venda',
        valor: 250,
        data: '2024-01-14T15:45:00Z',
        status: 'concluído'
      },
      {
        id: '3',
        tipo: 'compra',
        valor: 150,
        data: '2024-01-13T09:15:00Z',
        status: 'pendente'
      }
    ],
    portfolioImoveis: {
      valorTotal: 8750000,
      valorizacao: 32.0
    }
  })
  const [showBalance, setShowBalance] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const priceResponse = await fetch('/api/price')
      const priceData = await priceResponse.json()
      const usdResponse = await fetch('/api/usd')
      const usdData = await usdResponse.json()
      setData(prev => ({
        ...prev,
        cotacaoBCT: {
          usd: priceData.usd,
          brl: priceData.brl,
          variation24h: priceData.variation24h
        },
        cotacaoUSD: usdData.usdbrl,
        saldoBRL: prev.saldoBCT * priceData.brl
      }))
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluído': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'falhou': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case 'compra': return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case 'venda': return <ArrowUpRight className="w-4 h-4 text-blue-600" />
      default: return <ArrowUpRight className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">

      {/* HEADER DESKTOP */}
      <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2">Início</h1>
          <p className="text-[#111827]/60">
            Bem-vindo de volta, {user?.email?.split('@')[0]}!
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white mt-4 sm:mt-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* CARD DE COTAÇÃO DINÂMICA */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0C3D2E]">
              Cotação BCT/USD
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#12B76A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0C3D2E]">
              {price !== null && !isNaN(Number(price))
                ? `$${Number(price).toFixed(4)}`
                : 'Carregando...'}
            </div>
            <p className="text-xs text-[#111827]/60 mt-1">
              Preço em dólar (dados on-chain)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RESTANTE DO DASHBOARD */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Cotações e Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">Cotação USD/BRL</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#12B76A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C3D2E]">
                R$ {data.cotacaoUSD.toFixed(2)}
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">Dólar comercial</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">Valorização 24h</CardTitle>
              {data.cotacaoBCT.variation24h >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  data.cotacaoBCT.variation24h >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {data.cotacaoBCT.variation24h >= 0 ? '+' : ''}
                {data.cotacaoBCT.variation24h.toFixed(1)}%
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">Variação BCT</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}