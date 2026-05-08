---
name: a11-raport-tygodniowy
description: Użyj tego skilla gdy AdOps potrzebuje kompletnego raportu tygodniowego dla team leada, weekly report, podsumowanie tygodnia. Triggery: "raport tygodniowy", "weekly report", "podsumowanie tygodnia", "co się działo w tym tygodniu", "weekly summary", "raport dla team leada", "tygodniowy przegląd kampanii".
version: 1.0.0
quality_score: 9
---

# A11 — Raport tygodniowy AdOps

Kompletny raport tygodniowy dla team leada — wszystkie kampanie, kluczowe incydenty, działania podjęte.

## Cel

Tygodniowy snapshot wszystkich kampanii gotowy do wysłania team leadowi — bez dalszej edycji.

## Kroki wykonania

### 1. Pobierz dane (4 raporty równolegle)

**Raport bieżący tydzień (last_7_days):**
`run_report_preview` ALL kampanie + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`.

**Raport poprzedni tydzień (8–14 dni wstecz):**
Ten sam zestaw — do obliczenia delt WoW.

**Raport kreacje (last_7_days):**
dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE` + metrics: `IMPRESSIONS`, `CTR`, `VIDEO_COMPLETION_RATE`.

**Raport inventory (last_7_days):**
dims: `CAMPAIGN_NAME`, `SUPPLY_SOURCE`, `TOP_LEVEL_DOMAIN` + metrics: `IMPRESSIONS`, `VIEWABILITY`, `TOTAL_SPEND_USD`.

**Edge case:** Jeśli brak danych za poprzedni tydzień (kampania nowa) — zaznacz `(brak danych WoW — kampania <7 dni)` zamiast delta %.

### 2. Oblicz delty i klasyfikuj kampanie

Agent oblicza samodzielnie:

```
dla każdej kampanii:
  delta_wow_% = (wartość_bieżący − wartość_poprzedni) / wartość_poprzedni × 100
  significant = abs(delta_wow) > 20%

  pacing_oczekiwany% = (dni_od_startu / dni_całkowite) × 100
  pacing_rzeczywisty% = (spend_total / budget) × 100
  delta_pacing = pacing_rzeczywisty − pacing_oczekiwany

KLASYFIKACJA:
  OK:              delta_pacing −5% do +5%, brak alertów, metryki stabilne
  OBSERWACJA:      delta_pacing −15% do −5% lub +5% do +15%, lub 1 metryka WoW >20%
  WYMAGA_DZIAŁANIA: delta_pacing <−15% lub >+15%, zero delivery, CTR spike/drop
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📋 RAPORT TYGODNIOWY ADOPS
pon 4 maja – ndz 10 maja 2026  |  wygenerowano: czw 8 maja, 09:15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PODSUMOWANIE TYGODNIA:
  Kampanie aktywne:  8   |  ✅ OK: 5  |  👀 Obserwacja: 2  |  🔴 Działanie: 1
  Łączny spend:      $42 800  (WoW: +8% vs poprzedni tydzień)
  Łączne impresje:   18 400 000  (WoW: +12%)
  Incydenty:         2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ KAMPANIE OK (5):

  Kampania                  Spend    Pacing  CTR    Viewab.  WoW
  ─────────────────────── ──────── ─────── ────── ──────── ──────────
  Nike Air Max              $9 200   +2%    0,14%   71%     CTR +5%   stabilnie
  Samsung Galaxy            $6 800   +1%    0,09%   68%     stabilnie
  Żywiec Zdrój              $3 100   −2%    0,08%   65%     stabilnie
  H&M Wiosna                $5 400   +3%    0,13%   66%     stabilnie
  PKO BP Kredyty            $4 100   −1%    0,07%   74%     stabilnie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👀 NA OBSERWACJI (2):

  Adidas Running:  pacing −11% (lekki underpacing, monitoruję)
                   CTR WoW: −22% 🟡 — mogło zmienić się targetowanie
                   Działanie: sprawdzam przyczynę w piątek

  Rossmann Oferty: pacing +18% (overpacing, kampania kończy się 15 maja)
                   Przy obecnym tempie wyda budżet 4 dni przed końcem
                   Działanie: zmniejszam daily cap do $420/dz (z $620/dz)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 WYMAGAŁO / WYMAGA DZIAŁANIA (1):

  Nike Air Max › LI: Prospecting_Mobile
    Incydent: zero delivery wt 6–śr 7 maja (0 impresji przez 36h)
    Przyczyna: frequency cap ustawiony na 1/lifetime zamiast 3/tydzień
    Działanie: zmieniono cap w śr 7 maja o 14:30 — delivery wróciło do normy
    Status: ✅ ROZWIĄZANE | stracone impresje: ~170 000 (szac. $340)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCYDENTY TYGODNIA:

  1. Nike Air Max zero delivery (6–7 maja)
     Co: LI Prospecting_Mobile — 0 impresji przez 36h
     Wykryto: wt 6 maja, daily check 08:45
     Przyczyna: błędny frequency cap (1/lifetime)
     Działanie: poprawiono cap → delivery wróciło w ~2h
     Status: ✅ zamknięty

  2. Adidas Running CTR drop −22% WoW
     Co: CTR z 0,11% do 0,09% (−22% WoW)
     Wykryto: ten raport
     Przyczyna: w trakcie diagnozy
     Status: 👀 otwarty — wyjaśnienie do piątku

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 3 WNIOSKI NA KOLEJNY TYDZIEŃ:

  1. Zweryfikować frequency cappy wszystkich aktywnych LI
     (incydent Nike pokazał że błąd w konfiguracji może umknąć bez daily checku)

  2. Adidas Running — ustalić przyczynę CTR drop i wdrożyć korektę do śr 13 maja

  3. Rossmann — monitorować pacing codziennie, kampania kończy się 15 maja
     Cel: wyzerowanie budżetu ±5% od targetowanego spend
```

## Zasady

- Raport gotowy do wysłania team leadowi — bez redakcji po wygenerowaniu
- Incydenty opisuj: co → kiedy wykryto → przyczyna → działanie → status (otwarty/zamknięty)
- Wnioski muszą być actionable z konkretnym deadlinem (nie "warto sprawdzić" ale "sprawdzić do śr 13 maja")
- WoW delta >20% zawsze wymaga komentarza — czy to normalny szum czy sygnał
- Przy zero delivery: zawsze podaj szacowane stracone impresje i koszt (uzasadnia priorytet)
