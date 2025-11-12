import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { provider, BCT, ERC20_ABI } from "@/lib/ethers";

const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

export async function GET() {
  try {
    const url = new URL("https://polygon.api.0x.org/swap/v1/price");
    url.searchParams.set("buyToken", BCT);
    url.searchParams.set("sellToken", USDC);
    url.searchParams.set("sellAmount", "1000000"); // 1 USDC
    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json();
    const bctPerUsdc = parseFloat(j.buyAmount) / (10 ** 18);
    const priceUSD = 1 / bctPerUsdc;
    const priceBRL = priceUSD * 5.3;
    return NextResponse.json({ source: "0x", priceBRL, priceUSD });
  } catch (e) {
    return NextResponse.json({ error: "SEM_LIQUIDEZ", msg: (e as any).message });
  }
}
