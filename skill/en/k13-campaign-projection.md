---
name: k13-campaign-projection
description: Use this skill when the client or AdOps asks whether the campaign will spend the budget, how many impressions it will reach by the end, whether we will hit the goal. Triggers: "will we spend the budget", "campaign projection", "forecast", "will we deliver", "when does budget run out", "how many impressions will we get", "will the campaign deliver", "what will we achieve by end of month".
version: 1.0.0
quality_score: 9
---

# K13 — Campaign Projection

How much the campaign will achieve by the end at the current pace — specific numbers, not generalizations.

## Goal

Answer the question "will the campaign deliver?" with projected final values and scenario variants.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:** `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`

**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`, `REACH`, `CTR`, `VIEWABILITY`

**Date range:** campaign_to_date + last_7_days (to calculate current pace).

**Edge case:** If the campaign has already ended — do not project, call K12 (end-of-campaign report). Note: *"Campaign ended on [DATE]. Using K12 instead of K13."* If the campaign has not started yet — respond: *"Campaign has not launched — no projection data available. Check the start date."* If CAMPAIGN_BUDGET = $0 or unavailable — skip pacing% calculations and note: *"Budget data unavailable — impression projection is available, spend projection is not."* If the campaign has <3 days of data — note: *"Insufficient sample ([X] days) — projection may be highly inaccurate."*

### 2. Calculate projections

Agent calculates independently:

```
# Historical data
days_since_start  = today − CAMPAIGN_START_DATE
total_days        = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
days_remaining    = CAMPAIGN_END_DATE − today

# Pace from last 7 days (more current than campaign_to_date)
spend_7d          = TOTAL_SPEND_USD (last_7_days)
impressions_7d    = IMPRESSIONS (last_7_days)
daily_spend_$     = spend_7d / 7
daily_imp         = impressions_7d / 7

# Results to date
spend_CTD         = TOTAL_SPEND_USD (campaign_to_date)
imp_CTD           = IMPRESSIONS (campaign_to_date)
pacing_actual%    = spend_CTD / CAMPAIGN_BUDGET × 100
pacing_expected%  = (days_since_start / total_days) × 100
delta             = pacing_actual − pacing_expected

# Final projection (at current pace)
projected_spend   = spend_CTD + (daily_spend_$ × days_remaining)
projected_imp     = imp_CTD + (daily_imp × days_remaining)
utilization%      = projected_spend / CAMPAIGN_BUDGET × 100

# Scenario — when budget runs out (if overpacing)
days_to_exhaust   = (CAMPAIGN_BUDGET − spend_CTD) / daily_spend_$
exhaust_date      = today + days_to_exhaust

# Projection status:
utilization% > 95  and utilization% ≤ 105  → 🟢 On track
utilization% > 105                         → 🟡 Overpacing — will run out early
utilization% 80–95                         → 🟡 Slight underspend
utilization% < 80                          → 🔴 Underpacing — will not deliver
```

### 3. Prepare output

**For client:**

```
📊 CAMPAIGN PROJECTION — Nike Air Max
Campaign runs until May 30, 2026 (8 days remaining)

To date:
  • Spent: $18,400 of $25,000 (74%)
  • Impressions: 3,100,000

Projection to end of campaign (at current pace of $820/day):
  • Total spend: ~$24,960 of $25,000 (≈100%)
  • Total impressions: ~4,200,000

🟢 The campaign is on track.
   The budget will be nearly fully utilized and the ad will reach
   approx. 4.2 million impressions by the end of the month.
```

**For AdOps:**

```
📊 PROJECTION — Nike Air Max | 8 days remaining | 2026-05-08
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT PACE (last 7d):
  Spend/day:     $820   | Imp/day:    387,500
  Pacing actual: 74%    | Expected:    72% | delta: +2% 🟢

FINAL PROJECTION (at pace $820/day × 8 days):
  Projected spend:  $24,960 / $25,000   (99.8%) 🟢
  Projected imp:     4,200,000
  Projected reach:   1,820,000 (estimate: reach/imp ratio × projected_imp)

STATUS: 🟢 On track — budget will be delivered at 99.8%

SENSITIVITY:
  If pace drops 20% → utilization: 84% ($21,000) — underspend of $4,000
  If pace increases 15% → budget exhausted May 27 (3 days early)
```

**Variant — Underpacing (projection <80%):**

```
📊 PROJECTION — Adidas Running | 21 days remaining | 2026-05-08

CURRENT PACE (last 7d):
  Spend/day:     $390   | Pacing actual: 43% | Expected: 57% | delta: −14% 🟡

FINAL PROJECTION:
  Projected spend:  $16,590 / $30,000   (55%) 🔴 — will not deliver
  Shortfall:        $13,410 will remain unspent at the current pace

STATUS: 🔴 Underpacing — campaign will not deliver the budget

To spend 100%: need $638/day (currently $390/day → required increase of 64%)
Recommendation: underpacing diagnostics → A02
```

**Variant — Overpacing (budget will run out early):**

```
📊 PROJECTION — H&M Spring | 14 days remaining | 2026-05-08

CURRENT PACE (last 7d):
  Spend/day:     $1,420 | Pacing actual: 78% | Expected: 57% | delta: +21% 🟡

FINAL PROJECTION:
  Budget will be exhausted: ~May 12, 2026 (in 4 days) 🔴
  Remaining budget: $4,420 | At pace $1,420/day → 3.1 days

Recommendation: immediately reduce daily cap to $316/day
  (= $4,420 remaining / 14 days) → A16
```

## Communication Rules

- Projection is based on last 7 days pace — state this explicitly ("at the current pace")
- Always provide sensitivity scenarios for AdOps: what if pace changes ±15–20%
- For client: round to full thousands (4,200,000 not 4,183,750)
- If campaign has <7 days of data — note: "Small data sample ([X] days), projection may be inaccurate"
- Underpacing → always suggest A02; Overpacing → always suggest A16
- Do not project finished campaigns — route to K12
