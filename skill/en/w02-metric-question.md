---
name: w02-metric-question
description: Use this skill when the user asks about one specific campaign metric — CTR, impressions, viewability, reach, spend. Triggers: "what is our CTR", "how many impressions", "what is the viewability", "how much did we spend", "give me the metric", "what is our reach", "how many clicks", "what are the results", "what is [metric]", "how much is [metric]".
version: 1.0.0
quality_score: 9
---

# W02 — Metric Question

Direct answer to a question about one metric — value + brief context.

## Goal

One number with interpretation — no unnecessary surrounding data.

## Execution Steps

### 1. Identify the metric and fetch minimum data

Extract from the question:
- Which metric? (CTR / impressions / viewability / reach / spend / VCR / CPA / etc.)
- For which period? (yesterday / last week / month / campaign)
- For which campaign?

`run_report_preview` with minimal set — only the needed metrics:

| Question about | Metrics to fetch |
|---|---|
| CTR / click-through rate | `CTR`, `CLICKS`, `IMPRESSIONS` |
| Viewability | `VIEWABILITY`, `MEASURABILITY` |
| Reach | `REACH`, `FREQUENCY`, `IMPRESSIONS` |
| Spend / budget | `TOTAL_SPEND_USD`, `CAMPAIGN_BUDGET` |
| Video / completions | `VIDEO_COMPLETION_RATE`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_STARTS` |
| Impressions | `IMPRESSIONS` |
| Conversions | `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS` |

**Dims:** `CAMPAIGN_NAME` (+ `LINE_ITEM_NAME` if the question is about a specific line item)
**Date range:** provided by the user or last_7_days.

**Edge case:** If the metric is unavailable (e.g. conversions without a pixel) — respond: *"Data for [metric] is unavailable for this campaign. [Explanation why — e.g. 'requires a conversion tracking pixel installed'].'"* If the campaign had 0 impressions in the selected period — note: *"No data — the campaign had no impressions in this period."* If the user did not specify a period — use last_7_days and state this explicitly.

### 2. Prepare output

**Format for client — short, with benchmark:**

```
Click-through rate (CTR): 0.14%

A good result — the typical click-through rate for banner ads is approx. 0.08%,
so your campaign is performing nearly twice above the benchmark.
```

```
Ad viewability: 68%

Above the minimum (50%, MRC standard) — meaning 68 out of every 100 impressions
were genuinely visible to the user (they didn't scroll past before the ad loaded).
```

```
Reach: 1,800,000 unique people

That many distinct people saw your ad at least once this month.
```

```
Spend: $18,400 of $25,000 budget (74%)

With 73% of the campaign time elapsed — spend is exactly on track with the plan.
```

**Format for AdOps — technical with trend:**

```
CTR: 0.14% | last 7d | Nike Air Max — Remarketing_Desktop
Trend: ↑ vs. previous week (0.11%, +27%)
Display benchmark: 0.05–0.12% | Status: 🟢 above benchmark
```

### 3. Benchmarks for context

| Metric | For client: what to say | For AdOps: threshold |
|---|---|---|
| CTR display | benchmark ~0.08% | <0.05% weak, >0.12% excellent |
| CTR video | benchmark ~0.3–0.5% | <0.2% weak, >0.8% excellent |
| Viewability | good >50%, excellent >70% | MRC benchmark: 50% |
| VCR | good >50%, excellent >70% | <30% requires action |
| Frequency | optimal 2–5× | >7× is saturation |
| Spend vs budget | should be ±10% from expected | pacing delta ±15% = OK |

### 4. If the user needs more

Suggest the appropriate skill:
- Full campaign report → K01
- Status only (OK/not OK) → K02
- Deeper analysis of a specific metric (CTR anomaly, viewability audit) → A03 / A04

## Rules

- Answer: one number + max 2 sentences of context — never more
- Always compare to benchmark — without a benchmark a number means nothing
- For client: explain the metric in plain language, without English abbreviations
- For AdOps: provide trend (↑/↓/↔) and percentage benchmark
- If metric is unavailable — explain why (pixel, format, etc.), do not leave a blank
