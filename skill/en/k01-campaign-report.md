---
name: k01-campaign-report
description: Use this skill when a client or agency asks about campaign results in plain language. Triggers: "campaign report", "how did the campaign go", "give me results", "campaign summary", "monthly report", "performance report", "show me the campaign", "what did we achieve", "how are results looking". Designed for users without technical DSP knowledge.
version: 1.0.0
quality_score: 9
---

# K01 — Campaign Report

A summary of campaign results for a selected period, in a clear format for clients or agencies.

## Goal

Deliver a simple, readable campaign results report — no raw data, ready-made conclusions.

## Execution Steps

### 1. Establish scope

If the user has not specified a period, ask what time range the report should cover (e.g., last month, last week, full campaign duration). If no campaign name is given — ask or fetch the list of active campaigns.

**Edge case:** If the campaign is inactive or there is no data for the specified period, respond: *"The campaign [NAME] did not serve any ads during the selected period. Would you like to see results from the last active period?"*

### 2. Fetch data from MCP

Call `run_report_preview` with the following parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_STATUS`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`
- `LINE_ITEM_NAME`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `CTR`
- `VIEWABILITY`
- `REACH`

**Date range:** range specified by the user, or default to last_30_days.

### 3. Prepare output

Agent calculates independently:
- **pacing%** = (spend to date / total budget) / (days elapsed / total campaign length) × 100
- **pacing rating**: ideal = 85–115%, slow = <85%, too fast = >115%

Use the template below literally — substitute values and select the appropriate rating variant:

```
📊 Campaign report: Nike Air Max — April 2026
Period: April 1–30, 2026

── CAMPAIGN RESULTS ────────────────────────────

👁 Impressions:      4,200,000   (number of times the ad appeared)
👥 Reach:            1,800,000   (number of unique people who saw it)
💰 Budget:           $18,400 of $25,000 spent (74%)
   Pacing:           🟡 slightly slow — should be ~80% at this stage of the campaign
🖱 Click-through rate (CTR):  0.14%  (14 clicks per 10,000 impressions — good result for banners)
👀 Viewability:      68%         (68 out of 100 impressions were visible to users)

── ASSESSMENT ─────────────────────────────────

🟢 Campaign is on the right track.
The ad is reaching a wide audience and is well visible.
Click-through rate (0.14%) is above the typical result for banner ads (~0.08%),
meaning the creative is effectively capturing attention.
The budget is being spent slightly slower than planned — worth monitoring over the coming days.

── LINE ITEMS ──────────────────────────────────

| Line item              | Impressions | CTR    | Viewability |
|------------------------|-------------|--------|-------------|
| Remarketing – desktop  | 2,100,000   | 0.18%  | 72%         |
| Prospecting – mobile   | 2,100,000   | 0.10%  | 64%         |
```

**Pacing rating variants (select one):**
- 🟢 `Budget spend is on track — campaign is on the right path.`
- 🟡 `Budget being spent slightly slower than planned (pacing: X%) — worth monitoring.`
- 🔴 `Campaign is spending budget too slowly (pacing: X%) — there is a risk of not spending the full budget by end date. We recommend contacting your campaign manager.` → if delta < −15%, run skill A02.

**Viewability rating variants:**
- 🟢 `Viewability [X]% — ads are well visible to audiences (MRC standard: above 50%).`
- 🟡 `Viewability [X]% — some ads may not have been noticed. We are working on optimization.`
- 🔴 `Viewability [X]% — a significant portion of ads was not visible. We recommend urgent inventory optimization.` → use A16 for inventory diagnostics.

### 4. Close with a one-sentence summary

The last sentence of the report should be ready to paste into an email to the client:

> *"The campaign is performing as planned — ads reached 1.8M unique people, click-through rate is above benchmark, and the budget is being spent at the right pace."*

If something needs attention:

> *"The campaign is achieving good reach results, however ad viewability (42%) is below expectations — we are working on improvement and will update you on the results."*

## Communication Rules

- Instead of "CTR" write "click-through rate" (CTR can follow in parentheses)
- Instead of "viewability" write "ad visibility"
- Instead of "impressions" write "ad appearances" or "times the ad was shown"
- Instead of "line item" write "campaign variant" or leave the own name without translation
- Add an explanation in parentheses for every number — what it means for the client
- Round to full thousands (1,800,000 — not 1,823,471) — readability over precision
- Never show raw data without context — always add: "this means..." or "this is a [good/average/weak] result because..."
- The report always ends with a sentence ready to paste into client communication
