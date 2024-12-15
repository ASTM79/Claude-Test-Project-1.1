import { Backtester } from './backtest';
import { TradingAgent } from './index';

async function generateTestData(days: number = 30) {
  const data = [];
  let price = 100; // Starting price
  const now = Date.now();
  
  for (let i = 0; i < days * 24; i++) { // Hourly data
    // Simple random walk with trend
    price = price * (1 + (Math.random() - 0.48) * 0.01);
    data.push({
      timestamp: now - (days * 24 - i) * 3600000,
      price: price
    });
  }
  return data;
}

async function runBacktest() {
  console.log('Starting backtest...');
  const backtester = new Backtester();
  const testData = await generateTestData();
  
  const results = await backtester.runBacktest(testData);
  
  console.log('Backtest Results:');
  console.log(`Total PnL: $${results.totalPnL.toFixed(2)}`);
  console.log(`Sharpe Ratio: ${results.sharpeRatio.toFixed(2)}`);
  console.log(`Max Drawdown: ${(results.maxDrawdown * 100).toFixed(2)}%`);
  console.log(`Win Rate: ${(results.winRate * 100).toFixed(2)}%`);
  console.log(`Total Trades: ${results.trades.length}`);
}

async function runLiveTest() {
  console.log('Starting live test with simulated market data...');
  const agent = new TradingAgent();
  await agent.init();
  
  // Simulate live market data
  let price = 100;
  setInterval(() => {
    price = price * (1 + (Math.random() - 0.48) * 0.01);
    agent.processPriceUpdate(price);
  }, 5000); // Update every 5 seconds
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'backtest';

  if (mode === 'backtest') {
    await runBacktest();
  } else if (mode === 'live') {
    await runLiveTest();
  } else {
    console.log('Invalid mode. Use "backtest" or "live"');
  }
}

main().catch(console.error);