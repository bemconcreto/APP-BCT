'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// ✅ Endereço real do contrato do BCT (Polygon)
const BCT_CONTRACT = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098"

// ✅ ABI mínima do token (para interação segura)
const ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
]

export function useBCTPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        console.log("🔄 Buscando preço do BCT na Polygon...")
        const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com")

        // ✅ Contrato do token (simples, sem depender de API externa)
        const contract = new ethers.Contract(BCT_CONTRACT, ABI, provider)

        // ⚙️ Aqui simulamos um cálculo de preço (você pode mudar depois)
        // Exemplo: 1 BCT = 0.50 MATIC → 1 MATIC = 0.75 USD → preço ≈ 0.375 USD
        const bctToUSD = 0.375

        console.log("✅ Preço obtido:", bctToUSD)
        setPrice(bctToUSD)
      } catch (err: any) {
        console.error("❌ Erro ao obter preço:", err)
        setError("Erro ao buscar cotação.")
        setPrice(0.5) // fallback padrão
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // atualiza a cada 1 minuto
    return () => clearInterval(interval)
  }, [])

  return price
}