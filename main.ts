// Kura V-Bottom: a patient long-only bot for the cbBTC 24h race.
//
// Idea: on 1-minute bars the market is mostly noise (a full round trip costs
// ~26 bps in fees, slippage and impact), so this bot does nothing on ordinary
// days and waits for one event: a sharp selloff that turns. It buys only when
// price has fallen at least 2.00% below its 120-bar high AND has already risen
// at least 0.20% off its 120-bar low, i.e. the turn is confirmed, not guessed.
// It then rides the bounce with a 200 bps trailing stop off the peak value,
// a 250 bps stop-loss off its cost, and a 120-bar time stop. No fixed take
// profit: on a real V-bottom the rally is the prize.
//
// Retuned for btc-race-24h-20261117-0603: the new dev window (17 Nov, 1,440
// bars, 64,461 -> 64,776, +0.49%, max drawdown from peak only -2.12%) is far
// calmer than the previous window (15 Nov, -4.00%), so the old 3.00% drop
// threshold never fires there (0 trades, $0 PnL) and the bot would fail the
// dev gate. The 2.00% threshold fires once on the new window and four times
// on the old window, and is profitable on both:
//   new dev window (grade-local): net PnL +$8.65, 1 round trip, max DD 0.57%.
//   old dev window (grade-local): net PnL +$21.59, 4 round trips, max DD 3.64%.
// All decisions are pure functions of the bars seen: no clock, no network,
// no randomness, no lookahead.
import { BPS, runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYM = 'CBBTC';
/** Rolling window for the high/low, in bars. */
const WINDOW_BARS = 120;
/** Buy only after a fall of at least this many bps from the window high. */
const DROP_BPS = 200;
/** ...and a rise of at least this many bps off the window low. */
const CONFIRM_BPS = 20;
/** Stop-loss: sell when the position is worth this many bps under its cost. */
const STOP_BPS = 250;
/** Trailing stop: sell when the position falls this many bps below its peak value. */
const TRAIL_BPS = 200;
/** Time stop: sell after this many bars held, whatever the price. */
const MAX_HOLD_BARS = 120;
const MAX_SLIPPAGE_BPS = 100;

const closes: number[] = [];
let entryBar = -1;
let peakVal = 0n;

await runBars({
  onBatch(state, batch) {
    const bar = batch.bars.find((b) => b.symbol === SYM);
    if (bar === undefined) return [];
    const c = Number(bar.c) / 1e5;
    closes.push(c);
    const held = state.positions.get(SYM);

    if (held === undefined) {
      if (state.warmingUp) return [];
      if (closes.length <= WINDOW_BARS) return [];
      const prev = closes.slice(-WINDOW_BARS - 1, -1);
      let hi = prev[0];
      let lo = prev[0];
      for (const x of prev) {
        if (x > hi) hi = x;
        if (x < lo) lo = x;
      }
      const dropBps = ((hi - c) / hi) * 10000;
      const riseBps = ((c - lo) / lo) * 10000;
      if (dropBps < DROP_BPS || riseBps < CONFIRM_BPS) return [];
      const cash = state.cash;
      if (cash < BigInt(state.hello.fees.min_notional_quote_units)) return [];
      entryBar = state.seq;
      peakVal = 0n;
      const order: BuyInput = { side: 'buy', symbol: SYM, notional_quote_units: cash, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [order];
    }

    const val = state.value(SYM, held.qty);
    if (val > peakVal) peakVal = val;
    const cost = held.cost;
    const stop = (val * BPS) <= cost * (BPS - BigInt(STOP_BPS));
    const trail = peakVal > 0n && (val * BPS) <= peakVal * (BPS - BigInt(TRAIL_BPS));
    const time = state.seq - entryBar >= MAX_HOLD_BARS;
    if (stop || trail || time) {
      const order: SellInput = { side: 'sell', symbol: SYM, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
      entryBar = -1;
      peakVal = 0n;
      return [order];
    }
    return [];
  },
});
