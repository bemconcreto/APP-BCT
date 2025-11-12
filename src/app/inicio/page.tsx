"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useBCTPrice } from "@/hooks/useBCTPrice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  ArrowUpRight,
  Receipt,
  History,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function InicioPage() {
  const { user } = useAuthContext();

  const { usd, brl, loading } = useBCTPrice();

  const [showBalance, setShowBalance] = useState(true);
  const saldoBCT = 3240;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E]">Início</h1>
            <p className="text-gray-600">
              Bem-vindo de volta, {user?.email?.split("@")[0]}!
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-[#12B76A] text-[#12B76A]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* SALDO CARD */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#12B76A] to-[#0F9A5A] text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-90">Saldo em BCT</p>

                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">
                    {showBalance
                      ? saldoBCT.toLocaleString("pt-BR") + " BCT"
                      : "••••••"}
                  </span>

                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="opacity-80"
                  >
                    {showBalance ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className="text-lg mt-1 opacity-90">
                  ≈ {showBalance && brl ? `R$ ${brl.toFixed(2)}` : "••••••"}
                </p>
              </div>

              <Wallet className="w-10 h-10 opacity-70" />
            </div>

            <div className="flex space-x-3 mt-2">
              <Link href="/comprar" className="w-full">
                <Button className="w-full bg-white/20 text-white hover:bg-white/30">
                  Comprar
                </Button>
              </Link>

              <Link href="/vender" className="w-full">
                <Button className="w-full bg-white/20 text-white hover:bg-white/30">
                  Vender
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* COTAÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* BCT/USD */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-sm">Cotação BCT/USD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || !usd ? "Carregando..." : `$${usd.toFixed(4)}`}
              </div>
              <p className="text-gray-500 text-sm">Preço em dólar</p>
            </CardContent>
          </Card>

          {/* USD/BRL */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-sm">Cotação BCT/BRL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || !brl ? "Carregando..." : `R$ ${brl.toFixed(2)}`}
              </div>
              <p className="text-gray-500 text-sm">Preço em reais</p>
            </CardContent>
          </Card>

          {/* VARIAÇÃO */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-sm">Variação 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+0.0%</div>
              <p className="text-gray-500 text-sm">Simulado</p>
            </CardContent>
          </Card>
        </div>

        {/* MENUS DE AÇÃO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <MenuBox href="/comprar" title="Comprar BCT" icon={<CreditCard />} />
          <MenuBox href="/vender" title="Vender BCT" icon={<ArrowUpRight />} />
          <MenuBox href="/transacoes" title="Extrato" icon={<Receipt />} />
          <MenuBox href="/imoveis" title="Imóveis" icon={<Building2 />} />
        </div>
      </div>
    </div>
  );
}

function MenuBox({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: any;
}) {
  return (
    <Link href={href}>
      <Card className="shadow cursor-pointer hover:shadow-lg transition">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="w-10 h-10 bg-[#12B76A]/10 rounded-full flex items-center justify-center mb-3">
            {icon}
          </div>
          <p>{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}