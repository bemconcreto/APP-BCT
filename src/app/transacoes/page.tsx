'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Transacao {
  id: string
  tipo: 'compra' | 'venda' | 'transferência'
  valor: number
  valorBRL: number
  data: string
  status: 'concluído' | 'pendente' | 'falhou'
  hash?: string
  metodo?: string
}

export default function TransacoesPage() {
  const { user } = useAuthContext()
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    {
      id: '1',
      tipo: 'compra',
      valor: 500,
      valorBRL: 1250.00,
      data: '2024-01-15T10:30:00Z',
      status: 'concluído',
      metodo: 'Cartão de Crédito',
      hash: '0x1234...abcd'
    },
    {
      id: '2',
      tipo: 'venda',
      valor: 250,
      valorBRL: 625.00,
      data: '2024-01-14T15:45:00Z',
      status: 'concluído',
      metodo: 'PIX',
      hash: '0x5678...efgh'
    },
    {
      id: '3',
      tipo: 'compra',
      valor: 150,
      valorBRL: 375.00,
      data: '2024-01-13T09:15:00Z',
      status: 'pendente',
      metodo: 'Cartão de Crédito'
    },
    {
      id: '4',
      tipo: 'venda',
      valor: 100,
      valorBRL: 250.00,
      data: '2024-01-12T14:20:00Z',
      status: 'concluído',
      metodo: 'PIX',
      hash: '0x9abc...ijkl'
    },
    {
      id: '5',
      tipo: 'compra',
      valor: 800,
      valorBRL: 2000.00,
      data: '2024-01-10T11:30:00Z',
      status: 'concluído',
      metodo: 'Cartão de Crédito',
      hash: '0xdef0...mnop'
    },
    {
      id: '6',
      tipo: 'transferência',
      valor: 50,
      valorBRL: 125.00,
      data: '2024-01-08T16:45:00Z',
      status: 'falhou',
      metodo: 'Blockchain'
    }
  ])
  const [filtro, setFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluído':
        return 'Concluído'
      case 'pendente':
        return 'Pendente'
      case 'falhou':
        return 'Falhou'
      default:
        return status
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

  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchesFiltro = transacao.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
                         transacao.status.toLowerCase().includes(filtro.toLowerCase()) ||
                         transacao.metodo?.toLowerCase().includes(filtro.toLowerCase())
    
    const matchesTipo = tipoFiltro === 'todos' || transacao.tipo === tipoFiltro
    
    return matchesFiltro && matchesTipo
  })

  const totalCompras = transacoes
    .filter(t => t.tipo === 'compra' && t.status === 'concluído')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalVendas = transacoes
    .filter(t => t.tipo === 'venda' && t.status === 'concluído')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldoLiquido = totalCompras - totalVendas

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/inicio">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2 flex items-center">
              <History className="w-8 h-8 mr-3" />
              Histórico de Transações
            </h1>
            <p className="text-[#111827]/60">
              Acompanhe todas as suas movimentações BCT
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">
                Total Comprado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{totalCompras.toLocaleString('pt-BR')} BCT
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">
                Tokens adquiridos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#0C3D2E]">
                Total Vendido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                -{totalVendas.toLocaleString('pt-BR')} BCT
              </div>
              <p className="text-xs text-[#111827]/60 mt-1">
                Tokens vendidos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#12B76A] to-[#0F9A5A] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Saldo Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {saldoLiquido >= 0 ? '+' : ''}{saldoLiquido.toLocaleString('pt-BR')} BCT
              </div>
              <p className="text-xs opacity-90 mt-1">
                Posição atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-[#0C3D2E] flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por tipo, status ou método..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={tipoFiltro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setTipoFiltro('todos')}
                  className={tipoFiltro === 'todos' ? 'bg-[#12B76A] hover:bg-[#0F9A5A]' : ''}
                >
                  Todos
                </Button>
                <Button
                  variant={tipoFiltro === 'compra' ? 'default' : 'outline'}
                  onClick={() => setTipoFiltro('compra')}
                  className={tipoFiltro === 'compra' ? 'bg-[#12B76A] hover:bg-[#0F9A5A]' : ''}
                >
                  Compras
                </Button>
                <Button
                  variant={tipoFiltro === 'venda' ? 'default' : 'outline'}
                  onClick={() => setTipoFiltro('venda')}
                  className={tipoFiltro === 'venda' ? 'bg-[#12B76A] hover:bg-[#0F9A5A]' : ''}
                >
                  Vendas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#0C3D2E]">
                Transações ({transacoesFiltradas.length})
              </CardTitle>
              <CardDescription>
                Suas movimentações mais recentes
              </CardDescription>
            </div>
            <Button variant="outline" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transacoesFiltradas.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#F3F4F6]/50 hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transacao.tipo)}
                    <div>
                      <p className="font-medium text-[#0C3D2E] capitalize">
                        {transacao.tipo} BCT
                      </p>
                      <p className="text-sm text-[#111827]/60">
                        {formatDate(transacao.data)}
                      </p>
                      {transacao.metodo && (
                        <p className="text-xs text-[#111827]/50">
                          via {transacao.metodo}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-[#0C3D2E]">
                      {transacao.tipo === 'compra' ? '+' : '-'}{transacao.valor} BCT
                    </p>
                    <p className="text-sm text-[#111827]/60">
                      {formatCurrency(transacao.valorBRL)}
                    </p>
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <Badge className={getStatusColor(transacao.status)}>
                        {getStatusText(transacao.status)}
                      </Badge>
                    </div>
                    {transacao.hash && (
                      <p className="text-xs text-[#111827]/40 mt-1">
                        {transacao.hash}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {transacoesFiltradas.length === 0 && (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-[#111827]/30 mx-auto mb-4" />
                  <p className="text-[#111827]/60">
                    Nenhuma transação encontrada com os filtros aplicados.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#0C3D2E] mb-4">
              Sobre o Histórico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#111827]/70">
              <div>
                <p className="mb-2">• Histórico completo de todas as operações</p>
                <p className="mb-2">• Dados atualizados em tempo real</p>
                <p className="mb-2">• Exportação disponível em PDF/CSV</p>
              </div>
              <div>
                <p className="mb-2">• Transações verificadas na blockchain</p>
                <p className="mb-2">• Suporte para auditoria e declaração</p>
                <p className="mb-2">• Backup automático e seguro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}