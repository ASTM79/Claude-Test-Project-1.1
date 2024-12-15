export class MarketDataProvider {
  private lastPrice: number = 100;

  async getPrice(): Promise<number> {
    // Simulate price movement for testing
    this.lastPrice = this.lastPrice * (1 + (Math.random() - 0.48) * 0.01);
    return this.lastPrice;
  }
}