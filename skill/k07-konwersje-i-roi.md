---
name: k07-konwersje-i-roi
description: Użyj tego skilla gdy klient pyta o konwersje, ROAS, CPA, zwrot z inwestycji, opłacalność kampanii. Triggery: "ile konwersji", "jaki ROAS", "koszt konwersji", "CPA", "czy kampania jest opłacalna", "zwrot z inwestycji", "ile sprzedaży", "wyniki konwersji".
version: 1.0.0
quality_score: 9
---

# K07 — Konwersje i zwrot z inwestycji

Ile konwersji wygenerowała kampania i jaki jest koszt pozyskania klienta.

## Cel

Pokazać biznesowy wynik kampanii — nie tylko wyświetlenia, ale realne konwersje i rentowność.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `LINE_ITEM_PRIMARY_GOAL_NAME`
- `LINE_ITEM_PRIMARY_GOAL_VALUE`

**Metrics:**
- `TOTAL_CONVERSIONS`
- `POST_VIEW_CONVERSIONS`
- `POST_CLICK_CONVERSIONS`
- `ECPA_USD`
- `ROAS`
- `CONVERSION_RATE`
- `TOTAL_SPEND_USD`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

**Edge case:** Jeśli `TOTAL_CONVERSIONS` = 0 lub brak danych — odpowiedz: *"Brak zarejestrowanych konwersji w tym okresie. Możliwe przyczyny: (1) piksel śledzący nie jest wdrożony, (2) kampania jeszcze nie dotarła do etapu konwersji, (3) konwersje rejestrowane są z opóźnieniem. Skontaktuj się z opiekunem kampanii, żeby zweryfikować konfigurację."*

### 2. Obliczenia

Agent oblicza samodzielnie:

```
cel_CPA              = LINE_ITEM_PRIMARY_GOAL_VALUE (jeśli cel to CPA)
rzeczywisty_CPA      = ECPA_USD
realizacja_vs_cel_%  = (cel_CPA / rzeczywisty_CPA) × 100
                       (>100% = poniżej celu kosztowego = dobra wiadomość)

udział_view_%        = POST_VIEW_CONVERSIONS / TOTAL_CONVERSIONS × 100
udział_click_%       = POST_CLICK_CONVERSIONS / TOTAL_CONVERSIONS × 100
```

### 3. Oceń zwrot z inwestycji

Wzór: ROAS = przychód z konwersji / wydatki na kampanię × 100%

| ROAS (zwrot z każdego wydanego $1) | Ocena | Co to znaczy |
|---|---|---|
| >4× ($400%) | 🟢 Doskonały | Za każdy wydany $1 kampania przyniosła ponad $4 przychodu |
| 2–4× ($200–400%) | 🟡 Dobry | Kampania przynosi zwrot, ale jest pole do optymalizacji |
| 1–2× ($100–200%) | 🟠 Przeciętny | Kampania zwraca koszty, ale marża jest niska |
| <1× (<$100%) | 🔴 Poniżej progu | Kampania kosztuje więcej niż przynosi — wymaga interwencji → uruchom A02 + A03 |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i wybierz właściwy wariant oceny:

```
🎯 Konwersje i zwrot z inwestycji — Nike Air Max (kwiecień 2026)

KONWERSJE:
  Łącznie:               342 konwersje
  Po wyświetleniu:        85 (25%) — ktoś widział reklamę, a potem kupił
  Po kliknięciu:         257 (75%) — ktoś kliknął w reklamę, a potem kupił

KOSZTY:
  Wydano na kampanię:    $18 400
  Koszt jednej konwersji: $53,80
  Cel kosztowy (CPA):     $60,00  ✅ — jesteśmy 11% poniżej celu (dobrze!)

ZWROT Z INWESTYCJI:
  Za każdy wydany $1 kampania przyniosła: $3,20 przychodu  🟡 Dobry
  (ROAS: 320%)

✅ Kampania jest opłacalna i realizuje cel kosztowy.
   Koszt pozyskania konwersji ($53,80) jest o 10% niższy niż zakładany cel ($60).
```

**Warianty oceny końcowej (wybierz odpowiedni):**

🟢 Cel osiągnięty lub przekroczony:
> *"Kampania jest opłacalna — koszt jednej konwersji ($[X]) jest poniżej zakładanego celu ($[Y]). Za każdy wydany dolar kampania przynosi $[ROAS]× przychodu."*

🟡 Blisko celu:
> *"Kampania przynosi zwrot, choć koszt jednej konwersji ($[X]) jest nieco powyżej celu ($[Y]). Warto sprawdzić które linie kampanii osiągają najlepszy wynik i tam skupić budżet."*

🔴 Poniżej celu:
> *"Koszt pozyskania konwersji ($[X]) jest znacznie powyżej zakładanego celu ($[Y]). Nasz zespół analizuje przyczyny i przygotuje plan optymalizacji."*

## Zasady komunikacji

- Zamiast "CPA" pisz "koszt jednej konwersji" lub "koszt pozyskania klienta"
- Zamiast "ROAS" pisz "za każdy wydany $1 kampania przyniosła $X przychodu"
- Wyjaśnij różnicę między view-through a click-through: *"po wyświetleniu = ktoś widział reklamę i potem kupił; po kliknięciu = kliknął i potem kupił"*
- Jeśli cel CPA jest dostępny — zawsze porównaj do niego i powiedz czy jest dobrze czy nie
- Jeśli brak konwersji — nie zostawiaj pustego miejsca, wyjaśnij możliwe przyczyny
