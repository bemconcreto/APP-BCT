export async function criarPagamentoAsaas({
  customerId,
  value,
  description,
  dueDate,
  cpfCnpj,
  cardNumber,
  holderName,
  expiryMonth,
  expiryYear,
  cvv,
  email,
}: {
  customerId: string;
  value: number;
  description: string;
  dueDate: string; // YYYY-MM-DD
  cpfCnpj: string;

  cardNumber: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
}) {
  try {
    const apiKey = process.env.ASAAS_API_KEY;

    if (!apiKey) {
      console.error("API KEY do Asaas não encontrada!");
      return { success: false, error: "API key missing" };
    }

    // 🔥 ENVIO COMPLETO DO CARTÃO AO ASAAS
    const body = {
      customer: customerId,
      billingType: "CREDIT_CARD",
      value,
      description,
      dueDate,

      creditCard: {
        holderName,
        number: cardNumber,
        expiryMonth,
        expiryYear,
        ccv: cvv,
      },

      creditCardHolderInfo: {
        name: holderName,
        email,
        cpfCnpj,
        postalCode: "00000000",
        addressNumber: "0",
        phone: "11999999999",
      },
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

    return {
      success: true,
      data: {
        id: data.id ?? null,
        status: data.status ?? null,
        invoiceUrl: data.invoiceUrl ?? null,
      },
    };
  } catch (error) {
    console.error("Erro criarPagamentoAsaas:", error);
    return { success: false, error };
  }
}