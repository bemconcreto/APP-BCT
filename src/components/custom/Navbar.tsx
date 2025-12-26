'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  TrendingUp,
  History,
  LogOut,
  User,
  Building2,
  Wallet,
  FileCheck
} from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuthContext()

  const navigation = [
    { name: 'Início', href: '/inicio', icon: Home },
    { name: 'Comprar', href: '/comprar', icon: ShoppingCart },
    { name: 'Vender', href: '/vender', icon: TrendingUp },
    { name: 'Carteira', href: '/carteira', icon: Wallet },
    { name: 'Imóveis', href: '/imoveis', icon: Building2 },
    { name: 'Transparência', href: '/transparencia', icon: FileCheck },
    { name: 'Extrato', href: '/extrato', icon: History },
  ]

  return (
    <nav className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/inicio" className="flex items-center gap-3">
            <img
              src="/logo-bct.png"
              alt="Bem Concreto"
              className="w-10 h-10 object-contain"
            />
            <span className="font-semibold text-lg text-[#101820]">
              Bem Concreto
            </span>
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6">
            {user && navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#8D6E63] transition"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {user ? (
              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <User className="w-4 h-4" />
                  {user.email}
                </div>

                <Button
                  onClick={async () => {
                    await signOut()
                    window.location.href = 'https://app-bct.vercel.app/'
                  }}
                  size="sm"
                  className="bg-[#8D6E63] hover:bg-[#72594F] text-white"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" className="border-[#8D6E63] text-[#8D6E63]">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-[#8D6E63] hover:bg-[#72594F] text-white">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-[#8D6E63]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB]">
          <div className="px-4 py-3 space-y-2">
            {user && navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#8D6E63]"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {user && (
              <button
                onClick={async () => {
                  await signOut()
                  window.location.href = 'https://app-bct.vercel.app/'
                }}
                className="mt-4 w-full text-left text-sm text-[#8D6E63]"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}