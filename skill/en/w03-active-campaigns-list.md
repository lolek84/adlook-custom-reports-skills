---
name: w03-active-campaigns-list
description: Use this skill when the user asks which campaigns are currently active, wants a list of campaigns for an advertiser. Triggers: "which campaigns are active", "active campaigns list", "what are we running", "show my campaigns", "what campaigns do we have", "active campaigns", "what is live", "list of active campaigns".
version: 1.0.0
quality_score: 9
---

# W03 — Active Campaigns List

Which campaigns for a given advertiser are currently active, with basic parameters.

## Goal

Overview of active campaigns in one place — in simple form for the client, with full status for AdOps.

## Execution Steps

### 1. Fetch list of advertisers

`list_advertisers` → if the user did not specify a name — ask or show a list to choose from.

**Edge case:** If there are no active campaigns — respond: *"No active campaigns for [ADVERTISER] at the moment. The last campaign ended on [DATE]."* — and do not generate an empty table. If CAMPAIGN_BUDGET = $0 or unavailable — skip the pacing delta column and note: *"Budget data unavailable for [CAMPAIGN]."* If CAMPAIGN_END_DATE is in the past but status = ACTIVE — flag the anomaly: *"Campaign [NAME] has ACTIVE status but the end date has passed — requires verification."*

### 2. Fetch campaign data

`run_report_preview` with parameters:

**Dims:**
- `ADVERTISER_NAME`
- `CAMPAIGN_NAME`
- `CAMPAIGN_STATUS`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`

**Metrics:**
- `TOTAL_SPEND_USD`
- `IMPRESSIONS`

**Date range:** campaign_to_date (for pacing) + yesterday (to verify delivery).

Filter: `CAMPAIGN_STATUS = ACTIVE`.

### 3. Calculate for each campaign

Agent calculates independently:

```
pct_spent         = TOTAL_SPEND_USD / CAMPAIGN_BUDGET × 100
total_days        = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
days_since_start  = today − CAMPAIGN_START_DATE
days_remaining    = CAMPAIGN_END_DATE − today
expected_pacing   = (days_since_start / total_days) × 100
pacing_delta      = pct_spent − expected_pacing

STATUS:
  delta > −5 and < +5   → 🟢 OK
  delta −15 to −5       → 🟡 slight slowdown
  delta < −15           → 🔴 problem
  delta > +15           → 🟡 spending too fast

END ALERT:
  days_remaining < 7    → ⚠️ Ending soon
  IMPRESSIONS_yesterday = 0 → 🔴 Zero delivery — requires review
```

### 4. Prepare output

**For client:**

```
📋 Your active campaigns (3):

1. Nike Air Max — Awareness
   Budget: $18,400 of $25,000 spent (74%)
   Time: 8 days remaining (May 30, 2026)
   Status: 🟢 On track

2. Nike Air Max — Remarketing
   Budget: $5,100 of $12,000 spent (43%)
   Time: 21 days remaining (June 12, 2026)
   Status: 🟡 Slightly below plan — our team is monitoring

3. Nike Running Summer ⚠️ Ending in 4 days
   Budget: $9,800 of $10,000 spent (98%)
   Time: 4 days remaining (May 12, 2026)
   Status: 🟢 Budget nearly exhausted — campaign delivered
```

**For AdOps:**

```
📋 ACTIVE CAMPAIGNS — Nike Poland (3 campaigns) | 2026-05-08

Campaign                      | Budget  | Spent  | Expected | Δ pacing | Days | Yesterday
──────────────────────────────────────────────────────────────────────────────────────────
Nike Air Max — Awareness      | $25,000 |   74%  |    72%   |   +2%    |   8  | ✅ 142k
Nike Air Max — Remarketing    | $12,000 |   43%  |    57%   |  −14%    |  21  | ✅  38k
Nike Running Summer ⚠️        | $10,000 |   98%  |    96%   |   +2%    |   4  | ✅  12k

🟡 NOTE: Nike Air Max — Remarketing underpacing −14% → check bid/targeting → A02
⚠️  Nike Running Summer ending in 4 days — $200 budget remaining, delivery OK
```

**Edge case — zero delivery:**

```
🔴 ALERT: [CAMPAIGN NAME] — zero impressions yesterday
   Campaign is active but not delivering. Go to A02 (underpacing diagnostics).
```

## Rules

- Sort: first campaigns with 🔴 alerts, then 🟡, then 🟢 by end date ascending
- Do not show ended or scheduled campaigns (only ACTIVE)
- AdOps sees pacing delta and yesterday's impressions; client sees simple status emoji
- Campaigns ending in ≤7 days always highlighted with ⚠️ — even if pacing is OK
- For client: instead of "pacing delta" say "on track" / "slightly below plan"
