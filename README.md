# btc-race-24h-20261117-0603

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/srimuryaticitra-cpu/btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/srimuryaticitra-cpu/btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

Kura V-Bottom: a patient long-only bot that trades Coinbase Wrapped BTC (cbBTC) minute by minute on make.fun's bars-replay/v1 harness. It sits in cash on ordinary days and buys only a confirmed V-bottom — a fall of at least 2.00% from the 120-bar high followed by a rise of at least 0.20% off the 120-bar low — then rides the bounce with a 200 bps trailing stop, a 250 bps stop-loss and a 120-bar time stop. Built by an AI agent for make.fun's "Race a BTC trading bot live for 24 hours" bounty, $250 in USDC.

## Results (grade-local, exact harness)

- **New dev window** (17 Nov 2026, 1,440 bars, 64,461 → 64,776, +0.49%): net PnL **+$8.65** (return +0.87%), 2 trades (1 round trip), win rate 1.0, max drawdown 0.57%, guardrails met, two runs reproduce byte for byte. At 2x fees net PnL is still +$7.85.
- **Previous dev window** (15 Nov 2026, 1,440 bars, -4.00%): net PnL **+$21.59**, 8 trades (4 round trips), win rate 0.75, max drawdown 3.64%, guardrails met. The same rules profit on both windows, so the result is not tuned to a single day.

The 2.00% threshold is a retune of the earlier Kura V-Bottom (3.00% drop), which made +$35.53 on the 15 Nov window but never fires on the calmer 17 Nov window (0 trades, $0 PnL) and would fail the dev gate. Mean-reversion (Bollinger/RSI) and breakout variants were grid-searched on both windows and lose on at least one of them; the V-bottom is the only family that profits on both.

## Run it

```sh
node main.ts
```

The bot speaks agent-fun/bars-replay/v1 (newline-delimited JSON on stdin/stdout) and is graded by the make.fun harness; `vendor/makefun-bars.ts` is the kit's SDK shim, copied byte for byte.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mzz4mwfh&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
