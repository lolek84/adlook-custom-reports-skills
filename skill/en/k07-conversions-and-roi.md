---
name: k07-conversions-and-roi
description: Use this skill when a client asks about conversions, ROAS, CPA, return on investment, or campaign profitability. Triggers: "conversions", "ROI", "ROAS", "cost per conversion", "did it convert", "return on ad spend", "how many conversions", "what is the ROAS", "cost per acquisition", "CPA", "is the campaign profitable", "how many sales", "conversion results".
version: 1.0.0
quality_score: 9
---

# K07 — Conversions and Return on Investment

How many conversions the campaign generated and what the cost per acquisition is.

## Goal

Show the business result of the campaign — not just impressions, but real conversions and profitability.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `LINE_ITEM_PRIMARY_GOAL_NAME`
- `LINE_ITEM_PRIMARY_GOAL_VALUE`

**Metrics:**
- `TOTAL_CONVERSIONS`
- `POST_VIEW_CONVERSIONS`
- `POST_CLICK_CONVERSIONS`
- `ECPA_USD`
- `ROAS`
- `CONVERSION_RATE`
- `TOTAL_SPEND_USD`

**Date range:** range specified by the user or campaign_to_date.

**Edge case:** If `TOTAL_CONVERSIONS` = 0 or data is missing — respond: *"No conversions recorded during this period. Possible causes: (1) the tracking pixel is not implemented, (2) the campaign has not yet reached the conversion stage, (3) conversions are being recorded with a delay. Please contact your campaign manager to verify the configuration."*

### 2. Calculations

Agent calculates independently:

```
target_CPA           = LINE_ITEM_PRIMARY_GOAL_VALUE (if goal is CPA)
actual_CPA           = ECPA_USD
performance_vs_goal% = (target_CPA / actual_CPA) × 100
                       (>100% = below cost target = good news)

view_through_%       = POST_VIEW_CONVERSIONS / TOTAL_CONVERSIONS × 100
click_through_%      = POST_CLICK_CONVERSIONS / TOTAL_CONVERSIONS × 100

ROAS formula         = conversion revenue / campaign spend × 100%
```

### 3. Assess return on investment

| ROAS (return per $1 spent) | Rating | What it means |
|---|---|---|
| >4× ($400%) | 🟢 Excellent | For every $1 spent the campaign brought in over $4 in revenue |
| 2–4× ($200–400%) | 🟡 Good | Campaign is generating a return, but there is room for optimization |
| 1–2× ($100–200%) | 🟠 Average | Campaign is covering costs, but margin is low |
| <1× (<$100%) | 🔴 Below threshold | Campaign is costing more than it brings in — intervention required → run A02 + A03 |

### 4. Prepare output

Use the template below — substitute values and select the appropriate rating variant:

```
🎯 Conversions and return on investment — Nike Air Max (April 2026)

CONVERSIONS:
  Total:                  342 conversions
  View-through:            85 (25%) — someone saw the ad, then converted
  Click-through:          257 (75%) — someone clicked the ad, then converted

COSTS:
  Campaign spend:         $18,400
  Cost per conversion:    $53.80
  Conversion cost target (CPA):  $60.00  ✅ — we are 11% below target (good!)

RETURN ON INVESTMENT:
  For every $1 spent the campaign brought in: $3.20 in revenue  🟡 Good
  (ROAS: 320%)

✅ Campaign is profitable and meeting its cost target.
   Cost per conversion ($53.80) is 10% lower than the assumed target ($60.00).
```

**Final rating variants (select the appropriate one):**

🟢 Goal met or exceeded:
> *"Campaign is profitable — cost per conversion ($[X]) is below the assumed target ($[Y]). For every dollar spent the campaign generates $[ROAS]× in revenue."*

🟡 Close to goal:
> *"Campaign is generating a return, though cost per conversion ($[X]) is slightly above the target ($[Y]). Worth checking which campaign lines are achieving the best result and concentrating budget there."*

🔴 Below goal:
> *"Cost per conversion ($[X]) is significantly above the assumed target ($[Y]). Our team is analyzing the causes and will prepare an optimization plan."*

## Communication Rules

- Instead of "CPA" write "cost per conversion" or "cost per acquisition"
- Instead of "ROAS" write "for every dollar spent the campaign generated $X in revenue" (ROAS can follow in parentheses)
- Explain the difference between view-through and click-through: *"view-through = someone saw the ad and then converted; click-through = clicked the ad and then converted"*
- If the CPA target is available — always compare to it and state clearly whether it is being met
- If there are no conversions — do not leave a blank, explain the possible causes
