---
name: a13-audit-line-itemow
description: Użyj tego skilla gdy AdOps chce sprawdzić status line itemów, znaleźć LI z zero delivery, wykryć anomalie statusów. Triggery: "sprawdź LI", "które line itemy nie działają", "audit line itemów", "status LI", "zero delivery", "line item nie emituje", "LI aktywny bez impresji", "sprawdź line itemy kampanii".
version: 1.0.0
quality_score: 9
---

# A13 — Audit line itemów — anomalie statusów

Wykrycie line itemów aktywnych bez delivery, pauzowanych przez omyłkę, lub z niespójnymi datami.

## Cel

Znaleźć wszystkie LI z niespójnym statusem — aktywne bez emisji, pauzowane z budżetem, zakończone z niedowiezieniem.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `LINE_ITEM_STATUS`
- `LINE_ITEM_START_DATE`
- `LINE_ITEM_END_DATE`
- `LINE_ITEM_BUDGET`
- `LINE_ITEM_BIDDING_MODEL`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`

**Date range:** last_7_days (do wykrycia anomalii) + campaign_to_date (do oceny budżetu).

**Edge case:** Jeśli brak danych dla kampanii (np. kampania nieaktywna od >30 dni) — zaraportuj: `ℹ️ Brak danych za ostatnie 7 dni dla tej kampanii. Sprawdzam status wszystkich LI bez analizy delivery.`

### 2. Klasyfikacja anomalii

Agent klasyfikuje każdy LI:

```
🚨 KRYTYCZNE (natychmiastowe działanie):
  STATUS = ACTIVE  AND  IMPRESSIONS_last7d = 0
  → "Aktywny bez dostawy" — sprawdź bid/targeting/kreacje

⚠️ OSTRZEŻENIA (wymaga weryfikacji):
  STATUS = PAUSED  AND  LINE_ITEM_END_DATE > dziś  AND  spend < 80% × LINE_ITEM_BUDGET
  → "Pauzowany z niewydanym budżetem — czy celowo?"

  LINE_ITEM_START_DATE > dziś  AND  STATUS = ACTIVE
  → "Aktywny przed planowanym startem kampanii"

  LINE_ITEM_END_DATE < dziś  AND  STATUS = ACTIVE
  → "Aktywny po planowanym zakończeniu — czy celowo?"

📋 DO RAPORTOWANIA (post-mortem):
  STATUS = ENDED  AND  TOTAL_SPEND_USD < 0.80 × LINE_ITEM_BUDGET
  → "Zakończony z niedowiezionym budżetem (mniej niż 80% wydane)"
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🔍 AUDIT LINE ITEMÓW — Nike Air Max  |  czw 8 maja 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 KRYTYCZNE — AKTYWNE BEZ DOSTAWY (2):

  LI: Prospecting_Mobile
    Status: ACTIVE | Start: 1 kwi | End: 31 maj
    Last 7 dni: 0 impresji  (poprzednie 7 dni: 82 000 impresji)
    Budżet: $8 000 | Wydano: $3 200 (40%)
    ⚠️ Delivery zatrzymało się nagle — sprawdź frequency cap i kreacje
    Działanie: □ zweryfikuj frequency cap □ sprawdź approve kreacji □ sprawdź bid vs floor

  LI: Retargeting_Tablet
    Status: ACTIVE | Start: 1 kwi | End: 31 maj
    Last 7 dni: 0 impresji  (poprzednie 7 dni: 12 000 impresji)
    Budżet: $1 500 | Wydano: $620 (41%)
    Uwaga: mała audience na tablet — może być naturalne wyczerpanie zasięgu
    Działanie: □ sprawdź reach saturation □ rozważ wyłączenie i realokację budżetu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ OSTRZEŻENIA — WYMAGAJĄ WERYFIKACJI (2):

  LI: Awareness_Desktop
    Status: PAUSED | End: 31 maj (23 dni do końca) | Wydano: $4 100 z $12 000 (34%)
    ⚠️ Pauzowany z $7 900 niewydanego budżetu — czy pauza jest celowa?
    Działanie: □ potwierdź z klientem czy reaktywować

  LI: Video_Preroll_15s
    Status: ACTIVE | End date: 30 kwi 2026 ← przekroczony o 8 dni
    ⚠️ LI aktywny po planowanym zakończeniu
    Działanie: □ zmień status na ENDED lub zaktualizuj datę zakończenia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ZAKOŃCZONE Z NIEDOWIEZIENIEM (1):

  LI: Launch_Remarketing
    Status: ENDED | Okres: 1–15 kwi
    Wydano: $2 100 z $5 000 (42%) ← niedowiezione $2 900
    Przyczyna do wyjaśnienia klientowi: underpacing przez pierwsze 2 tygodnie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ BEZ PROBLEMÓW: 6 line itemów w normie

LISTA DZIAŁAŃ:
  □ [DZIŚ] Prospecting_Mobile — zdiagnozuj zero delivery (skill A02)
  □ [DZIŚ] Video_Preroll_15s — zaktualizuj datę zakończenia lub zmień status
  □ [JUTRO] Awareness_Desktop — potwierdź z klientem czy reaktywować
  □ [TYDZIEŃ] Launch_Remarketing — przygotuj wyjaśnienie niedowiezionego budżetu
```

## Zasady

- Zero delivery przez 7 dni = zawsze 🚨 KRYTYCZNE, nie czekaj z reakcją
- Pauza może być celowa (weekend, sezonowość) — zawsze pytaj zanim reaktywujesz
- Zakończony LI z <80% budżetu wymaga wyjaśnienia klientowi — wpisz do raportu tygodniowego
- LI aktywny po dacie zakończenia = błąd konfiguracji — napraw natychmiast
- Zawsze podaj kwotę niewydanego budżetu — to argument do priorytetyzacji działań
- Zero delivery → diagnostyka zawsze przez skill A02 (pełna procedura: bid, targeting, kreacje, frequency cap)
