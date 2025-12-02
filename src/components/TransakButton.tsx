"use client";

export default function TransakButton({ userAddress }: { userAddress: string }) {
  const open = () => {
    const url = `https://global.transak.com?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&defaultCryptoCurrency=BCT&walletAddress=${userAddress}&network=polygon&themeColor=12B76A`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={open}
      className="bg-[#101820] text-white px-4 py-2 rounded w-full hover:bg-[#101820] transition"
    >
      Comprar com Cartão 💳
    </button>
  );
}
