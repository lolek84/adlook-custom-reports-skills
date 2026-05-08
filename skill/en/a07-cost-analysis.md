---
name: a07-cost-analysis
description: Use this skill when AdOps wants to check campaign cost efficiency, eCPM, eCPC, eCPA, or cost optimization. Triggers: "cost analysis", "eCPM analysis", "expensive inventory", "cost efficiency", "CPM breakdown", "check costs", "eCPM rising", "paying too much for clicks", "optimize costs", "CPA above KPI", "cost too high", "eCPM spike", "why are we paying so much".
version: 1.0.0
quality_score: 9
---

# A07 — Cost Analysis (eCPM / eCPC / eCPA)

Campaign cost efficiency — whether we are paying the right price for results and where we are overpaying.

## Goal

Identify cost outliers and specify concrete actions with estimated savings.

## Execution Steps

### 1. Fetch data from MCP (3 reports in parallel)

**Main report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_BIDDING_MODEL`, `LINE_ITEM_PRIMARY_GOAL_NAME`, `LINE_ITEM_PRIMARY_GOAL_VALUE` + metrics: `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `ECPCV_USD`, `TOTAL_SPEND_USD`, `IMPRESSIONS`, `CLICKS`, `TOTAL_CONVERSIONS` — last_14_days.

**Supply vs cost report:**
dims: `CAMPAIGN_NAME`, `SUPPLY_SOURCE`, `CREATIVE_TYPE`, `DEVICE_TYPE` + metrics: `ECPM_USD`, `ECPC_USD`, `TOTAL_SPEND_USD`, `IMPRESSIONS` — last_14_days.

**14-day trend report:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DATE` + metrics: `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `TOTAL_SPEND_USD` — last_14_days.

**Edge case:** If `LINE_ITEM_PRIMARY_GOAL_VALUE` = null or 0 — you cannot calculate efficiency vs. goal. Report: `⚠️ No KPI defined for this LI — analyzing vs. market benchmark instead of campaign goal.`

### 2. Benchmarks and alert thresholds

| Format | Typical eCPM | 🟡 Watch | 🔴 Alert |
|---|---|---|---|
| Display standard | $1.00–3.00 | >$4.00 | >$6.00 |
| Rich media | $3.00–8.00 | >$10.00 | >$15.00 |
| Video pre-roll | $5.00–15.00 | >$18.00 | >$25.00 |
| CTV | $15.00–30.00 | >$35.00 | >$50.00 |

### 3. Calculate efficiency vs. goal and find outliers

Agent calculates independently:

```
for each LI with a goal:
  if BIDDING_MODEL = "CPC":  efficiency = LINE_ITEM_PRIMARY_GOAL_VALUE / ECPC_USD
  if BIDDING_MODEL = "CPA":  efficiency = LINE_ITEM_PRIMARY_GOAL_VALUE / ECPA_USD
  if BIDDING_MODEL = "CPM":  efficiency = benchmark_eCPM / ECPM_USD
  # efficiency > 1.0 = below cost goal (good)
  # efficiency < 1.0 = above goal (overpaying)

eCPM_trend        = compare eCPM from week 1 vs week 2 (delta%)
most_expensive    = SUPPLY_SOURCE + CREATIVE_TYPE with highest ECPM and >5% budget share
most_efficient    = SUPPLY_SOURCE + CREATIVE_TYPE with lowest ECPM and >5% budget share
```

### 4. Prepare output

Use the template below — substitute real values:

```
💰 COST ANALYSIS — Nike Air Max (14 days: Apr 25 – May 8, 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL COSTS:
  Average eCPM:   $2.40  🟢  (display benchmark: $1–3)
  Average eCPC:   $0.82  🟡  (target: $0.60 — exceeded by 37%)
  eCPA:           n/a    (no conversion pixel)

  eCPM trend (week 1 vs week 2):
  Week 1: $2.10 | Week 2: $2.90 → +38% increase 🔴  — investigate what changed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EFFICIENCY vs. GOAL (per line item):

  LI                    Model   Goal    Actual  Efficiency  Rating
  ─────────────────── ─────── ─────   ───────  ──────────  ──────
  Remarketing_Desktop  CPC    $0.60   $0.52    115%  🟢    below goal (good)
  Prospecting_Mobile   CPC    $0.60   $1.24     48%  🔴    2× over goal
  Display_Broad        CPC    $0.60   $0.71     85%  🟡    slightly over goal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOST EXPENSIVE COMBINATIONS (outliers):

  Supply Source    Format    eCPM   % budget  Note
  ──────────────  ────────  ─────  ─────────  ─────────────────────
  Magnite          display   $5.80    18%      🔴 2.4× above avg — candidate for reduction
  Index Exchange   display   $3.90    12%      🟡 slightly above norm

CHEAPEST + MOST EFFICIENT:

  Supply Source    Format    eCPM   CTR     Viewab.  Note
  ──────────────  ────────  ─────  ──────  ───────  ─────────────────
  Google AdX       display   $1.80   0.14%   71%     🟢 best price/quality ratio
  Xandr            display   $2.10   0.12%   68%     🟢 good result

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS:

  □ 1. [TODAY]       Prospecting_Mobile — eCPC $1.24 vs goal $0.60 (2×)
                     Action: change bid from CPC to CPM $2.00 or change bidding strategy
                     Expected savings: ~$340/week with 30% CPC reduction

  □ 2. [TODAY]       Magnite eCPM $5.80 (18% of budget) — investigate whether results justify the premium
                     Action: if CTR and viewability are not clearly higher → cap share at 5%
                     Expected savings: ~$420/week

  □ 3. [THIS WEEK]   eCPM +38% increase in week 2 — identify the cause
                     Investigate: was bid floor, targeting, or a new supply source added?
```

## Rules

- Rising eCPM ≠ automatic problem — it may rise alongside higher viewability or better CTR
- Always compare to `LINE_ITEM_PRIMARY_GOAL_VALUE` if available — that is the real KPI
- Look for outliers: one SSP with 2–3× higher eCPM and no clearly better results is a candidate for reduction
- Every recommendation = a specific dollar savings amount (justifies the action)
- The 14-day trend is more important than a single value — one expensive day is noise, a trend is a signal
