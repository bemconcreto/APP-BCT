import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desativa a checagem de TypeScript durante o build (equivalente ao antigo ignoreDuringBuilds)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Desativa falhas por warnings de lint (equivalente ao eslint.ignoreDuringBuilds)
  // OBS: não existe mais a chave eslint no Next 16
  // Agora o Next ignora automaticamente, então não precisa configurar nada.
};

export default nextConfig;