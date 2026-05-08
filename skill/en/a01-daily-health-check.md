---
name: a01-daily-health-check
description: Use this skill when AdOps asks for a morning campaign review, daily check, today's alerts, or status of all campaigns. Triggers: "daily health check", "morning check", "campaign overview", "all campaigns status", "daily review", "what's happening with campaigns", "alerts for today", "show me everything", "morning briefing".
version: 1.0.0
quality_score: 9
---

# A01 — Daily Health Check

Morning review of all active campaigns — pacing, anomalies, alerts. The starting point of the day.

## Goal

Quick review of all campaigns before the workday begins — identify what requires immediate attention.

## Execution Steps

### 1. Fetch the advertiser list

Call `list_advertisers` to get active clients.

**Edge case:** If `list_advertisers` returns an empty list or an error — stop and report: `⚠️ Cannot retrieve advertiser list. Check MCP connection or API permissions.`

### 2. Fetch campaign data (2 reports in parallel)

**Report A — yesterday:**
`run_report_preview` with dims: `ADVERTISER_NAME`, `CAMPAIGN_NAME`, `CAMPAIGN_STATUS`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`, `LINE_ITEM_NAME`, `LINE_ITEM_STATUS` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — date_range: yesterday.

**Report B — last_7_days:**
Same dimension set for last_7_days — for calculating trends and baseline averages.

**Edge case:** If a campaign has CAMPAIGN_STATUS = INACTIVE or ENDED — skip it in the main report, count them as "inactive: N". If a campaign had 0 impressions for the entire previous day, also check whether CAMPAIGN_STATUS changed unexpectedly to PAUSED or ENDED.

### 3. Calculate pacing for each campaign

Agent calculates independently:

```
days_elapsed        = today − CAMPAIGN_START_DATE
days_total          = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
expected_pacing%    = (days_elapsed / days_total) × 100
actual_pacing%      = (TOTAL_SPEND_USD / CAMPAIGN_BUDGET) × 100
delta               = actual_pacing% − expected_pacing%

STATUS:
  delta < −15%  → 🔴 UNDERPACING (critical)
  delta < −5%   → 🟡 UNDERPACING (mild)
  delta > +15%  → 🟡 OVERPACING
  otherwise     → 🟢 OK
```

### 4. Auto-detect alerts

Check each campaign/LI and flag:

| Condition | Alert | Priority |
|---|---|---|
| IMPRESSIONS_yesterday = 0 AND LINE_ITEM_STATUS = ACTIVE | 🚨 ZERO DELIVERY | P0 — immediate action |
| delta_pacing < −15% | 🔴 UNDERPACING | P1 |
| CTR_yesterday > 2× CTR_7d_avg | ⚡ CTR SPIKE | P1 — check for fraud |
| CTR_yesterday < 0.5× CTR_7d_avg | 📉 CTR DROP | P2 |
| VIEWABILITY_yesterday < 40% | 👁 LOW VIEWABILITY | P2 |
| delta_pacing > +15% | 🟡 OVERPACING | P2 |

### 5. Prepare output

Use the template below — substitute real values:

```
🌅 DAILY HEALTH CHECK — Thu May 8, 2026, 08:42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 ALERTS (2) — require action today:

  P0 │ 🚨 ZERO DELIVERY
     │ Nike Air Max › LI: Prospecting_Mobile
     │ Status: ACTIVE, yesterday: 0 impressions (norm: ~85k/day)
     │ Action: check targeting, creatives and bid — frequency cap likely too restrictive → run A02

  P1 │ ⚡ CTR SPIKE
     │ Adidas Running › LI: Remarketing_Desktop
     │ CTR yesterday: 1.84% vs 7d avg: 0.11% — 16× increase
     │ Action: check top domains by CTR — possible bot traffic → run A03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPAIGN STATUS (8 active):

🟢 OK (5):
  Nike Air Max       pacing 74% | expected 73% | Δ+1%  | $920/day | CTR 0.12% | viewab. 68%
  Samsung Galaxy     pacing 51% | expected 50% | Δ+1%  | $650/day | CTR 0.09% | viewab. 71%
  Żywiec Zdrój       pacing 88% | expected 85% | Δ+3%  | $280/day | CTR 0.08% | viewab. 62%
  H&M Spring         pacing 62% | expected 60% | Δ+2%  | $510/day | CTR 0.14% | viewab. 65%
  PKO BP Loans       pacing 45% | expected 46% | Δ−1%  | $380/day | CTR 0.07% | viewab. 74%

🟡 WATCH (2):
  Adidas Running     pacing 38% | expected 50% | Δ−12% | $390/day | ⚡ CTR SPIKE — see alert
  Rossmann Offers    pacing 91% | expected 70% | Δ+21% | $920/day | OVERPACING — will exhaust budget ~4 days early → see A16

🔴 REQUIRES ACTION (1):
  Nike Air Max › LI  pacing  0% | expected 73% | Δ−73% | 0 imp.  | ZERO DELIVERY — see P0 alert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active campaigns: 8 | Active LIs: 23 | Alerts: 2 | Inactive (skipped): 4
```

**If no alerts**, replace the alert section with:
```
✅ ALERTS (0) — all campaigns within normal parameters, no anomalies yesterday
```

**Actions for each alert type (append to alert):**
- `ZERO DELIVERY` → "Check: (1) targeting too narrow? (2) creatives rejected? (3) bid below floor price? (4) frequency cap exhausted?" → run A02
- `CTR SPIKE` → "Check top domains by CTR from yesterday — if landing_rate <20%, likely bot traffic. Exclude the domain." → run A03
- `CTR DROP` → "Check whether creatives or targeting were changed. Compare CTR per creative yesterday vs 7d." → run A03
- `UNDERPACING` → "Options: (1) raise bid floor by 15–20%, (2) broaden targeting, (3) check whether LI has active conflicts" → run A02
- `OVERPACING` → "Set daily cap = remaining_budget / days_remaining = $[X]/day" → run A16
- `LOW VIEWABILITY` → "Check which domains are dragging down viewability — exclude those below 30%" → run A04

## Rules

- Prioritize alerts: P0 (ZERO_DELIVERY) > P1 (UNDERPACING, CTR_SPIKE) > P2 (rest)
- Every alert must include: campaign, LI, specific value, ready-to-execute action
- STATUS section: sort descending by priority (🔴 → 🟡 → 🟢)
- If a campaign ends in ≤3 days — mark `⏰ ENDS [DATE]`
- If a campaign has 0 impressions for the entire previous day — also check whether CAMPAIGN_STATUS changed unexpectedly to PAUSED or ENDED
- Report generation timestamp at the end — helps track data freshness
- Cross-reference: every alert in the ACTIONS section references the diagnostic skill (A02, A03, A04, A16)
