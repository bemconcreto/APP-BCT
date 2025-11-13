import { ethers } from "ethers";

export const provider = new ethers.JsonRpcProvider(
  `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

export const BCT = process.env.NEXT_PUBLIC_BCT_CONTRACT_ADDRESS!;
export const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

export const treasuryWallet = () => {
  const pk = process.env.TREASURY_PRIVATE_KEY!;
  return new ethers.Wallet(pk, provider);
};
