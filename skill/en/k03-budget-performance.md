---
name: k03-budget-performance
description: Use this skill when a client asks about campaign budget — how much is left, how much was spent, whether it will last to the end. Triggers: "budget report", "how much did we spend", "budget utilization", "spending report", "budget performance", "how much budget is left", "will the budget last", "when will the budget run out".
version: 1.0.0
quality_score: 9
---

# K03 — Budget Performance

How much of the campaign budget has been spent, how much remains, and whether it will last to the end.

## Goal

A clear answer to questions about money — how much was spent, how much remains, when it will run out.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`

**Metrics:**
- `TOTAL_SPEND_USD`

**Date range:** campaign_to_date.

To see spend trend, also fetch with `DATE` in dims for the last 7–14 days.

**Edge case:** If the campaign has not started yet — respond: *"The campaign [NAME] starts on [DATE]. No funds have been spent yet."*
**Edge case:** If budget data is unavailable — respond: *"I do not have access to this campaign's budget. Please check with your campaign manager."*

### 2. Calculations

Agent calculates all values below independently:

```
spent          = TOTAL_SPEND_USD
budget         = CAMPAIGN_BUDGET
remaining      = budget − spent
percent        = (spent / budget) × 100

days_elapsed   = today − CAMPAIGN_START_DATE
days_total     = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
days_remaining = CAMPAIGN_END_DATE − today
daily_pace     = spent / days_elapsed        (average $ per day)
forecast       = spent + (daily_pace × days_remaining)
```

### 3. Forecast assessment

| Forecast vs budget | Status | What it means |
|---|---|---|
| 90–110% of budget | 🟢 On track | Campaign will spend the budget as planned |
| Above 110% | 🟡 Overspend risk | Campaign is spending too fast — budget may run out before the end date |
| Below 90% | 🟡 Underspend risk | Campaign is spending too slowly — some budget may go unused |
| Below 70% | 🔴 Action required | Significant portion of budget at risk — intervention necessary |

### 4. Prepare output

Use the template below literally — substitute values and select the appropriate forecast variant:

```
💰 Budget performance — Nike Air Max

Spent:          $18,400 of $25,000  (74% of budget)
Remaining:      $6,600
Days to end:    8 days

📈 Forecast at current pace ($920/day):
→ Campaign will spend approximately $25,760 in total — slightly above budget.
   We can ease the pace in the final days if you'd like.

🟢 Summary: Campaign is spending budget as planned.
```

**Summary variants (select the appropriate one):**

🟢 Safe:
> *"Campaign is spending budget as planned. $[X] and [N] days remain until the end — everything is on track."*

🟡 Overspend risk:
> *"Campaign is spending budget slightly faster than planned. At the current pace it will be exhausted on [DATE] — [N] days early. Would you like us to adjust the pace?"*

🟡 Underspend risk:
> *"Campaign is spending budget slower than planned. At the current pace approximately $[X] will go unused. Our team can increase the pace — let us know if you want changes."*

🔴 Critical:
> *"Campaign is significantly behind pace — without intervention approximately $[X] ([Y]% of budget) will go unused. Our team is already analyzing the cause."*
→ For 🔴 status or forecast below 70% of budget: run skill A02 (underpacing diagnostics).

**Special message when <7 days to end:**
> *"⏰ Note: only [N] days remain until the end of the campaign. At the current pace [the full budget will be spent / $X will remain]."*

## Communication Rules

- Instead of "on-track" write "as planned" or "on track"
- Instead of "pacing" write "spend pace"
- Report amounts rounded to full dollars ($18,400 — not $18,423.51)
- State the forecast with confidence, not as a hypothesis — "the campaign will spend", not "the campaign may spend"
- Always end with: what the client can do if the result is not green (a question or a declaration of action)
- If fewer than 7 days remain — highlight this separately and clearly
