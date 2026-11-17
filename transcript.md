# Build transcript — Kura V-Bottom retune (btc-race-24h-20261117-0603)

How this entry was built, in the order it happened, by the agent session
that wrote it. The kit's bundle (run at submit time) carries the full
session log; this file is the human-readable record of the same work.

## 1. Found the bounty

- Hourly make.fun monitor (cron makefun-mission-daily) spotted
  `btc-race-24h-20261117-0603` ($250, deadline 19:03 WIB 17 Nov 2026,
  10 paid places, 1st $60), same format as `btc-race-24h-20261115-0828`
  which we entered with "Kura V-Bottom" (dev +$35.53, raced, final unranked).
- Downloaded the kit: `GET https://make.fun/c/btc-race-24h-20261117-0603/kit`
  (7.3 MB), unpacked to `btc-race-24h-20261117-0603-kit/`, read
  `competition.yaml` + `RULES.txt` and diffed them against the old kit.

## 2. What changed in the new kit

- Dev window is new: 24h ending at the opening, 1,440 bars, 0 gaps,
  64,461.04 → 64,775.95 (+0.49%), range 63,874–65,467, 1m volatility
  6.4 bps stdev (old window: -4.00%, 12 bps stdev). Much calmer.
- Same pool/universe (pools.json sha256 identical), same protocol
  (agent-fun/bars-replay/v1), same SDK shim (sha256 identical), same six
  baselines (sha256 identical), same fees/caps/guardrails/prizes.
- Harness version bumped (harness@602a… node v26.13.1 vs bc7a… node
  v22.23.4), scorer and pricing rev changed, bundle sha256 changed.
- Dev phase 06:03–12:03 UTC 17 Nov; race 12:18 UTC 17 Nov – 12:18 UTC 18 Nov.

## 3. The old bot fails the gate on the new window

- Copied the old staging repo (`main.ts` + `vendor/`) unchanged and ran
  `grade-local --driver process` on the new kit: net PnL **$0.00**,
  0 trades, guardrails NOT met. The 3.00% drop threshold never fires:
  the new window's worst drawdown from its peak is only -2.12%.
- Baselines on the new window: buy-and-hold +$1.07, momentum +$2.45,
  ema-cross -$106.21, adx-momentum -$32.66, rsi-bollinger -$24.25,
  hold-cash $0.00. Only the two buy-and-hold-like bots pass the gate.

## 4. Grid search on the new window, checked on the old window

- Reused the exact Python replica of the harness fill math (verified
  within 0.6% of grade-local last round; this round it matched
  grade-local to the cent on both windows) and grid-searched three
  families on the NEW window, keeping only candidates also profitable
  on the OLD window (out-of-sample):
  - V-bottom (drop/confirm/trail/stop/hold): best both-windows
    W120 DROP=200 CONF=20 TRAIL=200 SL=250 HOLD=120 → NEW +$8.65
    (1 round trip), OLD +$21.59 (4 round trips, win rate 0.75).
    The highest-NEW variant (+$13.25, HOLD=480/TRAIL=120) was rejected:
    it loses $10–$42 on the old window, so it is tuned to one day only.
  - Bollinger/RSI mean-reversion (Kura Bounce family): 0 candidates
    profitable on the new window at all — the 26 bps round-trip cost
    eats every dip in a 6.4 bps-volatility window.
  - Breakout (new 60/120/240-bar high, with/without V-bottom entry):
    up to +$9.50 on the new window but -$30 to -$70 on the old window
    (downtrend punishes breakouts). Rejected.

## 5. Final bot and local grades

- Retuned `main.ts` (Kura V-Bottom): DROP 300→200 bps, CONFIRM 30→20,
  STOP 100→250, TRAIL 80→200, MAX_HOLD 720→120 bars. `vendor/` unchanged
  (kit SDK shim, byte-identical to the new kit's).
- `grade-local --driver process` on the NEW kit: net PnL **+$8.65**
  (return +0.87%), 2 trades, win rate 1.0, max drawdown 0.57%,
  guardrails met, two runs reproduce byte for byte. At 2x fees +$7.85.
- `grade-local --driver process` on the OLD kit (robustness check):
  net PnL **+$21.59**, 8 trades, win rate 0.75, max drawdown 3.64%,
  guardrails met, byte-for-byte reproduction.
- Note: local Node is v24.22.1, the server harness runs v26.13.1, so the
  local result_sha256 cannot equal the server's; the PnL figures above
  are the harness's own computation and do not depend on the Node version.
