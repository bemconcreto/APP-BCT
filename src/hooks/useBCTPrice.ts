'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// ✅ Contrato do Bem Concreto Token (Polygon)
const BCT_CONTRACT = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098"

// ✅ ABI mínima apenas com balance e decimals (você pode expandir depois)
const ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
]

export function useBCTPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // ✅ Conexão segura com a RPC pública da Polygon
        const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com")

        // ✅ Acessa o contrato do BCT
        const contract = new ethers.Contract(BCT_CONTRACT, ABI, provider)

        // ✅ Mock temporário para cálculo de preço em MATIC → USD
        // (Aqui simulamos o valor até conectar a um oráculo real)
        const maticToUSD = 0.75 // valor estimado do MATIC
        const simulatedBCTPrice = 0.5 * maticToUSD // 0.5 MATIC por BCT, exemplo

        setPrice(simulatedBCTPrice)
      } catch (err: any) {
        console.error("Erro ao buscar preço do BCT:", err)
        setError("Falha ao obter preço do token")
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // atualiza a cada 1 min
    return () => clearInterval(interval)
  }, [])

  return price
}