"use client";

import Image from "next/image";
import Link from "next/link";

const imoveis = [
  {
    titulo: "Casa em Condomínio Fechado",
    imagem: "/imoveis/IMG_2406 2.jpg",
    descricao: "Residência moderna e sustentável, localizada em condomínio de alto padrão com segurança 24h.",
    pago: "R$ 1.100.000,00",
    mercado: "R$ 1.600.000,00",
    valorização "45%",
    documentos: "/docs/casa-condominio.pdf"
  },
  {
    titulo: "Studios em São Paulo",
    imagem: "/imoveis/IMG_2364.jpg",
    descricao: "Empreendimento de studios localizado na zona sul de São Paulo, com alta valorização e demanda de locação.",
    pago: "R$ 1.606.800,00",
    mercado: "R$ 2.678.000,00",
    valorização "67%",
    documentos: "/docs/studios-sp.pdf"
  },
  {
    titulo: "Lotes em Condomínio Fechado",
    imagem: "/imoveis/IMG_1797.jpg",
    descricao: "Terrenos prontos para construir, com infraestrutura completa e grande potencial de valorização.",
    pago: "R$ 4.400.000,00",
    mercado: "R$ 12.000.000,00",
    valorização "172%",
    documentos: "/docs/lotes-condominio.pdf"
  }
];

export default function ImoveisPage() {
  return (
    <main className="min-h-screen bg-[#0D0F11] text-[#F2F2F2] p-6">
      <h1 className="text-3xl font-semibold text-[#F2F2F2] mb-8">
        Nossos Imóveis Tokenizados
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {imoveis.map((item, index) => (
          <div
            key={index}
            className="bg-[#16191C] border border-[#2A2D31] rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.01]"
          >
            <Image
              src={item.imagem}
              alt={item.titulo}
              width={500}
              height={300}
              className="w-full h-56 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#F2F2F2] mb-2">
                {item.titulo}
              </h2>
              <p className="text-sm text-[#A0A0A0] mb-4">{item.descricao}</p>
              <div className="text-sm mb-4">
                <p>
                  <span className="text-[#BFA89C]">Valor pago:</span> {item.pago}
                </p>
                <p>
                  <span className="text-[#12B76A]">Valor de mercado:</span>{" "}
                  {item.mercado}
                </p>
              </div>
              <Link
                href={item.documentos}
                className="inline-block mt-2 bg-[#6B4A3E] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5B3C33] transition-all"
              >
                Ver documentos 📄
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}