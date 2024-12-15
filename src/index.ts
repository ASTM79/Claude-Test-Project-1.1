import { config } from 'dotenv';
import { ElizaAgent } from '@eliza-foundation/core';
import { AGWClient } from '@abstract-foundation/agw-client';

config();

class TradingAgent extends ElizaAgent {
  private agw: AGWClient;

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
  }

  async init() {
    await this.agw.connect();
    console.log('Trading agent initialized');
  }
}

async function main() {
  const agent = new TradingAgent();
  await agent.init();
}

main().catch(console.error);