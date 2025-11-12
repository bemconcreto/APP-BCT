'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TreePine, 
  TrendingUp, 
  MapPin, 
  Calendar,
  FileText,
  Download,
  ArrowLeft,
  Square,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Droplets
} from 'lucide-react'
import Link from 'next/link'

export default function LotesCondominioPage() {
  const [currentImage, setCurrentImage] = useState(0)
  
  const imovelData = {
    titulo: 'Lotes em Condomínio Fechado',
    localizacao: 'Cotia, São Paulo - SP',
    valorCompra: 2400000,
    valorMercado: 3200000,
    valorizacao: 33.3,
    dataCompra: '2023-01-10',
    totalLotes: 160,
    areaTotal: 320000,
    areaLoteMin: 1000,
    areaLoteMax: 2500,
    vendidos: 45,
    descricao: `Investimento estratégico em loteamento de alto padrão localizado em Cotia, uma das regiões 
    de maior crescimento da Grande São Paulo. O condomínio foi planejado para oferecer qualidade 
    de vida excepcional, com infraestrutura completa e sustentabilidade ambiental.
    
    O projeto conta com 160 lotes residenciais de diferentes tamanhos, todos com escritura 
    individual e documentação regularizada. A localização privilegiada oferece fácil acesso 
    às principais rodovias e centros urbanos, mantendo a tranquilidade do ambiente natural.
    
    A valorização tem sido consistente devido ao crescimento da região, infraestrutura de 
    qualidade e demanda crescente por lotes em condomínios fechados na Grande São Paulo.`,
    caracteristicas: [
      'Portaria 24h com controle de acesso',
      'Ruas pavimentadas e iluminadas',
      'Rede de água e esgoto',
      'Energia elétrica subterrânea',
      'Internet de fibra óptica',
      'Área de preservação ambiental',
      'Clube com piscina e quadras',
      'Playground e área de lazer',
      'Trilhas ecológicas',
      'Coleta seletiva de lixo',
      'Sistema de drenagem',
      'Paisagismo planejado'
    ],
    imagens: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    documentos: [
      { nome: 'Memorial Descritivo', tipo: 'PDF', tamanho: '6.8 MB' },
      { nome: 'Aprovação do Loteamento', tipo: 'PDF', tamanho: '4.2 MB' },
      { nome: 'Registro em Cartório', tipo: 'PDF', tamanho: '3.9 MB' },
      { nome: 'Planta do Condomínio', tipo: 'PDF', tamanho: '8.1 MB' },
      { nome: 'Licença Ambiental', tipo: 'PDF', tamanho: '2.7 MB' },
      { nome: 'Regulamento Interno', tipo: 'PDF', tamanho: '1.8 MB' },
      { nome: 'Relatório de Vendas', tipo: 'PDF', tamanho: '2.1 MB' }
    ]
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
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % imovelData.imagens.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + imovelData.imagens.length) % imovelData.imagens.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/imoveis" 
            className="inline-flex items-center text-[#12B76A] hover:text-[#0F9A5A] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Imóveis
          </Link>
          
          <div className="flex items-center space-x-2 mb-2">
            <TreePine className="w-8 h-8 text-[#12B76A]" />
            <h1 className="text-3xl font-bold text-[#0F5132]">
              {imovelData.titulo}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1 text-[#111827]/60">
            <MapPin className="w-4 h-4" />
            <span>{imovelData.localizacao}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={imovelData.imagens[currentImage]} 
                  alt={`${imovelData.titulo} - Imagem ${currentImage + 1}`}
                  className="w-full h-96 object-cover"
                />
                
                {/* Controles do Carrossel */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {imovelData.imagens.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Badge de Valorização */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#12B76A] text-white text-lg px-3 py-1">
                    +{imovelData.valorizacao}%
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Descrição */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Sobre o Loteamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {imovelData.descricao.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-[#111827]/80 mb-4 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status de Vendas */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Status de Comercialização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-[#12B76A]/10 to-[#0F9A5A]/10 rounded-lg">
                    <p className="text-2xl font-bold text-[#12B76A]">{imovelData.totalLotes}</p>
                    <p className="text-sm text-[#111827]/60">Total de Lotes</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-[#12B76A]/10 to-[#0F9A5A]/10 rounded-lg">
                    <p className="text-2xl font-bold text-[#12B76A]">{imovelData.vendidos}</p>
                    <p className="text-sm text-[#111827]/60">Lotes Vendidos</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-[#12B76A]/10 to-[#0F9A5A]/10 rounded-lg">
                    <p className="text-2xl font-bold text-[#12B76A]">
                      {Math.round((imovelData.vendidos / imovelData.totalLotes) * 100)}%
                    </p>
                    <p className="text-sm text-[#111827]/60">Comercializado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Infraestrutura */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Infraestrutura Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imovelData.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-[#F3F4F6] rounded-lg">
                      {caracteristica.includes('Segurança') || caracteristica.includes('Portaria') ? (
                        <Shield className="w-5 h-5 text-[#12B76A] flex-shrink-0" />
                      ) : caracteristica.includes('Energia') || caracteristica.includes('Internet') ? (
                        <Zap className="w-5 h-5 text-[#12B76A] flex-shrink-0" />
                      ) : caracteristica.includes('água') || caracteristica.includes('esgoto') || caracteristica.includes('drenagem') ? (
                        <Droplets className="w-5 h-5 text-[#12B76A] flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 bg-[#12B76A] rounded-full flex-shrink-0 mt-2" />
                      )}
                      <span className="text-sm text-[#111827]/80">{caracteristica}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132] flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documentos
                </CardTitle>
                <CardDescription>
                  Acesse todos os documentos oficiais do loteamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {imovelData.documentos.map((documento, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-[#12B76A]" />
                        <div>
                          <p className="font-medium text-[#0F5132]">{documento.nome}</p>
                          <p className="text-sm text-[#111827]/60">{documento.tipo} • {documento.tamanho}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white">
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações Financeiras */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-[#12B76A] to-[#0F9A5A] text-white">
              <CardHeader>
                <CardTitle className="text-white">Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm opacity-90">Valor de Compra</p>
                  <p className="text-2xl font-bold">{formatCurrency(imovelData.valorCompra)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Valor Atual de Mercado</p>
                  <p className="text-2xl font-bold">{formatCurrency(imovelData.valorMercado)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-sm opacity-90">Valorização</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xl font-bold">+{imovelData.valorizacao}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Especificações */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Especificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Área Total</p>
                      <p className="font-medium">{(imovelData.areaTotal / 10000).toFixed(1)} hectares</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Lote Mínimo</p>
                      <p className="font-medium">{imovelData.areaLoteMin}m²</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Lote Máximo</p>
                      <p className="font-medium">{imovelData.areaLoteMax}m²</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data de Aquisição */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#12B76A]" />
                  <div>
                    <p className="text-sm text-[#111827]/60">Data de Aquisição</p>
                    <p className="font-medium text-[#0F5132]">{formatDate(imovelData.dataCompra)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-[#111827]/70">
                  <p>• 35 km do centro de São Paulo</p>
                  <p>• 15 km do Rodoanel</p>
                  <p>• 8 km da Rodovia Raposo Tavares</p>
                  <p>• Próximo a shoppings e universidades</p>
                  <p>• Região de alto crescimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}