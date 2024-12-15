import { ethers } from 'ethers';

export class MarketDataProvider {
  private provider: ethers.JsonRpcProvider;
  private pairAddress: string;

  constructor(rpcUrl: string, pairAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.pairAddress = pairAddress;
  }

  async getPrice(): Promise<number> {
    // Simplified price fetch from a DEX pair contract
    const pairAbi = ['function getReserves() external view returns (uint112, uint112, uint32)'];
    const pair = new ethers.Contract(this.pairAddress, pairAbi, this.provider);
    
    try {
      const [reserve0, reserve1] = await pair.getReserves();
      return Number(reserve0) / Number(reserve1);
    } catch (error) {
      console.error('Error fetching price:', error);
      return 0;
    }
  }
}