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
      // Buscar cotação do BCT
      const priceResponse = await fetch('/api/price')
      const priceData = await priceResponse.json()
      
      // Buscar cotação USD/BRL
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluído':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'falhou':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case 'venda':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0C3D2E] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#12B76A] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">BCT</span>
          </div>
          <span className="text-white font-bold text-lg">Bem Concreto Token</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-white" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-[#0C3D2E] p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-white font-bold text-lg">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white mb-6">
                <User className="w-5 h-5" />
                <div>
                  <p className="font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="text-sm opacity-75">{user?.email}</p>
                </div>
              </div>
              
              <div className="text-white mb-6">
                <p className="text-sm opacity-75">Saldo atual</p>
                <p className="text-lg font-bold">{data.saldoBCT.toLocaleString('pt-BR')} BCT</p>
              </div>
              
              <div className="space-y-2">
                <Link href="/dashboard" className="flex items-center space-x-3 text-white p-2 rounded">
                  <TrendingUp className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/imoveis" className="flex items-center space-x-3 text-white p-2 rounded">
                  <Building2 className="w-5 h-5" />
                  <span>Imóveis</span>
                </Link>
                <Link href="/comprar" className="flex items-center space-x-3 text-white p-2 rounded">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Carteira</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-3 text-white p-2 rounded w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Desktop */}
        <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2">
              Dashboard
            </h1>
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

        {/* Saldo Principal - Estilo Nubank */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#12B76A] to-[#0F9A5A] text-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Saldo disponível</p>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold">
                    {showBalance ? `${data.saldoBCT.toLocaleString('pt-BR')} BCT` : '••••••'}
                  </span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="opacity-90 hover:opacity-100"
                  >
                    {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-lg opacity-90 mt-1">
                  ≈ {showBalance ? formatCurrency(data.saldoBRL) : '••••••'}
                </p>
              </div>
              <Wallet className="h-12 w-12 opacity-75" />
            </div>
            
            <div className="flex space-x-3">
              <Link href="/comprar" className="flex-1">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                  Comprar BCT
                </Button>
              </Link>
              <Link href="/vender" className="flex-1">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                  Vender BCT
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Cotações e Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">
                Cotação BCT/USD
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#12B76A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C3D2E]">
                ${data.cotacaoBCT.usd.toFixed(2)}
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">
                Preço em dólar
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">
                Cotação USD/BRL
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#12B76A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C3D2E]">
                R$ {data.cotacaoUSD.toFixed(2)}
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">
                Dólar comercial
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">
                Valorização 24h
              </CardTitle>
              {data.cotacaoBCT.variation24h >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.cotacaoBCT.variation24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.cotacaoBCT.variation24h >= 0 ? '+' : ''}{data.cotacaoBCT.variation24h.toFixed(1)}%
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">
                Variação BCT
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Menu de Ações Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/comprar">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#12B76A]/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-[#12B76A]" />
                </div>
                <h3 className="font-medium text-[#0C3D2E]">Comprar BCT</h3>
                <p className="text-xs text-[#111827]/60 mt-1">Cartão ou PIX</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vender">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#12B76A]/20 transition-colors">
                  <ArrowUpRight className="h-6 w-6 text-[#12B76A]" />
                </div>
                <h3 className="font-medium text-[#0C3D2E]">Vender BCT</h3>
                <p className="text-xs text-[#111827]/60 mt-1">Receba via PIX</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transacoes">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#12B76A]/20 transition-colors">
                  <Receipt className="h-6 w-6 text-[#12B76A]" />
                </div>
                <h3 className="font-medium text-[#0C3D2E]">Extrato</h3>
                <p className="text-xs text-[#111827]/60 mt-1">Histórico completo</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/imoveis">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#12B76A]/20 transition-colors">
                  <Building2 className="h-6 w-6 text-[#12B76A]" />
                </div>
                <h3 className="font-medium text-[#0C3D2E]">Imóveis</h3>
                <p className="text-xs text-[#111827]/60 mt-1">Portfólio tokenizado</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Resumo Imóveis */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#0C3D2E] mb-1">
                  Portfólio Imobiliário
                </h3>
                <p className="text-[#111827]/70">
                  Seu portfólio imobiliário tokenizado valorizou +{data.portfolioImoveis.valorizacao}% nos últimos 12 meses.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#12B76A]">
                  {formatCurrency(data.portfolioImoveis.valorTotal)}
                </p>
                <p className="text-sm text-[#111827]/60">Valor atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Transações */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0C3D2E] flex items-center">
              <History className="w-5 h-5 mr-2" />
              Últimas Transações
            </CardTitle>
            <CardDescription>
              Suas transações mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ultimasTransacoes.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#F3F4F6]/50 hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transacao.tipo)}
                    <div>
                      <p className="font-medium text-[#0C3D2E] capitalize">
                        {transacao.tipo} BCT
                      </p>
                      <p className="text-sm text-[#111827]/60">
                        {formatDate(transacao.data)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#0C3D2E]">
                      {transacao.tipo === 'compra' ? '+' : '-'}{transacao.valor} BCT
                    </p>
                    <Badge className={getStatusColor(transacao.status)}>
                      {transacao.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/transacoes">
                <Button variant="outline" className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white">
                  Ver Todas as Transações
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Inferior Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center space-y-1">
            <TrendingUp className="w-5 h-5 text-[#12B76A]" />
            <span className="text-xs text-[#12B76A]">Home</span>
          </Link>
          <Link href="/comprar" className="flex flex-col items-center space-y-1">
            <Wallet className="w-5 h-5 text-[#111827]/60" />
            <span className="text-xs text-[#111827]/60">Carteira</span>
          </Link>
          <Link href="/transacoes" className="flex flex-col items-center space-y-1">
            <History className="w-5 h-5 text-[#111827]/60" />
            <span className="text-xs text-[#111827]/60">Extrato</span>
          </Link>
          <Link href="/imoveis" className="flex flex-col items-center space-y-1">
            <Building2 className="w-5 h-5 text-[#111827]/60" />
            <span className="text-xs text-[#111827]/60">Imóveis</span>
          </Link>
        </div>
      </div>
    </div>
  )
}