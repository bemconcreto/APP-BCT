'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  TrendingUp, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet
} from 'lucide-react'
import Link from 'next/link'

interface PriceData {
  usd: number
  brl: number
  variation24h: number
}

export default function VenderPage() {
  const { user } = useAuthContext()
  const [quantidadeBCT, setQuantidadeBCT] = useState('')
  const [priceData, setPriceData] = useState<PriceData>({
    usd: 0.48,
    brl: 2.50,
    variation24h: 5.2
  })
  const [loading, setLoading] = useState(false)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [saldoBCT] = useState(3240) // Simular saldo do usuário

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

  const quantidadeNumerica = parseFloat(quantidadeBCT.replace(',', '.')) || 0
  const valorBRL = quantidadeNumerica * priceData.brl

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleVenderPIX = () => {
    if (quantidadeNumerica > saldoBCT) {
      alert('Saldo insuficiente!')
      return
    }
    
    setLoading(true)
    // Simular processo de venda
    setTimeout(() => {
      setLoading(false)
      alert('Venda processada! Você receberá o PIX em até 24h úteis.')
    }, 2000)
  }

  const setMaxAmount = () => {
    setQuantidadeBCT(saldoBCT.toString())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2">
              Vender BCT
            </h1>
            <p className="text-[#111827]/60">
              Converta seus tokens BCT em reais via PIX
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saldo e Cotação */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0C3D2E] flex items-center justify-between">
                <span>Seu Saldo</span>
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
              <div className="flex items-center justify-between p-4 bg-[#12B76A]/10 rounded-lg">
                <div>
                  <p className="text-sm text-[#111827]/60">Saldo disponível</p>
                  <p className="text-2xl font-bold text-[#0C3D2E]">
                    {saldoBCT.toLocaleString('pt-BR')} BCT
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-[#12B76A]" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg">
                <div>
                  <p className="text-sm text-[#111827]/60">Preço atual</p>
                  <p className="text-xl font-bold text-[#0C3D2E]">
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
            </CardContent>
          </Card>

          {/* Calculadora de Venda */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0C3D2E]">Calcular Venda</CardTitle>
              <CardDescription>
                Digite a quantidade de BCT que deseja vender
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantidade">Quantidade BCT</Label>
                <div className="flex space-x-2">
                  <Input
                    id="quantidade"
                    type="text"
                    placeholder="0"
                    value={quantidadeBCT}
                    onChange={(e) => setQuantidadeBCT(e.target.value)}
                    className="text-lg"
                  />
                  <Button
                    onClick={setMaxAmount}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Máximo
                  </Button>
                </div>
                {quantidadeNumerica > saldoBCT && (
                  <p className="text-sm text-red-600 mt-1">
                    Quantidade superior ao saldo disponível
                  </p>
                )}
              </div>

              {quantidadeNumerica > 0 && (
                <div className="p-4 bg-[#12B76A]/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#111827]/60">Você receberá:</span>
                    <span className="text-xl font-bold text-[#12B76A]">
                      {formatCurrency(valorBRL)}
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

        {/* Método de Recebimento */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#0C3D2E] mb-6">
            Método de Recebimento
          </h2>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#0C3D2E] flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                PIX
              </CardTitle>
              <CardDescription>
                Receba o valor diretamente na sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Sem taxas de saque</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Transferência segura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Processamento em até 24h úteis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Disponível 24/7</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Importante
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      O pagamento será processado em até 24 horas úteis. 
                      Você receberá uma confirmação por email quando o PIX for enviado.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleVenderPIX}
                disabled={loading || quantidadeNumerica <= 0 || quantidadeNumerica > saldoBCT}
                className="w-full bg-[#12B76A] hover:bg-[#0F9A5A] text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4 mr-2" />
                )}
                Vender via PIX
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações Importantes */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#0C3D2E] mb-4">
              Informações sobre Venda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#111827]/70">
              <div>
                <p className="mb-2">• Valor mínimo: 10 BCT</p>
                <p className="mb-2">• Sem limite máximo de venda</p>
                <p className="mb-2">• Processamento automático</p>
              </div>
              <div>
                <p className="mb-2">• Sem taxas de transação</p>
                <p className="mb-2">• Histórico completo disponível</p>
                <p className="mb-2">• Suporte 24/7 para dúvidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}