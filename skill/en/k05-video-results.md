---
name: k05-video-results
description: Use this skill when a client asks about video ad results, how many people watched the video to the end, or completion rate. Triggers: "video results", "video performance", "completion rate", "how many watched", "video report", "how did the video ad perform", "VCR", "video views to completion", "spot results".
version: 1.0.0
quality_score: 9
---

# K05 — Video Results

Video ad completion — how many people watched to the end.

## Goal

Show the viewing funnel — where users drop off and what the overall video effectiveness is.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_DURATION`

**Metrics:**
- `VIDEO_STARTS`
- `VIDEO_PLAYS_25`
- `VIDEO_PLAYS_50`
- `VIDEO_PLAYS_75`
- `VIDEO_PLAYS_100`
- `VIDEO_COMPLETE_VIEWS`
- `VIDEO_COMPLETION_RATE`

**Date range:** range specified by the user or campaign_to_date.

Filter only creatives where `CREATIVE_TYPE` = video.

**Edge case:** If no video data (display-only campaign or video metrics = 0) — respond: *"This campaign contains no video ads, or video was not served during the selected period. Would you like to see banner ad results instead?"*

### 2. Build the funnel

Agent calculates for each creative independently:

```
start_100% = VIDEO_STARTS (baseline = 100%)
to_25%     = VIDEO_PLAYS_25 / VIDEO_STARTS × 100
to_50%     = VIDEO_PLAYS_50 / VIDEO_STARTS × 100
to_75%     = VIDEO_PLAYS_75 / VIDEO_STARTS × 100
to_end%    = VIDEO_COMPLETE_VIEWS / VIDEO_STARTS × 100   (= VIDEO_COMPLETION_RATE)
```

### 3. Assess video effectiveness

Thresholds based on the IAB market norm for in-stream video ads (benchmark: ~50% VCR).

| Completion rate (% watched to end) | Rating | Message for client |
|---|---|---|
| >70% | 🟢 Excellent | Ad is engaging — the vast majority of viewers watch to the end |
| 50–70% | 🟡 Good | Above the market average (~50%) — ad effectively holds attention |
| 30–50% | 🟠 Average | Some viewers drop off before the end — consider a shorter version |
| <30% | 🔴 Needs improvement | Most viewers do not watch to the end — likely cause: creative too long or inappropriate placement → run A03 (creative diagnostics) |

### 4. Prepare output

Use the template below — substitute values and select the appropriate rating variant:

```
🎬 Video results — Nike Air Max (April 2026)

Creative: "Spring Spot 2026" (30 seconds)
Video impressions: 1,200,000

How far into the ad viewers watched:
  ▶️  Started watching:     1,200,000 people  (100%)
  ◼️  To ¼ of ad (7.5s):     960,000 people  ( 80%)
  ◼️  To halfway (15s):       780,000 people  ( 65%)
  ◼️  To ¾ (22.5s):           600,000 people  ( 50%)
  ✅  To the end (30s):       480,000 people  ( 40%) 🟠

Market benchmark: ~50% completion rate.
Our ad: 40% — slightly below average.

👉 Recommendation: Consider shortening the spot to 15 seconds.
   A 15s version will likely achieve a higher completion rate,
   as most drop-offs occur between 15 and 22 seconds.
```

**Final recommendation variants (select the appropriate one):**

🟢 Great result:
> *"The video ad is achieving excellent results — [X]% of viewers watch to the end. This is significantly above the market average. The creative is effectively engaging audiences."*

🟡 Good result:
> *"The ad is achieving a good result ([X]% completion, market average ~50%). We can check whether a shorter version would maintain a similar level at lower cost."*

🟠/🔴 Weak result:
> *"[X]% of viewers watch the ad to the end — below the market average (~50%). The largest drop-off occurs at [moment]s. We recommend a shorter version or new creatives."*

**If there are multiple creatives:** Show a summary of all and highlight the best and worst performer.

## Communication Rules

- Instead of "VCR" or "completion rate" write "percentage of people who watched to the end"
- Instead of "creative" (if the client may not know the term) write "spot", "video", or use the own name
- The text funnel (▶️ → ✅) is more readable than a table of percentages alone
- Always compare the result to the benchmark — a number alone means nothing to the client
- If the result is weak — give a specific recommendation, not just a diagnosis
- Point to the exact moment of the largest drop-off (e.g., "between 15 and 22 seconds")
