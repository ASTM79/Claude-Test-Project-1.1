import { Position } from './position';

export class RiskManager {
  private maxDrawdown: number;
  private stopLossPercent: number;
  private takeProfitPercent: number;
  private maxPositionSize: number;

  constructor(config: {
    maxDrawdown?: number;
    stopLoss?: number;
    takeProfit?: number;
    maxPositionSize?: number;
  } = {}) {
    this.maxDrawdown = config.maxDrawdown || 0.1; // 10%
    this.stopLossPercent = config.stopLoss || 0.05; // 5%
    this.takeProfitPercent = config.takeProfit || 0.1; // 10%
    this.maxPositionSize = config.maxPositionSize || 1000;
  }

  checkStopLoss(position: Position, currentPrice: number): boolean {
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
    return pnlPercent <= -this.stopLossPercent;
  }

  checkTakeProfit(position: Position, currentPrice: number): boolean {
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
    return pnlPercent >= this.takeProfitPercent;
  }

  validateTradeSize(amount: number, price: number): boolean {
    return amount * price <= this.maxPositionSize;
  }

  checkDrawdown(equity: number, startingEquity: number): boolean {
    return (startingEquity - equity) / startingEquity > this.maxDrawdown;
  }
}