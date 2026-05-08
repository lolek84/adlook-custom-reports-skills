---
name: a16-overpacing-alert
description: Use this skill when AdOps wants to detect campaigns spending too fast, overpacing, or at risk of exhausting budget before the end date. Triggers: "overpacing", "spending too fast", "budget will run out early", "cap the spend", "overpacing alert", "campaign over pace", "pacing too high", "overspend alert".
version: 1.0.0
quality_score: 9
---

# A16 — Overpacing alert and spend control

Detect campaigns spending too fast — take action before budget runs out ahead of schedule.

## Goal

List of overpacing campaigns with budget exhaustion forecast and a specific daily cap value to set.

## Execution Steps

### 1. Pull data from MCP (2 reports in parallel)

**Daily report (last_7_days):**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`, `DATE` + metrics: `TOTAL_SPEND_USD`, `IMPRESSIONS` — last_7_days.

**Cumulative report (campaign_to_date):**
Same set without `DATE` — to calculate total spend from campaign start.

**Edge case:** If `CAMPAIGN_BUDGET` = 0 or null — skip this campaign and report: `⚠️ Campaign [NAME] — no budget in data, pacing cannot be calculated.`

### 2. Calculate pacing and forecast

Agent calculates independently:

```
spend_total      = TOTAL_SPEND_USD (campaign_to_date)
budget           = CAMPAIGN_BUDGET
remaining_budget = budget − spend_total

days_elapsed     = today − CAMPAIGN_START_DATE
total_days       = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
days_remaining   = CAMPAIGN_END_DATE − today

expected_pacing% = (days_elapsed / total_days) × 100
actual_pacing%   = (spend_total / budget) × 100
delta            = actual_pacing% − expected_pacing%

pace_7d          = TOTAL_SPEND_USD_last7d / 7         ($/day, last week)
projected_total  = spend_total + (pace_7d × days_remaining)
days_to_exhaust  = remaining_budget / pace_7d          (at current pace)

# ALERT if:
  delta > +15%  OR  projected_total > budget × 1.05

# Recommended daily cap (with 5% safety buffer):
  recommended_cap = (remaining_budget × 0.95) / days_remaining

PACING THRESHOLDS (system-wide):
  delta < −15%           → 🔴 critical underpacing
  −15% to −5%            → 🟡 mild underpacing
  −5% to +5%             → 🟢 OK
  +5% to +15%            → 🟡 mild overpacing
  > +15%                 → 🔴 critical overpacing
```

### 3. Prepare output

Use the template below — substitute real values:

```
⚡ OVERPACING ALERT  |  Thu May 8, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERPACING CAMPAIGNS (2):

  🔴 Rossmann Oferty — pacing delta: +22% (critical overpacing)

     Budget:        $15,000
     Spent:         $11,200  (75%)
     Expected:      $8,200   (55%)  ← 20 pp too high
     Remaining:     $3,800

     Pace last 7d:  $920/day
     Forecast:      projected total ~$18,400 at $15,000 budget (overage $3,400)
     ⚠️ Budget exhausted in ~4 days (May 14) — scheduled end: May 31

     📋 Action: set daily cap = $180/day
        (remaining $3,800 × 95% buffer / 20 days = $180.50/day)
        Note: significant pace reduction — confirm client accepts

  🟡 H&M Wiosna — pacing delta: +17% (mild overpacing)

     Budget:        $20,000
     Spent:         $12,400  (62%)
     Expected:      $10,000  (50%)  ← 12 pp too high
     Remaining:     $7,600

     Pace last 7d:  $630/day
     Forecast:      projected total ~$22,900 at $20,000 budget (overage $2,900)
     ⚠️ Budget exhausted in ~12 days (May 20) — scheduled end: May 31

     📋 Action: set daily cap = $310/day
        (remaining $7,600 × 95% / 23 days = $313/day, rounded to $310)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CAMPAIGNS WITHIN RANGE (6): pacing delta between −5% and +5%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION LIST:

  □ [TODAY]    Rossmann Oferty — set daily cap $180/day (current: no cap)
  □ [TODAY]    H&M Wiosna — set daily cap $310/day (current: no cap)
  □ [TODAY]    Notify Rossmann client — budget will run out May 14 instead of May 31
  □ [TOMORROW] Check that Rossmann daily cap is not blocking delivery — monitor pacing
```

**If no overpacing:**
```
✅ OVERPACING ALERT  |  Thu May 8, 2026

  No campaigns with overpacing (pacing delta ≤ +15% for all 8 campaigns).
  Next check: tomorrow as part of daily health check.
```

## Rules

- Calculate recommended daily cap with 5% safety buffer: `cap = remaining_budget × 0.95 / days_remaining`
- Notify the client if budget will be exhausted >5 days before the scheduled end date
- Overpacing may be intentional ("acceleration" before campaign end) — confirm with client
- Always provide the budget exhaustion date at current pace — this is the most critical piece of information
- Significant pace reduction (>50% of daily spend) always requires client approval
- Pacing thresholds (system-wide): delta <−15% = 🔴; −15% to −5% = 🟡; ±5% = 🟢 OK; +5% to +15% = 🟡; >+15% = 🔴 critical overpacing
- Budget exhaustion projection and daily cap recommendation → see also skill K13 (client spend projection)
