---
name: a11-weekly-report
description: Use this skill when AdOps needs a complete weekly report for the team lead, weekly review, or week summary. Triggers: "weekly report", "AdOps weekly", "week summary", "weekly review", "WoW performance", "what happened this week", "weekly campaign review".
version: 1.0.0
quality_score: 9
---

# A11 — AdOps Weekly Report

Complete weekly report for the team lead — all campaigns, key incidents, actions taken.

## Goal

Weekly snapshot of all campaigns ready to send to the team lead — no further editing required.

## Execution Steps

### 1. Pull data (4 reports in parallel)

**Current week report (last_7_days):**
`run_report_preview` ALL campaigns + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`.

**Previous week report (8–14 days ago):**
Same set — to calculate WoW deltas.

**Creatives report (last_7_days):**
dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE` + metrics: `IMPRESSIONS`, `CTR`, `VIDEO_COMPLETION_RATE`.

**Inventory report (last_7_days):**
dims: `CAMPAIGN_NAME`, `SUPPLY_SOURCE`, `TOP_LEVEL_DOMAIN` + metrics: `IMPRESSIONS`, `VIEWABILITY`, `TOTAL_SPEND_USD`.

**Edge case:** If no data for the previous week (new campaign) — mark `(no WoW data — campaign <7 days)` instead of delta %.

### 2. Calculate deltas and classify campaigns

Agent calculates independently:

```
for each campaign:
  delta_wow_% = (current_value − previous_value) / previous_value × 100
  significant = abs(delta_wow) > 20%

  expected_pacing% = (days_elapsed / total_days) × 100
  actual_pacing%   = (spend_total / budget) × 100
  delta_pacing     = actual_pacing% − expected_pacing%

CLASSIFICATION:
  OK:              delta_pacing −5% to +5%, no alerts, metrics stable
  MONITOR:         delta_pacing −15% to −5% or +5% to +15%, or 1 metric WoW >20%
  ACTION_REQUIRED: delta_pacing <−15% or >+15%, zero delivery, CTR spike/drop
```

### 3. Prepare output

Use the template below — substitute real values:

```
📋 ADOPS WEEKLY REPORT
Mon May 4 – Sun May 10, 2026  |  generated: Thu May 8, 09:15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK SUMMARY:
  Active campaigns:  8   |  ✅ OK: 5  |  👀 Monitor: 2  |  🔴 Action: 1
  Total spend:       $42,800  (WoW: +8% vs previous week)
  Total impressions: 18,400,000  (WoW: +12%)
  Incidents:         2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CAMPAIGNS OK (5):

  Campaign                  Spend    Pacing  CTR    Viewab.  WoW
  ─────────────────────── ──────── ─────── ────── ──────── ──────────
  Nike Air Max              $9,200   +2%    0.14%   71%     CTR +5%   stable
  Samsung Galaxy            $6,800   +1%    0.09%   68%     stable
  Żywiec Zdrój              $3,100   −2%    0.08%   65%     stable
  H&M Wiosna                $5,400   +3%    0.13%   66%     stable
  PKO BP Kredyty            $4,100   −1%    0.07%   74%     stable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👀 MONITOR (2):

  Adidas Running:  pacing −11% (mild underpacing, monitoring)
                   CTR WoW: −22% 🟡 — targeting may have changed
                   Action: investigating cause by Friday

  Rossmann Oferty: pacing +18% (overpacing, campaign ends May 15)
                   At current pace budget will run out 4 days early
                   Action: reducing daily cap to $420/day (from $620/day)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 REQUIRED / REQUIRES ACTION (1):

  Nike Air Max › LI: Prospecting_Mobile
    Incident: zero delivery Tue May 6 – Wed May 7 (0 impressions for 36h)
    Cause: frequency cap set to 1/lifetime instead of 3/week
    Action: cap corrected on Wed May 7 at 14:30 — delivery returned to normal
    Status: ✅ RESOLVED | estimated lost impressions: ~170,000 (~$340)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCIDENTS THIS WEEK:

  1. Nike Air Max zero delivery (May 6–7)
     What: LI Prospecting_Mobile — 0 impressions for 36h
     Detected: Tue May 6, daily check 08:45
     Cause: incorrect frequency cap (1/lifetime)
     Action: cap corrected → delivery resumed in ~2h
     Status: ✅ closed

  2. Adidas Running CTR drop −22% WoW
     What: CTR from 0.11% to 0.09% (−22% WoW)
     Detected: this report
     Cause: under investigation
     Status: 👀 open — explanation due by Friday

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 3 TAKEAWAYS FOR NEXT WEEK:

  1. Verify frequency caps on all active LIs
     (Nike incident showed that a misconfiguration can go undetected without a daily check)

  2. Adidas Running — identify cause of CTR drop and implement fix by Wed May 13

  3. Rossmann — monitor pacing daily, campaign ends May 15
     Goal: exhaust budget within ±5% of targeted spend
```

## Rules

- Report ready to send to team lead — no editing after generation
- Describe incidents as: what → when detected → cause → action → status (open/closed)
- Takeaways must be actionable with a specific deadline (not "worth checking" but "check by Wed May 13")
- WoW delta >20% always requires a comment — whether it is normal noise or a signal
- For zero delivery: always provide estimated lost impressions and cost (justifies priority)
