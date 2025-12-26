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
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/inicio" className="flex items-center gap-2">
            <img
              src="/logo-bct.png"
              alt="Bem Concreto"
              className="w-9 h-9"
            />
            <span className="font-bold text-lg text-[#101820]">
              Bem Concreto Token
            </span>
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6">
            {user && navigation.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-[#101820] hover:text-[#8D6E63] transition"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.email}
                </span>

                <Button
                  onClick={async () => {
                    await signOut()
                    window.location.href = '/'
                  }}
                  variant="outline"
                  className="border-[#8D6E63] text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-[#8D6E63] text-[#8D6E63]"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-[#8D6E63] text-white hover:bg-[#72594F]">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-[#101820]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-4 space-y-2">
          {user && navigation.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-[#101820] py-2"
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
                window.location.href = '/'
              }}
              className="flex items-center gap-2 text-red-600 py-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>
      )}
    </nav>
  )
}