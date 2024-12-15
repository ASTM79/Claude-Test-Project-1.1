export interface TradeSignal {
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  confidence: number;
}

interface IndicatorValues {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: number;
}

export class AdvancedTradingStrategy {
  private prices: number[] = [];
  private maxHistory = 100;
  private confidence: number = 0;

  addPrice(price: number) {
    this.prices.push(price);
    if (this.prices.length > this.maxHistory) this.prices.shift();
  }

  private calculateSMA(period: number): number {
    if (this.prices.length < period) return 0;
    const slice = this.prices.slice(-period);
    return slice.reduce((a, b) => a + b) / period;
  }

  private calculateRSI(): number {
    if (this.prices.length < 14) return 50;
    let gains = 0, losses = 0;
    for (let i = 1; i < 14; i++) {
      const change = this.prices[this.prices.length - i] - this.prices[this.prices.length - i - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(): number {
    const ema12 = this.calculateSMA(12);
    const ema26 = this.calculateSMA(26);
    return ema12 - ema26;
  }

  private getIndicators(currentPrice: number): IndicatorValues {
    this.addPrice(currentPrice);
    return {
      sma20: this.calculateSMA(20),
      sma50: this.calculateSMA(50),
      rsi: this.calculateRSI(),
      macd: this.calculateMACD()
    };
  }

  analyze(currentPrice: number): TradeSignal | null {
    const indicators = this.getIndicators(currentPrice);
    let signal: 'buy' | 'sell' | null = null;
    this.confidence = 0;

    // Trend following
    if (indicators.sma20 > indicators.sma50) this.confidence += 0.3;
    else if (indicators.sma20 < indicators.sma50) this.confidence -= 0.3;

    // RSI conditions
    if (indicators.rsi < 30) this.confidence += 0.4;
    else if (indicators.rsi > 70) this.confidence -= 0.4;

    // MACD conditions
    if (indicators.macd > 0) this.confidence += 0.3;
    else if (indicators.macd < 0) this.confidence -= 0.3;

    if (this.confidence >= 0.5) signal = 'buy';
    else if (this.confidence <= -0.5) signal = 'sell';

    if (!signal) return null;

    return {
      asset: 'ABS-USDC',
      action: signal,
      amount: 1,
      price: currentPrice,
      confidence: Math.abs(this.confidence)
    };
  }
}