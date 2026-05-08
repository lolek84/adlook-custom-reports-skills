---
name: a14-geo-performance
description: Use this skill when AdOps wants to optimize geographic targeting, find the best-converting regions and cities. Triggers: "geo performance", "which city performs best", "geographic performance", "regional efficiency", "budget by city", "which regions are working", "campaign geography".
version: 1.0.0
quality_score: 9
---

# A14 — Geo performance analysis

Which regions and cities deliver the best results — optimize geographic budget allocation.

## Goal

Identify the most effective locations and issue a concrete recommendation for geographic budget allocation.

## Execution Steps

### 1. Pull data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `COUNTRY`
- `REGION`
- `CITY`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `TOTAL_SPEND_USD`
- `ECPA_USD`
- `TOTAL_CONVERSIONS`

**Date range:** last_30_days or specified range.

**Edge case:** Exclude cities with <10,000 impressions — insufficient data for statistical significance. If TOTAL_CONVERSIONS = 0 or unavailable — analyze efficiency using CTR × VIEWABILITY instead of CPA.

### 2. Calculate geo efficiency

Agent calculates independently:

```
for each CITY with ≥10,000 impressions:
  score_awareness = CTR × (VIEWABILITY / 100)
  score_perf      = TOTAL_CONVERSIONS / (TOTAL_SPEND_USD / 1000)   (if conversions available)

  budget_share%   = TOTAL_SPEND_USD_CITY / TOTAL_SPEND_USD_total × 100
  results_share%  = (CTR_CITY × IMPRESSIONS_CITY) / (avg_CTR × total_IMPRESSIONS) × 100

  efficiency_ratio = results_share% / budget_share%
  if > 1.2: UNDERFUNDED  → increase budget
  if < 0.8: OVERFUNDED   → reduce budget
  else:     OK
```

### 3. Prepare output

Use the template below — substitute real values:

```
📍 GEO PERFORMANCE — Nike Air Max (April 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 10 CITIES — EFFICIENCY:

  #   City             Imp.       Budget  CTR    Viewab.  Score  Eff.ratio  Recommendation
  ─── ──────────────── ─────────  ─────── ────── ──────── ────── ─────────  ─────────────────
   1  Warszawa          1,840,000   38%   0.16%   72%     0.115   1.08      ✅ OK
   2  Kraków              620,000   13%   0.18%   74%     0.133   1.42  🔼  UNDERFUNDED — increase
   3  Wrocław             480,000   10%   0.14%   69%     0.097   1.02      ✅ OK
   4  Trójmiasto          390,000    8%   0.13%   67%     0.087   0.91      ✅ OK
   5  Poznań              310,000    6%   0.11%   65%     0.072   0.87      ✅ OK
   6  Łódź                240,000    5%   0.07%   61%     0.043   0.71  🔽  OVERFUNDED — reduce
   7  Katowice            190,000    4%   0.12%   68%     0.082   1.08      ✅ OK
   8  Lublin              140,000    3%   0.08%   60%     0.048   0.82      ✅ OK
   9  Bydgoszcz           110,000    2%   0.09%   62%     0.056   1.01      ✅ OK
  10  Szczecin             90,000    2%   0.07%   59%     0.041   0.82      ✅ OK

  Excluded: 28 cities with <10,000 impressions (insufficient sample)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGIONAL RANKING:

  Małopolska:     74% viewab., CTR 0.17%  🟢  most efficient region
  Mazowieckie (Masovian region): 72% viewab., CTR 0.16%  🟢
  Dolnośląskie:   69% viewab., CTR 0.14%  🟢
  Łódzkie:        61% viewab., CTR 0.07%  🟡  below average
  Śląskie:        68% viewab., CTR 0.12%  🟢

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALLOCATION RECOMMENDATIONS:

  🔼 INCREASE budget:
     Kraków — efficiency_ratio 1.42 (best results-to-budget ratio)
     CTR 0.18% highest in campaign, viewab. 74%, but only 13% of budget
     Action: move 3–5% of budget from Łódź → Kraków

  🔽 REDUCE budget:
     Łódź — efficiency_ratio 0.71 (below threshold at 5% of budget)
     CTR 0.07% (lowest in top 10), viewab. 61%
     Action: limit to 2–3% of geo budget

  ✅ NO CHANGE:
     Warszawa, Wrocław, Trójmiasto — efficiency OK, budget proportions justified
```

## Rules

- Do not recommend changes for cities with <10,000 impressions — insufficient data
- Efficiency_ratio >1.2: underfunded (results exceed budget share) = priority to increase
- Efficiency_ratio <0.8: overfunded (spending too much for too little result) = reduce
- For seasonality (summer/winter, holidays) note if results may be temporary
- Always provide a specific % of budget to shift, not "consider increasing"
