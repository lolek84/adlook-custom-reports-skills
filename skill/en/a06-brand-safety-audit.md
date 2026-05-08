---
name: a06-brand-safety-audit
description: Use this skill when AdOps wants to check campaign brand safety, find suspicious domains, or audit placements for brand risk. Triggers: "brand safety", "unsafe domains", "placement audit", "blacklist", "inappropriate content", "site safety", "brand safety check", "check if ad appeared on bad sites", "suspicious domains", "content safety".
version: 1.0.0
quality_score: 9
---

# A06 — Brand Safety Audit

Inventory review for brand safety — detecting domains that do not meet client requirements.

## Goal

Identify domains problematic for the client's brand, calculate the % of budget on risky inventory, and produce a ready-to-implement blacklist.

## Execution Steps

### 1. Fetch data from MCP

**Domain report:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `TOP_LEVEL_DOMAIN`, `APP_NAME`, `APP_ID`, `SUPPLY_SOURCE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD` — campaign_to_date or last_30_days.

**Edge case:** If `APP_NAME` = null — use `APP_ID` with label `(app, ID: [APP_ID])`. Unidentifiable apps should be treated as WATCH, not EXCLUDE.

### 2. Domain classification

Agent assigns each domain a class based on name, TLD, and context:

**🔴 EXCLUDE — exclude immediately:**
- Name patterns: `xxx`, `porn`, `adult`, `casino`, `bet`, `torrent`, `crack`, `hack`, `warez`
- Categories: adult content, gambling, illegal software, hate speech
- Parked domains: random letter/number strings with no recognizable name

**🟡 WATCH — requires manual verification:**
- High-risk TLDs: `.xyz`, `.top`, `.click`, `.loan`, `.pw`, `.tk`
- Low brand recognition + large budget share (>1% spend from unknown domain)
- APP_NAME = null (app without identification)
- Sensationalist news or clickbait domains (if the brand requires premium inventory)

**🟢 SAFE — safe:**
- Known Polish portals: wp.pl, onet.pl, gazeta.pl, interia.pl, tvn24.pl, polsat.pl, etc.
- Premium international: bbc.com, reuters.com, cnn.com, bloomberg.com, etc.
- Known apps with a name (Google Play / App Store recognizable)

### 3. Calculate impact

Agent calculates independently:

```
spend_EXCLUDE = sum TOTAL_SPEND_USD where class = EXCLUDE
spend_WATCH   = sum TOTAL_SPEND_USD where class = WATCH
total_spend   = sum TOTAL_SPEND_USD (all)

risky_%  = (spend_EXCLUDE + spend_WATCH) / total_spend × 100
```

### 4. Prepare output

Use the template below — substitute real values:

```
🛡 BRAND SAFETY AUDIT — Nike Air Max (April 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY:
  🟢 SAFE:    287 domains  — 91% of budget  ($16,740)
  🟡 WATCH:    18 domains  —  6% of budget  ( $1,100)
  🔴 EXCLUDE:   7 domains  —  3% of budget  (   $560)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 EXCLUDE IMMEDIATELY (7 domains):

  Domain                Reason                         Imp.      Budget
  ───────────────────── ─────────────────────────────  ──────── ──────
  free-casino-pl.com    gambling                        48,000   $240
  xxx-content.net       adult content                   32,000   $160
  crack-soft.xyz        illegal software                28,000   $140
  bet365-free.top       gambling + risky TLD            19,000   $ 95  ← .top
  poker-free.com        gambling                        14,000   $ 70  ← verify
  … (2 more)

🟡 TO VERIFY (top 5 by spend):

  Domain                  Flag reason                   Imp.      Budget
  ─────────────────────── ─────────────────────────────  ──────── ──────
  fastnews.xyz             .xyz TLD                      67,000   $335  — check content
  tabloids24.com           clickbait / sensationalism    54,000   $270  — right for the brand?
  (app, ID: 1234567)       no app name                   38,000   $190  — unidentified
  celebrity-gossip.com     context mismatch?             31,000   $155  — client decision
  info-spam.click          risky TLD .click              22,000   $110  — investigate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED BLACKLIST (implement immediately):
  free-casino-pl.com, xxx-content.net, crack-soft.xyz,
  bet365-free.top, poker-free.com [+ 2 more]

Budget on risky inventory: $1,660 (9% of total)
After EXCLUDE removal: $560 recovered → reallocate to premium
```

## Rules

- Automated classification requires AdOps approval before implementing the blacklist
- Unknown domain ≠ dangerous — flag as WATCH, not EXCLUDE (unless there is a clear signal)
- Always state the reason for the flag — "suspicious" alone is not enough
- Do not exclude domains solely based on TLD — check the name context
- Clearly distinguish: what to implement immediately (EXCLUDE) vs. what requires a human decision (WATCH)
- State % of budget on risky inventory — this is the argument for the client conversation
