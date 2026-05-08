---
name: w05-presentation-summary
description: Use this skill when the user wants data ready for a presentation, bullet points with results, key takeaways, summary for a deck. Triggers: "presentation data", "deck summary", "key takeaways", "bullet points", "executive summary", "slides data", "prepare data for presentation", "results for slides", "campaign conclusions".
version: 1.0.0
quality_score: 9
---

# W05 — Presentation Summary

Data ready to paste into a deck or report — formatted, with key takeaways.

## Goal

5–7 bullet points in executive summary format — ready to paste without editing.

## Execution Steps

### 1. Fetch full data set

`run_report_preview` with parameters:

**Dims:** `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_TYPE`

**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE`

**Date range:** full campaign period or specified range.

**Edge case:** If the campaign is still running — mark in the title: *"Partial data — campaign in progress (until [DATE], [%]% of time elapsed)"*. Do not create a final report for an active campaign without this annotation. If the campaign has not started (0 impressions) — respond: *"No data — the campaign has not yet launched."* If CAMPAIGN_BUDGET = $0 or unavailable — skip the budget section and note the absence of data.

### 2. Calculate and assess

Agent calculates independently:

```
pacing% = TOTAL_SPEND_USD / CAMPAIGN_BUDGET × 100
time%   = days_since_start / total_days × 100
delta   = pacing% − time%

BUDGET ASSESSMENT:
  delta > −5 and < +5  → "delivered as planned"
  delta < −15          → "below plan — [X]% spent with [Y]% of time elapsed"
  delta > +15          → "above plan — pace higher than expected"

CTR ASSESSMENT:
  display > 0.12%    → "above industry benchmark (0.08%)"
  display 0.05–0.12% → "within the norm for banner ads"
  display < 0.05%    → "below benchmark — worth reviewing creatives"

VIEWABILITY ASSESSMENT:
  > 70%              → "high viewability"
  50–70%             → "viewability within norm (MRC standard: 50%)"
  < 50%              → "viewability below benchmark — inventory optimization required"

VCR ASSESSMENT (video):
  > 60%              → "excellent engagement"
  40–60%             → "good result for a [X]s spot"
  < 40%              → "low completions — consider shortening the spot"
```

### 3. Prepare output

**For client (executive summary — ready to paste):**

```
📊 KEY RESULTS — Nike Air Max
Period: April 1–30, 2026

• Reach: The ad reached 1,800,000 unique people in Poland over the course of the month.
  → Each person saw it an average of 2.3 times — a healthy contact frequency.

• Budget delivery: $24,500 of $25,000 spent (98%) — delivered as planned.
  → Full budget utilization at a consistent pace throughout the month.

• Viewability: 68% of impressions were genuinely visible to the audience.
  → A good result — above the industry minimum (50%, MRC standard), ads reached where they needed to.

• Engagement: Click-through rate 0.14% — nearly twice above the benchmark for banners (0.08%).
  → Colorful spring creatives clearly attracted attention more effectively than standard ones.

• Efficiency: Reaching 1,000 people cost $2.10 — typical for premium inventory.

• Conversions: 342 purchases at an average of $53 each | For every $1 spent the campaign
  generated $3.20 in revenue (ROAS 320%) — above the target ($60 CPA).

→ CONCLUSION: The campaign achieved all planned objectives. Colorful spring creatives
  performed twice as well as previous ones — we recommend repeating this approach
  in the next campaign with an expanded video format.
```

**For AdOps — extended version with deltas:**

```
📊 EXECUTIVE SUMMARY — Nike Air Max | April 2026

• Reach: 1,800,000 UU | Frequency: 2.3× (norm 2–5×) | Impr: 4.2M
  WoW trend: reach +8% (last week) — audience still unsaturated

• Pacing: $24,500 / $25,000 (98%) | delta +2% vs. expected — ✅ OK
  Daily average: $817/day | Peak week 3: $1,100/day

• Viewability: 68% | Measurability: 84% | Benchmark: 50% MRC ✅ OK
  Weaker domains: [domain1] 41%, [domain2] 44% → candidates for exclusion

• CTR: 0.14% display ✅ | Benchmark: 0.08% | Best creative: "Spring banner" 0.18%
  Weakest: "Old banner 2025" 0.04% → recommendation: pause

• eCPM: $2.10 | Range: $1.40–$3.80 | Most expensive SSP: [SSP] $3.80 — check efficiency

• Conversions: 342 | CPA: $53.80 (target: $60) ✅ | ROAS: 320% (target: >200%) ✅
  Click-through: 280 | View-through: 62

→ ACTIONS FOR NEXT CAMPAIGN:
  1. Pause "Old banner 2025" → saves approx. $1,200/month
  2. Exclude domains with viewability <50% → improves inventory quality
  3. Test 15s spot (current 30s has VCR 40% — below benchmark)
```

## Rules

- Each bullet: metric + number + benchmark/norm + takeaway (4 elements)
- Executive style: confident, specific — "The campaign achieved" not "The campaign appears to have achieved"
- Last point (→ CONCLUSION) is always a recommendation for the next campaign, not another number
- Avoid Markdown tables — bullet points work in PowerPoint, Google Slides, and email
- Conversions section only if pixel is active — do not leave a blank with "no data"
- Client: zero DSP abbreviations (not "eCPM", "VCR", "LI") — write "cost per thousand", "video completions"
- AdOps: add WoW delta and a specific action for each area requiring attention
