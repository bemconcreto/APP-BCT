export function formatReal(valor: number | string) {
  if (valor === null || valor === undefined) return "R$ 0,00";

  const numero = Number(valor);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(valor: number | string) {
  if (valor === null || valor === undefined) return "0,00";

  const numero = Number(valor);

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function formatBCT(value: number): string {
  return value
    .toFixed(6) // mantém 6 dígitos
    .replace(".", ",") // troca o ponto pela vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // adiciona pontos de milhar
}