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
  Settings,
  LogOut,
  User,
  Building2
} from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuthContext()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Imóveis', href: '/imoveis', icon: Building2 },
    { name: 'Comprar', href: '/comprar', icon: ShoppingCart },
    { name: 'Vender', href: '/vender', icon: TrendingUp },
    { name: 'Histórico', href: '/transacoes', icon: History },
  ]

  return (
    <nav className="bg-[#0C3D2E] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#12B76A] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">BCT</span>
              </div>
              <span className="text-white font-bold text-xl font-inter">
                Bem Concreto Token
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[#F3F4F6] hover:text-[#12B76A] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-[#F3F4F6]">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button
                    size="sm"
                    className="bg-[#12B76A] text-white hover:bg-[#0F9A5A]"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#F3F4F6] hover:text-[#12B76A] p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0C3D2E] border-t border-[#12B76A]/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[#F3F4F6] hover:text-[#12B76A] block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {user ? (
              <div className="pt-4 border-t border-[#12B76A]/20">
                <div className="px-3 py-2 text-[#F3F4F6] text-sm">
                  {user.email}
                </div>
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="text-[#F3F4F6] hover:text-[#12B76A] block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#12B76A]/20 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link
                  href="/cadastro"
                  className="block px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    className="w-full bg-[#12B76A] text-white hover:bg-[#0F9A5A]"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}