'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  TrendingUp, 
  MapPin, 
  Calendar,
  FileText,
  Download,
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Square,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function CasaCondominioPage() {
  const [currentImage, setCurrentImage] = useState(0)
  
  const imovelData = {
    titulo: 'Casa em Condomínio Fechado',
    localizacao: 'Alphaville, Barueri - SP',
    valorCompra: 1200000,
    valorMercado: 1650000,
    valorizacao: 37.5,
    dataCompra: '2023-03-15',
    area: 350,
    quartos: 4,
    suites: 3,
    banheiros: 4,
    vagas: 3,
    descricao: `Magnífica residência de alto padrão localizada em um dos condomínios mais exclusivos de Alphaville. 
    Esta propriedade oferece o máximo em conforto e sofisticação, com acabamentos de primeira linha e 
    uma localização privilegiada que combina tranquilidade e praticidade.
    
    A casa conta com amplos espaços integrados, cozinha gourmet completa, área de lazer com piscina, 
    churrasqueira e jardim paisagístico. O condomínio oferece segurança 24h, área de lazer completa 
    com quadras esportivas, playground, salão de festas e muito mais.`,
    caracteristicas: [
      'Piscina privativa',
      'Área gourmet completa',
      'Jardim paisagístico',
      'Sistema de segurança',
      'Aquecimento solar',
      'Ar condicionado central',
      'Closet na suíte master',
      'Lavabo social'
    ],
    imagens: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    documentos: [
      { nome: 'Escritura Pública', tipo: 'PDF', tamanho: '2.3 MB' },
      { nome: 'Certidão de Matrícula', tipo: 'PDF', tamanho: '1.8 MB' },
      { nome: 'Laudo de Avaliação', tipo: 'PDF', tamanho: '4.1 MB' },
      { nome: 'IPTU 2024', tipo: 'PDF', tamanho: '890 KB' },
      { nome: 'Planta Baixa', tipo: 'PDF', tamanho: '3.2 MB' }
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
            <Home className="w-8 h-8 text-[#12B76A]" />
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
                <CardTitle className="text-[#0F5132]">Sobre o Imóvel</CardTitle>
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
                <CardTitle className="text-[#0F5132]">Características</CardTitle>
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

            {/* Documentos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0F5132] flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documentos
                </CardTitle>
                <CardDescription>
                  Acesse todos os documentos oficiais do imóvel
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Área</p>
                      <p className="font-medium">{imovelData.area}m²</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Quartos</p>
                      <p className="font-medium">{imovelData.quartos}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Banheiros</p>
                      <p className="font-medium">{imovelData.banheiros}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-[#12B76A]" />
                    <div>
                      <p className="text-sm text-[#111827]/60">Vagas</p>
                      <p className="font-medium">{imovelData.vagas}</p>
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