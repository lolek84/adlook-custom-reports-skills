---
name: a15-period-comparison
description: Use this skill when AdOps wants to compare results between weeks or months, see WoW or MoM trends and regressions. Triggers: "period comparison", "WoW", "MoM", "week over week", "month over month", "compare periods", "compare this week vs last", "trend analysis", "what has changed", "delta results".
version: 1.0.0
quality_score: 9
---

# A15 — Period comparison (MoM / WoW)

How results changed between weeks or months — detect trends and regressions.

## Goal

Delta table with highlights — what improved, what regressed, with cause diagnosis and recommendation.

## Execution Steps

### 1. Establish date ranges

```
WoW (week over week):   current = last_7_days | previous = 7–14 days ago
MoM (month over month): current = current month | previous = previous month
Custom:                 use ranges provided by the user
```

### 2. Pull data (2 reports in parallel)

**Current period report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE` — current period.

**Previous period report:**
Same set for previous period.

**Edge case:** If campaign started in the current period (no previous data) — mark: `(no previous period data — campaign <7 days or new)` and skip the delta column for this campaign.

**Edge case — different period lengths:** If compared periods have different numbers of days (e.g., February 28 days vs March 31 days) — normalize volumetric metrics to per-day before calculating delta: `delta_normalized = (M_current / days_current − M_previous / days_previous) / (M_previous / days_previous) × 100`. Note in the report: *"Periods of different length — deltas normalized per day."*

### 3. Calculate deltas

Agent calculates independently:

```
for each metric M:
  delta_abs = M_current − M_previous
  delta_pct = (M_current − M_previous) / M_previous × 100

  direction matters:
  "higher = better" metrics:  IMPRESSIONS, CTR, VIEWABILITY, REACH, VCR, ROAS, CONVERSIONS
  "lower = better" metrics:   ECPA_USD, ECPM_USD, FREQUENCY

  if |delta_pct| < 10%:  ↔ STABLE   (natural fluctuation)
  if delta in good direction and |delta| ≥ 10%:  ⬆ IMPROVEMENT
  if delta in bad direction and |delta| ≥ 10%:   ⬇ REGRESSION
  if |delta| ≥ 30%:  significant change — cause explanation required
```

### 4. Prepare output

Use the template below — substitute real values:

```
📊 WoW — Nike Air Max
Week 2 (May 5–11) vs Week 1 (Apr 28 – May 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Metric              Week 1       Week 2       Change    Rating
  ──────────────── ──────────── ──────────── ──────── ────────
  Impressions        2,100,000    2,450,000    +17%    ⬆ IMPROVEMENT
  Spend              $9,200       $10,800      +17%    ↔ (proportional to impressions)
  CTR                0.12%        0.14%        +17%    ⬆ IMPROVEMENT
  Viewability        68%          71%          +4%     ↔ stable
  Reach              820,000      890,000      +9%     ↔ stable
  Frequency          2.6×         2.8×         +8%     ↔ stable (direction: increase = worse)
  eCPM               $2.20        $2.40        +9%     ↔ stable
  Conversions        n/a          n/a          —       no pixel
  VCR                —            —            —       no video in this campaign

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 BIGGEST IMPROVEMENTS:

  ⬆ CTR: 0.12% → 0.14% (+17%)
    Probable cause: new creative Baner_wiosna_v2 launched May 5
    Takeaway: spring creative is performing better — scale budget to this format

  ⬆ Impressions: +17% at +17% spend — efficiency unchanged, scale growing
    Campaign scaling healthily

⚠️ REGRESSIONS TO INVESTIGATE:
  No regressions this week.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCLUSION:
  Week 2 outperformed Week 1. CTR increase of 17% likely driven by new creative
  launched May 5. Pacing stable, eCPM without significant change.
  Recommendation: increase budget for creative Baner_wiosna_v2 by 20% in Week 3.
```

**MoM variant with regression:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGRESSIONS TO INVESTIGATE:

  ⬇ Viewability: 72% → 58% (−19%)
    Probable cause: supply mix change — Magnite increased share from 8% to 24%
    (Magnite avg viewab. 41% on this campaign)
    Recommendation: restore supply proportions from previous month or limit Magnite

  ⬇ CTR: 0.14% → 0.09% (−36%) ← significant change (>30%)
    Check: (1) were creatives changed? (2) was targeting changed? (3) fraud?
    Required: CTR anomaly analysis (skill A03) before drawing conclusions
```

## Rules

- Delta <10% is natural fluctuation — do not alert, mark as ↔ stable
- Delta >30% always requires cause explanation — do not present without a diagnosis
- Seasonality in MoM: July vs December are different markets — note if this may be a factor
- Always look for the cause of the change before formulating a conclusion (creative / bid / supply / fraud)
- Final conclusion: one concrete recommendation with a number (e.g., "+20% budget to X"), not a generality
