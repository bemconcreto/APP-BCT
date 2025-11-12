'use client';

import { useBCTPrice } from '@/hooks/useBCTPrice';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowUpRight, Receipt, Building2, TrendingUp, DollarSign } from 'lucide-react';

export default function InicioPage() {
  const { usd, brl, loading } = useBCTPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white p-4 sm:p-6 lg:p-8">

      {/* ----- CARDS DE COTAÇÃO ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        {/* Card BCT / USD */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#0C3D2E]">
              BCT / USD
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#12B76A]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0C3D2E]">
              {loading ? 'Carregando...' : `$${usd?.toFixed(4)}`}
            </p>
            <p className="text-xs text-[#111827]/60 mt-1">
              Preço real calculado via Blockchain (Pool WMATIC ⇄ BCT)
            </p>
          </CardContent>
        </Card>

        {/* Card BCT / BRL */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#0C3D2E]">
              BCT / BRL
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#12B76A]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0C3D2E]">
              {loading ? 'Carregando...' : `R$ ${brl?.toFixed(4)}`}
            </p>
            <p className="text-xs text-[#111827]/60 mt-1">
              Preço real convertido pelo dólar do dia
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ----- 4 BOTÕES (EXISTENTES) ----- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Link href="/comprar">
          <Card className="border-0 shadow-lg hover:shadow-xl cursor-pointer transition">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard className="h-6 w-6 text-[#12B76A]" />
              </div>
              <h3 className="font-medium text-[#0C3D2E]">Comprar BCT</h3>
              <p className="text-xs text-[#111827]/60 mt-1">Cartão ou Pix</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vender">
          <Card className="border-0 shadow-lg hover:shadow-xl cursor-pointer transition">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="h-6 w-6 text-[#12B76A]" />
              </div>
              <h3 className="font-medium text-[#0C3D2E]">Vender BCT</h3>
              <p className="text-xs text-[#111827]/60 mt-1">Receba via Pix</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transacoes">
          <Card className="border-0 shadow-lg hover:shadow-xl cursor-pointer transition">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="h-6 w-6 text-[#12B76A]" />
              </div>
              <h3 className="font-medium text-[#0C3D2E]">Extrato</h3>
              <p className="text-xs text-[#111827]/60 mt-1">Histórico completo</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/imoveis">
          <Card className="border-0 shadow-lg hover:shadow-xl cursor-pointer transition">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#12B76A]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building2 className="h-6 w-6 text-[#12B76A]" />
              </div>
              <h3 className="font-medium text-[#0C3D2E]">Imóveis</h3>
              <p className="text-xs text-[#111827]/60 mt-1">Portfólio tokenizado</p>
            </CardContent>
          </Card>
        </Link>

      </div>
    </div>
  );
}