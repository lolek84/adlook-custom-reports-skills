---
name: w04-metric-explanation
description: Use this skill when the user asks what a metric means, wants an explanation of a DSP or advertising concept. Triggers: "what is CTR", "explain viewability", "what does eCPM mean", "explain the metric", "what is ROAS", "what is VCR", "what does it mean", "explain", "I don't understand", "what is pacing", "what is frequency".
version: 1.0.0
quality_score: 9
---

# W04 — Metric Explanation

What a metric means and how to interpret it in the context of an Adlook campaign.

## Goal

A clear, simple explanation of the metric tailored to the audience — no jargon for the client, technical depth for AdOps.

## Execution Steps

### 1. No MCP calls required

This skill does not require data — it relies on the agent's domain knowledge.
If the user provided a specific value from a campaign — reference it directly in the response.

### 2. Key metrics glossary

**CTR (Click-Through Rate)**
- Client: The percentage of people who clicked on the ad after seeing it. CTR 0.14% = out of 1,000 impressions, 1.4 people clicked. The industry benchmark for banners is approx. 0.08% — above this value the campaign engages well.
- AdOps: benchmark display 0.05–0.12%; video 0.3–0.8%. CTR >2% without correlation with landing rate → fraud signal. Monitor per domain. CTR anomaly → A03.

**Viewability**
- Client: The percentage of ads that were genuinely visible on the screen (the user did not scroll past before they loaded). Viewability 68% = 68 out of every 100 impressions were genuinely visible. A good result is >50%, excellent is >70%.
- AdOps: MRC standard = min. 50% pixels for ≥1 second (display) or ≥2 seconds (video). Measurability <70% reduces data reliability — check the SSP. Low viewability → A04 (viewability audit).

**VCR (Video Completion Rate)**
- Client: The percentage of people who watched the video ad all the way through. VCR 55% = more than half of audiences watched the full spot — a good result. Below 30% signals that the spot is too long or not engaging enough.
- AdOps: benchmark: 30s spot >40% OK, >60% excellent. Low VCR with Q1_drop >50% → shorten the intro; Q3_drop → shorten the outro.

**eCPM (effective Cost Per Mille)**
- Client: How much it costs to reach 1,000 people with the ad. eCPM $2.40 = for every 1,000 impressions, $2.40 was spent. Typical cost for banner ads is $1–3 per thousand.
- AdOps: benchmarks: display $1–3, video $5–15, CTV $15–30. High eCPM is acceptable if viewability >70% and CTR >0.12% — check efficiency = CTR × viewability / eCPM.

**Reach**
- Client: How many different (unique) people saw the ad — each counted once, regardless of how many times they saw it. Reach 1,800,000 = the ad reached 1.8 million distinct people in Poland.
- AdOps: reach = deduplicated cookies/IDs. When frequency >7, reaching new people becomes harder — check whether budget is targeting the same users repeatedly.

**Frequency**
- Client: How many times on average each person saw the ad. Frequency 3.2 = each recipient saw the ad on average 3 times. The optimal range is 3–5 times — more can become annoying.
- AdOps: frequency >7 per week → audience saturation, CTR drop is inevitable. Set a frequency cap or expand targeting.

**Pacing**
- Client: Whether the campaign is spending its budget at the right pace — not too fast and not too slow. A 10-day campaign that has spent 50% of the budget after 5 days is running perfectly.
- AdOps: delta_pacing = (spend%) − (time%). Normal range ±10%. Delta < −15% → underpacing (A02). Delta > +15% → overpacing (A16). Check daily cap and bid.

**ROAS (Return on Ad Spend)**
- Client: For every dollar spent, how many dollars in revenue did the campaign generate. ROAS 320% = for every $1 spent the campaign brought $3.20 in revenue. Above 200% the campaign is typically profitable.
- AdOps: requires a conversion pixel. Distinguish view-through ROAS (user saw the ad) from click-through ROAS (user clicked) — both are measured separately by Adlook.

**CPA (Cost Per Action)**
- Client: How much it costs to acquire one conversion — a purchase, registration, or form submission. CPA $53 = each purchase cost $53 in ad spend.
- AdOps: CPA target set by the client. When CPA > target → check audience quality and landing page. Requires a tracking pixel.

### 3. Response format

**For client — 3–4 sentences, no English abbreviations:**

```
Click-through rate (CTR) is the percentage of people who clicked on the ad after seeing it.

For example: CTR 0.14% means that for every 1,000 impressions, approximately 1–2 people clicked.

The industry benchmark for banner ads is approx. 0.08% — your campaign is achieving 0.14%,
nearly twice above the benchmark. This means the creatives are effectively attracting attention.
```

**For AdOps — definition + benchmark + how to optimize:**

```
CTR: (clicks / impressions) × 100
Benchmark: display 0.05–0.12% | video 0.3–0.8%
Optimization: CTR <0.05% → change creative or targeting
              CTR >2% without landing_rate → check fraud (A03)
              Compare per-domain — exclude outliers (A04)
```

**Edge case — metric unavailable:**

```
Data for [metric] is unavailable for this campaign.
[Viewability] requires a measurement script to be loaded — check whether the tag is deployed.
[ROAS/CPA] requires a conversion tracking pixel — contact the implementation team.
```

## Rules

- Never use English jargon without a plain-language explanation when responding to the client
- If the user provided a specific value — assess it immediately (good/average/weak) without asking
- Client: max 3–4 sentences, analogy or number, assessment vs. benchmark
- AdOps: add an optimization threshold and a reference to the relevant skill (A02–A16)
- End the response with a conclusion: what does this value mean for this specific campaign
