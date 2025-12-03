// src/utils/format.ts
export function formatReal(valor: number | string) {
  if (valor === null || valor === undefined) return "R$ 0,00";
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

export function formatNumber(valor: number | string) {
  if (valor === null || valor === undefined) return "0,00";
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

/**
 * Formata BCT: sempre 6 casas decimais e formato pt-BR (decimal vírgula).
 * Ex: 2.177473 -> "2,177473"
 * Ex: 1234.5 -> "1.234,500000"
 */
export function formatBCT(value: number | string) {
  const numero = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(numero);
}