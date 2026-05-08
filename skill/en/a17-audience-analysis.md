---
name: a17-audience-analysis
description: Use this skill when AdOps wants to see which audience segments deliver the best results, how performance breaks down by device, content type, and time of day. Triggers: "audience analysis", "which segments work", "device performance", "audience segments", "who is seeing the ad", "which target is working", "best performing group", "where is performance highest".
version: 1.0.0
quality_score: 9
---

# A17 — Audience segment analysis

Which audience groups deliver the best results — to allocate budget more effectively.

## Goal

Identify top-performing and underperforming segments and provide a specific % of budget to shift.

## Execution Steps

### 1. Pull data from MCP (3 reports in parallel)

**Report 1 — Devices:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `TOTAL_CONVERSIONS`, `ECPA_USD` — last_30_days or campaign_to_date.

**Report 2 — Environment and time of day (if available):**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `ENVIRONMENT`, `SUPPLY_SOURCE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — last_30_days.

**Report 3 — Geo segments:**
dims: `CAMPAIGN_NAME`, `COUNTRY`, `REGION`, `CITY` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH` — last_30_days.

**Edge case:** If TOTAL_CONVERSIONS = 0 or unavailable — evaluate performance using CTR × viewability (efficiency proxy without a pixel).

### 2. Calculate performance score per segment

Agent calculates independently:

```
# Without conversion data:
efficiency_score = CTR × (VIEWABILITY / 100) × 10,000

# With conversion data:
efficiency_score = (TOTAL_CONVERSIONS / IMPRESSIONS) × 10,000   [conversions per 10k impressions]
cost_efficiency  = TOTAL_CONVERSIONS / TOTAL_SPEND_USD           [conversions per $]

# Segment categorization:
median_score = median efficiency_score for segments with ≥50,000 impressions

CATEGORY:
  score > 1.5 × median  → 🚀 TOP — increase budget
  score 0.75–1.5 × med. → 👀 OK — maintain
  score < 0.75 × median → 🔻 WEAK — consider reducing
  impressions < 50,000  → 📊 Insufficient data

# Reallocation potential:
spend_weak   = sum TOTAL_SPEND_USD for 🔻 segments
spend_to_TOP = spend_weak × 0.5   [recommendation: move 50% of budget from weak to TOP]
```

### 3. Prepare output

```
👥 AUDIENCE SEGMENT ANALYSIS — Nike Air Max (April 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFORMANCE BY DEVICE:

Device       | Spend   | Imp.    | CTR    | Viewab. | Score  | Rating
─────────────────────────────────────────────────────────────────────
Mobile       | $14,200 | 2.8M   | 0.17%  | 71%     | 12.1   | 🚀 TOP
Desktop      |  $7,400 | 1.1M   | 0.10%  | 64%     |  6.4   | 👀 OK
Tablet       |  $2,100 |  220k  | 0.06%  | 58%     |  3.5   | 🔻 Weak
CTV          |    $700 |   80k  | 0.04%  | 89%     |  3.6   | 📊 Insufficient data

→ Mobile delivers 2× higher score at 57% of budget. Tablet ($2,100) — lowest score,
  candidate for reduction or exclusion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE BY ENVIRONMENT:

Environment       | Spend   | CTR    | Viewab. | Score  | Rating
────────────────────────────────────────────────────────────────
Web (sites)       | $18,100 | 0.14%  | 67%     |  9.4   | 👀 OK
App (mobile apps) |  $5,400 | 0.19%  | 74%     | 14.1   | 🚀 TOP
CTV (Smart TV)    |    $900 | 0.03%  | 91%     |  2.7   | 📊 Insufficient data

→ Mobile apps achieve 50% higher score than websites — at only 22% of budget.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 5 CITIES BY EFFICIENCY:

City        | Spend   | CTR    | Efficiency | Rating
──────────────────────────────────────────────────
Kraków      | $3,100  | 0.21%  |   1.4×     | 🚀 TOP — underfunded
Wrocław     | $2,200  | 0.18%  |   1.2×     | 🚀 TOP
Warszawa    | $9,800  | 0.13%  |   1.0×     | 👀 Baseline
Łódź        | $1,100  | 0.09%  |   0.6×     | 🔻 Weak
Katowice    |   $800  | 0.07%  |   0.5×     | 🔻 Weak

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUDGET ALLOCATION RECOMMENDATIONS:

🚀 Increase by ~$2,800/month:
  • Mobile — score 2× higher than desktop, underfunded vs results
  • Mobile apps — score 50% higher than web
  • Kraków + Wrocław — underfunded at high CTR

🔻 Reduce by ~$2,800/month:
  • Tablet — lowest score, $2,100/month can be reallocated
  • Katowice + Łódź — below 0.75× efficiency median

Expected effect: +8–12% campaign CTR at the same total budget.
```

**Edge case — no conversion data:**

```
ℹ️ No conversion data (pixel inactive) — evaluation based on CTR × viewability.
   Results are estimates. For full ROI analysis (ROAS/CPA) implement a tracking pixel.
```

## Rules

- Minimum 50,000 impressions per segment to evaluate — fewer = "insufficient data"
- Always provide a specific $ amount to shift, not just "increase mobile"
- If no pixel — state this explicitly and use CTR × viewability as proxy
- Kraków/Wrocław are often underfunded vs Warszawa — check systematically
- Budget reallocation recommendation: max 50% from a weak segment in one iteration
- Always conclude with a projected effect: "expected CTR increase of X%"
