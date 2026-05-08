---
name: a03-ctr-anomaly-analysis
description: Use this skill when AdOps spots a CTR anomaly — sudden spike or drop in CTR, suspected fraud. Triggers: "CTR anomaly", "CTR spike", "CTR drop", "unusual click rate", "CTR analysis", "suspicious CTR", "CTR too high", "CTR falling", "strange CTR on campaign", "fraud CTR", "CTR suddenly went up", "suspicious clicks".
version: 1.0.0
quality_score: 9
---

# A03 — CTR Anomaly Analysis

Detection and diagnosis of a sudden CTR spike or drop — distinguishing real change from fraud and statistical noise.

## Goal

Diagnose the source of a CTR anomaly and assess whether it is fraud, a creative change, or natural fluctuation — with a concrete action plan.

## Execution Steps

### 1. Fetch historical data (3 reports in parallel)

**30-day trend report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DATE` + metrics: `CTR`, `CLICKS`, `IMPRESSIONS`, `LANDING_RATE` — last_30_days.

**Domain breakdown report:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `TOP_LEVEL_DOMAIN`, `DATE` + metrics: `CTR`, `CLICKS`, `IMPRESSIONS`, `LANDING_RATE` — last_14_days.

**Device/creative report:**
dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `DEVICE_TYPE` + metrics: `CTR`, `CLICKS`, `LANDING_RATE` — last_14_days.

**Edge case:** If the campaign has <7 days of history — report: `⚠️ Insufficient data sample (<7 days) for reliable statistical analysis. Comparing to format benchmark instead of campaign history.`

### 2. Detect the anomaly

Agent calculates independently:

```
mean_CTR        = average CTR for last_30d (excluding last 2 days)
std_CTR         = standard deviation of CTR for last_30d
threshold_spike = mean + 2 × std  (exceeding = anomaly)
threshold_drop  = mean − 2 × std  (falling below = anomaly)

anomaly_day     = day where |CTR − mean_CTR| > 2 × std
delta_value     = CTR_anomaly − mean_CTR
```

### 3. Diagnose: fraud vs. real change

**Fraud indicators (CTR spike) — more fulfilled = more certain diagnosis:**

| Signal | Threshold | Diagnostic weight |
|---|---|---|
| Landing rate on spike day | <50% (bots click, don't visit) | 🔴 High |
| Display CTR | >2.0% | 🔴 High |
| Concentration on 1–3 domains | >70% of clicks from 1 domain | 🔴 High |
| Spike at night (00:00–06:00) | disproportionate clicks | 🟡 Medium |
| Spike only on weekends | no business justification | 🟡 Medium |

**Indicators of real change:**
- Landing rate remains high (>70%) — real users are visiting the site
- New creative deployed exactly on the spike day
- Spike distributed across domains (>10 domains with higher CTR)
- Targeting or bid change on the spike day

### 4. Prepare output

Use the template below — substitute real values:

```
⚡ CTR SPIKE ANALYSIS — Adidas Running › LI: Remarketing_Desktop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANOMALY DETECTED:
  Type:             CTR SPIKE 🔴
  Day:              Tue May 6, 2026
  CTR on that day:  1.84%  vs  30d average: 0.11%  (16× increase, +1.73 pp)
  Anomaly threshold: 0.28%  (mean + 2σ)

DIAGNOSIS: 🔴 PROBABLE FRAUD (confidence: high)

Evidence:
  ✗ Landing rate May 6:   8%  (norm: 74%)  → clicks are not reaching the site
  ✗ Concentration:        94% of clicks from 1 domain (suspicious-site.com — normally 2%)
  ✗ Display CTR >2%:      1.84% — above the fraud threshold
  ✓ No creative changes:  no new deployments May 5–7

Suspicious domains (top 3 by click share):
  1. suspicious-site.com    — 94% of clicks | CTR 18.4% | landing_rate 3%   🔴 EXCLUDE
  2. info-portal24.com      —  4% of clicks | CTR  2.1% | landing_rate 42%  🟡 INVESTIGATE
  3. click-news.com         —  2% of clicks | CTR  1.8% | landing_rate 38%  🟡 INVESTIGATE

RECOMMENDATION:
  □ 1. [TODAY]    Exclude suspicious-site.com from the campaign domain exclusion list
  □ 2. [TODAY]    Add info-portal24.com and click-news.com to watchlist — exclude if landing_rate <50%
  □ 3. [TODAY]    Consider reporting to SSP (Google AdX) as invalid traffic
  □ 4. [TOMORROW] Check CTR and landing_rate after 24h — confirm return to normal
```

**CTR DROP variant:**
```
📉 CTR DROP ANALYSIS — [CAMPAIGN]

  CTR yesterday: 0.03%  vs  30d average: 0.11%  (72% drop)
  Landing rate: 78% (normal) → traffic is genuine, but fewer clicks

DIAGNOSIS: 🟡 CREATIVE / TARGETING CHANGE

Investigate:
  □ 1. Was a creative changed yesterday? (a new creative may have lower CTR for the first few days)
  □ 2. Was targeting or audience changed? (a new group may behave differently)
  □ 3. Compare CTR per creative: yesterday vs 7d avg
  □ 4. If no changes — monitor for 3 days (may be natural fluctuation)
```

**UNCLEAR variant (mixed signals):**
```
🔍 CTR ANOMALY — further observation required

  Fraud signals met: 2/5
  Real-change signals met: 2/4
  → Diagnosis uncertain

Action: monitor for 48h. If spike repeats → exclude top domain.
```

## Rules

- Landing rate is the key signal — <50% during a spike = almost certain fraud
- CTR >2% for display always requires explanation — do not treat as a good result
- Do not raise alarms without evidence — describe diagnosis confidence (high / medium / unclear)
- For each suspicious domain: provide CTR, click share, and landing_rate
- Remediation actions always with a deadline (TODAY / TOMORROW / MONITOR)
