'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  ArrowLeft,
  Settings,
  Shield,
  Bell,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function PerfilPage() {
  const { user, signOut } = useAuthContext()
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })

  const mockApiKey = 'bct_sk_1234567890abcdef'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/início">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0C3D2E] mb-2 flex items-center">
              <User className="w-8 h-8 mr-3" />
              Meu Perfil
            </h1>
            <p className="text-[#111827]/60">
              Gerencie suas informações e configurações da conta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}\n          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E]">Informações Básicas</CardTitle>
                <CardDescription>
                  Suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      defaultValue={user?.email?.split('@')[0] || 'Usuário'}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button className="bg-[#12B76A] hover:bg-[#0F9A5A] text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E] flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Configurações de segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input
                    id="senha-atual"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input
                      id="nova-senha"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
                    <Input
                      id="confirmar-senha"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button variant="outline" className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white">
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            {/* API Access */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E] flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Acesso API
                </CardTitle>
                <CardDescription>
                  Chave de API para integração com sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Chave da API</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={mockApiKey}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      onClick={() => setShowApiKey(!showApiKey)}
                      variant="outline"
                      size="icon"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-[#111827]/60 mt-1">
                    Use esta chave para acessar a API do BCT em suas aplicações
                  </p>
                </div>
                <Button variant="outline" className="border-[#12B76A] text-[#12B76A] hover:bg-[#12B76A] hover:text-white">
                  Gerar Nova Chave
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Account Status and Settings */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E]">Status da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verificado</span>
                  <Badge className="bg-green-100 text-green-800">
                    Verificado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Completo</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pendente
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">2FA Ativado</span>
                  <Badge className="bg-red-100 text-red-800">
                    Inativo
                  </Badge>
                </div>
                <Button className="w-full bg-[#12B76A] hover:bg-[#0F9A5A] text-white">
                  Completar Verificação
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E] flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-[#12B76A]" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Button
                    onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                    variant={notifications.email ? "default" : "outline"}
                    size="sm"
                    className={notifications.email ? "bg-[#12B76A] hover:bg-[#0F9A5A]" : ""}
                  >
                    {notifications.email ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#12B76A]" />
                    <span className="text-sm">Push</span>
                  </div>
                  <Button
                    onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                    variant={notifications.push ? "default" : "outline"}
                    size="sm"
                    className={notifications.push ? "bg-[#12B76A] hover:bg-[#0F9A5A]" : ""}
                  >
                    {notifications.push ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-[#12B76A]" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Button
                    onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                    variant={notifications.sms ? "default" : "outline"}
                    size="sm"
                    className={notifications.sms ? "bg-[#12B76A] hover:bg-[#0F9A5A]" : ""}
                  >
                    {notifications.sms ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0C3D2E]">Ações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Ativar 2FA
                </Button>
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#F5F5F5] to-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#0C3D2E] mb-4">
              Informações da Conta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#111827]/70">
              <div>
                <p className="mb-2">• Conta criada em: Janeiro 2024</p>
                <p className="mb-2">• Último acesso: Hoje às 14:30</p>
                <p className="mb-2">• Nível de verificação: Básico</p>
              </div>
              <div>
                <p className="mb-2">• Transações realizadas: 12</p>
                <p className="mb-2">• Volume negociado: R$ 15.750,00</p>
                <p className="mb-2">• Status: Conta ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}