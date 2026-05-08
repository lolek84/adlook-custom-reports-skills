---
name: k09-device-breakdown
description: Use this skill when the client asks about the breakdown of impressions across devices — desktop, mobile, tablet, CTV. Triggers: "which devices", "mobile vs desktop", "device breakdown", "CTV performance", "device split", "how many on mobile", "smartphone", "TV", "tablet", "device distribution".
version: 1.0.0
quality_score: 9
---

# K09 — Device Breakdown

Distribution of impressions across desktop, mobile, tablet, and Smart TV.

## Goal

Show the client where the campaign reached audiences in terms of devices — in plain language, with a clear takeaway.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `DEVICE_TYPE`
- `OPERATING_SYSTEM`
- `ENVIRONMENT`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `CTR`
- `VIEWABILITY`

**Date range:** range provided by the user or campaign_to_date.

**Edge case:** If no CTV data (ENVIRONMENT = "ctv" → 0 impressions) — skip the CTV section with annotation: *"This campaign did not include Smart TV ads."* If total impressions = 0 (campaign not started or paused) — respond: *"No device data available — the campaign had no impressions in the selected period."* If OPERATING_SYSTEM is unavailable — skip the OS breakdown, keep only DEVICE_TYPE.

### 2. Grouping

Agent groups independently:

```
desktop  = DEVICE_TYPE in ["Desktop"]
mobile   = DEVICE_TYPE in ["Mobile Phone", "Smartphone"]
tablet   = DEVICE_TYPE in ["Tablet"]
ctv      = DEVICE_TYPE in ["Connected TV", "CTV"] or ENVIRONMENT = "ctv"

for each group: % share of IMPRESSIONS and TOTAL_SPEND_USD
```

Market benchmarks (Poland, 2026, industry norm):
- Mobile: ~55–60% | Desktop: ~30–35% | Tablet: ~5% | CTV: growing, ~5–10%

### 3. Prepare output

Use the template below — fill in real values:

```
📱 Devices — Nike Air Max (April 2026)

Where the ad was delivered:

  🖥  Desktop computers:              35%  ($8,750)
      Click-through rate: 0.14% | Viewability: 74%

  📱 Smartphones (mobile):            58%  ($14,500)
      Click-through rate: 0.11% | Viewability: 63%

  📟 Tablets:                          4%  ( $1,000)
      Click-through rate: 0.09% | Viewability: 66%

  📺 Smart TV / streaming TVs (CTV):   3%  (   $750)
      Click-through rate: n/a (TV format)  | Viewability: 82%

The distribution is close to typical for the Polish market
(mobile approx. 55–60%, desktop approx. 30–35%).

✅ Desktop has a higher click-through rate (0.14%) than smartphones (0.11%)
   — this is normal, as accidental clicks on small screens are limited.
   Smart TV achieves the highest ad viewability (82%) — premium inventory.
```

**Closing conclusion variants:**

If result is close to benchmark:
> *"The device breakdown is typical for online advertising in Poland. Most audiences saw the ad on a smartphone."*

If mobile dominates above benchmark (>70%):
> *"The campaign reached mainly smartphone users ([X]%). If you want higher click-through rates, consider dedicated mobile creatives or a higher desktop share in the next campaign."*

If CTV is significant (>10%):
> *"[X]% of impressions appeared on Smart TV — premium inventory with the highest viewability. It is worth continuing on streaming TVs."*

## Communication Rules

- Instead of "CTV" or "Connected TV" say "Smart TV and streaming TVs"
- Instead of "device type" say "device"
- If mobile click-through rate is <80% of desktop — clarify that this is normal, not a problem
- Always compare to the market benchmark (is the distribution typical or not)
- Highlight the device with the best viewability and the best click-through rate, with a forward-looking takeaway
