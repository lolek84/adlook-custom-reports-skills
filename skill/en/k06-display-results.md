---
name: k06-display-results
description: Use this skill when a client asks about banner clicks, CTR, or click-through rate for display ads. Triggers: "display results", "banner performance", "CTR report", "display campaign", "banner results", "how many clicks", "click-through rate", "did anyone click the ad", "how many people visited the site", "how is display performing".
version: 1.0.0
quality_score: 9
---

# K06 — Display Results (Click-through)

How many people clicked the banner and what is the quality of traffic directed to the site.

## Goal

Show the effectiveness of display creatives — clicks and the quality of traffic sent to the client's site.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_SIZE`
- `CREATIVE_TYPE`

**Metrics:**
- `IMPRESSIONS`
- `CLICKS`
- `CTR`
- `LANDING_PAGE_VIEWS`
- `LANDING_RATE`

**Date range:** range specified by the user or last_30_days.

Filter display creatives only (not video).

**Edge case:** If no site visit data is available (LANDING_PAGE_VIEWS = 0 or missing) — report only clicks with a note: *"Site visit data is unavailable for this campaign — showing clicks only."*

### 2. Assess click-through rate

Agent independently applies the benchmark for each format.

Benchmarks based on industry norm (DoubleVerify / IAB standard for programmatic display ads).

| Creative format | Typical CTR | Below average | Good result | Excellent result |
|---|---|---|---|---|
| Standard banner | 0.08% | <0.05% 🔴 | 0.08–0.12% 🟢 | >0.12% 🟢🟢 |
| Rich media / interactive | 0.15% | <0.10% 🔴 | 0.15–0.25% 🟢 | >0.25% 🟢🟢 |

Traffic quality (what percentage of clicks reached the site):
- >80% — 🟢 good traffic quality
- 60–80% — 🟡 average
- <60% — 🔴 suspicious click quality (possible automated traffic / bots)

**Alert:** If CTR >1% for a standard banner — flag as an anomaly requiring investigation.

### 3. Prepare output

Use the template below — substitute values and select the appropriate rating variant:

```
🖱 Ad click-through rate — Nike Air Max (April 2026)

Total:
  Impressions:               4,200,000
  Clicks:                        5,040   (number of times someone clicked the banner)
  Click-through rate (CTR):      0.12%  🟢  (excellent result — benchmark is 0.08%)
  Site visits:                   4,284   (85% of clicks reached the site — 🟢 good quality)

Results by creative:
  ┌─────────────────────────┬──────────┬────────┬──────────┐
  │ Creative                │ Size     │ CTR    │ Rating   │
  ├─────────────────────────┼──────────┼────────┼──────────┤
  │ Spring banner           │ 300×250  │ 0.15%  │ 🟢🟢     │
  │ Article banner          │ 728×90   │ 0.09%  │ 🟢       │
  │ Side banner             │ 160×600  │ 0.04%  │ 🔴       │
  └─────────────────────────┴──────────┴────────┴──────────┘

✅ "Spring banner" is performing best — CTR is nearly twice the benchmark.
⚠️  "Side banner" is below average — we are considering a creative refresh or pausing it.
```

**Final rating variants (select the appropriate one):**

🟢 Good result:
> *"The campaign is achieving a click-through rate of [X]% — above the typical result for banner ads (~0.08%). Ads are effectively capturing audience attention."*

🟡 Average result:
> *"Click-through rate ([X]%) is close to the market average. The [NAME] creative stands out ([CTR]%) — worth scaling it at the expense of weaker performers."*

🔴 Weak result:
> *"Click-through rate ([X]%) is below the typical result for banners ([BENCHMARK]%). We recommend refreshing the creatives or changing the target audiences."*

🚨 Suspicious traffic alert:
> *"Click-through rate is unusually high ([X]%) — this may indicate automated traffic (bots). Our team is analyzing the click sources."*
→ When bots are suspected: run A16 (brand safety / IVT diagnostics).

## Communication Rules

- Instead of "CTR" write "click-through rate" (CTR can follow in parentheses)
- Instead of "landing rate" write "percentage of clicks that reached the site"
- Always compare the click-through rate to the format benchmark — a number alone means nothing to the client
- Highlight the best and worst creative with a specific action recommendation
- If click-through rate is very high (>1%) — do not celebrate it, investigate first
