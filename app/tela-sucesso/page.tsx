export default function TelaSucesso() {
  return (
    <div style={{ padding: 30, textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        🎉 Parabéns!
      </h1>

      <p style={{ fontSize: 20, marginBottom: 30 }}>
        Você acabou de comprar mais alguns pedacinhos de imóveis!  
        Seu investimento está sendo processado.
      </p>

      <button
        onClick={() => (window.location.href = "/inicio")}
        style={{
          background: "#0066ff",
          padding: 14,
          borderRadius: 8,
          color: "#fff",
          fontSize: 18,
        }}
      >
        Ir para início
      </button>
    </div>
  );
}