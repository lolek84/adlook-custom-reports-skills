---
name: a05-creative-performance
description: Use this skill when AdOps analyzes creative performance, wants to know which creatives are working, and what to pause. Triggers: "creative performance", "which creative works", "banner performance analysis", "creative scoring", "compare creatives", "best banner", "pause weak creatives", "creative ranking", "which creatives are effective", "optimize creatives".
version: 1.0.0
quality_score: 9
---

# A05 — Creative Performance Analysis

Creative ranking by effectiveness + identification of creatives to pause and to scale.

## Goal

Deliver a creative ranking with concrete recommendations: SCALE / MONITOR / PAUSE — and the dollar savings from pausing weak creatives.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_SIZE`
- `CREATIVE_DURATION`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `VIDEO_COMPLETION_RATE`
- `ECPM_USD`
- `TOTAL_SPEND_USD`
- `CLICKS`

**Date range:** last_14_days or specified range.

**Edge case:** If all creatives have <10,000 impressions — report: `⚠️ Insufficient data sample for reliable assessment. Minimum 10,000 impressions per creative required. Return in [X] days or expand the date range.`

### 2. Calculate score and assign actions

Agent calculates independently:

```
for display:
  score = CTR × (VIEWABILITY / 100)

for video:
  score = VIDEO_COMPLETION_RATE × (VIEWABILITY / 100)

# Exclude from ranking: creatives with <10,000 impressions (non-statistical)
creatives_to_evaluate = [c for c in creatives if IMPRESSIONS >= 10,000]

median_score = median(score for c in creatives_to_evaluate)

ACTION:
  score > 1.5 × median  → 🚀 SCALE
  score > 0.75 × median → 👀 MONITOR
  score < 0.5 × median  → ⛔ PAUSE
  IMPRESSIONS < 10,000  → 📊 INSUFFICIENT DATA
```

### 3. Prepare output

Use the template below — substitute real values:

```
🎨 CREATIVE ANALYSIS — Nike Air Max › LI: Remarketing_Desktop (14 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  #  Creative                    Type      Size      Imp.       CTR    Viewab.  Score  ACTION
  ── ──────────────────────────  ───────   ────────  ─────────  ─────  ───────  ─────  ──────────────
  1  Banner_spring_v2_color      display   300×250    420,000   0.18%   71%     0.128  🚀 SCALE
  2  Banner_spring_v1_mono       display   300×250    390,000   0.14%   68%     0.095  👀 MONITOR
  3  Banner_side_728             display   728×90     280,000   0.09%   62%     0.056  👀 MONITOR
  4  Banner_old_2025             display   300×250    340,000   0.04%   58%     0.023  ⛔ PAUSE
  5  Video_30s_spot              video     –          210,000   –       65%     0.091  👀 MONITOR
  6  Banner_new_test             display   160×600      7,200   0.11%   61%     –      📊 INSUFFICIENT DATA

  Median score:  0.075
  SCALE threshold:   0.113  (1.5× median)
  PAUSE threshold:   0.038  (0.5× median)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS:

  🚀 SCALE budget:
     Banner_spring_v2_color — CTR 0.18%, viewab. 71% (top creative, 70% above median)
     Action: move budget from "Banner_old_2025" here

  ⛔ PAUSE:
     Banner_old_2025 — CTR 0.04%, score 0.023 (69% below median)
     Weekly savings: ~$680/week at current spend rate
     Action: pause LI or remove creative from rotation

  👀 MONITOR for 7 days:
     Banner_side_728, Banner_spring_v1_mono, Video_30s_spot

  📊 INSUFFICIENT DATA:
     Banner_new_test (7,200 imp.) — re-evaluate after reaching 10,000 imp.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVATION: The 300×250 color format (Banner_spring_v2_color) outperforms the monochromatic version 2×
             — worth testing color variants on the remaining formats.
```

## Rules

- Score is relative (ranking within a campaign) — do not compare scores between campaigns
- Creatives with <10k impressions: do not recommend pausing, mark as "insufficient data"
- Check whether a "weak" creative is not running on worse inventory — low viewability may drag down the score independently of the creative
- Always state the weekly dollar savings from pausing weak creatives
- General observation at the end (e.g., "format X beats Y") — this is the most valuable insight for the client
