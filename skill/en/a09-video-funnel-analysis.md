---
name: a09-video-funnel-analysis
description: Use this skill when AdOps is diagnosing a video problem — low completion rate, viewer drop-off points, video funnel issues. Triggers: "video funnel", "video drop-off", "where do viewers drop off", "video completion analysis", "why low VCR", "video not working", "low completion rate", "skip rate problem", "video not being watched", "video campaign analysis".
version: 1.0.0
quality_score: 9
---

# A09 — Video Funnel Analysis

Where viewers drop off the video — optimizing creative length and video placements.

## Goal

Identify the exact drop-off point and determine whether the problem is the creative, the placement, or a technical error — with a concrete recommendation.

## Execution Steps

### 1. Fetch data from MCP

**Funnel report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_DURATION`, `SUPPLY_SOURCE`, `DEVICE_TYPE` + metrics: `VIDEO_STARTS`, `VIDEO_PLAYS_25`, `VIDEO_PLAYS_50`, `VIDEO_PLAYS_75`, `VIDEO_PLAYS_100`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_COMPLETION_RATE`, `VIDEO_SKIPS`, `VIDEO_ERRORS` — last_14_days.

**Edge case:** If `VIDEO_STARTS` = 0 for a video creative — stop: `⛔ Creative [NAME] has zero video starts. Check whether the creative is approved and whether the format is compatible with the targeted supply.`
If `VIDEO_ERRORS` / `VIDEO_STARTS` > 10% — flag a technical issue before quality analysis.

### 2. Calculate drop-off

Agent calculates for each creative:

```
start = VIDEO_STARTS          → 100%
q1%   = VIDEO_PLAYS_25 / VIDEO_STARTS × 100
q2%   = VIDEO_PLAYS_50 / VIDEO_STARTS × 100
q3%   = VIDEO_PLAYS_75 / VIDEO_STARTS × 100
end%  = VIDEO_COMPLETE_VIEWS  / VIDEO_STARTS × 100   (= VIDEO_COMPLETION_RATE)

drop_intro  = 100 − q1%          (dropped before 25% of video)
drop_middle = q1% − q2%          (dropped between 25–50%)
drop_late   = q2% − q3%          (dropped between 50–75%)
drop_ending = q3% − end%         (dropped between 75–100%)

largest_drop = max(drop_intro, drop_middle, drop_late, drop_ending)
skip_rate    = VIDEO_SKIPS / VIDEO_STARTS × 100
error_rate   = VIDEO_ERRORS / VIDEO_STARTS × 100
```

### 3. Diagnose the drop-off cause

| Signal | Threshold | Diagnosis | Recommendation |
|---|---|---|---|
| drop_intro > 40% | >40% drop before 25% | Intro too long or bad placement (non-skippable pre-roll) | Trim intro or cut to 15s |
| drop_middle > 30% | Large mid-video drop | Video loses relevance after hooking viewer | Shorten overall or rewrite the middle section |
| skip_rate > 70% | Most viewers skip | Skippable format — video doesn't hold in the first 5s | Rewrite intro (first 5s are critical) |
| error_rate > 5% | Technical errors | Creative encoding issue or player problem | Check creative format with creative team |
| Only 1 SSP has many errors | Errors concentrated | Compatibility with a specific SSP's player | Exclude the problematic SSP or fix the format |

### 4. Prepare output

Use the template below — substitute real values:

```
🎬 VIDEO FUNNEL ANALYSIS — Nike Air Max (14 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATIVE: "Spring Spot 2026" (30 seconds)
Total starts: 1,200,000 | Skip rate: 42% | Error rate: 1.2% 🟢

DROP-OFF FUNNEL:
  ▶️  Start:             100%  (1,200,000 starts)
  ■   To 7.5s  (25%):    62%  (−38%) ← LARGEST DROP ⚠️
  ■   To 15s   (50%):    51%  (−11%)
  ■   To 22.5s (75%):    45%  (−6%)
  ✅  To end   (30s):     40%  (−5%)   VCR: 40% 🟠 (benchmark: ~50%)

DIAGNOSIS: ⚠️ INTRO PROBLEM (drop_intro 38%)

  38% of viewers drop off before 7.5 seconds.
  Skip rate 42% suggests some are intentional skips.
  Content after 7.5s retains viewers — mid and late drops are normal.

  Per-SSP comparison:
    Google AdX:  VCR 48%  — good result
    Magnite:     VCR 28%  — below expectations (check placement type)
    Xandr:       VCR 44%  — OK

RECOMMENDATIONS:
  □ 1. [PRIORITY] Trim video to 15s — most drop-off occurs before 7.5s
                  Forecast: 15s version VCR → estimated 55–65% (vs 40% now)
  □ 2. Investigate Magnite VCR 28% — is this in-banner video instead of pre-roll?
        If so: exclude Magnite from the video campaign or switch to outstream
  □ 3. Rewrite intro — first 5–7s should immediately show product/benefit
```

**If error_rate > 5%:**
```
🔴 TECHNICAL ISSUE — [CREATIVE]

  Error rate: 8.4% (norm: <5%)
  Errors concentrated on: Magnite 71%, Index Exchange 18%

  Action: check creative format (VAST version, bitrate, resolution)
          with the creative team before further quality analysis.
          Do not optimize content while technical errors persist — it is a false signal.
```

**Multi-creative summary:**
```
CREATIVE RANKING:

  Creative             Duration  VCR    Skip%  Drop_intro  Rating
  ───────────────────  ────────  ─────  ─────  ──────────  ──────────
  Spring_spot_30s      30s       40%    42%    38%         🟠 Trim to 15s
  Spring_spot_15s      15s       61%    38%    22%         🟢 Best
  Teaser_6s             6s       84%    12%    10%         🟢🟢 Bumper ad
```

## Rules

- VCR benchmark: >50% = good, 30–50% = needs optimization, <30% = serious problem
- Error rate >5% = technical issue — resolve first, then analyze quality
- Drop_intro >40% = almost always a signal to shorten or rewrite the first 5s
- Compare VCR per SSP — differences >15 pp between SSPs indicate a placement type problem
- Always support a shortening recommendation with a VCR forecast for the shorter version
