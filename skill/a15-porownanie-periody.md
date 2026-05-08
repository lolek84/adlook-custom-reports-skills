---
name: a15-porownanie-periody
description: Użyj tego skilla gdy AdOps chce porównać wyniki między tygodniami lub miesiącami, zobaczyć trendy i regresje WoW lub MoM. Triggery: "porównaj z poprzednim tygodniem", "MoM", "WoW", "trend wyników", "czy jest poprawa", "co się zmieniło", "week over week", "month over month", "porównanie periody", "delta wyników".
version: 1.0.0
quality_score: 9
---

# A15 — Porównanie periody (MoM / WoW)

Jak zmieniły się wyniki między tygodniami lub miesiącami — wykrycie trendów i regresji.

## Cel

Tabela delta z highlightami — co się poprawiło, co pogorszyło, z diagnozą przyczyny i rekomendacją.

## Kroki wykonania

### 1. Ustal zakresy dat

```
WoW (week over week):   current = last_7_days | previous = 7–14 dni temu
MoM (month over month): current = bieżący miesiąc | previous = poprzedni miesiąc
Custom:                 użyj zakresów podanych przez użytkownika
```

### 2. Pobierz dane (2 raporty równolegle)

**Raport current period:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE` — current period.

**Raport previous period:**
Ten sam zestaw za previous period.

**Edge case:** Jeśli kampania startowała w bieżącym okresie (brak previous data) — zaznacz: `(brak danych poprzedniego okresu — kampania <7 dni lub nowa)` i pomiń kolumnę delta dla tej kampanii.

**Edge case — różne długości okresów:** Jeśli porównywane okresy mają różną liczbę dni (np. luty 28 dni vs marzec 31 dni) — normalizuj metryki wolumetryczne do per-dnia przed obliczeniem delty: `delta_normalized = (M_current / dni_current − M_previous / dni_previous) / (M_previous / dni_previous) × 100`. Zaznacz w raporcie: *"Okresy różnej długości — delty znormalizowane per dzień."*

### 3. Oblicz delty

Agent oblicza samodzielnie:

```
dla każdej metryki M:
  delta_abs = M_current − M_previous
  delta_pct = (M_current − M_previous) / M_previous × 100

  ocena (kierunek zmiany ma znaczenie):
  metryki "wyższy = lepszy":  IMPRESSIONS, CTR, VIEWABILITY, REACH, VCR, ROAS, CONVERSIONS
  metryki "niższy = lepszy":  ECPA_USD, ECPM_USD, FREQUENCY

  if |delta_pct| < 10%:  ↔ STABILNA   (naturalna fluktuacja)
  if delta w dobrym kierunku i |delta| ≥ 10%:  ⬆ POPRAWA
  if delta w złym kierunku i |delta| ≥ 10%:    ⬇ REGRESJA
  if |delta| ≥ 30%:  znacząca zmiana — wymaga wyjaśnienia przyczyny
```

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📊 WoW — Nike Air Max
tydz. 2 (5–11 maja) vs tydz. 1 (28 kwi – 4 maja)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Metryka            Tydz. 1      Tydz. 2      Zmiana    Ocena
  ──────────────── ──────────── ──────────── ──────── ────────
  Wyświetlenia      2 100 000    2 450 000    +17%    ⬆ POPRAWA
  Wydatki           $9 200       $10 800      +17%    ↔ (proporcjonalnie do impresji)
  CTR               0,12%        0,14%        +17%    ⬆ POPRAWA
  Viewability       68%          71%          +4%     ↔ stabilna
  Zasięg            820 000      890 000      +9%     ↔ stabilny
  Częstotliwość     2,6×         2,8×         +8%     ↔ stabilna (kierunek: wzrost = gorsze)
  eCPM              $2,20        $2,40        +9%     ↔ stabilny
  Konwersje         n/d          n/d          —       brak piksela
  VCR               —            —            —       brak wideo w tej kampanii

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 NAJWIĘKSZE POPRAWY:

  ⬆ CTR: 0,12% → 0,14% (+17%)
    Prawdopodobna przyczyna: nowa kreacja Baner_wiosna_v2 wdrożona 5 maja
    Wniosek: kreacja wiosenna działa lepiej — skaluj budżet na ten format

  ⬆ Wyświetlenia: +17% przy +17% wydatków — efektywność bez zmian, skala rośnie
    Kampania zdrowo się skaluje

⚠️ REGRESJE DO ZBADANIA:
  Brak regresji w bieżącym tygodniu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WNIOSEK:
  Tydzień 2 lepszy od 1. Wzrost CTR o 17% prawdopodobnie wynika z nowej kreacji
  wdrożonej 5 maja. Pacing stabilny, eCPM bez istotnych zmian.
  Rekomendacja: zwiększ budżet kreacji Baner_wiosna_v2 o 20% w tygodniu 3.
```

**Wariant MoM z regresją:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGRESJE DO ZBADANIA:

  ⬇ Viewability: 72% → 58% (−19%)
    Prawdopodobna przyczyna: zmiana mix supply — Magnite zwiększył udział z 8% do 24%
    (Magnite ma avg viewab. 41% na tej kampanii)
    Rekomendacja: przywróć proporcje supply z poprzedniego miesiąca lub ogranicz Magnite

  ⬇ CTR: 0,14% → 0,09% (−36%) ← znacząca zmiana (>30%)
    Sprawdź: (1) czy zmieniono kreacje? (2) czy zmieniono targeting? (3) fraud?
    Wymagane: analiza anomalii CTR (skill A03) przed wyciągnięciem wniosków
```

## Zasady

- Delta <10% to naturalna fluktuacja — nie alarmuj, oznacz jako ↔ stabilna
- Delta >30% zawsze wymaga wyjaśnienia przyczyny — nie prezentuj bez diagnozy
- Sezonowość przy MoM: lipiec vs. grudzień to inne rynki — zaznacz jeśli może wpływać
- Zawsze szukaj przyczyny zmiany zanim sformulujesz wniosek (kreacja / bid / supply / fraud)
- Wniosek końcowy: jedna konkretna rekomendacja z liczbą (np. "+20% budżetu na X"), nie ogólnik
