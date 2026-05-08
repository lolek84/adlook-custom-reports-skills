---
name: a13-line-item-audit
description: Use this skill when AdOps wants to check line item status, find LIs with zero delivery, or detect status anomalies. Triggers: "line item audit", "LI audit", "line item check", "LI status", "which line items have issues", "zero delivery", "line item not serving", "LI active without impressions".
version: 1.0.0
quality_score: 9
---

# A13 — Line item audit — status anomalies

Detect line items that are active without delivery, paused by mistake, or have inconsistent dates.

## Goal

Find all LIs with an inconsistent status — active without serving, paused with remaining budget, ended with underdelivery.

## Execution Steps

### 1. Pull data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `LINE_ITEM_STATUS`
- `LINE_ITEM_START_DATE`
- `LINE_ITEM_END_DATE`
- `LINE_ITEM_BUDGET`
- `LINE_ITEM_BIDDING_MODEL`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`

**Date range:** last_7_days (for anomaly detection) + campaign_to_date (for budget assessment).

**Edge case:** If no data for a campaign (e.g., campaign inactive for >30 days) — report: `ℹ️ No data for the last 7 days for this campaign. Checking all LI statuses without delivery analysis.`

### 2. Anomaly classification

Agent classifies each LI:

```
🚨 CRITICAL (immediate action):
  STATUS = ACTIVE  AND  IMPRESSIONS_last7d = 0
  → "Active without delivery" — check bid/targeting/creatives

⚠️ WARNINGS (requires verification):
  STATUS = PAUSED  AND  LINE_ITEM_END_DATE > today  AND  spend < 80% × LINE_ITEM_BUDGET
  → "Paused with unspent budget — is this intentional?"

  LINE_ITEM_START_DATE > today  AND  STATUS = ACTIVE
  → "Active before scheduled campaign start"

  LINE_ITEM_END_DATE < today  AND  STATUS = ACTIVE
  → "Active past scheduled end date — is this intentional?"

📋 MONITOR (post-mortem):
  STATUS = ENDED  AND  TOTAL_SPEND_USD < 0.80 × LINE_ITEM_BUDGET
  → "Ended with underdelivered budget (less than 80% spent)"
```

### 3. Prepare output

Use the template below — substitute real values:

```
🔍 LINE ITEM AUDIT — Nike Air Max  |  Thu May 8, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL — ACTIVE WITHOUT DELIVERY (2):

  LI: Prospecting_Mobile
    Status: ACTIVE | Start: Apr 1 | End: May 31
    Last 7 days: 0 impressions  (previous 7 days: 82,000 impressions)
    Budget: $8,000 | Spent: $3,200 (40%)
    ⚠️ Delivery stopped suddenly — check frequency cap and creatives
    Action: □ verify frequency cap □ check creative approval □ check bid vs floor

  LI: Retargeting_Tablet
    Status: ACTIVE | Start: Apr 1 | End: May 31
    Last 7 days: 0 impressions  (previous 7 days: 12,000 impressions)
    Budget: $1,500 | Spent: $620 (41%)
    Note: small tablet audience — may be natural reach exhaustion
    Action: □ check reach saturation □ consider pausing and reallocating budget

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ WARNINGS — REQUIRE VERIFICATION (2):

  LI: Awareness_Desktop
    Status: PAUSED | End: May 31 (23 days remaining) | Spent: $4,100 of $12,000 (34%)
    ⚠️ Paused with $7,900 unspent budget — is the pause intentional?
    Action: □ confirm with client whether to reactivate

  LI: Video_Preroll_15s
    Status: ACTIVE | End date: April 30, 2026 ← overdue by 8 days
    ⚠️ LI active past scheduled end date
    Action: □ change status to ENDED or update end date

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ENDED WITH UNDERDELIVERY (1):

  LI: Launch_Remarketing
    Status: ENDED | Period: Apr 1–15
    Spent: $2,100 of $5,000 (42%) ← undelivered $2,900
    Cause to explain to client: underpacing during first 2 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ NO ISSUES: 6 line items within normal range

ACTION LIST:
  □ [TODAY]      Prospecting_Mobile — diagnose zero delivery (skill A02)
  □ [TODAY]      Video_Preroll_15s — update end date or change status
  □ [TOMORROW]   Awareness_Desktop — confirm with client whether to reactivate
  □ [THIS WEEK]  Launch_Remarketing — prepare explanation for undelivered budget
```

## Rules

- Zero delivery for 7 days = always 🚨 CRITICAL — do not delay response
- A pause may be intentional (weekend, seasonality) — always ask before reactivating
- Ended LI with <80% budget spent requires explanation to the client — add to weekly report
- LI active past its end date = configuration error — fix immediately
- Always state the amount of unspent budget — this justifies action priority
- Zero delivery → diagnostics always via skill A02 (full procedure: bid, targeting, creatives, frequency cap)
