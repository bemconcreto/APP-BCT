'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  Eye,
  ArrowRight,
  Home,
  Building,
  TreePine
} from 'lucide-react'
import Link from 'next/link'

interface PortfolioData {
  valorTotalCompra: number
  valorTotalMercado: number
  valorizacaoMedia: number
}

export default function ImoveisPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    valorTotalCompra: 6600000,
    valorTotalMercado: 8750000,
    valorizacaoMedia: 32.6
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const imoveis = [
    {
      id: 'casa-condominio',
      titulo: 'Casa em Condomínio Fechado',
      descricao: 'Residência de alto padrão em condomínio fechado. 3 suítes, área gourmet e lazer completo.',
      imagem: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      valorCompra: 1200000,
      valorMercado: 1650000,
      valorizacao: 37.5,
      localizacao: 'Alphaville, SP',
      icon: Home
    },
    {
      id: 'studios-sp',
      titulo: 'Studios em São Paulo',
      descricao: 'Empreendimento de studios voltado para locação e valorização no centro de São Paulo.',
      imagem: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      valorCompra: 3000000,
      valorMercado: 3900000,
      valorizacao: 30.0,
      localizacao: 'Centro, SP',
      icon: Building
    },
    {
      id: 'lotes-condominio',
      titulo: 'Lotes em Condomínio Fechado',
      descricao: 'Terrenos residenciais em condomínio com infraestrutura completa e segurança 24h.',
      imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      valorCompra: 2400000,
      valorMercado: 3200000,
      valorizacao: 33.3,
      localizacao: 'Cotia, SP',
      icon: TreePine
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-8 h-8 text-[#12B76A]" />
            <h1 className="text-3xl font-bold text-[#0F5132]">
              Portfólio Imobiliário
            </h1>
          </div>
          <p className="text-[#111827]/60 text-lg">
            Acompanhe seus investimentos em imóveis tokenizados
          </p>
        </div>

        {/* Resumo do Portfólio */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-[#12B76A] to-[#0F9A5A] text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm opacity-90 mb-1">Valor Total de Compra</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(portfolioData.valorTotalCompra)}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm opacity-90 mb-1">Valor Total de Mercado</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(portfolioData.valorTotalMercado)}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm opacity-90 mb-1">Valorização Média</p>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <p className="text-2xl font-bold">
                    +{portfolioData.valorizacaoMedia.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Imóveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imoveis.map((imovel) => {
            const IconComponent = imovel.icon
            return (
              <Card key={imovel.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={imovel.imagem} 
                    alt={imovel.titulo}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#12B76A] text-white">
                      +{imovel.valorizacao}%
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="w-5 h-5 text-[#12B76A]" />
                    <CardTitle className="text-lg text-[#0F5132]">
                      {imovel.titulo}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-[#111827]/60">
                    <MapPin className="w-4 h-4" />
                    <span>{imovel.localizacao}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-[#111827]/70 mb-4 line-clamp-2">
                    {imovel.descricao}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#111827]/60">Valor de Compra:</span>
                      <span className="font-medium text-[#0F5132]">
                        {formatCurrency(imovel.valorCompra)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#111827]/60">Valor Atual:</span>
                      <span className="font-medium text-[#12B76A]">
                        {formatCurrency(imovel.valorMercado)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#111827]/60">Valorização:</span>
                      <span className="font-bold text-[#12B76A] flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{imovel.valorizacao}%</span>
                      </span>
                    </div>
                  </div>
                  
                  <Link href={`/imoveis/${imovel.id}`}>
                    <Button className="w-full bg-[#12B76A] hover:bg-[#0F9A5A] text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Informações Adicionais */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#0F5132] mb-2">
                Transparência Total
              </h3>
              <p className="text-[#111827]/70 max-w-2xl mx-auto">
                Todos os nossos imóveis são tokenizados com documentação completa, 
                laudos de avaliação atualizados e total transparência nos investimentos. 
                Acompanhe a valorização do seu portfólio em tempo real.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}