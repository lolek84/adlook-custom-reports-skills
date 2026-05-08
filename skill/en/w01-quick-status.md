---
name: w01-quick-status
description: Use this skill when the user (client or AdOps) asks generally how the campaign is going, wants a quick check, one number. Triggers: "quick status", "how is the campaign doing", "one number", "quick check", "how is it going", "is everything OK", "campaign check", "what is happening with the campaign". Minimum MCP calls — maximum signal.
version: 1.0.0
quality_score: 9
---

# W01 — Quick Status — One Number

Answer to "how is it going?" in 1–2 sentences. Zero details, maximum signal.

## Goal

The shortest possible answer that gives a complete picture of campaign health.

## Execution Steps

### 1. Fetch data from MCP (minimum calls)

`run_report_preview` with absolute minimum:

**Dims:** `CAMPAIGN_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE`
**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`
**Date range:** yesterday (impressions) + campaign_to_date (pacing).

**Edge case:** If the user did not specify a campaign name — fetch the list of active campaigns and respond with a one-line status for each. If there are no active campaigns — respond: *"No active campaigns at the moment."* If a campaign had 0 impressions yesterday — add flag: *"ZERO DELIVERY → A02"*. If CAMPAIGN_BUDGET is unavailable — skip the pacing delta calculation and note: *"Budget data unavailable."*

### 2. Calculate

Agent calculates independently:

```
expected_pacing%  = (days_since_start / total_days) × 100
actual_pacing%    = (total_spend / budget) × 100
delta             = actual_pacing − expected_pacing

STATUS:
  delta > −5% and < +5%   → ✅ OK
  delta −15% to −5%       → ⚠️ slight slowdown
  delta < −15%            → 🔴 problem
  delta > +15%            → ⚠️ spending too fast
```

### 3. Response depending on the audience

**For client (🟢) — max 2 sentences, ready to paste into an email:**

✅ Status OK:
```
✅ Nike Air Max is on track — 2.1M impressions, 68% of budget spent, 4 days left.
Everything is delivering as planned.
```

⚠️ Minor issue:
```
⚠️ Nike Air Max is slightly below plan — 52% of budget spent with 65% of time elapsed.
Our team is monitoring the situation and will provide an update shortly.
```

🔴 Serious issue:
```
🔴 Nike Air Max requires attention — only 24% of budget spent with 65% of time elapsed.
Our team is already investigating — we will report next steps today.
```

**For AdOps (🟣) — 1 line, all numbers:**

```
✅ Nike Air Max: pacing +2% | $920/day | CTR 0.12% | viewab. 68% | 4 days left
⚠️ Adidas Running: pacing −11% | $390/day | CTR 0.09%↓ | check targeting
🔴 H&M Spring: pacing −24% | 0 imp. yesterday | ZERO DELIVERY → A02
```

### 4. If the user wants more

At the end, suggest the appropriate skill:
- Detailed report → K01
- Status only (yes/no) → K02
- Budget only → K03
- Morning review of all campaigns → A01

## Rules

- Maximum 2 sentences for client, 1 line for AdOps — never more
- Never ask for additional data before responding — answer based on what is available
- Emoji at the start — immediately signals good or bad
- For client: hide technical details (pacing delta, eCPM) — leave only what they understand
- For AdOps: show everything in one line — pacing%, $/day, CTR, viewability, alert if any
