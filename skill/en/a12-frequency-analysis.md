---
name: a12-frequency-analysis
description: Use this skill when AdOps wants to check campaign frequency, whether the same users are being over-served, or optimize frequency capping. Triggers: "frequency analysis", "frequency cap", "audience saturation", "how many times", "frequency too high", "reach vs frequency", "same users seeing too many ads".
version: 1.0.0
quality_score: 9
---

# A12 — Frequency and reach analysis

Are we over-serving the same users — diagnose audience saturation and optimize frequency capping.

## Goal

Detect audience saturation with a concrete diagnosis and recommendation to change the frequency cap or expand targeting.

## Execution Steps

### 1. Pull data from MCP

**Daily trend report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE`, `DATE` + metrics: `REACH`, `FREQUENCY`, `IMPRESSIONS` — last_30_days.

**Edge case:** If REACH = 0 or no data for the full period — report: `⚠️ REACH metric is not available for this campaign. Frequency cap analysis is not possible without unique user data.`

### 2. Diagnose the trend

Agent calculates independently:

```
# Group data by weeks
week_1 = first 7 days of campaign
week_N = last 7 days

avg_freq_week_1 = avg(FREQUENCY) in week 1
avg_freq_week_N = avg(FREQUENCY) in last week
saturation_score = avg_freq_week_N / avg_freq_week_1

reach_delta_%    = (reach_last_week − reach_first_week) / reach_first_week × 100
freq_delta_%     = (freq_last_week − freq_first_week) / freq_first_week × 100
```

**Interpretation of combinations:**
| Reach | Frequency | Diagnosis |
|---|---|---|
| ↑ growing | ↑ growing | 🟢 Healthy expansion — new users + repeat exposure |
| → stable | ↑ growing | 🔴 Audience saturation — same users seeing more and more |
| → stable | → stable | 🟢 Mature campaign — equilibrium |
| ↓ declining | ↑ growing | 🔴 Critical saturation — reach is shrinking |
| → stable (new reach ≈ 0/day) | → stable | 🟡 Hidden saturation — pool exhausted, algorithm recirculates same users; verify daily reach increment |

### 3. Frequency cap benchmarks

| Format | Optimal cap | Alert threshold |
|---|---|---|
| Display awareness | 3–5 imp/week | >7/week |
| Display performance | 5–10 imp/week | >15/week |
| Video | 2–3 imp/week | >5/week |
| CTV | 3–5 imp/week | >8/week |

### 4. Prepare output

Use the template below — substitute real values:

```
📊 FREQUENCY ANALYSIS — Nike Air Max (April 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATE:
  Average frequency (week 4):  4.7 impressions/person/week  🟡
  Optimal cap (display aware.): 3–5/week  ← approaching upper limit
  Audience saturation score:    1.92  (week 4 vs week 1)

4-WEEK TREND:

  Week    Reach         Δ Reach   Frequency   Δ Freq   Diagnosis
  ───────  ───────────── ─────────  ─────────   ──────  ─────────────────────
  Week 1   680,000       —          2.4×         —      🟢 campaign start
  Week 2   720,000       +6%        2.9×        +21%    🟢 healthy growth
  Week 3   710,000       −1%        3.8×        +31%    🟡 reach has stalled
  Week 4   695,000       −2%        4.7×        +24%    🔴 saturation — reach declining, freq growing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAGNOSIS: 🔴 AUDIENCE SATURATION (weeks 3–4)

  Since week 3: reach has stopped growing (−1%, −2%), while frequency increases (+31%, +24%).
  Campaign is reaching a narrower group of the same people.
  At current trend: frequency may reach 7× in week 5 → benchmark exceeded.

RECOMMENDATIONS (choose one or combine):

  □ 1. [IMMEDIATELY] Change frequency cap to 3/week (from current: no cap or >5)
       Effect: frequency growth stops, some budget may slow slightly

  □ 2. [THIS WEEK] Expand audience targeting
       Options: add lookalike 5% → 10%, expand geo reach, activate new interest segments
       Effect: new users enter the pool → reach will start growing again

  □ 3. [OPTIONAL] Insert a "cooldown" period of 3–5 days without serving
       Effect: audience "resets" — after resuming the campaign reaches fresh users again
       Risk: pacing gap — check whether the budget allows for it
```

## Rules

- Stable reach + growing frequency = ALWAYS a problem — do not ignore this signal
- Growing reach + growing frequency = healthy (new users + retention) — do not alert
- Saturation score >2.0 = urgent intervention; 1.5–2.0 = monitor; <1.5 = OK
- Recommend a frequency cap before the benchmark is exceeded — proactively
- Always provide a specific cap value to set (e.g., "3/week"), not a range
- Hidden saturation flag: if daily reach increment <1% for ≥3 consecutive days — treat as saturation even if total reach appears to grow
