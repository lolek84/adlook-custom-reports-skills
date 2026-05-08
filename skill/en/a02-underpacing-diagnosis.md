---
name: a02-underpacing-diagnosis
description: Use this skill when AdOps is diagnosing a campaign that isn't delivering, has underpacing, zero delivery, or a spend problem. Triggers: "underpacing", "campaign not delivering", "zero delivery", "low spend", "why no impressions", "what's blocking delivery", "campaign not spending", "no impressions on LI", "delivery problem".
version: 1.0.0
quality_score: 9
---

# A02 — Underpacing Diagnosis

Deep analysis of a campaign that is underdelivering — root cause identification and ready-to-execute remediation steps.

## Goal

Root cause analysis of underpacing with a prioritized remediation action list — specific values to change, not generic advice.

## Execution Steps

### 1. Fetch multi-dimensional data (5 reports in parallel)

**Report 1 — Line item level:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_STATUS`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `ECPM_USD` — last_7_days

**Report 2 — Supply source:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `SUPPLY_SOURCE`, `ENVIRONMENT` + metrics: `IMPRESSIONS`, `ECPM_USD` — last_7_days

**Report 3 — Domain breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `TOP_LEVEL_DOMAIN` + metrics: `IMPRESSIONS`, `ECPM_USD`, `VIEWABILITY` — last_7_days

**Report 4 — Device breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `ECPM_USD` — last_7_days

**Report 5 — Creative breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE` + metrics: `IMPRESSIONS`, `CTR` — last_7_days

**Edge case:** If all reports return 0 rows (no data) — stop: `⛔ No data at all for the last 7 days. The campaign may have been paused or the LI has incorrect dates. Check CAMPAIGN_STATUS and LINE_ITEM_STATUS in the dashboard.`

### 2. Calculate baseline and identify the problem category

Agent calculates independently:

```
expected_spend_per_day  = CAMPAIGN_BUDGET / days_total
actual_spend_per_day    = TOTAL_SPEND_USD / days_elapsed
daily_shortfall         = expected_spend − actual_spend
delta_pacing%           = (actual_pacing% − expected_pacing%)
```

Then check each category and assign a problem weight:

| Category | Diagnostic signal | Weight |
|---|---|---|
| 🔴 BID TOO LOW | eCPM_USD < $1.00 (display) or < $4.00 (video) | High |
| 🔴 CREATIVES BLOCKED | IMPRESSIONS = 0 for ≥1 creative with ACTIVE status | High |
| 🟡 NARROW SUPPLY | 1 SSP accounts for >80% of impressions, rest <5% each | Medium |
| 🟡 TARGETING TOO NARROW | Impressions only on 1–2 device types or no mobile | Medium |
| 🟡 FREQUENCY CAP | Reach grows slowly, eCPM rising — same users seen many times | Medium |
| 🟠 NO DATA | Report 1 returns rows, but impressions = 0 | Low — check campaign status |

### 3. Prepare output

Use the template below — substitute real values:

```
🔍 UNDERPACING DIAGNOSIS — Nike Air Max › LI: Prospecting_Mobile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS (last 7 days):
  Spent:               $2,100  (expected: $6,440 at on-pace)
  Pacing delta:        −67%  🔴  (critical underpacing)
  Avg impressions/day: 42,000  (goal: ~185,000/day)

ROOT CAUSE ANALYSIS:

  🔴 #1 — BID TOO LOW (definitive cause)
     eCPM_USD: $0.72 — below typical floor price for mobile display ($1.20–$1.80)
     Supply sources: Google AdX (0 impressions), Index Exchange (0 impressions), Xandr (42k/day ✓)
     Diagnosis: bid is not winning auctions on two major SSPs
     Action: raise bid floor to $1.50 or switch to CPM bidding instead of CPC

  🟡 #2 — NARROW SUPPLY (likely contributing cause)
     Xandr: 98% of impressions | Google AdX: 0% | Index Exchange: 0% | Magnite: 2%
     Only 1 SSP active — campaign is missing ~70% of available inventory
     Action: check whether private deals on Google AdX are active; remove any exclusions

  🟠 #3 — MOBILE TARGETING (monitor)
     Device breakdown: Mobile 41k/day | Desktop 1k/day | Tablet 0/day
     Mobile is working, but CPM too low — geo targeting may be too narrow
     Action: check whether geo is restricted to specific cities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION LIST (implementation order):

  □ 1. [TODAY]    Raise bid floor from $0.72 to $1.50 (priority: unlock Google AdX)
  □ 2. [TODAY]    Check status of private deals on Google AdX — active and budgeted?
  □ 3. [TOMORROW] If still 0 impressions on AdX after 24h — remove AdX exclusion list and check creatives
  □ 4. [TOMORROW] Monitor eCPM after bid change — target: $1.20–$1.80
```

**If ZERO DELIVERY (impressions = 0 entirely):**
```
⛔ ZERO DELIVERY — Nike Air Max › LI: Prospecting_Mobile

  Last 7 days: 0 impressions, $0 spend
  LINE_ITEM_STATUS: ACTIVE ← status OK, but no delivery

  Check in order:
  □ 1. Creatives — are they approved? (IMPRESSIONS per creative = 0 for all?)
  □ 2. Dates — is LINE_ITEM_START_DATE ≤ today ≤ LINE_ITEM_END_DATE?
  □ 3. Bid — eCPM in report = $0? → bid may be below the absolute floor
  □ 4. Frequency cap — is cap set to 1 impression/user/lifetime?
  □ 5. Targeting — does geo/audience exclude 100% of available inventory?
```

## Rules

- Always provide specific numbers: "eCPM $0.72 — below floor $1.20" instead of "eCPM too low"
- Maximum 3 root causes — prioritized from most certain to least certain
- Every action has a deadline: TODAY / TOMORROW / THIS WEEK
- If only 1 SSP has impressions — always worth investigating as second priority after bid
- Do not write "maybe" or "probably" for the primary cause — be specific
