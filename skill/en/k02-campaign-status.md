---
name: k02-campaign-status
description: Use this skill when a client asks if the campaign is OK, whether it is on track, or wants a quick status check. Triggers: "is the campaign OK", "campaign status", "quick check", "is it working", "yes or no status", "is the campaign on track", "how are we doing", "check campaign status". Gives a simple yes/no answer with pacing%.
version: 1.0.0
quality_score: 9
---

# K02 — Campaign Status — Is Everything OK?

A quick yes/no answer: is the campaign running as planned. Budget spend pace + key metrics.

## Goal

Maximum-speed answer to the question "is everything OK?" — one glance at the status.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`
- `LINE_ITEM_STATUS`

**Metrics:**
- `TOTAL_SPEND_USD`
- `IMPRESSIONS`

**Date range:** campaign_to_date (from campaign start to today).

**Edge case:** If the campaign does not exist or there is no data — respond: *"I could not find a campaign with that name. Please provide the full name or choose from the list of active campaigns."*
**Edge case:** If the campaign has not started yet (CAMPAIGN_START_DATE > today) — respond: *"The campaign [NAME] has not started yet — launch is scheduled for [DATE]. Status will be available once it goes live."*

### 2. Calculate budget spend pace

Agent calculates independently:

```
days_elapsed   = today − CAMPAIGN_START_DATE
days_total     = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
expected_%     = (days_elapsed / days_total) × 100
actual_%       = (TOTAL_SPEND_USD / CAMPAIGN_BUDGET) × 100
delta          = actual_% − expected_%
```

### 3. Assign status based on delta

| Spend pace delta | Status | What it means for the client |
|---|---|---|
| −5% to +5% | 🟢 All good | Campaign is spending budget exactly as planned |
| −15% to −5% | 🟡 Slight slowdown | Campaign is spending a little less than it should at this stage |
| below −15% | 🔴 Needs attention | Campaign is spending significantly too little — risk of not using the full budget |
| above +5% | 🟡 Accelerated pace | Campaign is spending faster than planned — budget may run out early |

### 4. Prepare output

Use the template below — substitute values and select the appropriate closing sentence:

```
🟢 Nike Air Max campaign — all good!

📅 Duration:   15 of 30 days (halfway through the campaign)
💰 Spent:      $12,300 of $25,000 — 49% of budget ✓
📣 Impressions: 2,100,000 (number of times the ad appeared)

Campaign is spending budget exactly at the planned pace.
15 days and $12,700 of budget remain until end of campaign.
```

**Closing sentence variants (select the appropriate one):**

🟢 On track:
> *"Campaign is running as planned. No action required."*

🟡 Slight slowdown:
> *"Campaign is slightly behind pace (spent [X]% of budget at [Y]% of time). Worth monitoring over the coming days — if it doesn't pick up, we will reach out to you."*

🟡 Accelerated pace:
> *"Campaign is spending budget faster than planned (spent [X]% at [Y]% of time elapsed). There is a risk of early completion — we can adjust the pace if you'd like."*

🔴 Needs attention:
> *"Campaign is significantly behind plan (spent [X]% of budget at [Y]% of time). Our team is analyzing the cause and will come back to you with an action plan."*
→ For 🔴 status, run skill A02 (underpacing diagnostics).

### 5. Alert: active ads with zero delivery

If any campaign variant has ACTIVE status but 0 impressions — add an alert:

> *"⚠️ Note: variant '[NAME]' is active but has not served any ads. Our team is investigating the cause."*

## Communication Rules

- Instead of "pacing" write "spend pace" or "budget progress"
- Instead of "line item" write "campaign variant"
- Instead of "impressions" write "ad appearances" or "times the ad was shown"
- Response maximum 6 lines — this is a quick status, not a report
- One emoji at the start — immediately clear whether things are good or not
- Every number has context in parentheses or in the next sentence
- For yellow/red status: always include specific next steps or a declaration of action
