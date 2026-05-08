---
name: a04-audit-viewability
description: Użyj tego skilla gdy AdOps chce zbadać viewability kampanii, znaleźć słabe domeny inventory, zrobić audit widoczności. Triggery: "sprawdź viewability", "niski viewability", "które domeny mają słaby viewability", "audit inventory viewability", "widoczność reklam", "viewability spada", "measurability problem".
version: 1.0.0
quality_score: 9
---

# A04 — Audit viewability

Pełna analiza viewability po inventory — identyfikacja złego supply i rekomendacje wykluczeń.

## Cel

Zidentyfikować domeny obniżające średni viewability, ocenić potencjalną oszczędność i przygotować konkretną blacklistę.

## Kroki wykonania

### 1. Pobierz dane z MCP (3 raporty równolegle)

**Raport domain:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `TOP_LEVEL_DOMAIN`, `SUPPLY_SOURCE`, `ENVIRONMENT` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS`, `ECPM_USD`, `TOTAL_SPEND_USD` — last_30_days.

**Raport app:**
dims: `CAMPAIGN_NAME`, `APP_NAME`, `ENVIRONMENT`, `DEVICE_TYPE` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS`, `TOTAL_SPEND_USD` — last_30_days.

**Raport device:**
dims: `CAMPAIGN_NAME`, `DEVICE_TYPE`, `ENVIRONMENT` + metrics: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS` — last_30_days.

**Edge case:** Pomiń domeny z <1 000 impresji — za mała próba, wyniki niestatystyczne. Jeśli MEASURABILITY <60% dla domeny, dodaj flagę `⚠️ NISKA MIERZALNOŚĆ` — viewability może być niewiarygodny.

### 2. Klasyfikacja inventory

Agent klasyfikuje każdą domenę/aplikację:

```
PREMIUM      : VIEWABILITY >= 70%
AKCEPTOWALNY : VIEWABILITY >= 50%
PONIŻEJ NORMY: VIEWABILITY >= 40%
WYKLUCZYĆ    : VIEWABILITY <  40%   ← kandydat do blacklisty

Dodaj flagę NISKA MIERZALNOŚĆ jeśli MEASURABILITY < 60%
```

### 3. Oblicz impakt wykluczeń

Agent oblicza samodzielnie:

```
spend_złe_inventory    = suma TOTAL_SPEND_USD gdzie VIEWABILITY < 40%
procent_złego_budżetu  = spend_złe_inventory / total_spend × 100

weighted_viewability_obecny  = ważona śr. VIEWABILITY (waga = IMPRESSIONS)
weighted_viewability_bez_złych = ważona śr. VIEWABILITY po wykluczeniu domen <40%
potencjalna_poprawa            = weighted_viewability_bez_złych − weighted_viewability_obecny
```

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
👁 AUDIT VIEWABILITY — Nike Air Max (kwiecień 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBECNY STAN:
  Średni viewability:  54%  🟡  (cel: >60%, minimum: >50%)
  Mierzalność:         78%  🟢
  Domeny analizowane:  312  (powyżej 1 000 impresji)

RANKING INVENTORY:
  🟢 PREMIUM  (>70%):  84 domeny  — 38% budżetu  — avg viewab. 74%
  🟡 OK       (50–70%): 167 domen  — 48% budżetu  — avg viewab. 61%
  🟠 SŁABE    (40–50%): 38 domen   —  9% budżetu  — avg viewab. 45%
  🔴 WYKLUCZYĆ (<40%):  23 domeny  —  5% budżetu  — avg viewab. 31%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 DO WYKLUCZENIA (top 5 po wydanym budżecie):

  Domena              Imp.      Viewab.  Budżet  Mierzal.
  ─────────────────── ───────── ──────── ─────── ──────────
  szybkie-newsy.pl    184 000    22%    $1 840   91%  ← wyklucz
  klik-info.com       142 000    28%    $1 420   88%  ← wyklucz
  portal-top.xyz       98 000    31%    $  980   ⚠️ 48%  ← wyklucz + niska mierzalność
  darmowe-gry24.pl     87 000    36%    $  870   82%  ← wyklucz
  info-rapid.net       74 000    38%    $  740   79%  ← wyklucz

🏆 TOP 5 PREMIUM (benchmark dla optymalizacji):

  Domena              Imp.      Viewab.  Budżet
  ─────────────────── ───────── ──────── ───────
  wp.pl               420 000    78%    $4 200
  onet.pl             380 000    74%    $3 800
  gazeta.pl           290 000    71%    $2 900
  tvn24.pl            210 000    76%    $2 100
  bankier.pl          180 000    73%    $1 800

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJA:
  Wyklucz 23 domeny z viewability <40%
  Uwolniony budżet:   $5 850/mies. (5% total) → przesunąć do premium inventory
  Oczekiwana poprawa: 54% → ~61% viewability  (+7 pp)

BLACKLISTA DO WDROŻENIA:
  szybkie-newsy.pl, klik-info.com, portal-top.xyz, darmowe-gry24.pl, info-rapid.net
  [+ 18 kolejnych domen z kolumny WYKLUCZYĆ]
```

## Zasady

- Sortuj "DO WYKLUCZENIA" po kolumnie Budżet (impakt $), nie po viewability
- Nie wykluczaj domen z <1 000 impresji — dane niestatystyczne, możliwy false positive
- MEASURABILITY <60% = viewability tej domeny jest niepewny — oznacz ale nie wykluczaj automatycznie
- Nieznana domena z dobrym viewability ≠ zła domena — nie karaj za brak rozpoznawalności
- Zawsze podaj ile % budżetu odzyskujemy i o ile poprawi się viewability — to uzasadnia działanie
