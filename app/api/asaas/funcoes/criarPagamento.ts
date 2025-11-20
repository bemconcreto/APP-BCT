export async function criarPagamentoAsaas({
  customerId,
  value,
  billingType,
  description,
  dueDate,
  cpfCnpj,
}: {
  customerId: string;
  value: number;
  billingType: "PIX" | "CREDIT_CARD";
  description: string;
  dueDate: string; // YYYY-MM-DD
  cpfCnpj: string;
}) {
  try {

    const apiKey = process.env.ASAAS_API_KEY;

    if (!apiKey) {
      console.error("API KEY do Asaas não encontrada!");
      return { success: false, error: "API key missing" };
    }

    // 🔥 Corpo completo exigido pelo Asaas
    const body = {
      customer: customerId,
      billingType,
      value,
      description,
      dueDate,
      cpfCnpj, // agora sempre enviado
    };

    const res = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Caso o Asaas retorne erro
    if (data.errors) {
      console.error("Erro ASAAS:", data.errors);
      return { success: false, error: data.errors };
    }

    // 🔥 Padronização universal p/ PIX e cartão
    return {
      success: true,
      data: {
        id: data.id ?? null,
        status: data.status ?? null,
        invoiceUrl: data.invoiceUrl ?? null,

        // PIX (algumas respostas variam em sandbox/produção)
        pixQrCode: data.pixQrCode ?? data.pix?.qrCode ?? null,
        pixCopiaECola: data.pixCopiaECola ?? data.pix?.payload ?? null,
      },
    };
  } catch (error) {
    console.error("Erro criarPagamentoAsaas:", error);
    return { success: false, error };
  }
}