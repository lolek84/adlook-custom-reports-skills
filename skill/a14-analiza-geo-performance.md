---
name: a14-analiza-geo-performance
description: Użyj tego skilla gdy AdOps chce zoptymalizować targetowanie geograficzne, znaleźć najlepiej konwertujące regiony i miasta. Triggery: "które miasto najlepiej konwertuje", "geo performance", "optymalizacja regionów", "gdzie warto inwestować", "geo analiza", "które regiony działają", "performance po miastach", "geografia kampanii AdOps".
version: 1.0.0
quality_score: 9
---

# A14 — Analiza geo performance

Które regiony i miasta dają najlepszy wynik — optymalizacja targetowania geograficznego.

## Cel

Zidentyfikować najefektywniejsze lokalizacje i wydać konkretną rekomendację alokacji budżetu geo.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `COUNTRY`
- `REGION`
- `CITY`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `TOTAL_SPEND_USD`
- `ECPA_USD`
- `TOTAL_CONVERSIONS`

**Date range:** last_30_days lub podany zakres.

**Edge case:** Pomiń miasta z <10 000 impresji — dane niestatystyczne. Jeśli TOTAL_CONVERSIONS = 0 lub brak — analizuj efficiency po CTR×VIEWABILITY zamiast CPA.

### 2. Oblicz efektywność geo

Agent oblicza samodzielnie:

```
dla każdego CITY z ≥10 000 impresji:
  score_awareness  = CTR × (VIEWABILITY / 100)
  score_perf       = TOTAL_CONVERSIONS / (TOTAL_SPEND_USD / 1000)   (jeśli konwersje dostępne)

  udział_budżetu%  = TOTAL_SPEND_USD_CITY / TOTAL_SPEND_USD_łącznie × 100
  udział_wyników%  = (CTR_CITY × IMPRESSIONS_CITY) / (avg_CTR × łączne_IMPRESSIONS) × 100

  efficiency_ratio = udział_wyników% / udział_budżetu%
  if > 1.2: UNDERFUNDED  → zwiększ budżet
  if < 0.8: OVERFUNDED   → zmniejsz budżet
  else:     OK
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📍 GEO PERFORMANCE — Nike Air Max (kwiecień 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 10 MIAST — EFEKTYWNOŚĆ:

  #   Miasto           Imp.       Budżet  CTR    Viewab.  Score  Eff.ratio  Rekomendacja
  ─── ──────────────── ─────────  ─────── ────── ──────── ────── ─────────  ─────────────────
   1  Warszawa          1 840 000   38%   0,16%   72%     0,115   1,08      ✅ OK
   2  Kraków              620 000   13%   0,18%   74%     0,133   1,42  🔼  UNDERFUNDED — zwiększ
   3  Wrocław             480 000   10%   0,14%   69%     0,097   1,02      ✅ OK
   4  Trójmiasto          390 000    8%   0,13%   67%     0,087   0,91      ✅ OK
   5  Poznań              310 000    6%   0,11%   65%     0,072   0,87      ✅ OK
   6  Łódź                240 000    5%   0,07%   61%     0,043   0,71  🔽  OVERFUNDED — zmniejsz
   7  Katowice            190 000    4%   0,12%   68%     0,082   1,08      ✅ OK
   8  Lublin              140 000    3%   0,08%   60%     0,048   0,82      ✅ OK
   9  Bydgoszcz           110 000    2%   0,09%   62%     0,056   1,01      ✅ OK
  10  Szczecin             90 000    2%   0,07%   59%     0,041   0,82      ✅ OK

  Pominięto: 28 miast z <10 000 impresji (za mała próba)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RANKING REGIONÓW:

  Małopolska:     74% viewab., CTR 0,17%  🟢  najefektywniejszy region
  Mazowieckie:    72% viewab., CTR 0,16%  🟢
  Dolnośląskie:   69% viewab., CTR 0,14%  🟢
  Łódzkie:        61% viewab., CTR 0,07%  🟡  poniżej średniej
  Śląskie:        68% viewab., CTR 0,12%  🟢

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJE ALOKACJI:

  🔼 ZWIĘKSZ budżet:
     Kraków — efficiency_ratio 1,42 (najlepszy stosunek wyników do budżetu)
     CTR 0,18% najwyższy w kampanii, viewab. 74%, ale tylko 13% budżetu
     Działanie: przenieś 3–5% budżetu z Łodzi → Kraków

  🔽 ZMNIEJSZ budżet:
     Łódź — efficiency_ratio 0,71 (poniżej normy przy 5% budżetu)
     CTR 0,07% (najniższy w top10), viewab. 61%
     Działanie: ogranicz do 2–3% budżetu geo

  ✅ BEZ ZMIAN:
     Warszawa, Wrocław, Trójmiasto — efektywność OK, proporcje budżetu uzasadnione
```

## Zasady

- Nie rekomenduj zmian dla miast z <10 000 impresji — za mało danych
- Efficiency_ratio >1,2: underfunded (wyniki ponad budżet) = priorytet do zwiększenia
- Efficiency_ratio <0,8: overfunded (wydajemy za dużo za mały wynik) = zmniejsz
- Przy sezonowości (lato/zima, wakacje) zaznacz jeśli wyniki mogą być czasowe
- Zawsze podaj konkretny % budżetu do przesunięcia, nie "rozważ zwiększenie"
