export interface Position {
  asset: string;
  amount: number;
  entryPrice: number;
  timestamp: number;
}

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private maxPositions: number;
  private maxExposure: number;

  constructor(maxPositions = 3, maxExposure = 10000) {
    this.maxPositions = maxPositions;
    this.maxExposure = maxExposure;
  }

  addPosition(asset: string, amount: number, price: number): boolean {
    if (this.getTotalExposure() + (amount * price) > this.maxExposure) return false;
    if (this.positions.size >= this.maxPositions && !this.positions.has(asset)) return false;

    const existingPosition = this.positions.get(asset);
    if (existingPosition) {
      existingPosition.amount += amount;
      existingPosition.entryPrice = (existingPosition.entryPrice + price) / 2;
    } else {
      this.positions.set(asset, { asset, amount, entryPrice: price, timestamp: Date.now() });
    }
    return true;
  }

  closePosition(asset: string): Position | null {
    const position = this.positions.get(asset);
    if (position) {
      this.positions.delete(asset);
      return position;
    }
    return null;
  }

  getPosition(asset: string): Position | null {
    return this.positions.get(asset) || null;
  }

  getTotalExposure(): number {
    return Array.from(this.positions.values())
      .reduce((total, pos) => total + (pos.amount * pos.entryPrice), 0);
  }

  getUnrealizedPnL(asset: string, currentPrice: number): number {
    const position = this.positions.get(asset);
    if (!position) return 0;
    return (currentPrice - position.entryPrice) * position.amount;
  }
}