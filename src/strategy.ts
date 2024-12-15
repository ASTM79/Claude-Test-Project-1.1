export interface TradeSignal {
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
}

export class SimpleMovingAverageStrategy {
  private prices: number[] = [];
  private period: number;

  constructor(period: number = 20) {
    this.period = period;
  }

  addPrice(price: number) {
    this.prices.push(price);
    if (this.prices.length > this.period) {
      this.prices.shift();
    }
  }

  calculateSMA(): number {
    if (this.prices.length === 0) return 0;
    return this.prices.reduce((a, b) => a + b) / this.prices.length;
  }

  analyze(currentPrice: number): TradeSignal | null {
    this.addPrice(currentPrice);
    if (this.prices.length < this.period) return null;

    const sma = this.calculateSMA();
    if (currentPrice > sma * 1.02) {
      return {
        asset: 'ABS-USDC',
        action: 'sell',
        amount: 1,
        price: currentPrice
      };
    } else if (currentPrice < sma * 0.98) {
      return {
        asset: 'ABS-USDC',
        action: 'buy',
        amount: 1,
        price: currentPrice
      };
    }
    return null;
  }
}