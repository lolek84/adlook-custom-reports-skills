---
name: k04-reach-and-frequency
description: Use this skill when a client asks about campaign reach, how many people saw the ad, how often someone saw the ad, or frequency. Triggers: "reach and frequency", "how many people saw it", "how many times", "unique users", "audience reach", "how many unique users", "campaign reach", "frequency cap".
version: 1.0.0
quality_score: 9
---

# K04 — Reach and Frequency

How many unique people the campaign reached and how often they saw the ad.

## Goal

Show the real reach of the campaign — how many different people saw the ad and how many times.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `DATE`

**Metrics:**
- `REACH`
- `FREQUENCY`
- `IMPRESSIONS`

**Date range:** range specified by the user or last_30_days.

**Edge case:** If REACH data is unavailable (some campaigns do not measure unique users) — respond: *"Unique audience was not measured for this campaign. I can show the number of impressions — each impression is one contact with the ad, but the same person may have seen it multiple times."*
**Edge case:** If the campaign has not started yet — respond: *"The campaign [NAME] has not served any ads yet — no reach data available. Data will be available after the first day of delivery."*

### 2. Calculations

Agent calculates independently:

```
total_impressions   = sum of IMPRESSIONS for the full period
total_reach         = REACH for the full period (do NOT sum daily values — these are unique users)
avg_frequency       = total_impressions / total_reach
weekly_trend        = group DATE by week → REACH + IMPRESSIONS per week
```

### 3. Assess contact frequency

Thresholds based on the industry standard (IAB recommendation for awareness campaigns).

| Average frequency | Rating | What it means for the client |
|---|---|---|
| 1–3 contacts | 🟢 Optimal | Ad reaches a wide group, each person sees it a few times |
| 4–7 contacts | 🟡 High | Some audiences may be seeing the ad too often |
| 8+ contacts | 🔴 Too high | Ad fatigue risk — the same group of people sees the ad repeatedly; audience expansion recommended |

### 4. Prepare output

Use the template below — substitute values and select the appropriate rating variant:

```
👥 Campaign reach — Nike Air Max (April 2026)

Ad reached:            1,800,000 unique people
                       (this many different people saw the ad at least once)
Total impressions:     5,400,000
                       (this many times the ad appeared in total)
On average each person
saw the ad:            3× during the month  🟢

📅 Weekly trend:
  Week 1 (Apr 1–7):    620,000 people · 2.8× average
  Week 2 (Apr 8–14):   710,000 people · 3.1× average
  Week 3 (Apr 15–21):  680,000 people · 3.2× average
  Week 4 (Apr 22–30):  540,000 people · 3.0× average

✅ Reach is growing steadily. The ad is being served at a healthy pace —
   each person sees it on average 3 times, which is an optimal result.
```

**Final rating variants (select the appropriate one):**

🟢 Optimal frequency:
> *"The campaign is achieving broad reach at a healthy frequency. Each person saw the ad on average [N]× — a good balance between reach and avoiding ad fatigue."*

🟡 High frequency:
> *"The campaign has a relatively high frequency ([N]× per person). Some audiences may have seen the ad too often. We can expand the target audience to reach new people instead of showing the ad to the same ones."*

🔴 Too high frequency:
> *"The campaign is repeatedly reaching the same people ([N]× per person). We recommend expanding the target audience or adding a frequency cap — at this point budget is likely not being used optimally."*

## Communication Rules

- Instead of "reach" write "number of unique people" or "reach (number of different people)"
- Instead of "frequency" write "contact frequency" or "how many times each person saw the ad"
- Instead of "audience" write "target audience" or "viewers"
- Explain the difference between impressions and reach if the client may not know it
- If frequency is high — propose a specific solution, not just a diagnosis
- Round numbers to thousands for readability
