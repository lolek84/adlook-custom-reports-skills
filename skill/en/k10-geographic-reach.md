---
name: k10-geographic-reach
description: Use this skill when the client asks about the geographic reach of the campaign, which cities and regions the ad ran in. Triggers: "geographic reach", "which cities", "where in the country", "regional breakdown", "Warsaw vs rest", "regional coverage", "city breakdown", "where did we run geographically".
version: 1.0.0
quality_score: 9
---

# K10 — Geographic Reach

Which cities and regions the campaign reached.

## Goal

Show the client the geographic distribution of the campaign — whether we reached the right places.

## Execution Steps

### 1. Fetch data from MCP

`run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `COUNTRY`
- `REGION`
- `CITY`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `REACH`

**Date range:** range provided by the user or campaign_to_date.

**Edge case:** If REACH = 0 or unavailable — show impressions only with annotation: *"Unique reach per city is unavailable — showing impression counts."* Do not show POSTAL_CODE — too granular for the client. If the campaign has not started yet (0 impressions) — respond: *"Campaign has not launched — no geographic data available."* If traffic is detected outside the planned targeting area — flag it and suggest verifying geo settings → A13 (line item audit).

### 2. Processing

Agent calculates independently:

```
top_10_cities    = sort CITY by IMPRESSIONS descending, take top 10
top_5_regions    = sort REGION by IMPRESSIONS descending, take top 5

top3_share_%     = sum of IMPRESSIONS for top 3 cities / total IMPRESSIONS × 100
```

### 3. Prepare output

Use the template below — fill in real values:

```
📍 Geographic Reach — Nike Air Max (April 2026)

TOP 10 CITIES:

  1.  Warsaw           —  38%   (1,596,000 impressions)
  2.  Krakow           —  13%   (  546,000 impressions)
  3.  Wroclaw          —  10%   (  420,000 impressions)
  4.  Tri-City         —   8%   (  336,000 impressions)
  5.  Poznan           —   6%   (  252,000 impressions)
  6.  Lodz             —   5%   (  210,000 impressions)
  7.  Katowice         —   4%   (  168,000 impressions)
  8.  Lublin           —   3%   (  126,000 impressions)
  9.  Bydgoszcz        —   2%   (   84,000 impressions)
  10. Szczecin         —   2%   (   84,000 impressions)

      Other            —   9%   (  378,000 impressions)

TOP 5 REGIONS:
  Masovian 38% | Lesser Poland 13% | Lower Silesia 10% | Pomeranian 8% | Greater Poland 6%

✅ The ad reached mainly the largest Polish cities.
   Warsaw, Krakow, and Wroclaw together account for 61% of impressions —
   typical for national campaigns with urban targeting.
```

**Closing conclusion variants:**

If distribution matches planned geo targeting:
> *"The geographic distribution matches the campaign plan. The ad reached the intended cities and regions."*

If one location dominates beyond expectation (>50% from one city):
> *"Warsaw accounts for [X]% of impressions — the campaign is clearly concentrated in the capital. If you want a more balanced national reach, we can adjust the targeting."*

If traffic appeared outside the planned area:
> *"Some impressions appeared outside the planned targeting area (e.g. [city]). Our team will review the geo settings and adjust the campaign if needed."*

## Communication Rules

- Use local city and region names (not codes)
- Do not show POSTAL_CODE — too granular for the client
- Always comment on whether the distribution matches the planned targeting
- If the campaign is national — note that Warsaw typically accounts for ~30–40% of traffic (industry norm for online advertising in Poland)
- Round to full percentages for readability
