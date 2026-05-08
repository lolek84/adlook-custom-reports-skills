---
name: k12-end-of-campaign-report
description: Use this skill when the client requests a comprehensive end-of-campaign report, monthly summary, or final results. Triggers: "end of campaign report", "campaign summary", "monthly summary", "final results", "wrap up campaign", "summarize the campaign", "what did we achieve this month", "final report", "close campaign with report".
version: 1.0.0
quality_score: 9
---

# K12 — End-of-Campaign Report

Comprehensive final campaign report — ready to send to the client or executive team.

## Goal

A professional report the client can forward to their management or agency without further editing.

## Execution Steps

### 1. Fetch 4 reports from MCP in parallel

**Report 1 — Main KPIs:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS` — campaign_to_date.

**Report 2 — Video (if campaign included video):**
dims: `CREATIVE_NAME`, `CREATIVE_DURATION` + metrics: `VIDEO_STARTS`, `VIDEO_COMPLETION_RATE`, `VIDEO_COMPLETE_VIEWS` — campaign_to_date.

**Report 3 — Top inventory:**
dims: `TOP_LEVEL_DOMAIN`, `APP_NAME`, `ENVIRONMENT` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD` — campaign_to_date.

**Report 4 — Creatives:**
dims: `CREATIVE_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE` + metrics: `IMPRESSIONS`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE` — campaign_to_date.

**Edge case:** If the campaign is still running — mark in the title: *"Partial report — campaign in progress (until [DATE])"* and add how many % of the campaign has been completed. If the campaign has not started yet (0 impressions) — respond: *"Campaign has not launched — no data for the report."* If CAMPAIGN_BUDGET = $0 or unavailable — skip the budget section and note: *"Budget data unavailable."*

### 2. Prepare output

Use the template below — fill in real values:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 END-OF-CAMPAIGN REPORT
Nike Air Max | April 1–30, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY

The Nike Air Max campaign achieved all planned objectives. Over the course of the month,
the ad reached 1.8 million unique people in Poland, with a click-through rate
(0.14%) well above the industry benchmark (0.08%). The budget ($25,000) was
utilized almost in full (98%).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY RESULTS

• 👥 Reach: 1,800,000 unique people
  → The ad reached 1.8M distinct users in Poland

• 👁 Impressions: 4,200,000 (each person saw the ad on average 2.3 times)
  → Healthy contact frequency — no risk of ad fatigue

• 💰 Budget delivery: $24,500 of $25,000 spent (98%)
  → Budget utilized as planned

• 🖱 Click-through rate (CTR): 0.14%
  → 75% above the benchmark for banner ads (~0.08%) — creatives effectively attract attention

• 👀 Ad viewability: 68%
  → Above the minimum (50%, MRC standard) — ads were genuinely visible to audiences

[• 🎯 Conversions: 342 purchases | Cost per conversion: $53.80 | ROAS: 320%
  → For every $1 spent, the campaign generated $3.20 in revenue — above the target ($60 CPA)]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIDEO RESULTS (if applicable)

• 🎬 Video ad "Spring Spot 30s":
  Completed by: 480,000 people (40% of those who started)
  → Below benchmark (50%, industry norm for 30s spot) — we recommend a shorter 15s version for the next campaign

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHERE THE AD RAN (top 5)

  1. wp.pl         — 12% of impressions
  2. onet.pl       —  9%
  3. gazeta.pl     —  7%
  4. tvn24.pl      —  6%
  5. sport.pl      —  4%

  The ad appeared mainly on well-known Polish news and entertainment sites.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEST AND WEAKEST AD

  🏆 Best:    "Spring color banner" (300×250) — CTR 0.18%, viewability 71%
  ⛔ Weakest: "Old banner 2025" (300×250) — CTR 0.04%, viewability 58%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCLUSIONS AND RECOMMENDATIONS FOR THE NEXT CAMPAIGN

✅ What worked well:
  1. Colorful spring banners — click-through rate 2× higher than older creatives
  2. Premium inventory (wp.pl, onet.pl) — high ad viewability
  3. Major city targeting — strong reach at efficient cost

💡 Recommendations:
  1. Replace "Old banner 2025" with a new creative — pausing it will free up approx. $1,200/month
  2. Shorten the video spot to 15 seconds — projected completion rate increase from 40% to ~60%
  3. Consider increasing the Krakow audience share — the city achieved the best click-through rate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report generated: Thu May 8, 2026 | Adlook DSP
```

## Communication Rules

- Report is self-contained — the client forwards it without editing
- Executive summary: max 3 sentences — result + assessment + one key number
- Zero DSP jargon (not: "eCPM", "LI", "SSP") — only concepts understandable to executives
- Every metric accompanied by an interpretation in parentheses or the next sentence
- Recommendations always specific and actionable (not "worth considering" but "replace X with Y")
- Conversions/ROAS only if data is available — do not leave an empty section
- Viewability: "good result" = >50% (MRC standard), "excellent" = >70%
- VCR: benchmark for 30s spot = >40% OK, >60% excellent (industry norm)
