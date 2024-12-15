import { config } from 'dotenv';
import { ElizaAgent } from '@eliza-foundation/core';
import { AGWClient } from '@abstract-foundation/agw-client';
import { SimpleMovingAverageStrategy } from './strategy';
import { MarketDataProvider } from './market';
import { TradeExecutor } from './executor';

config();

class TradingAgent extends ElizaAgent {
  private agw: AGWClient;
  private strategy: SimpleMovingAverageStrategy;
  private market: MarketDataProvider;
  private executor: TradeExecutor;

  constructor() {
    super({
      name: 'AbstractTrader',
      model: process.env.MODEL_NAME || 'gpt-4',
      memory: true
    });
    
    this.agw = new AGWClient({
      rpcUrl: process.env.ABSTRACT_RPC_URL,
      privateKey: process.env.PRIVATE_KEY
    });

    this.strategy = new SimpleMovingAverageStrategy();
    this.market = new MarketDataProvider(
      process.env.ABSTRACT_RPC_URL!,
      process.env.PAIR_ADDRESS!
    );
    this.executor = new TradeExecutor(this.agw);
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
        const signal = this.strategy.analyze(price);
        
        if (signal) {
          const txHash = await this.executor.executeTrade(signal);
          console.log(`Executed trade: ${signal.action} ${signal.amount} ${signal.asset} at ${signal.price}`);
          console.log(`Transaction hash: ${txHash}`);
        }
      } catch (error) {
        console.error('Trading cycle failed:', error);
      }
    }, 60000); // Check every minute
  }
}

async function main() {
  const agent = new TradingAgent();
  await agent.init();
}

main().catch(console.error);