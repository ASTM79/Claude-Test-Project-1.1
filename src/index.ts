import { config } from 'dotenv';
import { ElizaAgent } from '@eliza-foundation/core';
import { AGWClient } from '@abstract-foundation/agw-client';
import { AdvancedTradingStrategy } from './strategy';
import { MarketDataProvider } from './market';
import { TradeExecutor } from './executor';
import { PositionManager } from './position';
import { RiskManager } from './risk';
import Anthropic from '@anthropic-ai/sdk';

config();

class TradingAgent extends ElizaAgent {
  private agw: AGWClient;
  private strategy: AdvancedTradingStrategy;
  private market: MarketDataProvider;
  private executor: TradeExecutor;
  private positionManager: PositionManager;
  private riskManager: RiskManager;
  private startingEquity: number;
  private anthropic: Anthropic;

  constructor() {
    super({
      name: 'AbstractTrader',
      model: process.env.MODEL_NAME || 'claude-3-opus-20240229',
      memory: true,
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.agw = new AGWClient({
      rpcUrl: process.env.ABSTRACT_RPC_URL,
      privateKey: process.env.PRIVATE_KEY
    });

    this.strategy = new AdvancedTradingStrategy();
    this.market = new MarketDataProvider(
      process.env.ABSTRACT_RPC_URL!,
      process.env.PAIR_ADDRESS!
    );
    this.executor = new TradeExecutor(this.agw);
    this.positionManager = new PositionManager();
    this.riskManager = new RiskManager();
    this.startingEquity = 10000;
  }

  async init() {
    await this.agw.connect();
    console.log('Trading agent initialized');
    this.startTrading();
  }

  private async startTrading() {
    setInterval(async () => {
      try {
        const price = await this.market.getPrice();
        await this.checkExistingPositions(price);
        await this.evaluateNewTrades(price);
      } catch (error) {
        console.error('Trading cycle failed:', error);
      }
    }, 60000);
  }

  private async checkExistingPositions(currentPrice: number) {
    for (const [asset, position] of Array.from(this.positionManager['positions'])) {
      if (this.riskManager.checkStopLoss(position, currentPrice) ||
          this.riskManager.checkTakeProfit(position, currentPrice)) {
        const closedPosition = this.positionManager.closePosition(asset);
        if (closedPosition) {
          await this.executor.executeTrade({
            asset,
            action: 'sell',
            amount: closedPosition.amount,
            price: currentPrice,
            confidence: 1
          });
          console.log(`Closed position: ${asset} at ${currentPrice}`);
        }
      }
    }
  }

  private async evaluateNewTrades(currentPrice: number) {
    const equity = this.startingEquity + this.positionManager.getTotalExposure();
    if (this.riskManager.checkDrawdown(equity, this.startingEquity)) {
      console.log('Maximum drawdown reached, stopping new trades');
      return;
    }

    const signal = this.strategy.analyze(currentPrice);
    if (!signal) return;

    if (!this.riskManager.validateTradeSize(signal.amount, signal.price)) {
      console.log('Trade size exceeds risk limits');
      return;
    }

    if (signal.action === 'buy' && 
        this.positionManager.addPosition(signal.asset, signal.amount, signal.price)) {
      await this.executor.executeTrade(signal);
      console.log(`Executed trade: ${signal.action} ${signal.amount} ${signal.asset} at ${signal.price}`);
    }
  }
}

async function main() {
  const agent = new TradingAgent();
  await agent.init();
}

main().catch(console.error);