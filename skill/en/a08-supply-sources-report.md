---
name: a08-supply-sources-report
description: Use this skill when AdOps wants to compare SSPs and supply sources, or see which inventory sources deliver the best results. Triggers: "supply sources", "SSP performance", "which supply sources", "supply analysis", "inventory sources", "which SSP performs best", "compare supply sources", "best inventory", "SSP analysis", "ranking SSPs".
version: 1.0.0
quality_score: 9
---

# A08 — Supply Sources Report

Comparison of SSPs and exchanges — where we buy inventory and what delivers the best result.

## Goal

SSP ranking with a concrete budget allocation recommendation: where to increase, where to decrease, where to turn off.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `SUPPLY_SOURCE`
- `ENVIRONMENT`
- `DEVICE_TYPE`
- `CREATIVE_TYPE`

**Metrics:**
- `IMPRESSIONS`
- `VIEWABILITY`
- `CTR`
- `ECPM_USD`
- `TOTAL_SPEND_USD`
- `VIDEO_COMPLETION_RATE`

**Date range:** last_30_days or specified range.

**Edge case:** If an SSP has <50,000 impressions or <2% budget share — mark as `📊 INSUFFICIENT DATA` and do not recommend exclusion based on this data.

### 2. Calculate score and ranking

Agent calculates independently for each SSP:

```
# Aggregate per SUPPLY_SOURCE (ignore ENVIRONMENT and DEVICE_TYPE in the main score)
budget_share% = TOTAL_SPEND_USD_SSP / TOTAL_SPEND_USD_total × 100

# Efficiency score (higher = better)
for display:
  score = (VIEWABILITY / 100) × CTR × (1 / ECPM_USD) × 10,000
for video:
  score = (VIEWABILITY / 100) × VIDEO_COMPLETION_RATE × (1 / ECPM_USD) × 10,000

# Ranking: sort descending by score
# Exclude from ranking: SSPs with <50k impressions or <2% budget share (insufficient sample)
```

### 3. Prepare output

Use the template below — substitute real values:

```
📡 SUPPLY SOURCES RANKING — Nike Air Max (April 2026, display)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  #  SSP                Imp.       Budget   Viewab.  CTR    eCPM   Score  Rating
  ── ─────────────────  ─────────  ───────  ───────  ─────  ─────  ─────  ──────────────
  1  Google AdX          1,820,000   38%     71%     0.14%  $1.80  5.47   🟢🟢 Best
  2  Xandr               1,240,000   26%     68%     0.12%  $2.10  3.89   🟢 Good
  3  Index Exchange         680,000   14%     62%     0.09%  $2.40  2.33   🟡 Average
  4  PubMatic               490,000   10%     58%     0.08%  $2.90  1.60   🟡 Average
  5  Magnite                340,000    7%     41%     0.06%  $5.80  0.43   🔴 Weak
  6  Sharethrough            82,000    2%     —        —     —      —      📊 Insufficient data
  –  OpenX                   31,000    1%     —        —     —      —      📊 Insufficient data

  Score = (viewability/100) × CTR × (1/eCPM) × 10,000
  Higher score = better price/quality ratio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALLOCATION RECOMMENDATION:

  🔼 INCREASE share:
     Google AdX — score 5.47 (best), viewab. 71%, eCPM $1.80
     Action: move 7% of budget from Magnite → AdX
     Expected viewability improvement: ~+3 pp

  🔽 DECREASE share:
     Magnite — score 0.43 (weakest at 7% budget), viewab. 41%, eCPM $5.80
     We pay 3.2× more than AdX for clearly worse results
     Action: cap at max 2% of budget or turn off

  📊 WATCH (insufficient data):
     Sharethrough (82k imp.) — re-evaluate after 200k impressions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT BREAKDOWN (top SSP):

  Google AdX:  Web 65% | App 35%
               Web viewab: 74% | App viewab: 65%  — web clearly better
```

## Rules

- Score is relative — used for ranking within this campaign, not for comparison across campaigns
- CTV has different benchmarks than web/app — do not compare directly, analyze separately
- Do not recommend excluding an SSP with <50k impressions or <2% budget share — insufficient sample
- Increase → Decrease → Turn off: always a specific dollar amount or % to reallocate
- Provide the expected impact of each recommendation (viewability, CTR, or eCPM)
