"use client";

export default function TelaSucesso() {
  return (
    <div
      style={{
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        🎉 Compra realizada com sucesso!
      </h1>

      <p style={{ fontSize: 18, maxWidth: 380, marginBottom: 30 }}>
        Seus novos tokens foram adicionados à sua conta.  
        Continue construindo seu patrimônio imobiliário com a Bem Concreto Token!
      </p>

      <a
        href="/inicio"
        style={{
          padding: "12px 20px",
          background: "#0066ff",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
          fontSize: 16,
        }}
      >
        Voltar ao inicio
      </a>
    </div>
  );
}