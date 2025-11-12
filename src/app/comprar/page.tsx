'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  TrendingUp, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface PriceData {
  usd: number
  brl: number
  variation24h: number
}

export default function ComprarPage() {
  const { user } = useAuthContext()
  const [valorBRL, setValorBRL] = useState('')
  const [priceData, setPriceData] = useState<PriceData>({
    usd: 0.48,
    brl: 2.50,
    variation24h: 5.2
  })
  const [loading, setLoading] = useState(false)
  const [loadingPrice, setLoadingPrice] = useState(false)

  useEffect(() => {
    loadPrice()
  }, [])

  const loadPrice = async () => {
    setLoadingPrice(true)
    try {
      const response = await fetch('/api/price')
      const data = await response.json()
      setPriceData(data)
    } catch (error) {
      console.error('Erro ao carregar preço:', error)
    } finally {
      setLoadingPrice(false)
    }
  }

  const valorNumerico = parseFloat(valorBRL.replace(',', '.')) || 0
  const quantidadeBCT = valorNumerico / priceData.brl

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleComprarTransak = () => {
    setLoading(true)
    // Simular integração com Transak
    setTimeout(() => {
      setLoading(false)
      alert('Redirecionando para Transak...')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/início">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2">
              Comprar BCT
            </h1>
            <p className="text-[#111827]/60">
              Adquira tokens BCT com cartão de crédito ou PIX
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cotação Atual */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0C3D2E] flex items-center justify-between">
                <span>Cotação Atual</span>
                <Button
                  onClick={loadPrice}
                  disabled={loadingPrice}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPrice ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg">
                <div>
                  <p className="text-sm text-[#111827]/60">Preço BCT</p>
                  <p className="text-2xl font-bold text-[#0C3D2E]">
                    {formatCurrency(priceData.brl)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#111827]/60">Variação 24h</p>
                  <div className={`flex items-center ${priceData.variation24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="font-medium">
                      {priceData.variation24h >= 0 ? '+' : ''}{priceData.variation24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-[#12B76A]/10 rounded-lg">
                <p className="text-sm text-[#0C3D2E] mb-1">Preço em USD</p>
                <p className="text-lg font-bold text-[#12B76A]">
                  ${priceData.usd.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calculadora de Compra */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0C3D2E]">Calcular Compra</CardTitle>
              <CardDescription>
                Digite o valor em reais para ver quantos BCT você receberá
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="valor">Valor em BRL</Label>
                <Input
                  id="valor"
                  type="text"
                  placeholder="R$ 0,00"
                  value={valorBRL}
                  onChange={(e) => setValorBRL(e.target.value)}
                  className="text-lg"
                />
              </div>

              {valorNumerico > 0 && (
                <div className="p-4 bg-[#12B76A]/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#111827]/60">Você receberá:</span>
                    <span className="text-xl font-bold text-[#12B76A]">
                      {quantidadeBCT.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} BCT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#111827]/60">Preço unitário:</span>
                    <span className="text-sm font-medium text-[#0C3D2E]">
                      {formatCurrency(priceData.brl)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Métodos de Pagamento */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#0C3D2E] mb-6">
            Métodos de Pagamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cartão de Crédito - Transak */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E] flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Cartão de Crédito
                </CardTitle>
                <CardDescription>
                  Compra instantânea via Transak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Processamento instantâneo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Aceita Visa, Mastercard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Taxa: ~3-5%</span>
                </div>
                
                <Button 
                  onClick={handleComprarTransak}
                  disabled={loading || valorNumerico <= 0}
                  className="w-full bg-[#12B76A] hover:bg-[#0F9A5A] text-white"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Comprar com Cartão
                </Button>
              </CardContent>
            </Card>

            {/* PIX - Em breve */}
            <Card className="border-0 shadow-lg opacity-75">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E] flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  PIX
                  <Badge variant="secondary" className="ml-2">Em breve</Badge>
                </CardTitle>
                <CardDescription>
                  Transferência instantânea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Sem taxas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Disponível 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Processamento em minutos</span>
                </div>
                
                <Button 
                  disabled
                  className="w-full bg-gray-400 text-white cursor-not-allowed"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  PIX (Em breve)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informações Importantes */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#0C3D2E] mb-4">
              Informações Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#111827]/70">
              <div>
                <p className="mb-2">• Valor mínimo: R$ 50,00</p>
                <p className="mb-2">• Valor máximo: R$ 50.000,00 por transação</p>
                <p className="mb-2">• Tokens creditados automaticamente</p>
              </div>
              <div>
                <p className="mb-2">• Suporte 24/7 disponível</p>
                <p className="mb-2">• Transações seguras e auditadas</p>
                <p className="mb-2">• Histórico completo no dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}