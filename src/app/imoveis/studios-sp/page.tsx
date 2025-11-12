'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  TrendingUp, 
  MapPin, 
  Calendar,
  FileText,
  Download,
  ArrowLeft,
  Users,
  Square,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default function StudiosSPPage() {
  const [currentImage, setCurrentImage] = useState(0)
  
  const imovelData = {
    titulo: 'Studios em São Paulo',
    localizacao: 'Centro, São Paulo - SP',
    valorCompra: 3000000,
    valorMercado: 3900000,
    valorizacao: 30.0,
    dataCompra: '2023-06-20',
    unidades: 15,
    areaTotal: 750,
    areaUnidade: 50,
    rendimentoMensal: 2.8,
    ocupacao: 92,
    descricao: `Empreendimento estratégico localizado no coração de São Paulo, composto por 15 studios 
    modernos e completamente equipados. O projeto foi desenvolvido especificamente para atender 
    a demanda crescente por moradia temporária e locação de curta duração na região central.
    
    Cada unidade conta com design inteligente que maximiza o aproveitamento do espaço, 
    acabamentos contemporâneos e mobiliário planejado. A localização privilegiada oferece 
    fácil acesso ao transporte público, universidades, centros empresariais e pontos turísticos.
    
    O investimento tem se mostrado altamente rentável, com alta taxa de ocupação e 
    valorização consistente do patrimônio.`,
    caracteristicas: [
      'Mobiliário completo',
      'Internet de alta velocidade',
      'Ar condicionado',
      'Cozinha americana equipada',
      'Banheiro privativo',
      'Área de serviço',
      'Segurança 24h',
      'Recepção',
      'Área de convivência',
      'Lavanderia compartilhada',
      'Estacionamento rotativo',
      'Sistema de automação'
    ],
    imagens: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    ],
    documentos: [
      { nome: 'Plantas Arquitetônicas', tipo: 'PDF', tamanho: '5.2 MB' },
      { nome: 'Contrato de Compra', tipo: 'PDF', tamanho: '3.1 MB' },
      { nome: 'Licença da Prefeitura', tipo: 'PDF', tamanho: '2.8 MB' },
      { nome: 'Laudo de Avaliação', tipo: 'PDF', tamanho: '4.5 MB' },
      { nome: 'Relatório de Ocupação', tipo: 'PDF', tamanho: '1.9 MB' },
      { nome: 'Demonstrativo Financeiro', tipo: 'PDF', tamanho: '2.3 MB' }
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
            <Building className="w-8 h-8 text-[#12B76A]" />
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
                <CardTitle className="text-[#0F5132]">Sobre o Empreendimento</CardTitle>
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

            {/* Características */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132]">Características dos Studios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imovelData.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-[#F3F4F6] rounded-lg">
                      <div className="w-2 h-2 bg-[#12B76A] rounded-full" />
                      <span className="text-sm text-[#111827]/80">{caracteristica}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Financeira */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132] flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Performance Financeira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-[#12B76A]/10 to-[#0F9A5A]/10 rounded-lg">
                    <p className="text-sm text-[#111827]/60 mb-1">Rendimento Mensal Médio</p>
                    <p className="text-2xl font-bold text-[#12B76A]">{imovelData.rendimentoMensal}%</p>
                    <p className="text-xs text-[#111827]/60 mt-1">Sobre o valor investido</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-[#12B76A]/10 to-[#0F9A5A]/10 rounded-lg">
                    <p className="text-sm text-[#111827]/60 mb-1">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold text-[#12B76A]">{imovelData.ocupacao}%</p>
                    <p className="text-xs text-[#111827]/60 mt-1">Média dos últimos 12 meses</p>
                  </div>
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
                  Acesse todos os documentos oficiais do empreendimento
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
                    <Users className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Unidades</p>
                      <p className="font-medium">{imovelData.unidades} studios</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Área Total</p>
                      <p className="font-medium">{imovelData.areaTotal}m²</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Área por Unidade</p>
                      <p className="font-medium">{imovelData.areaUnidade}m²</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}