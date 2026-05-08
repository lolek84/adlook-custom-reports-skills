---
name: a04-viewability-audit
description: Use this skill when AdOps wants to audit campaign viewability, find weak inventory domains, or run a visibility audit. Triggers: "viewability audit", "low viewability", "visibility check", "viewability below benchmark", "ad visibility", "which domains have poor viewability", "viewability dropping", "measurability problem".
version: 1.0.0
quality_score: 9
---

# A04 — Viewability Audit

Full viewability analysis by inventory — identifying bad supply and providing exclusion recommendations.

## Goal

Identify domains dragging down average viewability, assess the potential savings, and produce a concrete blacklist.

## Execution Steps

### 1. Fetch data from MCP (3 reports in parallel)

**Domain report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `TOP_LEVEL_DOMAIN`, `SUPPLY_SOURCE`, `ENVIRONMENT` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS`, `ECPM_USD`, `TOTAL_SPEND_USD` — last_30_days.

**App report:**
dims: `CAMPAIGN_NAME`, `APP_NAME`, `ENVIRONMENT`, `DEVICE_TYPE` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS`, `TOTAL_SPEND_USD` — last_30_days.

**Device report:**
dims: `CAMPAIGN_NAME`, `DEVICE_TYPE`, `ENVIRONMENT` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS` — last_30_days.

**Edge case:** Skip domains with <1,000 impressions — sample too small, results are not statistically valid. If MEASURABILITY <60% for a domain, add a flag `⚠️ LOW MEASURABILITY` — viewability may be unreliable.

### 2. Inventory classification

Agent classifies each domain/app:

```
PREMIUM      : VIEWABILITY >= 70%
ACCEPTABLE   : VIEWABILITY >= 50%
BELOW NORM   : VIEWABILITY >= 40%
EXCLUDE      : VIEWABILITY <  40%   ← blacklist candidate

Add LOW MEASURABILITY flag if MEASURABILITY < 60%
```

### 3. Calculate exclusion impact

Agent calculates independently:

```
spend_bad_inventory      = sum TOTAL_SPEND_USD where VIEWABILITY < 40%
pct_bad_budget           = spend_bad_inventory / total_spend × 100

weighted_viewability_now        = weighted avg VIEWABILITY (weight = IMPRESSIONS)
weighted_viewability_without_bad = weighted avg VIEWABILITY after excluding domains <40%
potential_improvement           = weighted_viewability_without_bad − weighted_viewability_now
```

### 4. Prepare output

Use the template below — substitute real values:

```
👁 VIEWABILITY AUDIT — Nike Air Max (April 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATUS:
  Average viewability:  54%  🟡  (target: >60%, minimum: >50%)
  Measurability:        78%  🟢
  Domains analyzed:    312  (above 1,000 impressions)

INVENTORY RANKING:
  🟢 PREMIUM  (>70%):  84 domains  — 38% of budget  — avg viewab. 74%
  🟡 OK       (50–70%): 167 domains — 48% of budget  — avg viewab. 61%
  🟠 WEAK     (40–50%):  38 domains —  9% of budget  — avg viewab. 45%
  🔴 EXCLUDE  (<40%):   23 domains —  5% of budget  — avg viewab. 31%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 TO EXCLUDE (top 5 by spend):

  Domain              Imp.       Viewab.   Budget  Measurab.
  ─────────────────── ──────────  ──────── ─────── ──────────
  fast-news.com        184,000    22%      $1,840   91%  ← exclude
  click-info.com       142,000    28%      $1,420   88%  ← exclude
  portal-top.xyz        98,000    31%        $980   ⚠️ 48%  ← exclude + low measurability
  free-games24.com      87,000    36%        $870   82%  ← exclude
  info-rapid.net        74,000    38%        $740   79%  ← exclude

🏆 TOP 5 PREMIUM (benchmark for optimization):

  Domain              Imp.       Viewab.   Budget
  ─────────────────── ──────────  ──────── ───────
  wp.pl                420,000    78%      $4,200
  onet.pl              380,000    74%      $3,800
  gazeta.pl            290,000    71%      $2,900
  tvn24.pl             210,000    76%      $2,100
  bankier.pl           180,000    73%      $1,800

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATION:
  Exclude 23 domains with viewability <40%
  Budget recovered:    $5,850/month (5% of total) → reallocate to premium inventory
  Expected improvement: 54% → ~61% viewability  (+7 pp)

BLACKLIST TO IMPLEMENT:
  fast-news.com, click-info.com, portal-top.xyz, free-games24.com, info-rapid.net
  [+ 18 additional domains from the EXCLUDE column]
```

## Rules

- Sort "TO EXCLUDE" by Budget column ($ impact), not by viewability
- Do not exclude domains with <1,000 impressions — data is non-statistical, false positive risk
- MEASURABILITY <60% = viewability for that domain is uncertain — flag but do not auto-exclude
- An unknown domain with good viewability ≠ a bad domain — do not penalize for lack of brand recognition
- Always state how much % of budget is recovered and by how much viewability will improve — this justifies the action
