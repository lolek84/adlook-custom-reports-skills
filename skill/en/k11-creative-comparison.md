---
name: k11-creative-comparison
description: Use this skill when the client asks which ad performs better, wants to compare banners or creative versions, A/B test. Triggers: "which creative works better", "compare banners", "A/B test", "best creative", "creative comparison", "which ad is better", "compare ads", "which image", "which version".
version: 1.0.0
quality_score: 9
---

# K11 — Creative Comparison

Which version of the ad performs better — a clear answer with a recommendation.

## Goal

Give the client a clear answer on which creative is best and what to do about it — without technical jargon.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_SIZE`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `VIDEO_COMPLETION_RATE`
- `TOTAL_SPEND_USD`

**Date range:** range provided by the user or campaign_to_date.

**Edge case:** If a creative has <10,000 impressions — flag it with: *"(insufficient data for evaluation — result may be random)"* and do not recommend pausing based on this. If all creatives have <10,000 impressions — do not generate a ranking, respond: *"Insufficient data for a reliable assessment — wait for at least 10,000 impressions per creative."* If the campaign has only one creative — do not compare, inform: *"No creatives to compare — the campaign has only one ad version."*

### 2. Score and rank creatives

Agent calculates independently:

```
for display:  score = CTR × (VIEWABILITY / 100)
for video:    score = VIDEO_COMPLETION_RATE × (VIEWABILITY / 100)

median_score = median score of creatives with ≥10,000 impressions

DECISION:
  score > 1.5 × median  → 🚀 Scale — move budget here
  score > 0.75 × median → 👀 Monitor — results within norm
  score < 0.5 × median  → ⛔ Pause — weak performance
  impressions < 10,000  → 📊 Insufficient data
```

### 3. Prepare output

Use the template below — fill in real values:

```
🎨 Ad Comparison — Nike Air Max (April 2026)

CREATIVE RANKING:

  #  Ad name                Format    Impressions  CTR     Viewability  Rating
  ── ─────────────────────  ────────  ───────────  ──────  ───────────  ───────────────
  1  Spring color banner    300×250    420,000      0.18%   71%          🚀 Best
  2  Spring mono banner     300×250    380,000      0.14%   68%          👀 Good
  3  Sidebar banner         728×90     280,000      0.09%   62%          👀 Good
  4  Old banner 2025        300×250    340,000      0.04%   58%          ⛔ Weak
  5  New test banner        300×250      7,200       0.11%   61%          📊 Insufficient data

🏆 Best ad: "Spring color banner"
   CTR 0.18% — more than twice the industry benchmark for banner ads (0.08%).
   Viewability 71% — a strong result.

⛔ Weakest ad: "Old banner 2025"
   CTR 0.04% — below half the industry benchmark.
   Pausing this ad will save approx. $1,200/month and redirect budget
   to the version that works.

💡 Recommendation:
   Pause "Old banner 2025" and move its budget to "Spring color banner".
   The color spring version clearly attracts more attention — it is also worth testing
   it in 728×90 format instead of the current monochrome sidebar version.
```

**If insufficient data for comparison (<2 creatives with ≥10k impressions):**
```
📊 Insufficient data for a reliable comparison.

  Creative "New test banner" has only 7,200 impressions
  (minimum 10,000 needed for the result to be statistically meaningful).

  Let's revisit the comparison in [N] days — the data will be reliable then.
```

## Communication Rules

- Instead of "CTR" say "click-through rate" (CTR after first mention)
- Instead of "viewability" say "ad viewability"
- Instead of "creative" say "ad" or "banner" or "version"
- One specific recommendation — not a list of options to choose from
- Explain in plain language why a given ad is better ("more people clicked on it")
- Always provide an estimated saving amount when pausing a weak creative
- If data is insufficient — state it clearly, do not guess
- Industry benchmark for display CTR: ~0.08% (market benchmark); for video VCR: >50% good, <30% weak
- If a weak creative is detected → suggest A05 (creative performance analysis) for deeper investigation
