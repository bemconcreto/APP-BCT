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

    return { success: true, data };
  } catch (error) {
    console.error("Erro criarPagamentoAsaas:", error);
    return { success: false, error };
  }
}