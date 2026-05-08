---
name: k08-where-did-the-ad-run
description: Use this skill when the client asks where their ad ran, on which websites or apps, placement transparency. Triggers: "where did the ad run", "which websites", "placement list", "site list", "transparency report", "where did we advertise", "show placements", "which sites", "which services", "list of sites", "where did the ad appear".
version: 1.0.0
quality_score: 9
---

# K08 — Where Did the Ad Run?

List of websites and apps where the client's ad appeared — placement transparency report.

## Goal

Show the client where their ad actually ran — in plain language, without technical codes.

## Execution Steps

### 1. Fetch data from MCP

Call `run_report_preview` with parameters:

**Dims:**
- `CAMPAIGN_NAME`
- `TOP_LEVEL_DOMAIN`
- `APP_NAME`
- `SUPPLY_SOURCE`
- `ENVIRONMENT`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`

**Date range:** range provided by the user or campaign_to_date.

**Edge case:** If `APP_NAME` is empty for app/CTV rows — use `APP_ID` with annotation "(mobile app, name unavailable)". If `TOP_LEVEL_DOMAIN` contains a hash or code instead of a name — skip those rows and include the combined % as "other / unrecognized". If the campaign has not started yet (no impressions) — respond: *"Campaign has not launched — no placement data available."* If total impressions = 0 (e.g. campaign paused) — note: *"No impressions in the selected period — check campaign status."*

### 2. Processing

Agent calculates independently:

```
web_impressions  = IMPRESSIONS where ENVIRONMENT = "web"
app_impressions  = IMPRESSIONS where ENVIRONMENT = "app" or "ctv"
total            = web_impressions + app_impressions

web_share_%      = web_impressions / total × 100
app_share_%      = 100 − web_share_%

top10_web        = sort by IMPRESSIONS descending, take top 10 domains (web)
top10_app        = sort by IMPRESSIONS descending, take top 10 apps
```

### 3. Assess inventory quality

Agent flags each entry:
- 🟢 **Known site** — recognizable brand or platform (wp.pl, onet.pl, YouTube, etc.)
- 🟡 **Unknown site** — small domain, no context — "worth reviewing"
- 🔴 **Suspicious** — name suggests content inappropriate for the client's brand

### 4. Prepare output

Use the template below — fill in real values and add flags next to sites:

```
🌐 Where Did the Ad Run — Nike Air Max (April 2026)

Environment breakdown:
  🌍 Websites:              68%   (2,850,000 impressions)
  📱 Mobile apps:           29%   (1,220,000 impressions)
  📺 Smart TV (CTV):         3%   (  130,000 impressions)

TOP 10 WEBSITES:
  1. 🟢 wp.pl           — 12%  ($2,200)
  2. 🟢 onet.pl         —  9%  ($1,650)
  3. 🟢 gazeta.pl       —  7%  ($1,280)
  4. 🟢 interia.pl      —  6%  ($1,100)
  5. 🟡 artykuly24.pl   —  4%  ($  740)  — smaller site, worth reviewing
  6. 🟢 sport.pl        —  4%  ($  730)
  7. 🟢 pudelek.pl      —  3%  ($  550)
  8. 🟢 tvn24.pl        —  3%  ($  550)
  9. 🟢 bankier.pl      —  2%  ($  370)
  10. 🟢 fakt.pl        —  2%  ($  370)

TOP 5 APPS:
  1. 🟢 Onet             —  8%
  2. 🟢 WP Pilot         —  6%
  3. 🟢 Interia Sport    —  5%
  4. 🟡 (mobile app, name unavailable)  —  4%
  5. 🟢 Allegro          —  3%

✅ The ad appeared mainly on well-known Polish news and entertainment sites.
   One site (artykuly24.pl) requires review — we will investigate the content context.
```

**Closing comment variants:**

🟢 Good inventory:
> *"The ad ran on verified, reputable sites. Inventory is consistent with the brand profile."*

🟡 Mixed inventory:
> *"The majority of impressions appeared on well-known sites. [N] placements require review — we will investigate and implement exclusions if needed."*

🔴 Problematic inventory:
> *"Some impressions appeared on sites inconsistent with the brand profile. Our team will implement exclusions and report back with a correction."*

## Communication Rules

- Instead of "supply source" say "site" or "platform"
- Instead of "inventory" say "places where the ad appeared"
- Instead of "environment" say "channel" or spell out as "websites / apps / Smart TV"
- Do not show raw domain IDs or hashes — only recognizable names
- Always comment on the overall quality of the list: are these well-known brands consistent with the client's profile
- If the client previously mentioned specific sites they wanted to reach — confirm whether they appeared
- If problematic inventory is detected → note that the team will implement exclusions (A06 brand safety audit)
