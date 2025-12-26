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
  FileCheck,
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
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/inicio" className="flex items-center gap-3">
            <img
              src="/logo-bct.png"
              alt="Bem Concreto Token"
              className="w-9 h-9 rounded-full"
            />
            <span className="font-bold text-lg text-foreground">
              Bem Concreto Token
            </span>
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6">
            {user &&
              navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {user.email}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut()
                    window.location.href = 'https://app-bct.vercel.app/'
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link href="/cadastro">
                  <Button>Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-2">
            {user &&
              navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}

            {user && (
              <button
                onClick={async () => {
                  await signOut()
                  setIsMenuOpen(false)
                  window.location.href = 'https://app-bct.vercel.app/'
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}