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
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/inicio" className="flex items-center gap-3">
            <img
              src="/logo-bct.png"
              alt="Bem Concreto"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-lg text-foreground">
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
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {user.email}
                </span>

                <Button
                  onClick={async () => {
                    await signOut()
                    window.location.href = '/'
                  }}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90">
                    Criar Conta
                  </Button>
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
        <div className="md:hidden bg-background border-t border-border px-4 py-4 space-y-2">
          {user && navigation.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-foreground hover:text-primary"
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
              className="flex items-center gap-2 py-2 text-destructive"
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