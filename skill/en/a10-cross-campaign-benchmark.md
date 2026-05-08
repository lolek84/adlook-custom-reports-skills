---
name: a10-cross-campaign-benchmark
description: Use this skill when AdOps wants to compare results across multiple campaigns for the same advertiser, run a benchmark, or identify what works best structurally. Triggers: "cross-campaign benchmark", "compare campaigns", "which campaign performs best", "performance comparison", "what is different in campaign A vs B", "which campaign was better", "best campaign".
version: 1.0.0
quality_score: 9
---

# A10 — Cross-campaign benchmark

Compare results across multiple campaigns for the same advertiser — identify what works best structurally.

## Goal

Draw structural conclusions from campaign comparison and identify best practices for future campaigns.

## Execution Steps

### 1. Retrieve campaign list

`list_advertisers` → select advertiser → retrieve campaigns.

If the user has not specified which campaigns — ask which to compare, or retrieve the last 3–5 completed/active ones.

**Edge case:** If campaigns have different KPI objectives (one awareness, one performance) — note this explicitly and do not compare CPA/ROAS directly. Group the comparison by objective type.

### 2. Pull data for each campaign

`run_report_preview` dims: `ADVERTISER_NAME`, `CAMPAIGN_NAME`, `CAMPAIGN_OBJECTIVE`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE` — for the full period of each campaign (campaign_to_date or specified range).

### 3. Normalize to per-1,000-impressions

Agent calculates independently — eliminates the effect of different budgets:

```
CTR_per_1k        = CTR × 10           (CTR is already in %, keep as-is)
spend_per_1k_imp  = TOTAL_SPEND_USD / (IMPRESSIONS / 1000)   → effective eCPM
reach_per_1k_imp  = REACH / (IMPRESSIONS / 1000)
conv_per_1k_imp   = TOTAL_CONVERSIONS / (IMPRESSIONS / 1000)

overall_score = (CTR / CTR_benchmark) × 0.3
              + (VIEWABILITY / 70) × 0.3
              + (VCR / 50 if video, else 1.0) × 0.2
              + (conv_per_1k_imp / avg_conv_per_1k) × 0.2
```

### 4. Prepare output

Use the template below — substitute real values:

```
📊 CROSS-CAMPAIGN BENCHMARK — Nike Polska
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaigns compared: 4 | All: display | Period: Jan–Apr 2026

COMPARISON TABLE (normalized per 1,000 impressions):

  Campaign              Period      Budget   CTR    Viewab.  Freq  eCPM    Score
  ──────────────────── ─────────── ──────── ────── ──────── ───── ─────── ──────
  Nike Air Max          Apr 2026   $25,000  0.14%   71%     3.1×  $2.40   8.2  🥇
  Nike Running Q1       Mar 2026   $18,000  0.11%   68%     3.8×  $2.10   7.1  🥈
  Nike Zimowa           Jan 2026   $30,000  0.08%   62%     4.7×  $3.20   5.4  🥉
  Nike Back to School   Feb 2026   $12,000  0.06%   55%     5.9×  $2.80   4.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RANKING:

  🥇 Nike Air Max (Apr 2026) — score 8.2/10
     Highest CTR (0.14%) and viewability (71%) at average eCPM
     Frequency 3.1× — optimal, no saturation

  🥈 Nike Running Q1 (Mar 2026) — score 7.1/10
     Good CTR and lowest eCPM ($2.10 — cheapest of the four)
     Slightly higher frequency than Air Max

  🥉 Nike Zimowa (Jan 2026) — score 5.4/10
     Highest budget but highest eCPM ($3.20) and high frequency (4.7×)
     Likely audience saturation toward the end of the campaign

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEST PRACTICES (from Air Max — top campaign):

  Inventory:     Google AdX + Xandr as main SSPs (combined 64% of impressions)
  Format:        300×250 color banner (CTR 2× higher than 728×90)
  Bidding:       CPC with $0.60 floor (cheapest clicks across all campaigns)
  Frequency cap: 3/week — prevents audience saturation

RECOMMENDATIONS FOR NEXT CAMPAIGN:
  □ 1. Replicate Air Max SSP mix: AdX 40% + Xandr 25% + Index 15%
  □ 2. Set frequency cap 3/week from launch — do not wait for saturation
  □ 3. Avoid eCPM >$3 — Zimowa overpaid with weaker results than cheaper campaigns
  □ 4. Prioritize 300×250 format — consistently the best CTR across all campaigns
```

## Rules

- Compare campaigns of the same format (display vs display, video vs video)
- Normalization per-1,000-impressions is mandatory — without it the comparison is unreliable
- If campaigns had different KPIs — note this and do not compare CPA/ROAS directly
- Conclusions must be structural (what to repeat) not descriptive (what happened)
- If campaigns have different durations — normalize by comparing full cycles or use per-week analysis (skill A15) instead of comparing totals
