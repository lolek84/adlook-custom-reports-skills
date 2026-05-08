---
name: a18-budget-optimization
description: Use this skill when AdOps wants comprehensive budget optimization recommendations — which line items to scale, which to reduce, and how to reallocate spend to improve results. Triggers: "budget optimization", "where to move budget", "optimize spending", "reallocate budget", "which line items to scale", "what to pause and what to increase", "how to improve results".
version: 1.0.0
quality_score: 9
---

# A18 — Budget optimization

Comprehensive budget reallocation recommendations across line items, formats, and segments — with specific amounts.

## Goal

Prioritized list of budget changes with projected effect — ready to implement without further analysis.

## Execution Steps

### 1. Pull data (4 reports in parallel)

**Report 1 — LI performance:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `ECPM_USD`, `TOTAL_CONVERSIONS`, `ECPA_USD` — last_14_days.

**Report 2 — Format / creative type:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE` — last_14_days.

**Report 3 — Device breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — last_14_days.

**Report 4 — Pacing:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE` + metrics: `TOTAL_SPEND_USD` — campaign_to_date.

**Edge case:** If <14 days of data — use the available period and note: *"Analysis based on [N] days of data — preliminary recommendations, verify after 7 additional days."*

### 2. Calculate efficiency score per LI

Agent calculates independently:

```
# Score per LI (without conversions):
efficiency = CTR × (VIEWABILITY / 100) / (ECPM_USD / 10)
# Score per LI (with conversions):
efficiency = (TOTAL_CONVERSIONS / TOTAL_SPEND_USD) × 100   [conversions per $100 spend]

median_eff = median efficiency for LIs with ≥$500 spend

CLASSIFICATION:
  efficiency > 1.5 × median  → 🚀 SCALE UP
  efficiency 0.75–1.5 × med. → 👀 MAINTAIN
  efficiency < 0.75 × median → 🔻 REDUCE
  spend < $500 or imp < 50k  → 📊 Insufficient data

# Reallocation amounts:
to_remove   = sum spend × 0.3 for 🔻 LIs (take 30% from each weak LI — max 30% per LI per iteration)
to_add      = to_remove × 0.9   [10% safety buffer]
split_TOP   = to_add / count(🚀 LIs)   [equal split across TOP LIs]
```

### 3. Check pacing per LI

```
for each LI:
  expected_pacing  = (days_elapsed / total_days) × 100
  actual_pacing    = (spend / li_budget) × 100
  delta            = actual_pacing − expected_pacing

  delta < −20% → priority: investigate what is blocking delivery → A02
  delta > +20% → check whether it will exceed budget → A16
```

### 4. Prepare output

```
💰 BUDGET OPTIMIZATION — Nike Air Max (last 14 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LINE ITEM RANKING:

LI                        | Spend/14d | CTR    | Viewab. | eCPM   | Score | Action
──────────────────────────────────────────────────────────────────────────────────
Prospecting_Mobile_App    | $5,200    | 0.19%  | 74%     | $1.90  | 14.1  | 🚀 SCALE UP +$1,800
Remarketing_Desktop       | $4,100    | 0.16%  | 68%     | $2.10  |  9.8  | 👀 MAINTAIN
Prospecting_Desktop_Web   | $7,800    | 0.12%  | 63%     | $2.40  |  7.2  | 👀 MAINTAIN
Remarketing_Tablet        | $2,400    | 0.06%  | 54%     | $3.10  |  3.5  | 🔻 REDUCE −$700
Prospecting_CTV           |   $900    | 0.02%  | 88%     | $8.40  |  2.1  | 🔻 REDUCE −$400
Retargeting_Old_List      |   $600    | 0.03%  | 51%     | $2.90  |  1.8  | 🔻 REDUCE −$300

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS (in priority order):

  □ [TODAY]    Move $1,800 to "Prospecting_Mobile_App"
    → Score 2× above average, but only 24% of budget — clearly underfunded
    → Increase daily cap from $370/day to $500/day

  □ [TODAY]    Reduce "Remarketing_Tablet" by $700/14d (−30%)
    → CTR 0.06% at eCPM $3.10 — worst cost-to-results ratio
    → Reduce daily cap from $171/day to $120/day

  □ [TOMORROW] Reduce "Prospecting_CTV" by $400/14d (−44%)
    → CTR 0.02% at eCPM $8.40 — 4× more expensive than display without proportional results
    → Keep only $500/14d for testing until a larger data sample is collected

  □ [TOMORROW] PAUSE "Retargeting_Old_List" (−$300/14d)
    → Audience list likely outdated — CTR 0.03%, lower than prospecting
    → Refresh the segment or close the LI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REALLOCATION SUMMARY:

  Taking from: Tablet $700 + CTV $400 + Old_List $300 = $1,400
  Adding to: Mobile_App +$1,400 (buffer: $400 as daily reserve)

  Projected effect after 14 days:
  • Campaign CTR: 0.13% → ~0.16% (+23%)
  • At the same total budget ($21,000/14d)

PACING ALERTS:
  ⚠️ Prospecting_Mobile_App: pacing −18% → candidate for daily cap increase (A02 if it persists after increase)
  ✅ Remarketing_Desktop: pacing +1% → OK
```

**Edge case — all LIs have similar scores:**

```
📊 All line items have similar efficiency (score within 0.85–1.15× median).
   No clear candidate for reallocation.

   Recommendation: check optimization at the creative level (A05) or geo segments (A14) —
   performance differences may be hidden at a lower level of granularity.
```

## Rules

- Minimum $500 spend or 50,000 impressions per LI to evaluate — fewer = "insufficient data"
- Reallocation max 30% of a LI's budget in one iteration — larger changes risk pacing collapse
- Always provide a specific $ amount and a specific daily cap to set
- Deadline: TODAY = priority >1.5× median difference; TOMORROW = 0.75–1.5×; THIS WEEK = <0.75×
- If underpacing >20% on a TOP LI → run A02 (diagnostics) first, then reallocate
- Always conclude with a projected improvement in % CTR or ROAS
