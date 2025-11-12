import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de segurança para evitar URLs undefined
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('YOUR_SUPABASE_URL') || 
    supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Configure nas Integrações do projeto.')
}

// Criar cliente apenas se as variáveis estiverem configuradas corretamente
export const supabase = (supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL') && 
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for database tables
export interface User {
  id: string
  nome: string
  email: string
  cpf: string
  wallet_address?: string
  saldo_bct: number
  created_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  tipo: 'compra' | 'venda' | 'transferência'
  valor_brl: number
  quantidade_bct: number
  metodo_pagamento: 'PIX' | 'Cartão'
  status: 'pendente' | 'concluído' | 'falhou'
  data: string
  hash_transacao?: string
}

export interface Wallet {
  id: string
  user_id: string
  address: string
  private_key: string
}