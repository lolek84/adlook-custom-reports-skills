---
name: a08-raport-supply-sources
description: Użyj tego skilla gdy AdOps chce porównać SSP i supply sources, zobaczyć które źródła inventory dają najlepsze wyniki. Triggery: "który SSP działa najlepiej", "porównaj supply sources", "gdzie mamy najlepszy inventory", "analiza SSP", "supply source report", "które SSP", "ranking SSP", "OpenX vs PubMatic", "supply analiza".
version: 1.0.0
quality_score: 9
---

# A08 — Raport supply sources

Porównanie SSP i giełd — gdzie kupujemy inventory i co daje najlepszy wynik.

## Cel

Ranking SSP z konkretną rekomendacją alokacji budżetu: gdzie zwiększyć, gdzie zmniejszyć, gdzie wyłączyć.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `SUPPLY_SOURCE`
- `ENVIRONMENT`
- `DEVICE_TYPE`
- `CREATIVE_TYPE`

**Metrics:**
- `IMPRESSIONS`
- `VIEWABILITY`
- `CTR`
- `ECPM_USD`
- `TOTAL_SPEND_USD`
- `VIDEO_COMPLETION_RATE`

**Date range:** last_30_days lub podany zakres.

**Edge case:** Jeśli SSP ma <50 000 impresji lub <2% udziału w budżecie — oznacz jako `📊 ZA MAŁO DANYCH` i nie rekomenduj wykluczenia na podstawie tych danych.

### 2. Oblicz score i ranking

Agent oblicza samodzielnie dla każdego SSP:

```
# Agreguj per SUPPLY_SOURCE (ignoruj ENVIRONMENT i DEVICE_TYPE w score głównym)
udział_budżetu% = TOTAL_SPEND_USD_SSP / TOTAL_SPEND_USD_łącznie × 100

# Score efektywności (wyższy = lepszy)
dla display:
  score = (VIEWABILITY / 100) × CTR × (1 / ECPM_USD) × 10 000
dla video:
  score = (VIEWABILITY / 100) × VIDEO_COMPLETION_RATE × (1 / ECPM_USD) × 10 000

# Ranking: sortuj malejąco po score
# Wyklucz z rankingu SSP z <50k impresji lub <2% budżetu (za mała próba)
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📡 RANKING SUPPLY SOURCES — Nike Air Max (kwiecień 2026, display)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  #  SSP                Impresje   Budżet   Viewab.  CTR    eCPM   Score  Ocena
  ── ─────────────────  ─────────  ───────  ───────  ─────  ─────  ─────  ──────────────
  1  Google AdX          1 820 000   38%     71%     0,14%  $1,80  5,47   🟢🟢 Najlepszy
  2  Xandr               1 240 000   26%     68%     0,12%  $2,10  3,89   🟢 Dobry
  3  Index Exchange         680 000   14%     62%     0,09%  $2,40  2,33   🟡 Przeciętny
  4  PubMatic               490 000   10%     58%     0,08%  $2,90  1,60   🟡 Przeciętny
  5  Magnite                340 000    7%     41%     0,06%  $5,80  0,43   🔴 Słaby
  6  Sharethrough            82 000    2%     —        —     —      —      📊 Za mało danych
  ─  OpenX                  31 000    1%     —        —     —      —      📊 Za mało danych

  Score = (viewability/100) × CTR × (1/eCPM) × 10 000
  Wyższy score = lepszy stosunek jakości do ceny

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJA ALOKACJI:

  🔼 ZWIĘKSZ udział:
     Google AdX — score 5,47 (najlepszy), viewab. 71%, eCPM $1,80
     Działanie: przenieś 7% budżetu z Magnite → AdX
     Oczekiwana poprawa viewability: ok. +3 pp

  🔽 ZMNIEJSZ udział:
     Magnite — score 0,43 (najsłabszy przy 7% budżetu), viewab. 41%, eCPM $5,80
     Płacimy 3,2× więcej niż za AdX, za wyraźnie gorszy wynik
     Działanie: ogranicz do max 2% budżetu lub wyłącz

  📊 OBSERWUJ (za mało danych):
     Sharethrough (82k imp.) — oceń ponownie po 200k impresji

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BREAKDOWN PO ŚRODOWISKU (top SSP):

  Google AdX:  Web 65% | App 35%
               Web viewab: 74% | App viewab: 65%  — web wyraźnie lepszy
```

## Zasady

- Score jest względny — służy do rankingu w obrębie tej kampanii, nie między kampaniami
- CTV ma inne benchmarki niż web/app — nie porównuj bezpośrednio, analizuj oddzielnie
- Nie rekomenduj wykluczenia SSP z <50k impresji lub <2% budżetu — za mała próba
- Zwiększ → Zmniejsz → Wyklucz: zawsze konkretna kwota lub % do przesunięcia
- Podaj oczekiwany efekt każdej rekomendacji (viewability, CTR lub eCPM)
