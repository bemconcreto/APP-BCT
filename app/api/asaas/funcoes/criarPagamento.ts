export async function criarPagamentoAsaas({
  customerId,
  value,
  billingType,
  description,
}: {
  customerId: string;
  value: number;
  billingType: "PIX" | "CREDIT_CARD";
  description: string;
}) {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) {
      console.error("API KEY do Asaas não encontrada!");
      return { success: false, error: "API key missing" };
    }

    const body = {
      customer: customerId,
      billingType,
      value,
      description,
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

    if (data.errors) {
      console.error("Erro ASAAS:", data.errors);
      return { success: false, error: data.errors };
    }

    // 💡 Padroniza o retorno para PIX ou cartão
    return {
      success: true,
      data: {
        id: data.id,
        status: data.status,
        invoiceUrl: data.invoiceUrl, // checkout do cartão/PIX
        pix: data.pixTransaction?.qrCode ?? null,
        copiaCola: data.pixTransaction?.payload ?? null,
      },
    };
  } catch (error) {
    console.error("Erro criarPagamentoAsaas:", error);
    return { success: false, error };
  }
}