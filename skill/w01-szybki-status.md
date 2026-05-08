---
name: w01-szybki-status
description: Użyj tego skilla gdy użytkownik (klient lub AdOps) pyta ogólnie jak idzie kampania, chce quick check, jedną liczbę. Triggery: "jak idzie kampania", "wszystko OK", "quick check", "daj mi jedną liczbę", "jak leci", "szybki status", "czy idzie", "co słychać z kampanią", "jedna liczba". Minimum wywołań MCP — maksymalny sygnał.
version: 1.0.0
quality_score: 9
---

# W01 — Szybki status — jedna liczba

Odpowiedź na "jak idzie?" w 1–2 zdaniach. Zero szczegółów, maksymalny sygnał.

## Cel

Najkrótsza możliwa odpowiedź dająca pełny obraz stanu kampanii.

## Kroki wykonania

### 1. Pobierz dane z MCP (minimum wywołań)

`run_report_preview` z absolutnym minimum:

**Dims:** `CAMPAIGN_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE`
**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`
**Date range:** yesterday (impresje) + campaign_to_date (pacing).

**Edge case:** Jeśli użytkownik nie podał nazwy kampanii — pobierz listę aktywnych i odpowiedz statusem dla wszystkich jedną linią każda. Jeśli brak aktywnych kampanii — odpowiedz: *"Brak aktywnych kampanii w tej chwili."* Jeśli kampania ma 0 wyświetleń wczoraj — dodaj flagę: *"ZERO DELIVERY → A02"*. Jeśli CAMPAIGN_BUDGET niedostępny — pomiń obliczenie delta pacing i zaznacz: *"Brak danych budżetowych."*

### 2. Oblicz

Agent oblicza samodzielnie:

```
pacing_oczekiwany%  = (dni_od_startu / dni_całkowite) × 100
pacing_rzeczywisty% = (spend_total / budget) × 100
delta               = pacing_rzeczywisty − pacing_oczekiwany

STATUS:
  delta > −5% i < +5%   → ✅ OK
  delta −15% do −5%     → ⚠️ lekkie spowolnienie
  delta < −15%           → 🔴 problem
  delta > +15%           → ⚠️ za szybko
```

### 3. Odpowiedź zależna od rozmówcy

**Dla klienta (🟢) — max 2 zdania, gotowe do wklejenia w maila:**

✅ Status dobry:
```
✅ Kampania Nike Air Max idzie dobrze — 2,1 mln wyświetleń, 68% budżetu wydane, 4 dni do końca.
Wszystko realizuje się zgodnie z planem.
```

⚠️ Lekki problem:
```
⚠️ Kampania Nike Air Max jest lekko poniżej planu — wydano 52% budżetu przy 65% czasu.
Nasz zespół monitoruje sytuację i wróci z aktualizacją.
```

🔴 Poważny problem:
```
🔴 Kampania Nike Air Max wymaga uwagi — wydano tylko 24% budżetu przy 65% czasu.
Nasz zespół już diagnozuje przyczynę — poinformujemy o dalszych krokach dzisiaj.
```

**Dla AdOps (🟣) — 1 linia, wszystkie liczby:**

```
✅ Nike Air Max: pacing +2% | $920/dz | CTR 0,12% | viewab. 68% | 4 dni do końca
⚠️ Adidas Running: pacing −11% | $390/dz | CTR 0,09%↓ | sprawdź targetowanie
🔴 H&M Wiosna: pacing −24% | 0 imp. yesterday | ZERO DELIVERY → A02
```

### 4. Jeśli użytkownik chce więcej

Na końcu zaproponuj odpowiedni skill:
- Szczegółowy raport → K01
- Tylko status (tak/nie) → K02
- Tylko budżet → K03
- Poranny przegląd wszystkich kampanii → A01

## Zasady

- Maksymalnie 2 zdania dla klienta, 1 linia dla AdOps — nigdy więcej
- Nigdy nie pytaj o dodatkowe dane zanim odpiszesz — odpowiedz na podstawie dostępnych
- Emoji na początku — od razu widać czy dobrze czy nie
- Dla klienta: ukryj techniczne szczegóły (pacing delta, eCPM) — zostaw tylko co rozumie
- Dla AdOps: pokaż wszystko w jednej linii — pacing%, $/dz, CTR, viewab., alert jeśli jest
